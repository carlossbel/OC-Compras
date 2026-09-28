import { ETAPAS } from "../constants/catalogs";
import Icon from "./Icon";

// Muestra el avance de la OC en el flujo: Inicio -> Seguimiento -> Finalizado -> Cerrada
export default function FlowStepper({ etapa, cerrada }) {
  const pasos = [...ETAPAS, "Cerrada"];
  const actualIdx = cerrada ? 3 : ETAPAS.indexOf(etapa);

  return (
    <div className="flow">
      {pasos.map((p, i) => {
        const cls =
          i < actualIdx ? "done" : i === actualIdx ? "current" : "";
        return (
          <div className="flow-step" key={p}>
            <div className={`flow-node ${cls}`}>
              {i < actualIdx ? <Icon name="check" size={15} /> : <span className="flow-num">{i + 1}</span>} {p}
            </div>
            {i < pasos.length - 1 && <div className="flow-arrow" />}
          </div>
        );
      })}
    </div>
  );
}
