import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { etapaDeEstado } from "../utils/format";

const COL = "ordenes";

// Suscripción en tiempo real a todas las órdenes
export function suscribirOrdenes(callback) {
  const q = query(collection(db, COL), orderBy("creadoEn", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(rows);
    },
    (err) => {
      console.error("Error al leer órdenes:", err);
      callback([]);
    }
  );
}

export async function crearOrden(data) {
  const estadoEnvio = data.estadoEnvio || "Pendiente";
  const payload = {
    ...data,
    estadoEnvio,
    etapa: etapaDeEstado(estadoEnvio),
    cerrada: false,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  };
  return addDoc(collection(db, COL), payload);
}

export async function actualizarOrden(id, data) {
  const patch = { ...data, actualizadoEn: serverTimestamp() };
  if (data.estadoEnvio) patch.etapa = etapaDeEstado(data.estadoEnvio);
  return updateDoc(doc(db, COL, id), patch);
}

export async function cambiarEstado(id, estadoEnvio) {
  return updateDoc(doc(db, COL, id), {
    estadoEnvio,
    etapa: etapaDeEstado(estadoEnvio),
    actualizadoEn: serverTimestamp(),
  });
}

export async function cerrarOrden(id) {
  return updateDoc(doc(db, COL, id), {
    cerrada: true,
    fechaCierre: new Date().toISOString(),
    actualizadoEn: serverTimestamp(),
  });
}

export async function reabrirOrden(id) {
  return updateDoc(doc(db, COL, id), {
    cerrada: false,
    fechaCierre: null,
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarOrden(id) {
  return deleteDoc(doc(db, COL, id));
}

// ---- Catálogo de proveedores (agregados por los usuarios) ----
const COL_PROV = "proveedores";

export function suscribirProveedores(callback) {
  const q = query(collection(db, COL_PROV), orderBy("nombre"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => { console.error("Error al leer proveedores:", err); callback([]); }
  );
}

export async function crearProveedor(nombre) {
  return addDoc(collection(db, COL_PROV), { nombre: nombre.trim(), creadoEn: serverTimestamp() });
}

export async function eliminarProveedor(id) {
  return deleteDoc(doc(db, COL_PROV, id));
}
