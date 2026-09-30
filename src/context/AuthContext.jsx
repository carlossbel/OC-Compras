import { createContext, useContext, useState } from "react";
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

  // Devuelve true si las credenciales son válidas.
  const login = (nombre, pass) => {
    const u = USUARIOS.find((x) => x.nombre === nombre && x.pass === pass);
    if (!u) return false;
    const sesion = { nombre: u.nombre, rol: u.rol, ts: Date.now() };
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

  return (
    <AuthCtx.Provider value={{ user, esAdmin, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
