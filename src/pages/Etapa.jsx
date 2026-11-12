import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import OCTable from "../components/OCTable";
import IconSelect from "../components/IconSelect";
import RangeDate from "../components/RangeDate";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { VENDEDORES, vendedorDeOC } from "../constants/vendedores";

const INFO = {
  Inicio: { titulo: "Inicio", desc: "Órdenes recién ingresadas · por procesar", key: "inicio" },
  Seguimiento: { titulo: "Seguimiento", desc: "Órdenes en producción o tránsito", key: "seguimiento" },
  Finalizado: { titulo: "Finalizados", desc: "Órdenes recibidas o entregadas · listas para cerrar", key: "finalizado" },
};

function coincide(o, t) {
  if (!t) return true;
  return [o.cliente, o.ocCliente, o.crol, o.descripcion, o.proveedor, o.claveProducto, o.facturaBloobit, o.numeroPedido]
    .filter(Boolean).some((v) => String(v).toLowerCase().includes(t));
}

export default function Etapa({ etapa }) {
  const data = useData();
  const { esAdmin } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const info = INFO[etapa];
  const rows = data[info.key];

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((o) => {
      if (vendedor && vendedorDeOC(o) !== vendedor) return false;
      const f = o.fechaRecepcionOC;
      if (desde && (!f || f < desde)) return false;
      if (hasta && (!f || f > hasta)) return false;
      return coincide(o, t);
    });
  }, [rows, q, vendedor, desde, hasta]);

  const limpiar = () => { setQ(""); setVendedor(""); setDesde(""); setHasta(""); };

  return (
    <>
      <Topbar title={info.titulo}>
        {esAdmin && <button className="btn btn-primary" onClick={() => nav("/nueva")}><Icon name="plus" size={16} /> Nueva OC</button>}
      </Topbar>
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>{info.desc}</p>
        <div className="filtros-mini">
          <div className="busc-text">
            <Icon name="search" size={16} />
            <input placeholder="Buscar CROL, clave, producto…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <IconSelect icon="user" title="Vendedor" value={vendedor} onChange={setVendedor} options={[{ value: "", label: "Todos los vendedores" }, ...VENDEDORES.map((v) => ({ value: v, label: v }))]} />
          <RangeDate desde={desde} hasta={hasta} onChange={(d, h) => { setDesde(d); setHasta(h); }} />
          <button className="btn btn-outline btn-icon" onClick={limpiar} title="Limpiar"><Icon name="trash" size={15} /></button>
          <span className="chip soft">{filtradas.length}</span>
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
