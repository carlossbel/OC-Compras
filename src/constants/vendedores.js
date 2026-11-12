import { partidasDe } from "../utils/format";

// Prefijo (3 primeras letras de la clave de producto) -> vendedor
export const PREFIJO_VENDEDOR = {
  GRA: "Ana Garcia",
  CMM: "Mario Crisanto",
  MPC: "Carlos Medina",
  VDA: "Laura Valle",
  TOL: "Leonardo Ortega",
  MMC: "Cuauhtémoc Muñoz",
  HVJ: "Jovanna Hernández",
  TTR: "Rene Torres",
  RTL: "Eduardo Rodriguez",
};

// Lista de vendedores (ordenada)
export const VENDEDORES = [...new Set(Object.values(PREFIJO_VENDEDOR))].sort((a, b) => a.localeCompare(b, "es"));

// Vendedor de una orden, según el prefijo de la clave de su primera partida.
export function vendedorDeOC(oc) {
  const clave = (partidasDe(oc)[0]?.claveProducto || "").trim().toUpperCase();
  return PREFIJO_VENDEDOR[clave.slice(0, 3)] || "";
}

const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Dado el nombre de un usuario, devuelve el vendedor que le corresponde (ignora acentos).
export function vendedorDeUsuario(nombre) {
  const n = norm(nombre);
  return VENDEDORES.find((v) => norm(v) === n) || "";
}
