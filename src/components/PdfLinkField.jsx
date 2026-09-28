import { useRef, useState } from "react";
import { subirPDF } from "../services/ocService";
import Icon from "./Icon";

// Campo para vincular un PDF: subirlo a Firebase Storage o pegar una URL.
const MAX_MB = 10;

export default function PdfLinkField({ label, value, onChange, carpeta }) {
  const fileRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [modoUrl, setModoUrl] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Selecciona un archivo PDF.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(
        `El PDF pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. ` +
          `Máximo ${MAX_MB} MB — comprímelo o usa “Pegar URL” con un enlace (Drive/SharePoint).`
      );
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
        "No se pudo subir el PDF. Verifica que Firebase Storage esté habilitado " +
          "y con reglas publicadas. Mientras tanto puedes pegar un enlace con “Pegar URL”."
      );
      setModoUrl(true);
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="field">
      <label>{label}</label>

      {value ? (
        <div className="pdf-row">
          <a href={value} target="_blank" rel="noopener noreferrer" className="pdf-link">
            <Icon name="file" size={16} /> Ver PDF
          </a>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
            Cambiar
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange("")}>
            Quitar
          </button>
        </div>
      ) : modoUrl ? (
        <div className="pdf-row">
          <input
            placeholder="Pega el enlace del PDF (Drive, SharePoint…)"
            defaultValue=""
            onBlur={(e) => e.target.value.trim() && onChange(e.target.value.trim())}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setModoUrl(false)}>
            Subir archivo
          </button>
        </div>
      ) : (
        <div className="pdf-row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={subiendo}>
            {subiendo ? `Subiendo… ${progreso}%` : (<><Icon name="upload" size={15} /> Subir PDF</>)}
          </button>
          {subiendo ? (
            <div className="upload-bar"><span style={{ width: `${progreso}%` }} /></div>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setModoUrl(true)}>
              Pegar URL
            </button>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} style={{ display: "none" }} />
    </div>
  );
}
