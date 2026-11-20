import { useState } from "react";
import {
  ESTADOS_ENVIO,
  TIEMPOS_ENTREGA,
  PARTIDAS,
  NO_APLICA_OPCIONES,
} from "../constants/catalogs";
import { fmtFecha, partidasDe, facturasDe, clientesDe } from "../utils/format";
import { estimarFecha } from "../utils/estimacion";
import PdfLinkField from "./PdfLinkField";
import ProveedorField from "./ProveedorField";
import ClienteField from "./ClienteField";
import GlassDropdown from "./GlassDropdown";
import GlassDate from "./GlassDate";
import Icon from "./Icon";
import { PREFIJO_VENDEDOR } from "../constants/vendedores";

const VACIO = {
  cliente: "",
  ocCliente: "",
  fechaRecepcionOC: "",
  fechaEnvioCompras: "",
  tiempoEntregaCliente: "",
  crol: "",
  crolUrl: "",
  fechaProceso: "",
  proveedor: "",
  tiempoEntregaBloobit: "",
  estadoEnvio: "Pendiente",
  noAplica: "",
  noAplicaDetalle: "",
  fechaEntregaRealCliente: "",
  comentario: "",
};

const partidaVacia = (n = 1) => ({ partida: n, claveProducto: "", descripcion: "", cantidad: "" });

// Muestra una fecha estimada calculada por fórmula (solo lectura).
function EstimadaCalc({ label, base, tiempo, alerta }) {
  const val = estimarFecha(base, tiempo);
  const atrasada = alerta && val && val < new Date().toISOString().slice(0, 10);
  return (
    <div className="field">
      <label>{label} <span className="td-mut" style={{ fontWeight: 400 }}>· fórmula</span></label>
      <input readOnly value={val ? fmtFecha(val) : "— se calcula —"}
        style={atrasada ? { color: "#ef4444", fontWeight: 700, borderColor: "#f3c6c6", background: "#fef2f2" } : { background: "#f8fafc", color: "#475569" }} />
    </div>
  );
}

export default function OCForm({ inicial, onSubmit, onCancel, modo = "crear" }) {
  const [f, setF] = useState({
    ...VACIO,
    fechaRecepcionOC: modo === "crear" ? new Date().toISOString().slice(0, 10) : "",
    ...(inicial || {}),
  });
  const [partidas, setPartidas] = useState(
    inicial ? partidasDe(inicial).map((p) => ({ ...partidaVacia(), ...p })) : [partidaVacia(1)]
  );
  const [facturas, setFacturas] = useState(
    inicial && facturasDe(inicial).length ? facturasDe(inicial) : [{ numero: "", url: "" }]
  );
  const [clientesOC, setClientesOC] = useState(
    inicial && clientesDe(inicial).length ? clientesDe(inicial).map((c) => ({ cliente: c.cliente || "", ocCliente: c.ocCliente || "" })) : [{ cliente: "", ocCliente: "" }]
  );
  const [activa, setActiva] = useState(0); // pestaña de partida activa
  const [guardando, setGuardando] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setVal = (k) => (v) => setF({ ...f, [k]: v });

  // ---- Partidas ----
  const idx = Math.min(activa, partidas.length - 1); // índice de la pestaña activa (acotado)
  const pa = partidas[idx] || partidas[0];
  const setPartida = (i, k, v) => setPartidas(partidas.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const addPartida = () => {
    const usadas = partidas.map((p) => Number(p.partida));
    const next = PARTIDAS.find((n) => !usadas.includes(n)) || partidas.length + 1;
    const nuevo = [...partidas, partidaVacia(next)];
    setPartidas(nuevo);
    setActiva(nuevo.length - 1); // cambia a la nueva pestaña
  };
  const removePartida = (i) => {
    if (partidas.length <= 1) return;
    const nuevo = partidas.filter((_, idx) => idx !== i);
    setPartidas(nuevo);
    setActiva((a) => Math.max(0, Math.min(i <= a ? a - 1 : a, nuevo.length - 1)));
  };

  // ---- Facturas ----
  const setFactura = (i, k, v) => setFacturas(facturas.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const addFactura = () => setFacturas([...facturas, { numero: "", url: "" }]);
  const removeFactura = (i) => setFacturas(facturas.filter((_, idx) => idx !== i));

  // ---- Cliente(s) y OC ----
  const vendedorDeCliente = PREFIJO_VENDEDOR[(partidas[0]?.claveProducto || "").trim().slice(0, 3).toUpperCase()] || "";
  const setCli = (i, k, v) => setClientesOC(clientesOC.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const addCliente = () => setClientesOC([...clientesOC, { cliente: "", ocCliente: "" }]);
  const removeCliente = (i) => { if (clientesOC.length > 1) setClientesOC(clientesOC.filter((_, idx) => idx !== i)); };

  const submit = async (e) => {
    e.preventDefault();
    const clientesLimpios = clientesOC
      .map((c) => ({ cliente: (c.cliente || "").trim(), ocCliente: (c.ocCliente || "").trim() }))
      .filter((c) => c.cliente || c.ocCliente);
    if (!clientesLimpios.length || !clientesLimpios[0].cliente)
      return alert("El cliente es obligatorio.");
    const partidasLimpias = partidas
      .filter((p) => (p.descripcion || "").trim() || (p.claveProducto || "").trim() || p.cantidad !== "")
      .map((p) => ({
        partida: Number(p.partida) || 1,
        claveProducto: (p.claveProducto || "").trim(),
        descripcion: (p.descripcion || "").trim(),
        cantidad: p.cantidad === "" || p.cantidad === null ? null : Number(p.cantidad),
      }));
    if (!partidasLimpias.length || !partidasLimpias.some((p) => p.descripcion))
      return alert("Agrega al menos una partida con descripción.");

    const facturasLimpias = facturas
      .filter((x) => (x.numero || "").trim() || (x.url || "").trim())
      .map((x) => ({ numero: (x.numero || "").trim(), url: (x.url || "").trim() }));

    setGuardando(true);
    try {
      const payload = {
        ...f,
        clientesOC: clientesLimpios,
        partidas: partidasLimpias,
        facturas: facturasLimpias,
        // Campos legados para compatibilidad de vistas/búsqueda/export
        cliente: clientesLimpios[0].cliente,
        ocCliente: clientesLimpios[0].ocCliente,
        claveProducto: partidasLimpias[0].claveProducto,
        descripcion: partidasLimpias[0].descripcion,
        cantidad: partidasLimpias[0].cantidad,
        facturaBloobit: facturasLimpias[0]?.numero || "",
        facturaUrl: facturasLimpias[0]?.url || "",
        // Fechas estimadas por fórmula
        fechaEstimadaCliente: estimarFecha(f.fechaRecepcionOC, f.tiempoEntregaCliente),
        fechaEstimadaBloobit: estimarFecha(f.fechaProceso || f.fechaRecepcionOC, f.tiempoEntregaBloobit),
      };
      await onSubmit(payload);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {/* ===== Cliente(s) y OC ===== */}
      <div className="form-section">
        <div className="form-section-head">
          <h3><Icon name="user" size={16} /> Cliente(s) y OC {clientesOC.length > 1 && <span className="td-mut" style={{ fontWeight: 400 }}>({clientesOC.length})</span>}</h3>
          <button type="button" className="icon-btn sm" onClick={addCliente} title="Agregar cliente">
            <Icon name="plus" size={15} />
          </button>
        </div>
        {clientesOC.map((c, i) => (
          <div key={i} className="cliente-oc-row">
            <ClienteField value={c.cliente} onChange={(v) => setCli(i, "cliente", v)} vendedor={vendedorDeCliente} />
            <div className="field">
              <label>OC del Cliente</label>
              <input value={c.ocCliente} onChange={(e) => setCli(i, "ocCliente", e.target.value)} placeholder="Ej. ST_26_06" />
            </div>
            {clientesOC.length > 1 ? (
              <button type="button" className="icon-btn-del" title="Quitar cliente" onClick={() => removeCliente(i)}>
                <Icon name="trash" size={14} />
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>

      {/* ===== Datos de la orden (CROL) ===== */}
      <div className="form-grid">
        <div className="field">
          <label>CROL</label>
          <input value={f.crol} onChange={set("crol")} placeholder="Folio de la OC en CROL" />
        </div>
        <PdfLinkField label="Vínculo a la CROL (PDF / enlace)" value={f.crolUrl} onChange={setVal("crolUrl")} />
      </div>

      {/* ===== Partidas (en pestañas) ===== */}
      <div className="form-section">
        <div className="form-section-head">
          <h3><Icon name="list" size={16} /> Partidas <span className="td-mut" style={{ fontWeight: 400 }}>({partidas.length})</span></h3>
        </div>

        <div className="partida-tabs">
          {partidas.map((p, i) => (
            <button type="button" key={i} className={`partida-tab ${i === idx ? "active" : ""}`} onClick={() => setActiva(i)}>
              Partida {p.partida}
            </button>
          ))}
          <button type="button" className="partida-tab add" onClick={addPartida}>
            <Icon name="plus" size={13} /> Agregar
          </button>
        </div>

        <div className="partida-pane">
          <div className="form-grid">
            <div className="field">
              <label>N° de partida</label>
              <GlassDropdown value={pa.partida} onChange={(v) => setPartida(idx, "partida", v)} options={PARTIDAS} />
            </div>
            <div className="field">
              <label>Clave de producto</label>
              <input value={pa.claveProducto} onChange={(e) => setPartida(idx, "claveProducto", e.target.value)} placeholder="Ej. CMM26-10-022" />
            </div>
            <div className="field">
              <label>Cantidad</label>
              <input type="number" min="0" value={pa.cantidad} onChange={(e) => setPartida(idx, "cantidad", e.target.value)} />
            </div>
            <div className="field" />
            <div className="field full">
              <label>Descripción</label>
              <textarea value={pa.descripcion} onChange={(e) => setPartida(idx, "descripcion", e.target.value)} placeholder="Descripción del producto" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => removePartida(idx)} disabled={partidas.length === 1}>
              <Icon name="trash" size={14} /> Quitar esta partida
            </button>
          </div>
        </div>
      </div>

      {/* ===== Fechas / estado ===== */}
      <div className="form-grid">
        <ProveedorField value={f.proveedor} onChange={setVal("proveedor")} />
        <div className="field">
          <label>Estado de envío <span className="td-mut" style={{ fontWeight: 400 }}>· semáforo</span></label>
          <GlassDropdown value={f.estadoEnvio} onChange={setVal("estadoEnvio")} options={ESTADOS_ENVIO} />
        </div>

        <div className="field">
          <label>Recepción OC cliente</label>
          <GlassDate value={f.fechaRecepcionOC} onChange={setVal("fechaRecepcionOC")} />
        </div>
        <div className="field">
          <label>Envío a compras</label>
          <GlassDate value={f.fechaEnvioCompras} onChange={setVal("fechaEnvioCompras")} />
        </div>

        <div className="field">
          <label>Tiempo de entrega al cliente</label>
          <GlassDropdown value={f.tiempoEntregaCliente} onChange={setVal("tiempoEntregaCliente")} options={TIEMPOS_ENTREGA} />
        </div>
        <EstimadaCalc label="Fecha estimada al cliente" base={f.fechaRecepcionOC} tiempo={f.tiempoEntregaCliente} />

        <div className="field">
          <label>Fecha del proceso <span className="td-mut" style={{ fontWeight: 400 }}>· envío al proveedor</span></label>
          <GlassDate value={f.fechaProceso} onChange={setVal("fechaProceso")} />
        </div>
        <div className="field">
          <label>Tiempo de entrega a Bloobit</label>
          <GlassDropdown value={f.tiempoEntregaBloobit} onChange={setVal("tiempoEntregaBloobit")} options={TIEMPOS_ENTREGA} />
        </div>

        <EstimadaCalc label="Fecha estimada a Bloobit" base={f.fechaProceso || f.fechaRecepcionOC} tiempo={f.tiempoEntregaBloobit} alerta />
        <div className="field">
          <label>Fecha de entrega al cliente</label>
          <GlassDate value={f.fechaEntregaRealCliente} onChange={setVal("fechaEntregaRealCliente")} />
        </div>

        <div className="field">
          <label>Indicador <span className="td-mut" style={{ fontWeight: 400 }}>· ¿no aplica?</span></label>
          <GlassDropdown
            value={f.noAplica}
            onChange={setVal("noAplica")}
            options={[{ value: "", label: "Sí aplica (normal)" }, ...NO_APLICA_OPCIONES.map((o) => ({ value: o, label: `No aplica · ${o}` }))]}
          />
          <span className="td-mut" style={{ fontSize: 12 }}>
            Si eliges un motivo, la orden se excluye de los indicadores.
          </span>
        </div>
        {f.noAplica === "Otro" ? (
          <div className="field">
            <label>Detalle <span className="td-mut" style={{ fontWeight: 400 }}>· ¿qué pasó?</span></label>
            <input
              type="text"
              value={typeof f.noAplicaDetalle === "string" ? f.noAplicaDetalle : ""}
              onChange={(e) => setF((prev) => ({ ...prev, noAplicaDetalle: e.target.value }))}
              placeholder="Describe el motivo…"
            />
          </div>
        ) : (
          <div className="field" />
        )}
      </div>

      {/* ===== Facturas ===== */}
      <div className="form-section">
        <div className="form-section-head">
          <h3><Icon name="file" size={16} /> Facturas</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addFactura}>
            <Icon name="plus" size={14} /> Agregar factura
          </button>
        </div>
        {facturas.map((x, i) => (
          <div className="factura-row" key={i}>
            <div className="field" style={{ width: 180 }}>
              <label>N° Factura</label>
              <input value={x.numero} onChange={(e) => setFactura(i, "numero", e.target.value)} placeholder="Ej. B15563" />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <PdfLinkField label="Vínculo de la factura (PDF / enlace)" value={x.url} onChange={(v) => setFactura(i, "url", v)} />
            </div>
            <button type="button" className="icon-btn-del" title="Quitar factura" onClick={() => removeFactura(i)} disabled={facturas.length === 1}>
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* ===== Comentarios ===== */}
      <div className="form-grid">
        <div className="field full">
          <label>Comentarios</label>
          <textarea value={f.comentario} onChange={set("comentario")} placeholder="Campo de texto general" />
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? "Guardando…" : modo === "crear" ? "Crear orden" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
