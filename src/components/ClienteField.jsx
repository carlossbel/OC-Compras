import { useState } from "react";
import { useData } from "../context/DataContext";
import { crearCliente } from "../services/ocService";
import GlassDropdown from "./GlassDropdown";
import Icon from "./Icon";

// Campo de cliente: desplegable de clientes conocidos + opción de agregar uno nuevo.
// vendedor: a quién se le asigna el cliente agregado (según la clave del producto).
export default function ClienteField({ value, onChange, vendedor }) {
  const { clientes } = useData();
  const [modoOtro, setModoOtro] = useState(false);
  const [nuevo, setNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const onSelect = (v) => {
    if (v === "__otro__") { setModoOtro(true); setNuevo(value || ""); }
    else onChange(v);
  };

  const agregar = async () => {
    const n = nuevo.trim();
    if (!n) return;
    setGuardando(true);
    try {
      await crearCliente(n, vendedor);
      onChange(n);
      setModoOtro(false);
      setNuevo("");
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el cliente. Revisa las reglas de Firestore (colección clientes).");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="field">
      <label>Cliente <span className="req">*</span></label>
      {modoOtro ? (
        <div className="pdf-row">
          <input autoFocus value={nuevo} onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
            placeholder="Nombre del nuevo cliente" />
          <button type="button" className="btn btn-ghost btn-sm" onClick={agregar} disabled={!nuevo.trim() || guardando}>
            {guardando ? "Guardando…" : "Agregar"}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setModoOtro(false)}>Cancelar</button>
        </div>
      ) : (
        <GlassDropdown
          value={value || ""}
          onChange={onSelect}
          placeholder="Selecciona un cliente"
          options={[
            ...(value && !clientes.includes(value) ? [{ value, label: value }] : []),
            ...clientes.map((c) => ({ value: c, label: c })),
            { value: "__otro__", label: <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="plus" size={14} /> Agregar cliente…</span> },
          ]}
        />
      )}
    </div>
  );
}
