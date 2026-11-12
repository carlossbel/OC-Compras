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
                Ve a <b>Nueva OC</b> y llena los datos: elige el <b>cliente</b> de la lista (o agrégalo),
                captura el <b>CROL</b>, el <b>proveedor</b> y hasta <b>10 partidas</b> con las pestañas
                “Agregar”. Define el <b>tiempo de entrega</b> y presiona <b>Crear orden</b>. Puedes registrar
                varias <b>facturas</b> y marcar <b>“No aplica”</b> (backorder, parcial, proyecto, paquetería…)
                para excluirla de los indicadores. Nace en la etapa que corresponda a su estado.
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
                Toca la <b>lupa</b> del encabezado para abrir el <b>Buscador</b> y encontrar una orden por
                CROL, clave, producto, cliente o proveedor. También puedes filtrar por <b>etapa</b>,
                <b> vendedor</b> y <b>rango de fechas</b>.
              </Paso>
              <Paso n="3" titulo="Reportes">
                En <b>Reportes</b> filtra por fechas, etapa, estado, proveedor o cliente, revisa los
                indicadores y exporta a <b>CSV</b> o <b>PDF</b>.
              </Paso>
              <div className="ayuda-tip">
                <Icon name="eye" size={16} />
                <span>Tu cuenta es de <b>solo lectura</b>: puedes ver, buscar y generar reportes, pero no modificar órdenes.</span>
              </div>
            </>
          )}
        </div>

        {/* Buscar y filtrar */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ margin: "0 0 10px" }}>
            <Icon name="search" size={17} /> Buscar y filtrar
          </div>
          <p className="td-mut" style={{ margin: "0 0 12px", lineHeight: 1.6, fontSize: 13 }}>
            La <b>lupa</b> arriba a la derecha abre el <b>Buscador</b> general (texto + etapa + vendedor +
            fechas). Además, en <b>Inicio</b>, <b>Seguimiento</b>, <b>Finalizados</b> y <b>Todas</b> tienes
            una barra de filtros compacta:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="ayuda-sem" style={{ alignItems: "flex-start" }}>
              <span className="icon-box on" style={{ width: 30, height: 30, flexShrink: 0 }}><Icon name="search" size={15} /></span>
              <span className="ayuda-desc"><b>Texto:</b> busca por CROL, clave, producto, cliente o factura.</span>
            </div>
            <div className="ayuda-sem" style={{ alignItems: "flex-start" }}>
              <span className="icon-box on" style={{ width: 30, height: 30, flexShrink: 0 }}><Icon name="user" size={15} /></span>
              <span className="ayuda-desc"><b>Vendedor:</b> la caja con icono de usuario despliega la lista; elige uno para ver solo sus órdenes.</span>
            </div>
            <div className="ayuda-sem" style={{ alignItems: "flex-start" }}>
              <span className="icon-box on" style={{ width: 30, height: 30, flexShrink: 0 }}><Icon name="calendar" size={15} /></span>
              <span className="ayuda-desc"><b>Fechas:</b> abre el calendario, elige la <b>fecha inicial</b> y luego la <b>final</b> para filtrar ese rango.</span>
            </div>
            <div className="ayuda-sem" style={{ alignItems: "flex-start" }}>
              <span className="icon-box on" style={{ width: 30, height: 30, flexShrink: 0 }}><Icon name="trash" size={15} /></span>
              <span className="ayuda-desc"><b>Limpiar:</b> restablece todos los filtros.</span>
            </div>
          </div>
        </div>

        {/* Clientes por vendedor */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ margin: "0 0 10px" }}>
            <Icon name="user" size={17} /> Clientes por vendedor
          </div>
          <p className="td-mut" style={{ margin: 0, lineHeight: 1.6, fontSize: 13 }}>
            El módulo <b>Clientes</b> muestra la cartera de cada vendedor. Lo mejor: <b>los clientes se
            agregan solos</b> conforme registras las OC —no hay que capturarlos aparte—. El sistema sabe
            de quién es cada cliente por el <b>prefijo</b> (las 3 primeras letras) de la clave de producto.
            Cada persona puede agregar clientes a su propia cartera (Karla y Ana, a cualquiera).
          </p>
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
