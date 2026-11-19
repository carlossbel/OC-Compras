import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { ESTADOS_ENVIO, ETAPAS } from "../constants/catalogs";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";
import { indicadorEntregas, evalEntrega } from "../utils/estimacion";
import { fmtFecha, cantidadTotal } from "../utils/format";

const CAMPOS_FECHA = [
  { v: "fechaRecepcionOC", t: "Recepción OC" },
  { v: "fechaProceso", t: "Fecha del proceso" },
  { v: "fechaEstimadaCliente", t: "Estimada al cliente" },
  { v: "fechaEntregaRealCliente", t: "Entrega real al cliente" },
];

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fmtMes(ym) {
  const [y, m] = ym.split("-").map(Number);
  const nom = MESES[m - 1] || "";
  return `${nom.charAt(0).toUpperCase() + nom.slice(1)} ${y}`;
}

function csvEscape(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportarCSV(rows) {
  const cols = [
    ["Cliente", "cliente"], ["OC Cliente", "ocCliente"], ["CROL", "crol"],
    ["Clave Producto", "claveProducto"], ["Descripción", "descripcion"],
    ["Cantidad", "cantidad"], ["Proveedor", "proveedor"], ["Estado", "estadoEnvio"],
    ["Etapa", "etapa"], ["Cerrada", "cerrada"],
    ["Recepción OC", "fechaRecepcionOC"], ["Envío a compras", "fechaEnvioCompras"],
    ["Tiempo entrega cliente", "tiempoEntregaCliente"], ["Estimada cliente", "fechaEstimadaCliente"],
    ["Fecha proceso", "fechaProceso"], ["Tiempo entrega Bloobit", "tiempoEntregaBloobit"],
    ["Estimada Bloobit", "fechaEstimadaBloobit"], ["Entrega real cliente", "fechaEntregaRealCliente"],
    ["Factura", "facturaBloobit"], ["No aplica", "noAplica"], ["Comentario", "comentario"],
  ];
  const head = cols.map((c) => c[0]).join(",");
  const body = rows.map((o) =>
    cols.map(([, k]) => csvEscape(k === "cerrada" ? (o.cerrada ? "Sí" : "No") : o[k])).join(",")
  ).join("\n");
  const blob = new Blob(["﻿" + head + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_oc_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function esc(v) {
  return (v === null || v === undefined ? "" : String(v))
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function exportarPDF(rows, f, ind, porMes) {
  const cols = [
    ["Cliente", "cliente"], ["OC Cliente", "ocCliente"], ["CROL", "crol"],
    ["Clave", "claveProducto"], ["Descripción", "descripcion"],
    ["Cant.", "cantidad"], ["Proveedor", "proveedor"], ["Estado", "estadoEnvio"],
    ["Etapa", "etapa"], ["Recepción OC", "fechaRecepcionOC"],
    ["Estimada cliente", "fechaEstimadaCliente"], ["Entrega real", "fechaEntregaRealCliente"],
  ];
  const hoy = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const rango = (f.desde || f.hasta)
    ? `${f.desde ? fmtFecha(f.desde) : "inicio"} — ${f.hasta ? fmtFecha(f.hasta) : "hoy"} (por ${CAMPOS_FECHA.find((c) => c.v === f.campoFecha)?.t})`
    : "Todas las fechas";
  const filtros = [
    f.etapa !== "Todas" ? `Etapa: ${f.etapa}` : null,
    f.estado !== "Todos" ? `Estado: ${f.estado}` : null,
    f.vendedor && f.vendedor !== "Todos" ? `Vendedor: ${f.vendedor}` : null,
    f.proveedor !== "Todos" ? `Proveedor: ${f.proveedor}` : null,
    (f.cliente || "").trim() ? `Cliente: ${f.cliente.trim()}` : null,
  ].filter(Boolean).join(" · ") || "Sin filtros adicionales";

  const thead = cols.map((c) => `<th>${esc(c[0])}</th>`).join("");
  const tbody = rows.map((o) =>
    `<tr>${cols.map(([, k]) => `<td>${esc(o[k])}</td>`).join("")}</tr>`
  ).join("");
  const porEstado = ESTADOS_ENVIO.map((s) => {
    const n = rows.filter((o) => o.estadoEnvio === s).length;
    return `<span class="pill">${esc(s)}: <b>${n}</b></span>`;
  }).join("");

  const pm = porMes || { filas: [], total: { cerradas: 0, aTiempo: 0, atrasadas: 0, noAplica: 0, pct: null } };
  const mesRows = pm.filas.map((r) =>
    `<tr><td style="text-align:left">${esc(fmtMes(r.ym))}</td><td>${r.cerradas}</td><td>${r.aTiempo}</td><td>${r.atrasadas}</td><td>${r.noAplica}</td><td>${r.pct === null ? "—" : r.pct + "%"}</td></tr>`
  ).join("");
  const mesTotal = `<tr class="tot"><td style="text-align:left">Total</td><td>${pm.total.cerradas}</td><td>${pm.total.aTiempo}</td><td>${pm.total.atrasadas}</td><td>${pm.total.noAplica}</td><td>${pm.total.pct === null ? "—" : pm.total.pct + "%"}</td></tr>`;
  const seccionMes = pm.filas.length
    ? `<h2 class="sec">Indicador de cerradas por mes</h2>
       <table class="mes"><thead><tr><th>Mes</th><th>Cerradas</th><th>A tiempo</th><th>Atrasadas</th><th>No aplica</th><th>% a tiempo</th></tr></thead>
       <tbody>${mesRows}${mesTotal}</tbody></table>`
    : "";

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Reporte OC Bloobit · ${esc(hoy)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1a2234; margin: 28px; font-size: 11px; }
  h1 { font-size: 20px; margin: 0; letter-spacing: 1px; color: #0b2a4a; }
  .sub { color: #5b6b82; font-size: 11px; margin-top: 2px; }
  .head { border-bottom: 3px solid #0b2a4a; padding-bottom: 12px; margin-bottom: 16px;
          display: flex; justify-content: space-between; align-items: flex-end; }
  .meta { text-align: right; color: #5b6b82; font-size: 10px; }
  .kpis { display: flex; gap: 10px; margin: 0 0 14px; flex-wrap: wrap; }
  .kpi { border: 1px solid #d8e0ec; border-radius: 8px; padding: 8px 14px; min-width: 110px; }
  .kpi .n { font-size: 20px; font-weight: 800; color: #0b2a4a; }
  .kpi .l { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; color: #5b6b82; }
  .info { background: #f3f6fb; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 10px; color: #3a4a63; }
  .info div { margin: 2px 0; }
  .pill { display: inline-block; background: #eef2f8; border-radius: 20px; padding: 2px 10px; margin: 2px 4px 2px 0; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0b2a4a; color: #fff; text-align: left; padding: 6px 7px; font-size: 9px; text-transform: uppercase; letter-spacing: .4px; }
  td { padding: 5px 7px; border-bottom: 1px solid #e6ebf3; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafd; }
  .foot { margin-top: 18px; color: #94a3b8; font-size: 9px; text-align: center; }
  h2.sec { font-size: 13px; color: #0b2a4a; margin: 16px 0 8px; }
  table.mes th, table.mes td { text-align: center; }
  table.mes th:first-child, table.mes td:first-child { text-align: left; }
  table.mes tr.tot td { font-weight: 700; background: #eef2f8; }
  @media print { body { margin: 14mm; } }
</style></head><body>
  <div class="head">
    <div><h1>BLOOBIT · Reporte de Órdenes de Compra</h1>
      <div class="sub">Formato FO-AB-001 · Generado el ${esc(hoy)}</div></div>
    <div class="meta">${esc(rows.length)} resultados<br>${esc(ind.cantidad.toLocaleString("es-MX"))} piezas</div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="n">${ind.porEtapa.Inicio}</div><div class="l">Inicio</div></div>
    <div class="kpi"><div class="n">${ind.porEtapa.Seguimiento}</div><div class="l">Seguimiento</div></div>
    <div class="kpi"><div class="n">${ind.porEtapa.Finalizado}</div><div class="l">Finalizado</div></div>
    <div class="kpi"><div class="n">${ind.porEtapa.Cerrada}</div><div class="l">Cerradas</div></div>
    <div class="kpi"><div class="n">${ind.pct === null ? "—" : ind.pct + "%"}</div><div class="l">A tiempo (${ind.evaluadas})</div></div>
  </div>
  <div class="info">
    <div><b>Rango:</b> ${esc(rango)}</div>
    <div><b>Filtros:</b> ${esc(filtros)}</div>
    <div style="margin-top:6px">${porEstado}</div>
  </div>
  ${seccionMes}
  <h2 class="sec">Detalle de órdenes</h2>
  <table><thead><tr>${thead}</tr></thead><tbody>${tbody || `<tr><td colspan="${cols.length}" style="text-align:center;color:#94a3b8;padding:20px">Sin resultados</td></tr>`}</tbody></table>
  <div class="foot">Bloobit — Sistema de Órdenes de Compra · Documento generado automáticamente</div>
  <script>window.onload = function(){ window.focus(); window.print(); };</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Permite las ventanas emergentes para generar el PDF."); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function Stat({ label, value, color, sub }) {
  return (
    <div className="stat">
      <span className="accent" style={{ background: color }} />
      <div className="label">{label}</div>
      <div className="value" style={{ fontSize: 28 }}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export default function Reportes() {
  const { ordenes, cargando, proveedores, clientes } = useData();
  const [f, setF] = useState({
    campoFecha: "fechaRecepcionOC",
    desde: "",
    hasta: "",
    etapa: "Todas",
    estado: "Todos",
    vendedor: "Todos",
    proveedor: "Todos",
    cliente: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const limpiar = () =>
    setF({ campoFecha: "fechaRecepcionOC", desde: "", hasta: "", etapa: "Todas", estado: "Todos", vendedor: "Todos", proveedor: "Todos", cliente: "" });

  const rows = useMemo(() => {
    const cli = f.cliente.trim().toLowerCase();
    return ordenes.filter((o) => {
      if (f.etapa === "Cerrada") { if (!o.cerrada) return false; }
      else if (f.etapa !== "Todas") { if (o.cerrada || o.etapa !== f.etapa) return false; }
      if (f.estado !== "Todos" && o.estadoEnvio !== f.estado) return false;
      if (f.vendedor !== "Todos" && vendedorDeOC(o) !== f.vendedor) return false;
      if (f.proveedor !== "Todos" && o.proveedor !== f.proveedor) return false;
      if (cli && !(o.cliente || "").toLowerCase().includes(cli)) return false;
      const fv = o[f.campoFecha];
      if (f.desde && (!fv || fv < f.desde)) return false;
      if (f.hasta && (!fv || fv > f.hasta)) return false;
      return true;
    });
  }, [ordenes, f]);

  const ind = useMemo(() => {
    const porEtapa = { Inicio: 0, Seguimiento: 0, Finalizado: 0, Cerrada: 0 };
    let cantidad = 0;
    for (const o of rows) {
      if (o.cerrada) porEtapa.Cerrada++;
      else porEtapa[o.etapa] = (porEtapa[o.etapa] || 0) + 1;
      cantidad += cantidadTotal(o);
    }
    const ent = indicadorEntregas(rows); // excluye "no aplica"
    return { porEtapa, cantidad, aTiempo: ent.aTiempo, atrasadas: ent.atrasadas, evaluadas: ent.total, pct: ent.pct };
  }, [rows]);

  // Indicador de cerradas por mes (agrupado por mes de entrega real).
  const porMes = useMemo(() => {
    const map = {}; // "YYYY-MM" -> {cerradas, aTiempo, atrasadas, noAplica}
    for (const o of rows) {
      if (!o.cerrada) continue;
      const fecha = o.fechaEntregaRealCliente || o.fechaCierre || o.fechaRecepcionOC || "";
      const ym = String(fecha).slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(ym)) continue;
      const m = (map[ym] = map[ym] || { cerradas: 0, aTiempo: 0, atrasadas: 0, noAplica: 0 });
      m.cerradas++;
      if (o.noAplica) { m.noAplica++; continue; }
      const r = evalEntrega(o);
      if (r === "aTiempo") m.aTiempo++;
      else if (r === "atrasada") m.atrasadas++;
    }
    const filas = Object.keys(map).sort().reverse().map((ym) => {
      const m = map[ym];
      const ev = m.aTiempo + m.atrasadas;
      return { ym, ...m, pct: ev ? Math.round((m.aTiempo / ev) * 100) : null };
    });
    const tot = filas.reduce((a, r) => ({
      cerradas: a.cerradas + r.cerradas, aTiempo: a.aTiempo + r.aTiempo,
      atrasadas: a.atrasadas + r.atrasadas, noAplica: a.noAplica + r.noAplica,
    }), { cerradas: 0, aTiempo: 0, atrasadas: 0, noAplica: 0 });
    const evT = tot.aTiempo + tot.atrasadas;
    return { filas, total: { ...tot, pct: evT ? Math.round((tot.aTiempo / evT) * 100) : null } };
  }, [rows]);

  return (
    <>
      <Topbar title="Reportes">
        <button className="btn btn-outline" onClick={() => exportarCSV(rows)} disabled={!rows.length}>
          <Icon name="download" size={16} /> CSV
        </button>
        <button className="btn btn-primary" onClick={() => exportarPDF(rows, f, ind, porMes)} disabled={!rows.length}>
          <Icon name="file" size={16} /> Exportar PDF
        </button>
      </Topbar>

      <div className="content">
        {/* Filtros */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ margin: "0 0 14px" }}>
            <Icon name="filter" size={16} /> Filtros
          </div>
          <div className="filtros-grid">
            <div className="field">
              <label>Filtrar por fecha</label>
              <select value={f.campoFecha} onChange={set("campoFecha")}>
                {CAMPOS_FECHA.map((c) => <option key={c.v} value={c.v}>{c.t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Desde</label>
              <input type="date" value={f.desde} onChange={set("desde")} />
            </div>
            <div className="field">
              <label>Hasta</label>
              <input type="date" value={f.hasta} onChange={set("hasta")} />
            </div>
            <div className="field">
              <label>Etapa</label>
              <select value={f.etapa} onChange={set("etapa")}>
                <option value="Todas">Todas</option>
                {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
                <option value="Cerrada">Cerrada</option>
              </select>
            </div>
            <div className="field">
              <label>Estado de envío</label>
              <select value={f.estado} onChange={set("estado")}>
                <option value="Todos">Todos</option>
                {ESTADOS_ENVIO.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Vendedor</label>
              <select value={f.vendedor} onChange={set("vendedor")}>
                <option value="Todos">Todos</option>
                {VENDEDORES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Proveedor</label>
              <select value={f.proveedor} onChange={set("proveedor")}>
                <option value="Todos">Todos</option>
                {proveedores.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Cliente</label>
              <select value={f.cliente} onChange={set("cliente")}>
                <option value="">Todos</option>
                {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={limpiar}>Limpiar filtros</button>
            </div>
          </div>
          {(f.desde || f.hasta) && (
            <div className="td-mut" style={{ fontSize: 12, marginTop: 10 }}>
              <Icon name="calendar" size={13} /> Rango: {f.desde ? fmtFecha(f.desde) : "inicio"} — {f.hasta ? fmtFecha(f.hasta) : "hoy"} (por {CAMPOS_FECHA.find((c) => c.v === f.campoFecha)?.t})
            </div>
          )}
        </div>

        {/* Indicadores */}
        <div className="grid cards-4">
          <Stat label="Resultados" value={rows.length} color="#3b82f6" sub={`${ind.cantidad.toLocaleString("es-MX")} piezas`} />
          <Stat label="Inicio" value={ind.porEtapa.Inicio} color="#f59e0b" />
          <Stat label="Seguimiento" value={ind.porEtapa.Seguimiento} color="#6366f1" />
          <Stat label="Finalizado" value={ind.porEtapa.Finalizado} color="#10b981" />
        </div>

        <div className="grid cards-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>Indicador · Entregas a tiempo</div>
            {ind.evaluadas > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: "var(--green)" }}>{ind.pct}%</span>
                  <span className="td-mut">a tiempo · {ind.evaluadas} evaluadas</span>
                </div>
                <div className="ind-bar">
                  <span style={{ width: `${ind.pct}%`, background: "var(--green)" }} />
                  <span style={{ width: `${100 - ind.pct}%`, background: "var(--red)" }} />
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                  <span><b style={{ color: "var(--green)" }}>{ind.aTiempo}</b> <span className="td-mut">a tiempo</span></span>
                  <span><b style={{ color: "var(--red)" }}>{ind.atrasadas}</b> <span className="td-mut">atrasadas</span></span>
                </div>
              </>
            ) : (
              <div className="empty"><Icon name="checkCircle" size={36} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>No hay órdenes con fecha de entrega en este filtro.</div></div>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ margin: "0 0 14px" }}>Por estado de envío</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {ESTADOS_ENVIO.map((s) => {
                const n = rows.filter((o) => o.estadoEnvio === s).length;
                const pct = rows.length ? Math.round((n / rows.length) * 100) : 0;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <span style={{ minWidth: 130 }}>{s}</span>
                    <div className="ind-bar" style={{ flex: 1, height: 9 }}>
                      <span style={{ width: `${pct}%`, background: "var(--navy-600)" }} />
                    </div>
                    <b style={{ minWidth: 28, textAlign: "right" }}>{n}</b>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Indicador de cerradas por mes */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title" style={{ margin: "0 0 4px" }}>Indicador de cerradas por mes</div>
          <div className="td-mut" style={{ fontSize: 12, marginBottom: 12 }}>
            Cumplimiento de entregas de las OC cerradas, por mes de entrega. Usa los filtros de fecha (desde / hasta) para acotar el rango.
          </div>
          {porMes.filas.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="tabla-semaforo">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Mes</th>
                    <th>Cerradas</th>
                    <th><span className="sem-dot" style={{ background: "#10b981" }} /> A tiempo</th>
                    <th><span className="sem-dot" style={{ background: "#ef4444" }} /> Atrasadas</th>
                    <th>No aplica</th>
                    <th>% a tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {porMes.filas.map((r) => (
                    <tr key={r.ym}>
                      <td style={{ textAlign: "left", fontWeight: 600 }}>{fmtMes(r.ym)}</td>
                      <td><b>{r.cerradas}</b></td>
                      <td><b style={{ color: "#10b981" }}>{r.aTiempo}</b></td>
                      <td><b style={{ color: "#ef4444" }}>{r.atrasadas}</b></td>
                      <td><span className="td-mut">{r.noAplica}</span></td>
                      <td><b>{r.pct === null ? "—" : `${r.pct}%`}</b></td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid var(--glass-border)" }}>
                    <td style={{ textAlign: "left", fontWeight: 700 }}>Total</td>
                    <td><b>{porMes.total.cerradas}</b></td>
                    <td><b style={{ color: "#10b981" }}>{porMes.total.aTiempo}</b></td>
                    <td><b style={{ color: "#ef4444" }}>{porMes.total.atrasadas}</b></td>
                    <td><span className="td-mut">{porMes.total.noAplica}</span></td>
                    <td><b>{porMes.total.pct === null ? "—" : `${porMes.total.pct}%`}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty"><Icon name="calendar" size={36} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>No hay órdenes cerradas con fecha de entrega en este filtro.</div></div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <OCTable
            titulo="Resultados del reporte"
            rows={rows}
            mostrarHoja
            vacio={cargando ? "Cargando…" : "No hay órdenes que cumplan los filtros."}
          />
        </div>
      </div>
    </>
  );
}
