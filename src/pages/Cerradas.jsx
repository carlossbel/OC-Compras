import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import IconSelect from "../components/IconSelect";
import RangeDate from "../components/RangeDate";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";

export default function Cerradas() {
  const { cerradas, cargando } = useData();
  const [q, setQ] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return cerradas.filter((o) => {
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
  }, [cerradas, q, vendedor, desde, hasta]);

  const limpiar = () => { setQ(""); setVendedor(""); setDesde(""); setHasta(""); };

  return (
    <>
      <Topbar title="OC Cerradas" />
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>Histórico de órdenes de compra concluidas.</p>
        <div className="filtros-mini">
          <div className="busc-text">
            <Icon name="search" size={16} />
            <input placeholder="Buscar CROL, clave, producto…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <IconSelect icon="user" title="Vendedor" value={vendedor} onChange={setVendedor} options={[{ value: "", label: "Todos los vendedores" }, ...VENDEDORES.map((v) => ({ value: v, label: v }))]} />
          <RangeDate desde={desde} hasta={hasta} onChange={(d, h) => { setDesde(d); setHasta(h); }} />
          <button className="btn btn-outline btn-icon" onClick={limpiar} title="Limpiar"><Icon name="trash" size={15} /></button>
          <span className="chip soft">{rows.length}</span>
        </div>
        <OCTable rows={rows} mostrarEtapa={false} mostrarIndicador vacio={cargando ? "Cargando…" : "Aún no hay órdenes cerradas."} />
      </div>
    </>
  );
}
