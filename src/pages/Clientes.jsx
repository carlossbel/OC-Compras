import { useState } from "react";
import Topbar from "../components/Topbar";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { VENDEDORES, vendedorDeUsuario } from "../constants/vendedores";
import { crearCliente, editarCliente, eliminarCliente } from "../services/ocService";

const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
// Solo estas personas pueden agregar o quitar clientes.
const GESTORES = ["carlos beltran", "ana garcia", "karla arriaga"];

function ModalAgregar({ vendedor, onClose }) {
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const add = async () => {
    const n = nombre.trim();
    if (!n) return;
    setGuardando(true);
    try { await crearCliente(n, vendedor); onClose(); }
    catch (e) { console.error(e); alert("No se pudo guardar el cliente (revisa las reglas de Firestore)."); setGuardando(false); }
  };
  return (
    <Modal title={`Agregar cliente · ${vendedor}`} onClose={onClose} maxWidth={440}>
      <div className="field">
        <label>Nombre del cliente</label>
        <input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Escribe el nombre del cliente…"
        />
      </div>
      <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
        <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={add} disabled={!nombre.trim() || guardando}>
          <Icon name="plus" size={15} /> {guardando ? "Guardando…" : "Agregar"}
        </button>
      </div>
    </Modal>
  );
}

function ModalEditar({ vendedor, lista, onClose }) {
  const [vals, setVals] = useState(() => Object.fromEntries(lista.map((c) => [c.id, c.nombre])));
  const [guardando, setGuardando] = useState(null);
  const guardar = async (c) => {
    const n = (vals[c.id] || "").trim();
    if (!n || n === c.nombre) return;
    setGuardando(c.id);
    try { await editarCliente(c.id, n); }
    catch (e) { console.error(e); alert("No se pudo editar el cliente."); }
    finally { setGuardando(null); }
  };
  return (
    <Modal title={`Editar clientes · ${vendedor}`} onClose={onClose} maxWidth={480}>
      {lista.length === 0 ? (
        <div className="td-mut" style={{ fontSize: 13, lineHeight: 1.6 }}>
          No hay clientes agregados manualmente para editar. Los clientes derivados de las órdenes no se editan aquí.
        </div>
      ) : (
        <>
          <div className="td-mut" style={{ fontSize: 12, marginBottom: 10 }}>Edita el nombre y guarda cada cliente:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
            {lista.map((c) => {
              const cambiado = (vals[c.id] || "").trim() && (vals[c.id] || "").trim() !== c.nombre;
              return (
                <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={vals[c.id] ?? ""}
                    onChange={(e) => setVals((p) => ({ ...p, [c.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); guardar(c); } }}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="icon-btn sm" title="Guardar" onClick={() => guardar(c)} disabled={!cambiado || guardando === c.id}>
                    <Icon name="check" size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
        <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}

function ModalQuitar({ vendedor, lista, onClose }) {
  const [borrando, setBorrando] = useState(null);
  const del = async (id, nombre) => {
    if (!confirm(`¿Quitar el cliente "${nombre}"?`)) return;
    setBorrando(id);
    try { await eliminarCliente(id); }
    catch (e) { console.error(e); alert("No se pudo quitar el cliente."); }
    finally { setBorrando(null); }
  };
  return (
    <Modal title={`Quitar cliente · ${vendedor}`} onClose={onClose} maxWidth={460}>
      {lista.length === 0 ? (
        <div className="td-mut" style={{ fontSize: 13, lineHeight: 1.6 }}>
          No hay clientes agregados manualmente para este vendedor. Los clientes que se derivan de las
          órdenes no se pueden borrar aquí (se actualizan solos con las OC).
        </div>
      ) : (
        <>
          <div className="td-mut" style={{ fontSize: 12, marginBottom: 10 }}>Selecciona el cliente que quieres quitar:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto" }}>
            {lista.map((c) => (
              <div key={c.id} className="cliente-row">
                <span>{c.nombre}</span>
                <button type="button" className="icon-btn-del sm" title="Quitar" onClick={() => del(c.id, c.nombre)} disabled={borrando === c.id}>
                  <Icon name="trash" size={13} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
        <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}

export default function Clientes() {
  const { clientesPorVendedor, cliExtra } = useData();
  const { user, esAdmin } = useAuth();
  const miVendedor = vendedorDeUsuario(user?.nombre);
  const [modal, setModal] = useState(null); // { tipo: "add" | "del", v }

  const puedeGestionar = GESTORES.includes(norm(user?.nombre));

  // Quién ve qué: los gestores/admin ven a todos; un vendedor ve solo su cartera.
  const vendedores = (esAdmin || puedeGestionar) ? VENDEDORES : (miVendedor ? [miVendedor] : []);

  const eliminablesDe = (v) => cliExtra.filter((c) => c.vendedor === v);

  return (
    <>
      <Topbar title="Clientes" />
      <div className="content">
        <p className="td-mut" style={{ marginTop: 0 }}>
          {puedeGestionar
            ? "Clientes por vendedor (derivados de las órdenes + agregados manualmente). Puedes agregar y quitar con los iconos de cada tarjeta."
            : miVendedor
              ? "Tus clientes asignados. Solo Carlos, Ana o Karla pueden agregar o quitar clientes."
              : "Clientes por vendedor."}
        </p>

        {vendedores.length === 0 ? (
          <div className="card empty"><Icon name="user" size={36} strokeWidth={1.4} style={{ opacity: .5, marginBottom: 8 }} /><div>No hay vendedor asignado.</div></div>
        ) : (
          <div className="grid cards-3">
            {vendedores.map((v) => {
              const lista = clientesPorVendedor[v] || [];
              return (
                <div className="card" key={v}>
                  <div className="section-title" style={{ margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="user" size={16} /> {v}
                    <span className="chip soft" style={{ marginLeft: "auto" }}>{lista.length}</span>
                    {puedeGestionar && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="icon-btn sm" title="Agregar cliente" onClick={() => setModal({ tipo: "add", v })}>
                          <Icon name="plus" size={15} />
                        </button>
                        <button type="button" className="icon-btn sm" title="Editar clientes" onClick={() => setModal({ tipo: "edit", v })}>
                          <Icon name="edit" size={14} />
                        </button>
                        <button type="button" className="icon-btn-del sm" title="Quitar cliente" onClick={() => setModal({ tipo: "del", v })}>
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  {lista.length === 0 ? (
                    <div className="td-mut" style={{ fontSize: 13 }}>Sin clientes todavía.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto" }}>
                      {lista.map((cli) => (
                        <div key={cli} className="cliente-row"><span>{cli}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal?.tipo === "add" && (
        <ModalAgregar vendedor={modal.v} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === "edit" && (
        <ModalEditar vendedor={modal.v} lista={eliminablesDe(modal.v)} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === "del" && (
        <ModalQuitar vendedor={modal.v} lista={eliminablesDe(modal.v)} onClose={() => setModal(null)} />
      )}
    </>
  );
}
