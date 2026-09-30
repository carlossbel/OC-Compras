import { createPortal } from "react-dom";
import Icon from "./Icon";

export default function Modal({ title, onClose, children, maxWidth }) {
  // Se renderiza en document.body con un portal para que el efecto vidrio (backdrop-filter)
  // de las tarjetas/tablas no rompa el position:fixed del modal.
  return createPortal(
    <div className="modal-back" onClick={onClose}>
      <div
        className="modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="x" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
