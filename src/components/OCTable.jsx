import { useState } from "react";
import DetalleOC from "./DetalleOC";
import { EstadoChip, EtapaChip } from "./Chip";
import Semaforo from "./Semaforo";
import Icon from "./Icon";
import { fmtFecha, fmtNum } from "../utils/format";

export default function OCTable({
  titulo,
  rows,
  vacio = "No hay órdenes en esta vista.",
  mostrarEtapa = true,
  mostrarHoja = false,
}) {
  const [sel, setSel] = useState(null);

  return (
    <div className="table-wrap">
      {titulo && (
        <div className="table-head">
          <h3>{titulo}</h3>
          <span className="count">· {rows.length} órdenes</span>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Cliente</th>
              <th>OC / CROL</th>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Proveedor</th>
              <th>Estado</th>
              {mostrarEtapa && <th>Etapa</th>}
              <th>Estim. Bloobit</th>
              <th>Factura</th>
              {mostrarHoja && <th>Hoja</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={mostrarEtapa ? 10 : 9}>
                  <div className="empty">
                    <Icon name="inbox" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} />
                    <div>{vacio}</div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id} onClick={() => setSel(o)} style={{ cursor: "pointer" }}>
                  <td><Semaforo oc={o} /></td>
                  <td className="td-strong">{o.cliente || "—"}</td>
                  <td>
                    <div className="td-strong">{o.ocCliente || "—"}</div>
                    <div className="td-mut" style={{ fontSize: 12 }}>{o.crol}</div>
                  </td>
                  <td className="td-desc">
                    {o.descripcion
                      ? o.descripcion.length > 90
                        ? o.descripcion.slice(0, 90) + "…"
                        : o.descripcion
                      : "—"}
                    {o.claveProducto && (
                      <div className="td-mut" style={{ fontSize: 12 }}>{o.claveProducto}</div>
                    )}
                  </td>
                  <td>{fmtNum(o.cantidad)}</td>
                  <td>{o.proveedor || "—"}</td>
                  <td><EstadoChip estado={o.estadoEnvio} /></td>
                  {mostrarEtapa && (
                    <td><EtapaChip etapa={o.etapa} cerrada={o.cerrada} /></td>
                  )}
                  <td className="td-mut">{fmtFecha(o.fechaEstimadaBloobit)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {o.facturaUrl ? (
                      <a href={o.facturaUrl} target="_blank" rel="noopener noreferrer" className="pdf-link" title="Ver factura"><Icon name="file" size={16} /></a>
                    ) : (
                      <span className="td-mut">—</span>
                    )}
                  </td>
                  {mostrarHoja && (
                    <td><span className="chip soft">{o.cerrada ? "Cerradas" : "Pendientes"}</span></td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sel && <DetalleOC oc={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
