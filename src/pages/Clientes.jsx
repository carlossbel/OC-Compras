import { useState } from "react";
import Topbar from "../components/Topbar";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { VENDEDORES, vendedorDeUsuario } from "../constants/vendedores";
import { crearCliente, eliminarCliente } from "../services/ocService";

function AgregarCliente({ vendedor }) {
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const add = async () => {
    const n = nombre.trim();
    if (!n) return;
    setGuardando(true);
    try { await crearCliente(n, vendedor); setNombre(""); }
    catch (e) { console.error(e); alert("No se pudo guardar el cliente (revisa las reglas de Firestore)."); }
    finally { setGuardando(false); }
  };
  return (
    <div className="pdf-row" style={{ marginTop: 10 }}>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="Agregar cliente…" />
      <button type="button" className="btn btn-ghost btn-sm" onClick={add} disabled={!nombre.trim() || guardando}>
        <Icon name="plus" size={14} /> {guardando ? "…" : "Agregar"}
      </button>
    </div>
  );
}

export default function Clientes() {
  const { clientesPorVendedor, cliExtra } = useData();
  const { user, esAdmin } = useAuth();
  const miVendedor = vendedorDeUsuario(user?.nombre);

  // Admins (Karla, Ana, Carlos) gestionan a cualquier vendedor; los vendedores solo el suyo.
  const vendedores = esAdmin ? VENDEDORES : (miVendedor ? [miVendedor] : []);

  const idDeCliente = (vend, nombre) => {
    const c = cliExtra.find((x) => x.vendedor === vend && x.nombre === nombre);
    return c ? c.id : null;
  };
  const borrar = async (id, nombre) => {
    if (confirm(`¿Quitar el cliente "${nombre}"?`)) await eliminarCliente(id);
  };

  return (
    <>
      <Topbar title="Clientes" />
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>
          {esAdmin
            ? "Clientes por vendedor (derivados de las órdenes + agregados manualmente)."
            : miVendedor
              ? "Tus clientes asignados. Puedes agregar los que vayas teniendo."
              : "Tu usuario no está vinculado a un vendedor."}
        </p>

        {vendedores.length === 0 ? (
          <div className="card empty"><Icon name="user" size={36} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>No hay vendedor asignado.</div></div>
        ) : (
          <div className="grid cards-3">
            {vendedores.map((v) => {
              const lista = clientesPorVendedor[v] || [];
              const puedeEditar = esAdmin || v === miVendedor;
              return (
                <div className="card" key={v}>
                  <div className="section-title" style={{ margin: "0 0 10px" }}>
                    <Icon name="user" size={16} /> {v}
                    <span className="chip soft" style={{ marginLeft: "auto" }}>{lista.length}</span>
                  </div>
                  {lista.length === 0 ? (
                    <div className="td-mut" style={{ fontSize: 13 }}>Sin clientes todavía.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto" }}>
                      {lista.map((cli) => {
                        const id = idDeCliente(v, cli);
                        return (
                          <div key={cli} className="cliente-row">
                            <span>{cli}</span>
                            {puedeEditar && id && (
                              <button type="button" className="icon-btn-del" style={{ width: 28, height: 28 }} title="Quitar" onClick={() => borrar(id, cli)}>
                                <Icon name="trash" size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {puedeEditar && <AgregarCliente vendedor={v} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
