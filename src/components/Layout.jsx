import { NavLink } from "react-router-dom";
import { useData } from "../context/DataContext";
import Icon from "./Icon";

const link = ({ isActive }) => (isActive ? "active" : "");

export default function Layout({ children }) {
  const { inicio, seguimiento, finalizado, cerradas } = useData();

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
          <NavLink to="/nueva" className={link}>
            <Icon name="plus" className="nav-icon" /> Nueva OC
          </NavLink>
          <NavLink to="/buscador" className={link}>
            <Icon name="search" className="nav-icon" /> Buscador
          </NavLink>

          <div className="nav-section">OC Pendientes</div>
          <NavLink to="/pendientes" className={link}>
            <Icon name="list" className="nav-icon" /> Todas
          </NavLink>
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

          <div className="nav-section">Histórico</div>
          <NavLink to="/cerradas" className={link}>
            <Icon name="archive" className="nav-icon" /> Cerradas
            {cerradas.length > 0 && <span className="badge">{cerradas.length}</span>}
          </NavLink>
        </nav>
      </aside>

      <div className="main">{children}</div>
    </div>
  );
}
