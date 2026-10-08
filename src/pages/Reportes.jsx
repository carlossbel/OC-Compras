import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { ESTADOS_ENVIO, PROVEEDORES, ETAPAS } from "../constants/catalogs";
import { indicadorEntregas } from "../utils/estimacion";
import { fmtFecha, cantidadTotal } from "../utils/format";

const CAMPOS_FECHA = [
  { v: "fechaRecepcionOC", t: "Recepción OC" },
  { v: "fechaProceso", t: "Fecha del proceso" },
  { v: "fechaEstimadaCliente", t: "Estimada al cliente" },
  { v: "fechaEntregaRealCliente", t: "Entrega real al cliente" },
];

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
  const { ordenes, cargando } = useData();
  const [f, setF] = useState({
    campoFecha: "fechaRecepcionOC",
    desde: "",
    hasta: "",
    etapa: "Todas",
    estado: "Todos",
    proveedor: "Todos",
    cliente: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const limpiar = () =>
    setF({ campoFecha: "fechaRecepcionOC", desde: "", hasta: "", etapa: "Todas", estado: "Todos", proveedor: "Todos", cliente: "" });

  const rows = useMemo(() => {
    const cli = f.cliente.trim().toLowerCase();
    return ordenes.filter((o) => {
      if (f.etapa === "Cerrada") { if (!o.cerrada) return false; }
      else if (f.etapa !== "Todas") { if (o.cerrada || o.etapa !== f.etapa) return false; }
      if (f.estado !== "Todos" && o.estadoEnvio !== f.estado) return false;
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

  return (
    <>
      <Topbar title="Reportes">
        <button className="btn btn-primary" onClick={() => exportarCSV(rows)} disabled={!rows.length}>
          <Icon name="download" size={16} /> Exportar CSV
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
              <label>Proveedor</label>
              <select value={f.proveedor} onChange={set("proveedor")}>
                <option value="Todos">Todos</option>
                {PROVEEDORES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Cliente</label>
              <input value={f.cliente} onChange={set("cliente")} placeholder="Nombre del cliente" />
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
