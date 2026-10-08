import { ETAPA_POR_ESTADO } from "../constants/catalogs";

export function etapaDeEstado(estadoEnvio) {
  return ETAPA_POR_ESTADO[estadoEnvio] || "Inicio";
}

export function fmtFecha(v) {
  if (!v) return "—";
  try {
    // Las fechas "YYYY-MM-DD" se interpretan como locales (evita desfase por zona horaria).
    let d;
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      const [y, m, day] = v.slice(0, 10).split("-").map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(v);
    }
    if (isNaN(d)) return v;
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return v;
  }
}

export function fmtNum(n) {
  if (n === null || n === undefined || n === "") return "—";
  return Number(n).toLocaleString("es-MX");
}

// ---- Normalización (compatibilidad con datos antiguos de 1 partida / 1 factura) ----

// Devuelve el arreglo de partidas de una orden (o lo arma desde el formato viejo).
export function partidasDe(o) {
  if (o && Array.isArray(o.partidas) && o.partidas.length) return o.partidas;
  if (o && (o.claveProducto || o.descripcion || o.cantidad != null)) {
    return [{ partida: 1, claveProducto: o.claveProducto || "", descripcion: o.descripcion || "", cantidad: o.cantidad ?? "" }];
  }
  return [];
}

// Devuelve el arreglo de facturas de una orden (o lo arma desde el formato viejo).
export function facturasDe(o) {
  if (o && Array.isArray(o.facturas) && o.facturas.length) return o.facturas;
  if (o && (o.facturaBloobit || o.facturaUrl)) {
    return [{ numero: o.facturaBloobit || "", url: o.facturaUrl || "" }];
  }
  return [];
}

// Suma de cantidades de todas las partidas.
export function cantidadTotal(o) {
  return partidasDe(o).reduce((s, p) => s + (Number(p.cantidad) || 0), 0);
}

// ¿La orden está excluida de los indicadores? (backorder, parcial, proyecto, etc.)
export function noAplicaIndicador(o) {
  return !!(o && o.noAplica);
}
