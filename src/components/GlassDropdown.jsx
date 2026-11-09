import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

// Desplegable con efecto vidrio que se adapta al tema (claro/oscuro/colores).
// options: array de strings o de { value, label }.
export default function GlassDropdown({ value, onChange, options, placeholder = "— Seleccionar —" }) {
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

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const m = 12;
      const abajo = window.innerHeight - r.bottom - m;
      const arriba = r.top - m;
      if (abajo >= arriba) setMenuStyle({ top: "calc(100% + 6px)", bottom: "auto", maxHeight: Math.max(170, abajo) + "px" });
      else setMenuStyle({ bottom: "calc(100% + 6px)", top: "auto", maxHeight: Math.max(170, arriba) + "px" });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="gdrop" ref={ref}>
      <button ref={btnRef} type="button" className={`gdrop-btn ${current ? "" : "placeholder"}`} onClick={toggle}>
        <span className="gdrop-val">{current ? current.label : placeholder}</span>
        <Icon name="chevronDown" size={15} className={open ? "gdrop-chev open" : "gdrop-chev"} />
      </button>
      {open && (
        <div className="gdrop-menu" style={menuStyle}>
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
