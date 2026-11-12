import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

// Caja con un icono que despliega una lista de opciones (efecto vidrio).
// options: array de { value, label }. value "" = sin filtro.
export default function IconSelect({ icon, value, onChange, options, title }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const norm = (options || []).map((o) => (typeof o === "object" ? o : { value: String(o), label: String(o) }));
  const current = norm.find((o) => String(o.value) === String(value));
  const activo = value !== "" && value !== undefined && value !== null;

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const abajo = window.innerHeight - r.bottom - 12;
      const arriba = r.top - 12;
      if (abajo >= arriba) setMenuStyle({ top: "calc(100% + 6px)", bottom: "auto", maxHeight: Math.max(180, abajo) + "px" });
      else setMenuStyle({ bottom: "calc(100% + 6px)", top: "auto", maxHeight: Math.max(180, arriba) + "px" });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="gdrop icon-sel" ref={ref}>
      <button ref={btnRef} type="button" className={`icon-box ${activo ? "on" : ""}`} onClick={toggle} title={title + (current ? ": " + current.label : "")}>
        <Icon name={icon} size={17} />
        {activo && <span className="icon-box-dot" />}
      </button>
      {open && (
        <div className="gdrop-menu icon-sel-menu" style={menuStyle}>
          {norm.map((o) => (
            <button
              type="button"
              key={String(o.value)}
              className={`gdrop-opt ${String(o.value) === String(value) ? "sel" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
