import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { ETAPAS } from "../constants/catalogs";

export default function Pendientes() {
  const { pendientes, cargando } = useData();
  const { esAdmin } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState("Todas");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return pendientes
      .filter((o) => etapa === "Todas" || o.etapa === etapa)
      .filter((o) =>
        !t ||
        [o.cliente, o.ocCliente, o.crol, o.descripcion, o.proveedor, o.claveProducto]
          .filter(Boolean).some((v) => String(v).toLowerCase().includes(t))
      );
  }, [pendientes, q, etapa]);

  return (
    <>
      <Topbar title="OC Pendientes">
        {esAdmin && <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>}
      </Topbar>
      <div className="content">
        <div className="toolbar">
          <input className="filter-input" placeholder="Buscar cliente, CROL, producto…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select-inline" value={etapa} onChange={(e) => setEtapa(e.target.value)} style={{ padding: "9px 12px" }}>
            <option value="Todas">Todas las etapas</option>
            {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <div className="spacer" />
          <span className="chip soft">{rows.length} órdenes</span>
        </div>
        <OCTable rows={rows} vacio={cargando ? "Cargando…" : "No hay órdenes pendientes. Crea una con “Nueva OC”."} />
      </div>
    </>
  );
}
