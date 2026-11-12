import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { suscribirOrdenes, suscribirProveedores, suscribirClientes } from "../services/ocService";
import { PROVEEDORES } from "../constants/catalogs";
import { vendedorDeOC } from "../constants/vendedores";

const DataCtx = createContext(null);

export function DataProvider({ children }) {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [provExtra, setProvExtra] = useState([]); // proveedores agregados por usuarios [{id, nombre}]
  const [cliExtra, setCliExtra] = useState([]); // clientes agregados [{id, nombre, vendedor}]

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

  useEffect(() => {
    const unsub = suscribirClientes((rows) => setCliExtra(rows));
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

  // Clientes por vendedor: derivados de las órdenes (por prefijo de clave) + agregados manualmente.
  const clientesPorVendedor = useMemo(() => {
    const map = {}; // vendedor -> Set de clientes
    const add = (vend, cli) => {
      if (!cli) return;
      const v = vend || "(sin vendedor)";
      (map[v] = map[v] || new Set()).add(cli.trim());
    };
    for (const o of ordenes) add(vendedorDeOC(o), (o.cliente || "").trim());
    for (const c of cliExtra) add(c.vendedor, (c.nombre || "").trim());
    const out = {};
    Object.keys(map).forEach((v) => { out[v] = [...map[v]].filter(Boolean).sort((a, b) => a.localeCompare(b, "es")); });
    return out;
  }, [ordenes, cliExtra]);

  // Todos los nombres de cliente (para el desplegable de Nueva OC).
  const clientes = useMemo(() => {
    const set = new Set();
    Object.values(clientesPorVendedor).forEach((arr) => arr.forEach((c) => set.add(c)));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [clientesPorVendedor]);

  return (
    <DataCtx.Provider value={{ ordenes, cargando, proveedores, provExtra, clientes, clientesPorVendedor, cliExtra, ...derivados }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
