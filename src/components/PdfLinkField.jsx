import { useState } from "react";
import Icon from "./Icon";

// Campo para vincular un PDF por enlace (OneDrive, Drive, SharePoint…).
export default function PdfLinkField({ label, value, onChange }) {
  const [urlText, setUrlText] = useState("");

  const commitUrl = () => {
    const v = urlText.trim();
    if (v) onChange(v);
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
      <div className="pdf-row">
        <input
          placeholder="Pega el enlace del PDF (OneDrive, SharePoint, Drive…)"
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          onBlur={commitUrl}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitUrl(); } }}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={commitUrl} disabled={!urlText.trim()}>
          Guardar
        </button>
      </div>
    </div>
  );
}
