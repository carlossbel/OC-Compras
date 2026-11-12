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

// Caja con icono de calendario que abre un calendario y toma un rango:
// primera fecha = inicio, segunda fecha = fin (busca entre ese rango).
export default function RangeDate({ desde, hasta, onChange, title = "Rango de fechas" }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [view, setView] = useState(parse(desde) || new Date());
  const [pend, setPend] = useState(null); // inicio elegido, esperando el fin
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { if (open) { setView(parse(desde) || new Date()); setPend(null); } }, [open]);

  const activo = !!(desde || hasta);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const abajo = window.innerHeight - r.bottom - 12;
      if (abajo >= 340 || abajo >= r.top) setMenuStyle({ top: "calc(100% + 6px)", bottom: "auto" });
      else setMenuStyle({ bottom: "calc(100% + 6px)", top: "auto" });
    }
    setOpen((o) => !o);
  };

  const y = view.getFullYear();
  const mo = view.getMonth();
  const firstDay = (new Date(y, mo, 1).getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const dDesde = parse(desde);
  const dHasta = parse(hasta);
  const cellDate = (d) => new Date(y, mo, d);

  const pick = (d) => {
    const clicked = cellDate(d);
    if (!pend) {
      // primera fecha: empieza un rango nuevo
      setPend(clicked);
      onChange(fmt(clicked), "");
    } else {
      // segunda fecha: cierra el rango (ordena si hace falta)
      let ini = pend, fin = clicked;
      if (fin < ini) { const t = ini; ini = fin; fin = t; }
      onChange(fmt(ini), fmt(fin));
      setPend(null);
      setOpen(false);
    }
  };

  const esIgual = (a, b) => a && b && a.getTime() === b.getTime();
  const enRango = (d) => {
    const c = cellDate(d);
    if (pend && !dHasta) return esIgual(c, pend);
    if (dDesde && dHasta) return c >= dDesde && c <= dHasta;
    return false;
  };
  const esInicio = (d) => esIgual(cellDate(d), pend || dDesde);
  const esFin = (d) => esIgual(cellDate(d), dHasta);
  const hoy = new Date();
  const esHoy = (d) => cellDate(d).toDateString() === hoy.toDateString();

  const etiqueta = desde && hasta ? `${fmtFecha(desde)} – ${fmtFecha(hasta)}`
    : desde ? `Desde ${fmtFecha(desde)}` : "";

  return (
    <div className="gdate icon-sel" ref={ref}>
      <button ref={btnRef} type="button" className={`icon-box ${activo ? "on" : ""}`} onClick={toggle} title={title + (etiqueta ? ": " + etiqueta : "")}>
        <Icon name="calendar" size={17} />
        {activo && <span className="icon-box-dot" />}
      </button>
      {open && (
        <div className="gdate-menu" style={menuStyle}>
          <div className="gdate-rango">
            {pend && !hasta ? "Elige la fecha final…" : etiqueta || "Elige la fecha inicial…"}
          </div>
          <div className="gdate-head">
            <button type="button" className="gdate-nav" onClick={() => setView(new Date(y, mo - 1, 1))} aria-label="Mes anterior">‹</button>
            <span>{MESES[mo]} {y}</span>
            <button type="button" className="gdate-nav" onClick={() => setView(new Date(y, mo + 1, 1))} aria-label="Mes siguiente">›</button>
          </div>
          <div className="gdate-grid gdate-dows">{DOWS.map((d, i) => <span key={i}>{d}</span>)}</div>
          <div className="gdate-grid">
            {cells.map((d, i) => d === null
              ? <span key={i} />
              : <button
                  type="button"
                  key={i}
                  className={`gdate-day ${enRango(d) ? "inrango" : ""} ${esInicio(d) ? "sel" : ""} ${esFin(d) ? "sel" : ""} ${esHoy(d) ? "hoy" : ""}`}
                  onClick={() => pick(d)}
                >{d}</button>
            )}
          </div>
          <div className="gdate-foot">
            <button type="button" className="linkbtn" onClick={() => { const t = fmt(new Date()); onChange(t, t); setPend(null); setOpen(false); }}>Hoy</button>
            {(desde || hasta) && <button type="button" className="linkbtn" onClick={() => { onChange("", ""); setPend(null); setOpen(false); }}>Limpiar</button>}
          </div>
        </div>
      )}
    </div>
  );
}
