import { colorSemaforo } from "../utils/estimacion";

const COLORES = { rojo: "#ef4444", amarillo: "#f59e0b", verde: "#10b981" };
const TITULO = { rojo: "Atrasada", amarillo: "En proceso", verde: "A tiempo" };

export default function Semaforo({ oc, showLabel = false }) {
  const c = colorSemaforo(oc);
  return (
    <span className="semaforo" title={TITULO[c]}>
      <span className="semaforo-luz" style={{ background: COLORES[c] }} />
      {showLabel && <span className="semaforo-txt">{TITULO[c]}</span>}
    </span>
  );
}
