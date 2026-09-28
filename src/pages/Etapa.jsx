import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";

const INFO = {
  Inicio: { titulo: "Inicio", desc: "Órdenes recién ingresadas · por procesar", key: "inicio" },
  Seguimiento: { titulo: "Seguimiento", desc: "Órdenes en producción o tránsito", key: "seguimiento" },
  Finalizado: { titulo: "Finalizados", desc: "Órdenes recibidas o entregadas · listas para cerrar", key: "finalizado" },
};

export default function Etapa({ etapa }) {
  const data = useData();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const info = INFO[etapa];
  const rows = data[info.key];

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((o) =>
      [o.cliente, o.ocCliente, o.crol, o.descripcion, o.proveedor, o.claveProducto]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(t))
    );
  }, [rows, q]);

  return (
    <>
      <Topbar title={info.titulo}>
        <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>
      </Topbar>
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>{info.desc}</p>
        <div className="toolbar">
          <input className="filter-input" placeholder="Buscar en esta etapa…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="spacer" />
          <span className="chip soft">{filtradas.length} órdenes</span>
        </div>
        <OCTable
          rows={filtradas}
          mostrarEtapa={false}
          vacio={data.cargando ? "Cargando…" : `No hay órdenes en ${info.titulo}.`}
        />
      </div>
    </>
  );
}
