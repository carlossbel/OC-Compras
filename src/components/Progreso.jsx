import { ETAPAS, COLOR_ETAPA } from "../constants/catalogs";

// Barra de progreso del avance de la CROL por etapa.
// Inicio 25% · Seguimiento 50% · Finalizado 75% · Cerrada 100%
export default function Progreso({ etapa, cerrada, showLabel = false }) {
  const idx = cerrada ? 3 : Math.max(0, ETAPAS.indexOf(etapa));
  const pct = ((idx + 1) / 4) * 100;
  const color = cerrada ? COLOR_ETAPA.Cerrada : COLOR_ETAPA[etapa] || "#64748b";

  return (
    <div className="prog" title={`${cerrada ? "Cerrada" : etapa} · ${pct}%`}>
      <div className="prog-track">
        <span className="prog-fill" style={{ width: `${pct}%`, background: color }} />
        {[1, 2, 3].map((n) => (
          <span key={n} className="prog-tick" style={{ left: `${n * 25}%` }} />
        ))}
      </div>
      {showLabel && <span className="prog-lbl">{cerrada ? "Cerrada" : etapa} · {pct}%</span>}
    </div>
  );
}
