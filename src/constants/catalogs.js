// Catálogos extraídos del Excel FO-AB-001

// Estado de envío -> etapa del flujo
// Inicio (recién ingresadas) -> Seguimiento (producción/tránsito) -> Finalizado (recibidas/entregadas) -> Cerrada
export const ESTADOS_ENVIO = [
  "Pendiente",
  "Order Processing",
  "Produccion",
  "Transito",
  "Recibido",
  "Entregado",
];

// Mapeo estado de envío -> etapa
export const ETAPA_POR_ESTADO = {
  "Pendiente": "Inicio",
  "Order Processing": "Inicio",
  "Produccion": "Seguimiento",
  "Transito": "Seguimiento",
  "Recibido": "Finalizado",
  "Entregado": "Finalizado",
};

export const ETAPAS = ["Inicio", "Seguimiento", "Finalizado"];

export const TIEMPOS_ENTREGA = [
  "INMEDIATO",
  "1-5 Dias Habiles",
  "2 a 5 Días hábiles",
  "5-8 días hábiles",
  "5 a 8 Días hábiles",
  "8 a 12 Días hábiles",
  "2 a 3 Semanas",
  "3 a 4 Semanas",
  "3 o Mas Semanas",
  "4 a 6 Semanas",
  "4 a más semanas",
  "6 a 12 Semanas",
];

export const PROVEEDORES = [
  "INTCOMEX",
  "INTCOMEX CLOUD",
  "INGRAM",
  "INGRAM CLOUD",
  "CT INTERNACIONAL",
  "CT",
  "TELECOMMBA",
  "EXEL DEL NORTE",
  "EXEL",
  "FINCO",
  "SERMEXTEC",
  "TEAM",
  "NIMAX",
  "GRUPO CVA",
  "CVA",
  "SYSCOM",
  "CAT",
  "REGIOTRADE INTERNACIONAL",
  "CYBERPUERTA",
  "AMAZON",
  "COSTCO",
  "COMPUSOLUCIONES",
  "GRUPO DICE",
  "GRUPO LOMA",
  "NEXSYS",
  "CANON MEXICANA",
  "PARKPLACE",
  "STEREN",
];

// Color por etapa (para chips)
export const COLOR_ETAPA = {
  Inicio: "#f59e0b",
  Seguimiento: "#3b82f6",
  Finalizado: "#10b981",
  Cerrada: "#64748b",
};

export const COLOR_ESTADO = {
  "Pendiente": "#f59e0b",
  "Order Processing": "#f97316",
  "Produccion": "#6366f1",
  "Transito": "#3b82f6",
  "Recibido": "#14b8a6",
  "Entregado": "#10b981",
};
