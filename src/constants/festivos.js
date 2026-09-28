// Días festivos / no hábiles de México — tomados de la hoja "Parametros" del Excel FO-AB-001.
// El cálculo de fechas estimadas omite fines de semana y estos días.
// Nota: incluye Jueves y Viernes Santo (costumbre, no obligatorios por LFT). Edita según los días que Bloobit labore.
export const FESTIVOS = new Set([
  "2025-01-01", // Año Nuevo
  "2025-02-03", // Día de la Constitución
  "2025-03-17", // Natalicio Benito Juárez
  "2025-04-17", // Jueves Santo
  "2025-04-18", // Viernes Santo
  "2025-05-01", // Día del Trabajo
  "2025-09-16", // Independencia
  "2025-11-17", // Revolución Mexicana
  "2025-12-25", // Navidad
  "2026-01-01", // Año Nuevo
  "2026-02-02", // Día de la Constitución
  "2026-03-16", // Natalicio Benito Juárez
  "2026-04-02", // Jueves Santo
  "2026-04-03", // Viernes Santo
  "2026-05-01", // Día del Trabajo
  "2026-09-16", // Independencia
  "2026-11-16", // Revolución Mexicana
  "2026-12-25", // Navidad
  "2027-01-01", // Año Nuevo
  "2027-02-01", // Día de la Constitución
  "2027-03-15", // Natalicio Benito Juárez
  "2027-03-25", // Jueves Santo
  "2027-03-26", // Viernes Santo
  "2027-05-01", // Día del Trabajo
  "2027-09-16", // Independencia
  "2027-11-15", // Revolución Mexicana
  "2027-12-25", // Navidad
]);
