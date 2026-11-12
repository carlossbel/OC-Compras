import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function Topbar({ title, children, buscador = true }) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="spacer" />
      {children}
      {buscador && (
        <button className="topbar-search" title="Buscador" onClick={() => nav("/buscador")}>
          <Icon name="search" size={18} />
        </button>
      )}
    </div>
  );
}
