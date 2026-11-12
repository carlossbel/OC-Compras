import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import GlassDropdown from "../components/GlassDropdown";
import GlassDate from "../components/GlassDate";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";

const INFO = {
  Inicio: { titulo: "Inicio", desc: "Órdenes recién ingresadas · por procesar", key: "inicio" },
  Seguimiento: { titulo: "Seguimiento", desc: "Órdenes en producción o tránsito", key: "seguimiento" },
  Finalizado: { titulo: "Finalizados", desc: "Órdenes recibidas o entregadas · listas para cerrar", key: "finalizado" },
};

export default function Etapa({ etapa }) {
  const data = useData();
  const { esAdmin } = useAuth();
  const nav = useNavigate();
  const [vendedor, setVendedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const info = INFO[etapa];
  const rows = data[info.key];

  const filtradas = useMemo(() => {
    return rows.filter((o) => {
      if (vendedor && vendedorDeOC(o) !== vendedor) return false;
      const f = o.fechaRecepcionOC;
      if (desde && (!f || f < desde)) return false;
      if (hasta && (!f || f > hasta)) return false;
      return true;
    });
  }, [rows, vendedor, desde, hasta]);

  return (
    <>
      <Topbar title={info.titulo}>
        {esAdmin && <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>}
      </Topbar>
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>{info.desc}</p>
        <div className="filtros-oc">
          <div className="field"><label>Vendedor</label>
            <GlassDropdown value={vendedor} onChange={setVendedor} placeholder="Todos" options={[{ value: "", label: "Todos" }, ...VENDEDORES.map((v) => ({ value: v, label: v }))]} />
          </div>
          <div className="field"><label>Desde</label><GlassDate value={desde} onChange={setDesde} /></div>
          <div className="field"><label>Hasta</label><GlassDate value={hasta} onChange={setHasta} /></div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setVendedor(""); setDesde(""); setHasta(""); }}>Limpiar</button>
              <span className="chip soft">{filtradas.length}</span>
            </div>
          </div>
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
