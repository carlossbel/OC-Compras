import { createContext, useContext, useState, useEffect } from "react";
import { USUARIOS } from "../constants/usuarios";

const AuthCtx = createContext(null);
const KEY = "oc_bloobit_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Registro canónico del usuario (por nombre) para obtener tema/super siempre al día,
  // aunque la sesión guardada sea antigua y no tenga esos campos.
  const record = user ? USUARIOS.find((u) => u.nombre === user.nombre) : null;

  // Aplica el tema (color) del usuario en la raíz del documento.
  useEffect(() => {
    const tema = record?.tema || "azul";
    document.documentElement.setAttribute("data-tema", tema);
  }, [user?.nombre]);

  // Modo claro / noche — preferencia global (todos los usuarios), guardada en el equipo.
  const [modo, setModo] = useState(() => {
    try {
      return localStorage.getItem("oc_bloobit_modo") || "claro";
    } catch {
      return "claro";
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-modo", modo);
    try {
      localStorage.setItem("oc_bloobit_modo", modo);
    } catch {}
  }, [modo]);
  const toggleModo = () => setModo((m) => (m === "noche" ? "claro" : "noche"));

  // Devuelve true si las credenciales son válidas.
  const login = (nombre, pass) => {
    const u = USUARIOS.find((x) => x.nombre === nombre && x.pass === pass);
    if (!u) return false;
    const sesion = { nombre: u.nombre, rol: u.rol, super: !!u.super, tema: u.tema || "azul", ts: Date.now() };
    setUser(sesion);
    try {
      localStorage.setItem(KEY, JSON.stringify(sesion));
    } catch {}
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  const esAdmin = user?.rol === "admin";
  const esSuper = !!(record?.super || user?.super); // Carlos Beltran (sistemas): puede borrar proveedores

  return (
    <AuthCtx.Provider value={{ user, esAdmin, esSuper, modo, toggleModo, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
