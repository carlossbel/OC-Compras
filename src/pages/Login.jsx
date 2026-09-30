import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { USUARIOS } from "../constants/usuarios";
import Icon from "../components/Icon";
import GlassSelect from "../components/GlassSelect";

export default function Login() {
  const { login } = useAuth();
  const [nombre, setNombre] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!nombre) return setError("Selecciona tu usuario.");
    if (!login(nombre, pass)) {
      setError("Usuario o contraseña incorrectos.");
      setPass("");
    }
  };

  return (
    <div className="login-page">
      <span className="login-blob b1" />
      <span className="login-blob b2" />
      <span className="login-blob b3" />

      <form className="login-glass" onSubmit={submit}>
        <img
          src="/logo-white.png"
          alt="BLOOBIT"
          className="login-glass-logo"
          onError={(e) => { e.currentTarget.classList.add("hidden"); e.currentTarget.nextSibling.classList.remove("hidden"); }}
        />
        <h1 className="hidden login-glass-fallback">BLOOBIT</h1>

        <h2>Iniciar sesión</h2>
        <p className="sub">Sistema de gestión de Órdenes de Compra</p>

        <GlassSelect
          value={nombre}
          onChange={(v) => { setNombre(v); setError(""); }}
          options={USUARIOS.map((u) => u.nombre)}
          placeholder="Usuario"
        />

        <div className="glass-field">
          <Icon name="lock" size={18} />
          <input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(""); }}
            placeholder="Contraseña"
          />
        </div>

        {error && <div className="login-error-glass">{error}</div>}

        <button className="btn btn-glass" type="submit">
          Entrar al sistema <Icon name="arrowRight" size={17} />
        </button>
      </form>
    </div>
  );
}
