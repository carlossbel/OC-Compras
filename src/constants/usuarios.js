// Usuarios y roles del sistema.
// rol "admin"  -> acceso total (crear, editar, cerrar, eliminar)
// rol "lector" -> solo lectura (ver, filtrar, reportes)
//
// NOTA: esto es autenticación básica del lado del cliente para uso interno.
// Para seguridad real conviene migrar a Firebase Authentication.
export const USUARIOS = [
  // Administración (acceso total)
  { nombre: "Karla Arriaga", pass: "030226", rol: "admin" },
  { nombre: "Ana Garcia", pass: "020625", rol: "admin" },
  { nombre: "Claudia Oseguera", pass: "040926", rol: "admin" },
  // Sistemas (acceso total)
  { nombre: "Carlos Beltran", pass: "1312", rol: "admin" },

  // Vendedores (solo lectura)
  { nombre: "Laura Valle", pass: "030625", rol: "lector" },
  { nombre: "Carlos Medina", pass: "251125", rol: "lector" },
  { nombre: "Jovanna Hernandez", pass: "181125", rol: "lector" },
  { nombre: "Leo Torrero", pass: "030625", rol: "lector" },

  // Solo lectura (contraseña temporal 0000 — actualizar)
  { nombre: "Cuauhtemoc Muñoz", pass: "0000", rol: "lector" },
  { nombre: "Mario Crisanto", pass: "0000", rol: "lector" },
  { nombre: "Barbara Perez", pass: "0000", rol: "lector" },
];

export const ROL_LABEL = {
  admin: "Administrador",
  lector: "Solo lectura",
};
