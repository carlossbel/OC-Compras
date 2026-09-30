import Topbar from "../components/Topbar";
import Icon from "../components/Icon";
import FlowStepper from "../components/FlowStepper";
import { EstadoChip } from "../components/Chip";
import { useAuth } from "../context/AuthContext";

function Paso({ n, titulo, children }) {
  return (
    <div className="ayuda-paso">
      <div className="ayuda-num">{n}</div>
      <div>
        <div className="ayuda-paso-t">{titulo}</div>
        <div className="td-mut" style={{ fontSize: 13, lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

function EstadoFila({ estado, etapa, desc }) {
  return (
    <div className="ayuda-estado">
      <EstadoChip estado={estado} />
      <Icon name="arrowRight" size={14} style={{ color: "var(--muted)" }} />
      <b>{etapa}</b>
      <span className="ayuda-desc">{desc}</span>
    </div>
  );
}

export default function Ayuda() {
  const { esAdmin } = useAuth();

  return (
    <>
      <Topbar title="Ayuda" />
      <div className="content" style={{ maxWidth: 980 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: "0 0 6px" }}>¿Cómo funciona el sistema?</h2>
          <p className="td-mut" style={{ margin: 0, lineHeight: 1.6 }}>
            Esta plataforma da seguimiento a las <b>órdenes de compra (OC)</b> desde que ingresan
            hasta que se cierran. Cada orden avanza automáticamente por etapas según su
            <b> estado de envío</b>.
          </p>
        </div>

        {/* Flujo */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ margin: "0 0 16px" }}>
            <Icon name="truck" size={17} /> El flujo de una orden
          </div>
          <FlowStepper etapa="Seguimiento" cerrada={false} />
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <EstadoFila estado="Pendiente" etapa="Inicio" desc="Recién ingresada, por procesar." />
            <EstadoFila estado="Order Processing" etapa="Inicio" desc="En proceso de ingreso." />
            <EstadoFila estado="Produccion" etapa="Seguimiento" desc="El proveedor la está preparando." />
            <EstadoFila estado="Transito" etapa="Seguimiento" desc="En camino hacia Bloobit." />
            <EstadoFila estado="Recibido" etapa="Finalizado" desc="Llegó a Bloobit." />
            <EstadoFila estado="Entregado" etapa="Finalizado" desc="Entregada al cliente." />
          </div>
          <div className="ayuda-tip">
            <Icon name="checkCircle" size={16} />
            <span>Cambia el <b>estado de envío</b> de una orden y esta se moverá sola a la etapa correcta. Desde <b>Finalizado</b> puedes <b>cerrarla</b> y pasará al histórico de <b>Cerradas</b>.</span>
          </div>
        </div>

        {/* Pasos de uso */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ margin: "0 0 4px" }}>
            <Icon name="list" size={17} /> Paso a paso
          </div>
          {esAdmin ? (
            <>
              <Paso n="1" titulo="Crear una orden">
                Ve a <b>Nueva OC</b>, llena los datos (cliente, CROL, producto, proveedor, fechas y
                tiempos de entrega) y presiona <b>Crear orden</b>. Nace en la etapa que corresponda a su estado.
              </Paso>
              <Paso n="2" titulo="Dar seguimiento">
                Abre la orden desde <b>Inicio</b>, <b>Seguimiento</b> o <b>Finalizados</b> y cambia su
                <b> estado de envío</b> conforme avanza con el proveedor.
              </Paso>
              <Paso n="3" titulo="Vincular documentos">
                En los campos de <b>CROL</b> y <b>Factura</b> pega el enlace del PDF desde OneDrive
                (Compartir → Copiar vínculo) y presiona <b>Guardar</b>. Quedará como “Ver PDF”.
              </Paso>
              <Paso n="4" titulo="Cerrar la orden">
                Cuando esté entregada, ábrela y presiona <b>Cerrar OC</b>. Se moverá a <b>Cerradas</b>.
                Si necesitas, puedes <b>Reabrir</b> o <b>Editar</b> cualquier orden.
              </Paso>
            </>
          ) : (
            <>
              <Paso n="1" titulo="Consultar órdenes">
                Navega por <b>Inicio</b>, <b>Seguimiento</b>, <b>Finalizados</b> y <b>Cerradas</b> para
                ver las órdenes en cada etapa. Haz clic en cualquiera para ver su detalle completo.
              </Paso>
              <Paso n="2" titulo="Buscar">
                Usa el <b>Buscador</b> para encontrar una orden por CROL, factura, cliente, producto o proveedor.
              </Paso>
              <Paso n="3" titulo="Reportes">
                En <b>Reportes</b> filtra por fechas, etapa, estado, proveedor o cliente, revisa los
                indicadores y exporta a CSV.
              </Paso>
              <div className="ayuda-tip">
                <Icon name="eye" size={16} />
                <span>Tu cuenta es de <b>solo lectura</b>: puedes ver, buscar y generar reportes, pero no modificar órdenes.</span>
              </div>
            </>
          )}
        </div>

        {/* Semáforo */}
        <div className="grid cards-2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              <Icon name="eye" size={17} /> El semáforo
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="ayuda-sem"><span className="semaforo-luz" style={{ background: "#10b981" }} /><b>Verde</b><span className="ayuda-desc">entregada / recibida (a tiempo)</span></div>
              <div className="ayuda-sem"><span className="semaforo-luz" style={{ background: "#f59e0b" }} /><b>Amarillo</b><span className="ayuda-desc">en proceso, dentro de plazo</span></div>
              <div className="ayuda-sem"><span className="semaforo-luz" style={{ background: "#ef4444" }} /><b>Rojo</b><span className="ayuda-desc">atrasada (pasó la fecha estimada y no ha llegado)</span></div>
            </div>
          </div>
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              <Icon name="calendar" size={17} /> Fechas automáticas
            </div>
            <p className="td-mut" style={{ margin: 0, lineHeight: 1.6, fontSize: 13 }}>
              Las <b>fechas estimadas</b> se calculan solas a partir del tiempo de entrega, contando solo
              <b> días hábiles</b> (omite fines de semana y días festivos de México). La fecha estimada a
              Bloobit se marca en <b style={{ color: "var(--red)" }}>rojo</b> si no se cumple.
            </p>
          </div>
        </div>

        {/* Roles */}
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 14px" }}>
            <Icon name="user" size={17} /> Roles de usuario
          </div>
          <div className="grid cards-2">
            <div className="ayuda-rol">
              <span className="rol-chip rol-admin">Administrador</span>
              <p className="td-mut" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Acceso total: crear, editar, cambiar estado, cerrar/reabrir y eliminar órdenes, además de reportes.
              </p>
            </div>
            <div className="ayuda-rol">
              <span className="rol-chip rol-lector">Solo lectura</span>
              <p className="td-mut" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Puede ver todas las órdenes, buscar, filtrar y generar reportes. No puede crear ni modificar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
