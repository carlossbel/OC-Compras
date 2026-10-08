import { useState } from "react";
import DetalleOC from "./DetalleOC";
import { EstadoChip, EtapaChip } from "./Chip";
import Semaforo from "./Semaforo";
import Progreso from "./Progreso";
import Icon from "./Icon";
import { fmtFecha, fmtNum, partidasDe, facturasDe, cantidadTotal } from "../utils/format";
import { evalEntrega } from "../utils/estimacion";

const IND = {
  aTiempo: { txt: "A tiempo", color: "#10b981", bg: "#ecfdf5" },
  atrasada: { txt: "Atrasada", color: "#ef4444", bg: "#fef2f2" },
  noAplica: { txt: "No aplica", color: "#64748b", bg: "#f1f5f9" },
};
function IndicadorChip({ oc }) {
  const r = evalEntrega(oc);
  if (!r) return <span className="td-mut">—</span>;
  const c = IND[r];
  return <span className="chip" style={{ background: c.bg, color: c.color }}>{c.txt}</span>;
}

export default function OCTable({
  titulo,
  rows,
  vacio = "No hay órdenes en esta vista.",
  mostrarEtapa = true,
  mostrarHoja = false,
  mostrarIndicador = false,
}) {
  const [sel, setSel] = useState(null);
  const cols = 9 + (mostrarEtapa ? 1 : 0) + (mostrarIndicador ? 1 : 0) + (mostrarHoja ? 1 : 0);

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
              {mostrarEtapa && <th>Etapa / progreso</th>}
              <th>Estim. Bloobit</th>
              <th>Factura</th>
              {mostrarIndicador && <th>Indicador</th>}
              {mostrarHoja && <th>Hoja</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols}>
                  <div className="empty">
                    <Icon name="inbox" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} />
                    <div>{vacio}</div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((o) => {
                const parts = partidasDe(o);
                const primera = parts[0] || {};
                const desc = primera.descripcion || "";
                const facs = facturasDe(o);
                return (
                <tr key={o.id} onClick={() => setSel(o)} style={{ cursor: "pointer" }}>
                  <td><Semaforo oc={o} /></td>
                  <td className="td-strong">
                    {o.cliente || "—"}
                    {o.noAplica && <div className="chip soft" style={{ fontSize: 10, marginTop: 3 }}>No aplica · {o.noAplica}</div>}
                  </td>
                  <td>
                    <div className="td-strong">{o.ocCliente || "—"}</div>
                    <div className="td-mut" style={{ fontSize: 12 }}>{o.crol}</div>
                  </td>
                  <td className="td-desc">
                    {desc ? (desc.length > 85 ? desc.slice(0, 85) + "…" : desc) : "—"}
                    <div className="td-mut" style={{ fontSize: 12 }}>
                      {primera.claveProducto}
                      {parts.length > 1 && <span> · +{parts.length - 1} partida{parts.length - 1 > 1 ? "s" : ""}</span>}
                    </div>
                  </td>
                  <td>{fmtNum(cantidadTotal(o))}</td>
                  <td>{o.proveedor || "—"}</td>
                  <td><EstadoChip estado={o.estadoEnvio} /></td>
                  {mostrarEtapa && (
                    <td>
                      <EtapaChip etapa={o.etapa} cerrada={o.cerrada} />
                      <div style={{ marginTop: 6 }}><Progreso etapa={o.etapa} cerrada={o.cerrada} /></div>
                    </td>
                  )}
                  <td className="td-mut">{fmtFecha(o.fechaEstimadaBloobit)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {facs.length ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        {facs.map((fc, i) =>
                          fc.url ? (
                            <a key={i} href={fc.url} target="_blank" rel="noopener noreferrer" className="pdf-link" title={fc.numero || "Ver factura"}><Icon name="file" size={16} /></a>
                          ) : (
                            <span key={i} className="td-mut" title={fc.numero} style={{ fontSize: 12 }}>{fc.numero || "—"}</span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="td-mut">—</span>
                    )}
                  </td>
                  {mostrarIndicador && (
                    <td><IndicadorChip oc={o} /></td>
                  )}
                  {mostrarHoja && (
                    <td><span className="chip soft">{o.cerrada ? "Cerradas" : "Pendientes"}</span></td>
                  )}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sel && <DetalleOC oc={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
