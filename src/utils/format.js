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

// Genera un folio CROL legible: CROL-AAMM-#### (secuencial simple por timestamp)
export function generarCrol() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CROL-${yy}${mm}-${rand}`;
}
