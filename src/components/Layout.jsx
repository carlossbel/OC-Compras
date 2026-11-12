import { NavLink, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { ROL_LABEL } from "../constants/usuarios";
import Icon from "./Icon";

const link = ({ isActive }) => (isActive ? "active" : "");

export default function Layout({ children }) {
  const { inicio, seguimiento, finalizado, cerradas } = useData();
  const { user, esAdmin, logout, modo, toggleModo } = useAuth();
  const nav = useNavigate();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img
            src="/logo-white.png"
            alt="BLOOBIT"
            className="brand-logo"
            onError={(e) => { e.currentTarget.classList.add("hidden"); e.currentTarget.nextSibling.classList.remove("hidden"); }}
          />
          <span className="brand-fallback hidden">BLOOBIT</span>
          <small className="brand-sub">ÓRDENES DE COMPRA</small>
        </div>

        <nav className="nav">
          <NavLink to="/" className={link} end>
            <Icon name="dashboard" className="nav-icon" /> Dashboard
          </NavLink>
          {esAdmin && (
            <NavLink to="/nueva" className={link}>
              <Icon name="plus" className="nav-icon" /> Nueva OC
            </NavLink>
          )}
          {/* El buscador general queda en el icono flotante; los admins lo conservan también en el menú */}
          {esAdmin && (
            <NavLink to="/buscador" className={link}>
              <Icon name="search" className="nav-icon" /> Buscador
            </NavLink>
          )}
          <NavLink to="/reportes" className={link}>
            <Icon name="chart" className="nav-icon" /> Reportes
          </NavLink>
          <NavLink to="/ayuda" className={link}>
            <Icon name="help" className="nav-icon" /> Ayuda
          </NavLink>

          <div className="nav-section">Histórico</div>
          <NavLink to="/pendientes" className={link}>
            <Icon name="list" className="nav-icon" /> Todas
          </NavLink>

          <div className="nav-divider" />
          <NavLink to="/inicio" className={link}>
            <Icon name="inbox" className="nav-icon" /> Inicio
            {inicio.length > 0 && <span className="badge">{inicio.length}</span>}
          </NavLink>
          <NavLink to="/seguimiento" className={link}>
            <Icon name="truck" className="nav-icon" /> Seguimiento
            {seguimiento.length > 0 && <span className="badge">{seguimiento.length}</span>}
          </NavLink>
          <NavLink to="/finalizados" className={link}>
            <Icon name="packageCheck" className="nav-icon" /> Finalizados
            {finalizado.length > 0 && <span className="badge">{finalizado.length}</span>}
          </NavLink>

          <div className="nav-divider" />
          <NavLink to="/cerradas" className={link}>
            <Icon name="archive" className="nav-icon" /> Cerradas
            {cerradas.length > 0 && <span className="badge">{cerradas.length}</span>}
          </NavLink>

          <NavLink to="/clientes" className={link}>
            <Icon name="user" className="nav-icon" /> Clientes
          </NavLink>
        </nav>

        <div className="sidebar-foot">
          <div className="foot-row">
            <div className="user" style={{ flex: 1, marginBottom: 0 }}>
              <Icon name="user" size={16} />
              <div>
                <div>{user?.nombre}</div>
                <span className={`rol-chip ${esAdmin ? "rol-admin" : "rol-lector"}`}>{ROL_LABEL[user?.rol]}</span>
              </div>
            </div>
            <button className="foot-icon" onClick={toggleModo} title={modo === "noche" ? "Modo claro" : "Modo noche"}>
              <Icon name={modo === "noche" ? "sun" : "moon"} size={16} />
            </button>
            <button className="foot-icon" onClick={() => { logout(); nav("/"); }} title="Cerrar sesión">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        {/* Buscador general flotante (arriba a la derecha) */}
        <button className="search-fab" title="Buscar" onClick={() => nav("/buscador")}>
          <Icon name="search" size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
