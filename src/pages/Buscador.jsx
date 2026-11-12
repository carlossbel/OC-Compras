import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import GlassDropdown from "../components/GlassDropdown";
import GlassDate from "../components/GlassDate";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { ETAPAS } from "../constants/catalogs";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";

export default function Buscador() {
  const { ordenes, cargando } = useData();
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState("Todas");
  const [vendedor, setVendedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const hayFiltro = q.trim() || etapa !== "Todas" || vendedor || desde || hasta;

  const rows = useMemo(() => {
    if (!hayFiltro) return [];
    const t = q.trim().toLowerCase();
    return ordenes.filter((o) => {
      if (etapa === "Cerrada") { if (!o.cerrada) return false; }
      else if (etapa !== "Todas") { if (o.cerrada || o.etapa !== etapa) return false; }
      if (vendedor && vendedorDeOC(o) !== vendedor) return false;
      const f = o.fechaRecepcionOC;
      if (desde && (!f || f < desde)) return false;
      if (hasta && (!f || f > hasta)) return false;
      if (t) {
        const campos = [o.cliente, o.ocCliente, o.crol, o.descripcion, o.proveedor, o.claveProducto, o.facturaBloobit, o.numeroPedido];
        if (!campos.filter(Boolean).some((v) => String(v).toLowerCase().includes(t))) return false;
      }
      return true;
    });
  }, [ordenes, q, etapa, vendedor, desde, hasta, hayFiltro]);

  const limpiar = () => { setQ(""); setEtapa("Todas"); setVendedor(""); setDesde(""); setHasta(""); };

  return (
    <>
      <Topbar title="Buscador" buscador={false} />
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>
          Busca por CROL, clave, producto, cliente o proveedor y filtra por etapa, vendedor y fechas.
        </p>

        <div className="busc-row">
          <div className="busc-text">
            <Icon name="search" size={16} />
            <input
              autoFocus
              placeholder="CROL, clave, producto, cliente, factura…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="filtros-oc" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
          <div className="field"><label>Etapa</label>
            <GlassDropdown value={etapa} onChange={setEtapa} options={[{ value: "Todas", label: "Todas" }, ...ETAPAS.map((e) => ({ value: e, label: e })), { value: "Cerrada", label: "Cerradas" }]} />
          </div>
          <div className="field"><label>Vendedor</label>
            <GlassDropdown value={vendedor} onChange={setVendedor} placeholder="Todos" options={[{ value: "", label: "Todos" }, ...VENDEDORES.map((v) => ({ value: v, label: v }))]} />
          </div>
          <div className="field"><label>Desde</label><GlassDate value={desde} onChange={setDesde} /></div>
          <div className="field"><label>Hasta</label><GlassDate value={hasta} onChange={setHasta} /></div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn-outline btn-sm" onClick={limpiar} title="Limpiar"><Icon name="trash" size={15} /></button>
              {hayFiltro && <span className="chip soft">{rows.length}</span>}
            </div>
          </div>
        </div>

        {!hayFiltro ? (
          <div className="card empty"><Icon name="search" size={40} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>Escribe o aplica un filtro para buscar.</div></div>
        ) : (
          <OCTable rows={rows} mostrarHoja vacio={cargando ? "Cargando…" : "Sin resultados."} />
        )}
      </div>
    </>
  );
}
