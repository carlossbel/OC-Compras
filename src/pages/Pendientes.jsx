import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import GlassDropdown from "../components/GlassDropdown";
import IconSelect from "../components/IconSelect";
import RangeDate from "../components/RangeDate";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { ETAPAS } from "../constants/catalogs";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";

export default function Pendientes() {
  const { pendientes, cargando } = useData();
  const { esAdmin } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState("Todas");
  const [vendedor, setVendedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return pendientes.filter((o) => {
      if (etapa !== "Todas" && o.etapa !== etapa) return false;
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
  }, [pendientes, q, etapa, vendedor, desde, hasta]);

  const limpiar = () => { setQ(""); setEtapa("Todas"); setVendedor(""); setDesde(""); setHasta(""); };

  return (
    <>
      <Topbar title="OC Pendientes">
        {esAdmin && <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>}
      </Topbar>
      <div className="content">
        <div className="filtros-mini">
          <div className="busc-text">
            <Icon name="search" size={16} />
            <input placeholder="Buscar CROL, clave, producto…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mini-e"><GlassDropdown value={etapa} onChange={setEtapa} options={[{ value: "Todas", label: "Todas las etapas" }, ...ETAPAS.map((e) => ({ value: e, label: e }))]} /></div>
          <IconSelect icon="user" title="Vendedor" value={vendedor} onChange={setVendedor} options={[{ value: "", label: "Todos los vendedores" }, ...VENDEDORES.map((v) => ({ value: v, label: v }))]} />
          <RangeDate desde={desde} hasta={hasta} onChange={(d, h) => { setDesde(d); setHasta(h); }} />
          <button className="btn btn-outline btn-icon" onClick={limpiar} title="Limpiar"><Icon name="trash" size={15} /></button>
          <span className="chip soft">{rows.length}</span>
        </div>
        <OCTable rows={rows} vacio={cargando ? "Cargando…" : "No hay órdenes pendientes."} />
      </div>
    </>
  );
}
