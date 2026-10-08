import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCForm from "../components/OCForm";
import FlowStepper from "../components/FlowStepper";
import { crearOrden } from "../services/ocService";
import { etapaDeEstado } from "../utils/format";

export default function NuevaOC() {
  const nav = useNavigate();

  const onSubmit = async (data) => {
    await crearOrden(data);
    const etapa = etapaDeEstado(data.estadoEnvio);
    const destino =
      etapa === "Seguimiento" ? "/seguimiento" :
      etapa === "Finalizado" ? "/finalizados" : "/inicio";
    nav(destino);
  };

  return (
    <>
      <Topbar title="Nueva Orden de Compra" />
      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="td-mut" style={{ marginBottom: 10, fontSize: 13 }}>
            Al crear la orden, se colocará en la etapa que corresponda a su estado de envío.
            El flujo avanza así:
          </div>
          <FlowStepper etapa="Inicio" cerrada={false} />
        </div>

        <div className="card">
          <OCForm modo="crear" onSubmit={onSubmit} onCancel={() => nav("/")} />
        </div>
      </div>
    </>
  );
}
