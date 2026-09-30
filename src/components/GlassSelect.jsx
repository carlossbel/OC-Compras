import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

// Desplegable con efecto vidrio (reemplaza al <select> nativo en el login).
// Calcula la altura/posición al abrir para no salirse de la pantalla.
export default function GlassSelect({ value, onChange, options, placeholder, icon = "user" }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const margen = 16;
      const abajo = window.innerHeight - r.bottom - margen;
      const arriba = r.top - margen;
      // Abrir hacia donde haya más espacio
      if (abajo >= arriba) {
        setMenuStyle({ top: "calc(100% + 6px)", bottom: "auto", maxHeight: Math.max(160, abajo) + "px" });
      } else {
        setMenuStyle({ bottom: "calc(100% + 6px)", top: "auto", maxHeight: Math.max(160, arriba) + "px" });
      }
    }
    setOpen((o) => !o);
  };

  return (
    <div className="gsel" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className={`glass-field gsel-btn ${value ? "" : "placeholder"}`}
        onClick={toggle}
      >
        <Icon name={icon} size={19} />
        <span className="gsel-val">{value || placeholder}</span>
        <Icon name="chevronDown" size={16} className={open ? "gsel-chev open" : "gsel-chev"} />
      </button>

      {open && (
        <div className="gsel-menu" style={menuStyle}>
          {options.map((o) => (
            <button
              type="button"
              key={o}
              className={`gsel-opt ${o === value ? "sel" : ""}`}
              onClick={() => { onChange(o); setOpen(false); }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
