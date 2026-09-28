import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function Login() {
  const { login } = useAuth();
  const [nombre, setNombre] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    login(nombre.trim());
  };

  return (
    <div className="login-wrap">
      <div className="login-art">
        <img
          src="/logo.png"
          alt="BLOOBIT"
          className="login-logo"
          onError={(e) => { e.currentTarget.classList.add("hidden"); e.currentTarget.nextSibling.classList.remove("hidden"); }}
        />
        <h1 className="hidden">BLOOBIT</h1>
        <p>
          Sistema de gestión de Órdenes de Compra. Controla cada orden desde su
          ingreso hasta el cierre, con seguimiento por etapas en tiempo real.
        </p>
        <div className="feat">
          <div><Icon name="inbox" size={18} /> Inicio — órdenes recién ingresadas</div>
          <div><Icon name="truck" size={18} /> Seguimiento — en producción / tránsito</div>
          <div><Icon name="packageCheck" size={18} /> Finalizados — recibidas / entregadas</div>
          <div><Icon name="archive" size={18} /> Cerradas — histórico de órdenes concluidas</div>
        </div>
      </div>

      <div className="login-form-side">
        <form className="login-card" onSubmit={submit}>
          <h2>Iniciar sesión</h2>
          <p className="muted">Ingresa tu nombre para entrar al sistema.</p>
          <div className="field">
            <label>Usuario</label>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Entrar al sistema <Icon name="arrowRight" size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
