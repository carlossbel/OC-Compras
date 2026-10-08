import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { suscribirOrdenes, suscribirProveedores } from "../services/ocService";
import { PROVEEDORES } from "../constants/catalogs";

const DataCtx = createContext(null);

export function DataProvider({ children }) {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [provExtra, setProvExtra] = useState([]); // proveedores agregados por usuarios [{id, nombre}]

  useEffect(() => {
    const unsub = suscribirOrdenes((rows) => {
      setOrdenes(rows);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = suscribirProveedores((rows) => setProvExtra(rows));
    return () => unsub();
  }, []);

  const derivados = useMemo(() => {
    const pendientes = ordenes.filter((o) => !o.cerrada);
    const cerradas = ordenes.filter((o) => o.cerrada);
    const porEtapa = (e) => pendientes.filter((o) => o.etapa === e);
    return {
      pendientes,
      cerradas,
      inicio: porEtapa("Inicio"),
      seguimiento: porEtapa("Seguimiento"),
      finalizado: porEtapa("Finalizado"),
    };
  }, [ordenes]);

  // Lista combinada de nombres de proveedores (base + agregados), sin duplicados y ordenada.
  const proveedores = useMemo(() => {
    const base = new Set(PROVEEDORES.map((p) => p.toUpperCase()));
    const extra = provExtra.map((p) => p.nombre).filter((n) => n && !base.has(n.toUpperCase()));
    return [...PROVEEDORES, ...extra].sort((a, b) => a.localeCompare(b, "es"));
  }, [provExtra]);

  return (
    <DataCtx.Provider value={{ ordenes, cargando, proveedores, provExtra, ...derivados }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
