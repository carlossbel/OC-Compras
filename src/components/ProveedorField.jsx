import { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { crearProveedor, eliminarProveedor } from "../services/ocService";
import GlassDropdown from "./GlassDropdown";
import Icon from "./Icon";

// Campo de proveedor: desplegable + opción "Otro" (agregar, admin) + borrar (solo Carlos Beltran).
export default function ProveedorField({ value, onChange }) {
  const { proveedores, provExtra } = useData();
  const { esSuper } = useAuth();
  const [modoOtro, setModoOtro] = useState(false);
  const [nuevo, setNuevo] = useState("");
  const [gestionar, setGestionar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const onSelect = (v) => {
    if (v === "__otro__") {
      setModoOtro(true);
      setNuevo("");
    } else {
      onChange(v);
    }
  };

  const agregar = async () => {
    const n = nuevo.trim();
    if (!n) return;
    setGuardando(true);
    try {
      await crearProveedor(n);
      onChange(n);
      setModoOtro(false);
      setNuevo("");
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el proveedor. Revisa las reglas de Firestore (colección proveedores).");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (p) => {
    if (confirm(`¿Eliminar el proveedor "${p.nombre}" del catálogo?`)) {
      await eliminarProveedor(p.id);
    }
  };

  return (
    <div className="field">
      <label>Proveedor</label>

      {modoOtro ? (
        <div className="pdf-row">
          <input
            autoFocus
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
            placeholder="Nombre del nuevo proveedor"
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={agregar} disabled={!nuevo.trim() || guardando}>
            {guardando ? "Guardando…" : "Agregar"}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setModoOtro(false)}>Cancelar</button>
        </div>
      ) : (
        <GlassDropdown
          value={value || ""}
          onChange={onSelect}
          options={[
            ...(value && !proveedores.includes(value) ? [{ value, label: value }] : []),
            ...proveedores.map((p) => ({ value: p, label: p })),
            { value: "__otro__", label: <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="plus" size={14} /> Otro…</span> },
          ]}
        />
      )}

      {/* Gestión de proveedores agregados — solo Carlos Beltran (sistemas) */}
      {esSuper && !modoOtro && (
        <div style={{ marginTop: 4 }}>
          <button type="button" className="linkbtn" onClick={() => setGestionar((g) => !g)}>
            {gestionar ? "Ocultar" : "Gestionar proveedores agregados"}
          </button>
          {gestionar && (
            <div className="prov-manage">
              {provExtra.length === 0 ? (
                <span className="td-mut" style={{ fontSize: 12 }}>No hay proveedores agregados por usuarios.</span>
              ) : (
                provExtra.map((p) => (
                  <div className="prov-manage-row" key={p.id}>
                    <span>{p.nombre}</span>
                    <button type="button" className="icon-btn-del" style={{ width: 30, height: 30 }} title="Eliminar" onClick={() => borrar(p)}>
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
