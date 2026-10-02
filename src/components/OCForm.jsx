import { useState } from "react";
import {
  ESTADOS_ENVIO,
  TIEMPOS_ENTREGA,
  PROVEEDORES,
} from "../constants/catalogs";
import { fmtFecha } from "../utils/format";
import { estimarFecha } from "../utils/estimacion";
import PdfLinkField from "./PdfLinkField";

const VACIO = {
  cliente: "",
  ocCliente: "",
  fechaRecepcionOC: "",
  fechaEnvioCompras: "",
  tiempoEntregaCliente: "",
  crol: "",
  crolUrl: "",
  cantidad: "",
  claveProducto: "",
  descripcion: "",
  fechaProceso: "",
  proveedor: "",
  tiempoEntregaBloobit: "",
  estadoEnvio: "Pendiente",
  facturaBloobit: "",
  facturaUrl: "",
  fechaEntregaRealCliente: "",
  comentario: "",
};

// Muestra una fecha estimada calculada por fórmula (solo lectura).
function EstimadaCalc({ label, base, tiempo, alerta }) {
  const val = estimarFecha(base, tiempo);
  const atrasada =
    alerta && val && val < new Date().toISOString().slice(0, 10);
  return (
    <div className="field">
      <label>{label} <span className="td-mut" style={{ fontWeight: 400 }}>· fórmula</span></label>
      <input
        readOnly
        value={val ? fmtFecha(val) : "— se calcula —"}
        style={
          atrasada
            ? { color: "#ef4444", fontWeight: 700, borderColor: "#f3c6c6", background: "#fef2f2" }
            : { background: "#f8fafc", color: "#475569" }
        }
      />
    </div>
  );
}

export default function OCForm({ inicial, onSubmit, onCancel, modo = "crear" }) {
  const [f, setF] = useState({
    ...VACIO,
    fechaRecepcionOC:
      modo === "crear" ? new Date().toISOString().slice(0, 10) : "",
    ...(inicial || {}),
  });
  const [guardando, setGuardando] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setVal = (k) => (v) => setF({ ...f, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.cliente.trim()) return alert("El cliente es obligatorio.");
    if (!f.descripcion.trim()) return alert("La descripción es obligatoria.");
    setGuardando(true);
    try {
      const payload = {
        ...f,
        cantidad: f.cantidad === "" ? null : Number(f.cantidad),
        // Fechas estimadas por fórmula (se guardan para reportes y semáforo)
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
        <PdfLinkField
          label="Vínculo a la CROL (PDF / enlace)"
          value={f.crolUrl}
          onChange={setVal("crolUrl")}
        />

        <div className="field">
          <label>Clave de Producto</label>
          <input value={f.claveProducto} onChange={set("claveProducto")} placeholder="Se toma de la OC del CROL" />
        </div>
        <div className="field" />

        <div className="field full">
          <label>Descripción <span className="req">*</span></label>
          <textarea value={f.descripcion} onChange={set("descripcion")} placeholder="Se toma de la OC del CROL" />
        </div>

        <div className="field">
          <label>Cantidad</label>
          <input type="number" min="0" value={f.cantidad} onChange={set("cantidad")} />
        </div>
        <div className="field">
          <label>Proveedor</label>
          <select value={f.proveedor} onChange={set("proveedor")}>
            <option value="">— Seleccionar —</option>
            {PROVEEDORES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Fechas base y estimadas al cliente */}
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
        <EstimadaCalc
          label="Fecha estimada al cliente"
          base={f.fechaRecepcionOC}
          tiempo={f.tiempoEntregaCliente}
        />

        {/* Proceso / Bloobit */}
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

        <EstimadaCalc
          label="Fecha estimada a Bloobit"
          base={f.fechaProceso || f.fechaRecepcionOC}
          tiempo={f.tiempoEntregaBloobit}
          alerta
        />
        <div className="field">
          <label>Estado de envío <span className="td-mut" style={{ fontWeight: 400 }}>· semáforo</span></label>
          <select value={f.estadoEnvio} onChange={set("estadoEnvio")}>
            {ESTADOS_ENVIO.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="td-mut" style={{ fontSize: 12 }}>
            Define la etapa automáticamente (Inicio → Seguimiento → Finalizado).
          </span>
        </div>

        {/* Factura + entrega */}
        <div className="field">
          <label>Factura Bloobit</label>
          <input value={f.facturaBloobit} onChange={set("facturaBloobit")} placeholder="Ej. B15563" />
        </div>
        <PdfLinkField
          label="Factura (PDF / enlace)"
          value={f.facturaUrl}
          onChange={setVal("facturaUrl")}
        />

        <div className="field">
          <label>Fecha de entrega al cliente</label>
          <input type="date" value={f.fechaEntregaRealCliente} onChange={set("fechaEntregaRealCliente")} />
        </div>
        <div className="field" />

        <div className="field full">
          <label>Comentarios</label>
          <textarea value={f.comentario} onChange={set("comentario")} placeholder="Campo de texto general" />
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? "Guardando…" : modo === "crear" ? "Crear orden" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
