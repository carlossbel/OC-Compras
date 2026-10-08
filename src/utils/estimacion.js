// Cálculo de fechas estimadas a partir del tiempo de entrega (la "fórmula" del Excel).
import { FESTIVOS } from "../constants/festivos";

// ¿La fecha es día hábil? (no sábado, no domingo, no festivo)
function esHabil(d) {
  const dia = d.getDay();
  if (dia === 0 || dia === 6) return false;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return !FESTIVOS.has(`${y}-${m}-${day}`);
}

// Convierte un texto de tiempo de entrega a días hábiles (toma el límite superior del rango).
export function tiempoADiasHabiles(tiempo) {
  if (!tiempo) return null;
  const t = String(tiempo).toLowerCase();
  if (t.includes("inmediato")) return 0;
  const nums = (t.match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  const max = Math.max(...nums);
  if (t.includes("semana")) return max * 5; // 5 días hábiles por semana
  return max; // días hábiles
}

// Parsea "YYYY-MM-DD" como fecha LOCAL (evita el desfase por zona horaria).
function parseLocal(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Formatea una fecha a "YYYY-MM-DD" en horario local.
function fmtLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Suma días hábiles (omite sábado, domingo y festivos) a una fecha.
export function sumarDiasHabiles(fecha, dias) {
  const d = parseLocal(fecha);
  if (!d) return null;
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    if (esHabil(d)) restantes--;
  }
  return d;
}

// Fecha estimada = fecha base + tiempo de entrega (en días hábiles). Devuelve "YYYY-MM-DD".
export function estimarFecha(fechaBase, tiempo) {
  const dias = tiempoADiasHabiles(tiempo);
  if (!fechaBase || dias === null) return "";
  const res = sumarDiasHabiles(fechaBase, dias);
  return res ? fmtLocal(res) : "";
}

const hoyISO = () => new Date().toISOString().slice(0, 10);

// ¿La entrega a Bloobit está atrasada? (no cumplió y aún no se recibe/entrega)
export function estaAtrasada(oc) {
  if (!oc || oc.cerrada) return false;
  if (oc.noAplica) return false; // backorder/parcial/proyecto/arrendamiento/paquetería no aplican
  if (["Recibido", "Entregado"].includes(oc.estadoEnvio)) return false;
  const est = oc.fechaEstimadaBloobit || estimarFecha(oc.fechaProceso || oc.fechaRecepcionOC, oc.tiempoEntregaBloobit);
  if (!est) return false;
  return est < hoyISO();
}

// Semáforo: verde (entregada a tiempo / en plazo), amarillo (en proceso), rojo (atrasada).
export function colorSemaforo(oc) {
  // Si ya hay fecha de entrega real, el color refleja si se cumplió o no.
  const r = evalEntrega(oc);
  if (r === "atrasada") return "rojo";
  if (r === "aTiempo") return "verde";
  // Sin fecha de entrega aún:
  if (["Recibido", "Entregado"].includes(oc.estadoEnvio)) return "verde";
  if (estaAtrasada(oc)) return "rojo";
  return "amarillo";
}

// Evalúa una orden individual para el indicador de entrega:
// "aTiempo" | "atrasada" | "noAplica" | null (sin datos para evaluar).
export function evalEntrega(o) {
  if (!o) return null;
  if (o.noAplica) return "noAplica";
  const real = o.fechaEntregaRealCliente;
  const est = o.fechaEstimadaCliente || estimarFecha(o.fechaRecepcionOC, o.tiempoEntregaCliente);
  if (!real || !est) return null;
  return real <= est ? "aTiempo" : "atrasada";
}

// Indicador de entregas a tiempo sobre un conjunto de órdenes.
// Compara la entrega real al cliente contra la fecha estimada al cliente.
// Excluye las marcadas como "no aplica" (backorder, parcial, proyecto, arrendamiento, paquetería).
export function indicadorEntregas(orders) {
  let aTiempo = 0, atrasadas = 0, excluidas = 0;
  for (const o of orders || []) {
    if (o.noAplica) { excluidas++; continue; }
    const real = o.fechaEntregaRealCliente;
    const est = o.fechaEstimadaCliente || estimarFecha(o.fechaRecepcionOC, o.tiempoEntregaCliente);
    if (!real || !est) continue;
    real <= est ? aTiempo++ : atrasadas++;
  }
  const total = aTiempo + atrasadas;
  const pct = total ? Math.round((aTiempo / total) * 100) : null;
  return { aTiempo, atrasadas, total, pct, excluidas };
}
