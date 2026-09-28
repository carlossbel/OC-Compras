import { COLOR_ETAPA, COLOR_ESTADO } from "../constants/catalogs";

export function EtapaChip({ etapa, cerrada }) {
  const label = cerrada ? "Cerrada" : etapa;
  const color = cerrada ? COLOR_ETAPA.Cerrada : COLOR_ETAPA[etapa] || "#64748b";
  return (
    <span className="chip" style={{ background: color }}>
      {label}
    </span>
  );
}

export function EstadoChip({ estado }) {
  const color = COLOR_ESTADO[estado] || "#64748b";
  return (
    <span className="chip soft" style={{ color }}>
      <span className="dot" /> {estado}
    </span>
  );
}
