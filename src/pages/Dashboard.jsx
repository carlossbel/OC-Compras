import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { COLOR_ESTADO, ESTADOS_ENVIO } from "../constants/catalogs";
import { indicadorEntregas, indicadorIngreso, colorSemaforo } from "../utils/estimacion";
import { vendedorDeUsuario, vendedorDeOC, VENDEDORES } from "../constants/vendedores";

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

  const miVendedor = vendedorDeUsuario(user?.nombre);

  // Órdenes y cerradas del perfil (si es vendedor, solo las suyas).
  const ordenesPerfil = miVendedor ? ordenes.filter((o) => vendedorDeOC(o) === miVendedor) : ordenes;
  const cerradasPerfil = miVendedor ? cerradas.filter((o) => vendedorDeOC(o) === miVendedor) : cerradas;
  const noAplicaCerradas = cerradasPerfil.filter((o) => o.noAplica).length;

  const ing = indicadorIngreso(ordenesPerfil);         // ¿ingreso de OC dentro de 2 días hábiles? (por perfil)

  // Contador de semáforo por vendedor. Si el perfil es de un vendedor, solo el suyo.
  const semaforoPorVendedor = (() => {
    const vendedoresTabla = miVendedor ? [miVendedor] : VENDEDORES;
    const map = {};
    for (const v of vendedoresTabla) map[v] = { verde: 0, amarillo: 0, rojo: 0 };
    for (const o of ordenes) {
      const v = vendedorDeOC(o);
      if (!map[v]) continue;
      const c = colorSemaforo(o); // "verde" | "amarillo" | "rojo"
      if (map[v][c] !== undefined) map[v][c]++;
    }
    return vendedoresTabla
      .map((v) => ({ v, ...map[v], total: map[v].verde + map[v].amarillo + map[v].rojo }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
  })();
  const pendientesChart = miVendedor
    ? pendientes.filter((o) => vendedorDeOC(o) === miVendedor)
    : pendientes;

  const donut = ESTADOS_ENVIO.map((s) => ({
    label: s,
    value: pendientesChart.filter((o) => o.estadoEnvio === s).length,
    color: COLOR_ESTADO[s],
  })).filter((d) => d.value > 0);

  const indGeneral = indicadorEntregas(cerradas);      // general (para la tarjeta de Cerradas)
  const ind = indicadorEntregas(cerradasPerfil);       // entregas a tiempo por perfil

  const stats = [
    { label: "Inicio", value: inicio.length, sub: "Por procesar", color: "#f59e0b", to: "/inicio" },
    { label: "Seguimiento", value: seguimiento.length, sub: "Producción / tránsito", color: "#6366f1", to: "/seguimiento" },
    { label: "Finalizados", value: finalizado.length, sub: "Recibidas / entregadas", color: "#10b981", to: "/finalizados" },
    {
      label: "Cerradas",
      value: cerradas.length,
      sub: indGeneral.pct !== null ? `${indGeneral.pct}% entregas a tiempo` : "Histórico",
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
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, color: "var(--muted)", fontWeight: 700, letterSpacing: .3 }}>Resumen general</h3>
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

        <h2 style={{ margin: "26px 0 4px" }}>Resumen de tus órdenes</h2>

        {/* Semáforo (arriba de partidas por estado de envío) */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="section-title" style={{ margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="semaforo" size={17} /> {miVendedor ? "Mi semáforo" : "Semáforo por vendedor"}
          </div>
          {semaforoPorVendedor.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="tabla-semaforo">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Vendedor</th>
                    <th><span className="sem-dot" style={{ background: "#10b981" }} /> A tiempo</th>
                    <th><span className="sem-dot" style={{ background: "#f59e0b" }} /> En proceso</th>
                    <th><span className="sem-dot" style={{ background: "#ef4444" }} /> Atrasada</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {semaforoPorVendedor.map((r) => (
                    <tr key={r.v}>
                      <td style={{ textAlign: "left", fontWeight: 600 }}>{r.v}</td>
                      <td><b style={{ color: "#10b981" }}>{r.verde}</b></td>
                      <td><b style={{ color: "#f59e0b" }}>{r.amarillo}</b></td>
                      <td><b style={{ color: "#ef4444" }}>{r.rojo}</b></td>
                      <td><b>{r.total}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty"><Icon name="semaforo" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Aún no hay órdenes para evaluar el semáforo.</div></div>
          )}
        </div>

        <div className="grid cards-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Partidas por estado de envío
            </div>
            {donut.length ? (
              <Donut data={donut} />
            ) : (
              <div className="empty"><Icon name="chart" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Aún no hay órdenes registradas.</div></div>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Entregas a tiempo (cerradas)
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
              Ingreso de OC a tiempo
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

          {/* Contador de No aplica en cerradas (todos, con los datos del perfil) */}
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>
              Cerradas marcadas “No aplica”
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: "#64748b" }}>{noAplicaCerradas}</span>
              <span className="td-mut">de {cerradasPerfil.length} órdenes cerradas</span>
            </div>
            <div className="ind-bar">
              <span style={{ width: `${cerradasPerfil.length ? Math.round((noAplicaCerradas / cerradasPerfil.length) * 100) : 0}%`, background: "#64748b" }} />
              <span style={{ width: `${cerradasPerfil.length ? 100 - Math.round((noAplicaCerradas / cerradasPerfil.length) * 100) : 100}%`, background: "var(--glass-border)" }} />
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
