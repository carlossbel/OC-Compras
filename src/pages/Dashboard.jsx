import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { COLOR_ESTADO, ESTADOS_ENVIO } from "../constants/catalogs";
import { indicadorEntregas, indicadorIngreso } from "../utils/estimacion";
import { vendedorDeUsuario, vendedorDeOC } from "../constants/vendedores";

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 70, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <g transform="translate(90,90) rotate(-90)">
          <circle r={R} fill="none" strokeWidth="24" style={{ stroke: "var(--glass-border)" }} />
          {total > 0 &&
            data.map((d, i) => {
              const len = (d.value / total) * C;
              const el = (
                <circle
                  key={i}
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="24"
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
        </g>
        <text x="90" y="84" textAnchor="middle" fontSize="30" fontWeight="800" style={{ fill: "var(--text)" }}>{total}</text>
        <text x="90" y="104" textAnchor="middle" fontSize="12" style={{ fill: "var(--muted)" }}>partidas</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color }} />
            <span style={{ minWidth: 130 }}>{d.label}</span>
            <b>{d.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { ordenes, pendientes, cerradas, inicio, seguimiento, finalizado } = useData();
  const { esAdmin, user } = useAuth();
  const nav = useNavigate();

  const ing = indicadorIngreso(ordenes);               // ¿ingreso de OC dentro de 2 días hábiles?
  const noAplicaCerradas = cerradas.filter((o) => o.noAplica).length;

  const miVendedor = vendedorDeUsuario(user?.nombre);
  const pendientesChart = miVendedor
    ? pendientes.filter((o) => vendedorDeOC(o) === miVendedor)
    : pendientes;

  const donut = ESTADOS_ENVIO.map((s) => ({
    label: s,
    value: pendientesChart.filter((o) => o.estadoEnvio === s).length,
    color: COLOR_ESTADO[s],
  })).filter((d) => d.value > 0);

  const ind = indicadorEntregas(cerradas);

  const stats = [
    { label: "Inicio", value: inicio.length, sub: "Por procesar", color: "#f59e0b", to: "/inicio" },
    { label: "Seguimiento", value: seguimiento.length, sub: "Producción / tránsito", color: "#6366f1", to: "/seguimiento" },
    { label: "Finalizados", value: finalizado.length, sub: "Recibidas / entregadas", color: "#10b981", to: "/finalizados" },
    {
      label: "Cerradas",
      value: cerradas.length,
      sub: ind.pct !== null ? `${ind.pct}% entregas a tiempo` : "Histórico",
      color: "#64748b",
      to: "/cerradas",
    },
  ];

  return (
    <>
      <Topbar title="Dashboard">
        {esAdmin && <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>}
      </Topbar>

      <div className="content">
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ margin: "0 0 2px" }}>Resumen general</h2>
          <p className="td-mut" style={{ margin: 0 }}>Órdenes de compra por etapa e indicador de cumplimiento.</p>
        </div>

        <div className="grid cards-4">
          {stats.map((s) => (
            <div className="stat" key={s.label} style={{ cursor: "pointer" }} onClick={() => nav(s.to)}>
              <span className="accent" style={{ background: s.color }} />
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
              <div className="sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid cards-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Partidas por estado de envío{miVendedor ? ` · ${miVendedor}` : ""}
            </div>
            {donut.length ? (
              <Donut data={donut} />
            ) : (
              <div className="empty"><Icon name="chart" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Aún no hay órdenes registradas.</div></div>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Indicador · Entregas a tiempo (cerradas)
            </div>
            {ind.total > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: "var(--green)" }}>{ind.pct}%</span>
                  <span className="td-mut">a tiempo · {ind.total} órdenes evaluadas</span>
                </div>
                <div className="ind-bar">
                  <span style={{ width: `${ind.pct}%`, background: "var(--green)" }} />
                  <span style={{ width: `${100 - ind.pct}%`, background: "var(--red)" }} />
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: "var(--green)" }} />
                    <span className="td-mut">A tiempo</span> <b>{ind.aTiempo}</b>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: "var(--red)" }} />
                    <span className="td-mut">Atrasadas</span> <b>{ind.atrasadas}</b>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty"><Icon name="checkCircle" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Aún no hay órdenes cerradas con fecha de entrega para evaluar.</div></div>
            )}
          </div>
        </div>

        <div className="grid cards-2" style={{ marginTop: 16 }}>
          {/* Indicador de ingreso de OC dentro de 2 días hábiles */}
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Indicador · Ingreso de OC a tiempo (≤ 2 días hábiles)
            </div>
            {ing.total > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: "var(--blue)" }}>{ing.pct}%</span>
                  <span className="td-mut">dentro de los 2 días · {ing.total} órdenes evaluadas</span>
                </div>
                <div className="ind-bar">
                  <span style={{ width: `${ing.pct}%`, background: "var(--blue)" }} />
                  <span style={{ width: `${100 - ing.pct}%`, background: "var(--amber, #f59e0b)" }} />
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: "var(--blue)" }} />
                    <span className="td-mut">Dentro de 2 días</span> <b>{ing.aTiempo}</b>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: "#f59e0b" }} />
                    <span className="td-mut">Fuera del plazo</span> <b>{ing.fuera}</b>
                  </div>
                </div>
                <div className="td-mut" style={{ fontSize: 12, marginTop: 10 }}>
                  Compara la <b>fecha de envío a compras</b> con la <b>fecha de proceso</b> (días hábiles).
                </div>
              </>
            ) : (
              <div className="empty"><Icon name="inbox" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Aún no hay órdenes con fecha de envío a compras y de proceso para evaluar.</div></div>
            )}
          </div>

          {/* Contador de No aplica en cerradas */}
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Cerradas marcadas “No aplica”
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: "#64748b" }}>{noAplicaCerradas}</span>
              <span className="td-mut">de {cerradas.length} órdenes cerradas</span>
            </div>
            <div className="ind-bar">
              <span style={{ width: `${cerradas.length ? Math.round((noAplicaCerradas / cerradas.length) * 100) : 0}%`, background: "#64748b" }} />
              <span style={{ width: `${cerradas.length ? 100 - Math.round((noAplicaCerradas / cerradas.length) * 100) : 100}%`, background: "var(--glass-border)" }} />
            </div>
            <div className="td-mut" style={{ fontSize: 12, marginTop: 12 }}>
              Órdenes excluidas de los indicadores (backorder, parcial, proyecto, paquetería, cierre de mes, etc.).
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
