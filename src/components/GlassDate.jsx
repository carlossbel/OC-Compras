import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import { fmtFecha } from "../utils/format";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DOWS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function parse(v) {
  if (!v) return null;
  const [y, m, d] = String(v).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function fmt(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Selector de fecha con calendario de efecto vidrio (adaptado al tema).
export default function GlassDate({ value, onChange, placeholder = "dd/mm/aaaa" }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const sel = parse(value);
  const [view, setView] = useState(sel || new Date());
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { if (open) setView(parse(value) || new Date()); }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const abajo = window.innerHeight - r.bottom - 12;
      if (abajo >= 330 || abajo >= r.top) setMenuStyle({ top: "calc(100% + 6px)", bottom: "auto" });
      else setMenuStyle({ bottom: "calc(100% + 6px)", top: "auto" });
    }
    setOpen((o) => !o);
  };

  const y = view.getFullYear();
  const mo = view.getMonth();
  const firstDay = (new Date(y, mo, 1).getDay() + 6) % 7; // lunes = 0
  const days = new Date(y, mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const hoy = new Date();
  const mismo = (d, x) => x && x.getFullYear() === y && x.getMonth() === mo && x.getDate() === d;
  const pick = (d) => { onChange(fmt(new Date(y, mo, d))); setOpen(false); };

  return (
    <div className="gdate" ref={ref}>
      <button ref={btnRef} type="button" className={`gdrop-btn ${sel ? "" : "placeholder"}`} onClick={toggle}>
        <Icon name="calendar" size={15} />
        <span className="gdrop-val">{sel ? fmtFecha(value) : placeholder}</span>
        <Icon name="chevronDown" size={15} className={open ? "gdrop-chev open" : "gdrop-chev"} />
      </button>
      {open && (
        <div className="gdate-menu" style={menuStyle}>
          <div className="gdate-head">
            <button type="button" className="gdate-nav" onClick={() => setView(new Date(y, mo - 1, 1))} aria-label="Mes anterior">‹</button>
            <span>{MESES[mo]} {y}</span>
            <button type="button" className="gdate-nav" onClick={() => setView(new Date(y, mo + 1, 1))} aria-label="Mes siguiente">›</button>
          </div>
          <div className="gdate-grid gdate-dows">{DOWS.map((d, i) => <span key={i}>{d}</span>)}</div>
          <div className="gdate-grid">
            {cells.map((d, i) => d === null
              ? <span key={i} />
              : <button type="button" key={i} className={`gdate-day ${mismo(d, sel) ? "sel" : ""} ${mismo(d, hoy) ? "hoy" : ""}`} onClick={() => pick(d)}>{d}</button>
            )}
          </div>
          <div className="gdate-foot">
            <button type="button" className="linkbtn" onClick={() => { onChange(fmt(new Date())); setOpen(false); }}>Hoy</button>
            {value && <button type="button" className="linkbtn" onClick={() => { onChange(""); setOpen(false); }}>Limpiar</button>}
          </div>
        </div>
      )}
    </div>
  );
}
