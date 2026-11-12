import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import GlassDropdown from "../components/GlassDropdown";
import GlassDate from "../components/GlassDate";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { ETAPAS } from "../constants/catalogs";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";

export default function Pendientes() {
  const { pendientes, cargando } = useData();
  const { esAdmin } = useAuth();
  const nav = useNavigate();
  const [etapa, setEtapa] = useState("Todas");
  const [vendedor, setVendedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const rows = useMemo(() => {
    return pendientes.filter((o) => {
      if (etapa !== "Todas" && o.etapa !== etapa) return false;
      if (vendedor && vendedorDeOC(o) !== vendedor) return false;
      const f = o.fechaRecepcionOC;
      if (desde && (!f || f < desde)) return false;
      if (hasta && (!f || f > hasta)) return false;
      return true;
    });
  }, [pendientes, etapa, vendedor, desde, hasta]);

  return (
    <>
      <Topbar title="OC Pendientes">
        {esAdmin && <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>}
      </Topbar>
      <div className="content">
        <div className="filtros-oc" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr auto" }}>
          <div className="field"><label>Etapa</label>
            <GlassDropdown value={etapa} onChange={setEtapa} options={[{ value: "Todas", label: "Todas las etapas" }, ...ETAPAS.map((e) => ({ value: e, label: e }))]} />
          </div>
          <div className="field"><label>Vendedor</label>
            <GlassDropdown value={vendedor} onChange={setVendedor} placeholder="Todos" options={[{ value: "", label: "Todos" }, ...VENDEDORES.map((v) => ({ value: v, label: v }))]} />
          </div>
          <div className="field"><label>Desde</label><GlassDate value={desde} onChange={setDesde} /></div>
          <div className="field"><label>Hasta</label><GlassDate value={hasta} onChange={setHasta} /></div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setEtapa("Todas"); setVendedor(""); setDesde(""); setHasta(""); }}>Limpiar</button>
              <span className="chip soft">{rows.length}</span>
            </div>
          </div>
        </div>
        <OCTable rows={rows} vacio={cargando ? "Cargando…" : "No hay órdenes pendientes."} />
      </div>
    </>
  );
}
