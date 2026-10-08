import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import { useData } from "../context/DataContext";

export default function Cerradas() {
  const { cerradas, cargando } = useData();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return cerradas;
    return cerradas.filter((o) =>
      [o.cliente, o.ocCliente, o.crol, o.descripcion, o.proveedor, o.claveProducto, o.facturaBloobit]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(t))
    );
  }, [cerradas, q]);

  return (
    <>
      <Topbar title="OC Cerradas" />
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>Histórico de órdenes de compra concluidas.</p>
        <div className="toolbar">
          <input className="filter-input" placeholder="Buscar en cerradas…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="spacer" />
          <span className="chip soft">{rows.length} órdenes</span>
        </div>
        <OCTable rows={rows} mostrarEtapa={false} mostrarIndicador vacio={cargando ? "Cargando…" : "Aún no hay órdenes cerradas."} />
      </div>
    </>
  );
}
