import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";

export default function Buscador() {
  const { ordenes, cargando } = useData();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return ordenes.filter((o) =>
      [o.cliente, o.ocCliente, o.crol, o.descripcion, o.proveedor, o.claveProducto, o.facturaBloobit, o.numeroPedido]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(t))
    );
  }, [ordenes, q]);

  return (
    <>
      <Topbar title="Buscador" />
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>
          Busca por CROL, factura, cliente, producto o proveedor en pendientes e histórico.
        </p>
        <div className="toolbar">
          <input
            autoFocus
            className="filter-input"
            style={{ minWidth: 340 }}
            placeholder="Escribe CROL, factura, cliente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="spacer" />
          {q && <span className="chip soft">{rows.length} resultados</span>}
        </div>

        {!q ? (
          <div className="card empty"><Icon name="search" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Empieza a escribir para buscar.</div></div>
        ) : (
          <OCTable rows={rows} mostrarHoja vacio={cargando ? "Cargando…" : "Sin resultados."} />
        )}
      </div>
    </>
  );
}
