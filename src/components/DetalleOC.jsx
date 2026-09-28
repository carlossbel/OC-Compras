import { useState } from "react";
import Modal from "./Modal";
import OCForm from "./OCForm";
import FlowStepper from "./FlowStepper";
import { EstadoChip, EtapaChip } from "./Chip";
import Semaforo from "./Semaforo";
import Icon from "./Icon";
import { ESTADOS_ENVIO } from "../constants/catalogs";
import { fmtFecha, fmtNum } from "../utils/format";
import { estaAtrasada } from "../utils/estimacion";
import {
  actualizarOrden,
  cambiarEstado,
  cerrarOrden,
  reabrirOrden,
  eliminarOrden,
} from "../services/ocService";

function Item({ k, v, alerta }) {
  return (
    <div className="detail-item">
      <div className="k">{k}</div>
      <div className="v" style={alerta ? { color: "#ef4444", fontWeight: 700 } : undefined}>
        {v || "—"}
      </div>
    </div>
  );
}

function PdfLink({ k, url }) {
  return (
    <div className="detail-item">
      <div className="k">{k}</div>
      <div className="v">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="pdf-link">
            <Icon name="file" size={16} /> Ver PDF
          </a>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}

export default function DetalleOC({ oc, onClose }) {
  const [editar, setEditar] = useState(false);

  const onGuardar = async (data) => {
    await actualizarOrden(oc.id, data);
    setEditar(false);
  };

  const avanzar = async (e) => {
    await cambiarEstado(oc.id, e.target.value);
  };

  const cerrar = async () => {
    if (confirm("¿Cerrar esta OC? Se moverá al histórico de Cerradas.")) {
      await cerrarOrden(oc.id);
      onClose();
    }
  };
  const reabrir = async () => {
    await reabrirOrden(oc.id);
    onClose();
  };
  const borrar = async () => {
    if (confirm("¿Eliminar definitivamente esta OC?")) {
      await eliminarOrden(oc.id);
      onClose();
    }
  };

  return (
    <Modal
      title={editar ? "Editar OC" : `OC ${oc.crol || oc.ocCliente || ""}`}
      onClose={onClose}
    >
      {editar ? (
        <OCForm
          inicial={oc}
          modo="editar"
          onSubmit={onGuardar}
          onCancel={() => setEditar(false)}
        />
      ) : (
        <>
          <FlowStepper etapa={oc.etapa} cerrada={oc.cerrada} />

          <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "16px 0 20px", flexWrap: "wrap" }}>
            <EtapaChip etapa={oc.etapa} cerrada={oc.cerrada} />
            <EstadoChip estado={oc.estadoEnvio} />
            <Semaforo oc={oc} showLabel />
            {!oc.cerrada && (
              <label style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                Cambiar estado:
                <select className="select-inline" value={oc.estadoEnvio} onChange={avanzar}>
                  {ESTADOS_ENVIO.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div className="detail-grid">
              <Item k="Cliente" v={oc.cliente} />
              <Item k="OC Cliente" v={oc.ocCliente} />
              <Item k="CROL" v={oc.crol} />
              <PdfLink k="Vínculo CROL" url={oc.crolUrl} />
              <Item k="Clave Producto" v={oc.claveProducto} />
              <Item k="Cantidad" v={fmtNum(oc.cantidad)} />
              <Item k="Proveedor" v={oc.proveedor} />
              <Item k="Estado Envío" v={oc.estadoEnvio} />
              <Item k="Recepción OC" v={fmtFecha(oc.fechaRecepcionOC)} />
              <Item k="Envío a compras" v={fmtFecha(oc.fechaEnvioCompras)} />
              <Item k="T. entrega cliente" v={oc.tiempoEntregaCliente} />
              <Item k="Estimada cliente" v={fmtFecha(oc.fechaEstimadaCliente)} />
              <Item k="Fecha del proceso" v={fmtFecha(oc.fechaProceso)} />
              <Item k="T. entrega Bloobit" v={oc.tiempoEntregaBloobit} />
              <Item k="Estimada Bloobit" v={fmtFecha(oc.fechaEstimadaBloobit)} alerta={estaAtrasada(oc)} />
              <Item k="Factura Bloobit" v={oc.facturaBloobit} />
              <PdfLink k="Factura (acuse)" url={oc.facturaUrl} />
              <Item k="Entrega real cliente" v={fmtFecha(oc.fechaEntregaRealCliente)} />
            </div>
            {oc.descripcion && (
              <div style={{ marginTop: 16 }}>
                <div className="k" style={{ fontSize: 11.5, textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>Descripción</div>
                <div style={{ marginTop: 4 }}>{oc.descripcion}</div>
              </div>
            )}
            {oc.comentario && (
              <div style={{ marginTop: 14 }}>
                <div className="k" style={{ fontSize: 11.5, textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>Comentario</div>
                <div style={{ marginTop: 4 }}>{oc.comentario}</div>
              </div>
            )}
          </div>

          <div className="form-actions" style={{ justifyContent: "space-between" }}>
            <button className="btn btn-danger" onClick={borrar}><Icon name="trash" size={16} /> Eliminar</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setEditar(true)}><Icon name="edit" size={16} /> Editar</button>
              {oc.cerrada ? (
                <button className="btn btn-ghost" onClick={reabrir}>Reabrir</button>
              ) : (
                <button className="btn btn-green" onClick={cerrar}><Icon name="check" size={16} /> Cerrar OC</button>
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
