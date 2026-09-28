# Bloobit · Órdenes de Compra (OC)

Aplicación web en **React + Vite + Firebase Firestore** para gestionar órdenes de compra, basada en el formato `FO-AB-001`.

## Flujo

Una orden avanza por etapas, determinadas automáticamente por su **estado de envío**:

| Estado de envío            | Etapa        |
| -------------------------- | ------------ |
| Pendiente / Order Processing | **Inicio**   |
| Produccion / Transito        | **Seguimiento** |
| Recibido / Entregado         | **Finalizado**  |

Desde **Finalizado**, la orden puede **cerrarse** y pasa al histórico de **Cerradas**.

```
Nueva OC → Inicio → Seguimiento → Finalizado → (Cerrar) → Cerradas
```

## Estructura

- `src/firebase.js` — configuración de Firebase.
- `src/services/ocService.js` — CRUD y suscripción en tiempo real a Firestore (colección `ordenes`).
- `src/context/` — sesión (`AuthContext`) y datos en vivo (`DataContext`).
- `src/pages/` — Login, Dashboard, Nueva OC, etapas, Cerradas, Buscador.
- `src/components/` — Layout, tabla, formulario, modal de detalle, stepper del flujo.
- `src/constants/catalogs.js` — catálogos extraídos del Excel (estados, proveedores, tiempos de entrega).

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre http://localhost:5173

### Firebase

1. En la consola de Firebase (proyecto `oc-bloobit`), habilita **Cloud Firestore**.
2. Publica las reglas de `firestore.rules`.
3. Habilita **Storage** (para adjuntar PDFs de CROL y facturas) y publica `storage.rules`.

> Las reglas de ejemplo son abiertas para desarrollo; restríngelas con Firebase Auth antes de producción.

### Campos y reglas de negocio (según `FO-AB-001`)

- **Fuente**, **Cliente**, **OC del cliente**, **CROL** (consecutivo del ERP).
- **Vínculo a la CROL** y **Factura (acuse firmado)**: se puede **subir un PDF** (Firebase Storage) o pegar un enlace.
- **Fechas estimadas con fórmula**: se calculan con el tiempo de entrega (días hábiles, omite fines de semana). La estimada a Bloobit se marca en **rojo** si no se cumple.
- **Estado de envío con semáforo**: 🟢 a tiempo/entregada · 🟡 en proceso · 🔴 atrasada.
- Se eliminó **Número de pedido**.

El login actual es una pantalla simple guardada en `localStorage`. Para producción, integra **Firebase Authentication**.
