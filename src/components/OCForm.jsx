import { useState } from "react";
import {
  ESTADOS_ENVIO,
  TIEMPOS_ENTREGA,
  PARTIDAS,
  NO_APLICA_OPCIONES,
} from "../constants/catalogs";
import { fmtFecha, partidasDe, facturasDe } from "../utils/format";
import { estimarFecha } from "../utils/estimacion";
import PdfLinkField from "./PdfLinkField";
import ProveedorField from "./ProveedorField";
import Icon from "./Icon";

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

  const submit = async (e) => {
    e.preventDefault();
    if (!f.cliente.trim()) return alert("El cliente es obligatorio.");
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
        partidas: partidasLimpias,
        facturas: facturasLimpias,
        // Campos legados para compatibilidad de vistas/búsqueda/export
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
      {/* ===== Datos de la orden (CROL) ===== */}
      <div className="form-grid">
        <div className="field">
          <label>Cliente <span className="req">*</span></label>
          <input value={f.cliente} onChange={set("cliente")} placeholder="De la OC" />
        </div>
        <div className="field">
          <label>OC del Cliente</label>
          <input value={f.ocCliente} onChange={set("ocCliente")} placeholder="Ej. ST_26_06" />
        </div>
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
              <select value={pa.partida} onChange={(e) => setPartida(idx, "partida", e.target.value)}>
                {PARTIDAS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
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
          <select value={f.estadoEnvio} onChange={set("estadoEnvio")}>
            {ESTADOS_ENVIO.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Recepción OC cliente</label>
          <input type="date" value={f.fechaRecepcionOC} onChange={set("fechaRecepcionOC")} />
        </div>
        <div className="field">
          <label>Envío a compras</label>
          <input type="date" value={f.fechaEnvioCompras} onChange={set("fechaEnvioCompras")} />
        </div>

        <div className="field">
          <label>Tiempo de entrega al cliente</label>
          <select value={f.tiempoEntregaCliente} onChange={set("tiempoEntregaCliente")}>
            <option value="">— Seleccionar —</option>
            {TIEMPOS_ENTREGA.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <EstimadaCalc label="Fecha estimada al cliente" base={f.fechaRecepcionOC} tiempo={f.tiempoEntregaCliente} />

        <div className="field">
          <label>Fecha del proceso <span className="td-mut" style={{ fontWeight: 400 }}>· envío al proveedor</span></label>
          <input type="date" value={f.fechaProceso} onChange={set("fechaProceso")} />
        </div>
        <div className="field">
          <label>Tiempo de entrega a Bloobit</label>
          <select value={f.tiempoEntregaBloobit} onChange={set("tiempoEntregaBloobit")}>
            <option value="">— Seleccionar —</option>
            {TIEMPOS_ENTREGA.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <EstimadaCalc label="Fecha estimada a Bloobit" base={f.fechaProceso || f.fechaRecepcionOC} tiempo={f.tiempoEntregaBloobit} alerta />
        <div className="field">
          <label>Fecha de entrega al cliente</label>
          <input type="date" value={f.fechaEntregaRealCliente} onChange={set("fechaEntregaRealCliente")} />
        </div>

        <div className="field">
          <label>Indicador <span className="td-mut" style={{ fontWeight: 400 }}>· ¿no aplica?</span></label>
          <select value={f.noAplica} onChange={set("noAplica")}>
            <option value="">Sí aplica (normal)</option>
            {NO_APLICA_OPCIONES.map((o) => <option key={o} value={o}>No aplica · {o}</option>)}
          </select>
          <span className="td-mut" style={{ fontSize: 12 }}>
            Si eliges un motivo, la orden se excluye de los indicadores.
          </span>
        </div>
        <div className="field" />
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
