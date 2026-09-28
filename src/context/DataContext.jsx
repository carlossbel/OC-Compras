import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { suscribirOrdenes } from "../services/ocService";

const DataCtx = createContext(null);

export function DataProvider({ children }) {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = suscribirOrdenes((rows) => {
      setOrdenes(rows);
      setCargando(false);
    });
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

  return (
    <DataCtx.Provider value={{ ordenes, cargando, ...derivados }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
