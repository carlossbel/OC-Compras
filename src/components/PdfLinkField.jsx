import { useRef, useState } from "react";
import { subirPDF } from "../services/ocService";
import Icon from "./Icon";

const MAX_MB = 10;

// Campo para vincular un PDF: por enlace (predeterminado, gratis) o subiéndolo a Storage (requiere Blaze).
export default function PdfLinkField({ label, value, onChange, carpeta }) {
  const fileRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [modoSubir, setModoSubir] = useState(false);
  const [urlText, setUrlText] = useState("");

  const commitUrl = () => {
    const v = urlText.trim();
    if (v) onChange(v);
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Selecciona un archivo PDF.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`El PDF pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo ${MAX_MB} MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setSubiendo(true);
    setProgreso(0);
    try {
      const url = await subirPDF(file, carpeta, setProgreso);
      onChange(url);
    } catch (err) {
      console.error(err);
      alert(
        "No se pudo subir el PDF. Firebase Storage requiere el plan Blaze. " +
          "Usa mejor la opción de pegar un enlace (Drive/OneDrive/SharePoint)."
      );
      setModoSubir(false);
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Ya hay un PDF vinculado
  if (value) {
    return (
      <div className="field">
        <label>{label}</label>
        <div className="pdf-row">
          <a href={value} target="_blank" rel="noopener noreferrer" className="pdf-link">
            <Icon name="file" size={16} /> Ver PDF
          </a>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => { onChange(""); setUrlText(""); }}>
            Quitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="field">
      <label>{label}</label>

      {modoSubir ? (
        <>
          <div className="pdf-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={subiendo}>
              {subiendo ? `Subiendo… ${progreso}%` : (<><Icon name="upload" size={15} /> Elegir PDF</>)}
            </button>
            {subiendo && <div className="upload-bar"><span style={{ width: `${progreso}%` }} /></div>}
          </div>
          {!subiendo && (
            <span className="pdf-hint">
              Requiere plan Blaze.{" "}
              <button type="button" className="linkbtn" onClick={() => setModoSubir(false)}>Mejor pegar un enlace</button>
            </span>
          )}
          <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} style={{ display: "none" }} />
        </>
      ) : (
        <>
          <div className="pdf-row">
            <input
              placeholder="Pega el enlace del PDF (Drive, OneDrive, SharePoint…)"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              onBlur={commitUrl}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitUrl(); } }}
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={commitUrl} disabled={!urlText.trim()}>
              Guardar
            </button>
          </div>
          <span className="pdf-hint">
            <button type="button" className="linkbtn" onClick={() => setModoSubir(true)}>Subir archivo</button> (requiere Blaze)
          </span>
        </>
      )}
    </div>
  );
}
