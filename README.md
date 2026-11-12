# zirkonyx-prueba-2
Prueba de ZIRKONYX: página creada desde cero (clínica odontológica)

Página de **Clínica Dental Sonrisa Viva**, hecha con Next.js (App Router) y TypeScript.

## Instalar y ejecutar

Requisitos: Node.js 18.17 o superior y una base de datos PostgreSQL (12 o superior).

```bash
npm install
cp .env.example .env.local   # completa DATABASE_URL
node scripts/migrar.mjs      # crea las tablas y carga servicios y horario
npx next dev                 # http://localhost:3000
```

Para publicar: aplicar las migraciones con `node scripts/migrar.mjs` (con `DATABASE_URL`
del servidor), luego `npx next build` y `npx next start`. La página de inicio funciona
sin base de datos; las pantallas de `/agendar` la necesitan (si no responde, muestran
un aviso con el teléfono).

### Base de datos

- `db/migrations/`: migraciones SQL numeradas (`001_…`, `002_…`). Cada cambio de la base va
  en un archivo nuevo; nunca se edita uno ya aplicado. `scripts/migrar.mjs` aplica los que
  falten y los anota en la tabla `migraciones_aplicadas`.
- Tablas: `servicios`, `horario_atencion`, `bloqueos` (festivos y vacaciones) y `citas`.
- Las fechas y horas se guardan en la hora de la clínica (`America/Bogota`).
- La restricción `citas_sin_choques` impide que dos citas confirmadas se crucen, aunque
  dos pacientes confirmen a la vez. Una cita con estado `cancelada` libera su hora.

## Cómo está organizado

- `src/app/page.tsx`: página de inicio (portada, servicios, ¿Por qué elegirnos?, llamada a agendar).
- `src/app/agendar/`: la reserva en 4 pasos. `page.tsx` (1. Servicio, acepta `?servicio=<slug>`),
  `dia-hora/` (2. Día y hora), `datos/` (3. Tus datos) y `confirmacion/` (4. Confirmación).
  `acciones.ts` guarda la cita (validación en el servidor).
- `src/lib/reservas.ts`: días y turnos libres y creación de la cita dentro de una transacción.
  Ahí se ajustan el intervalo entre turnos (30 min), los días que se ofrecen (14) y la
  anticipación mínima para el mismo día (60 min).
- `src/lib/db.ts`, `src/lib/fechas.ts`, `src/lib/validacion.ts`, `src/lib/rutasReserva.ts`: conexión,
  fechas en la zona de la clínica, validación de datos y direcciones de los pasos.
- `src/app/privacidad/page.tsx`: aviso de privacidad (texto definitivo pendiente).
- `src/components/`: cabecera (con menú desplegable en celular), pie de página e íconos.
- `src/lib/clinica.ts`: dirección, teléfono y horario de la clínica, en un solo lugar.
- `src/lib/servicios.ts`: textos e íconos de los cinco servicios (duración en la base de datos).
- `src/app/globals.css`: estilo «Azul claro, paso a paso» (azul `#1d4ed8`, títulos `#0f2a6b`, letra Poppins).

## Etapas

1. La página de la clínica.
2. Agendar una cita paso a paso (base de datos PostgreSQL, `DATABASE_URL`) (esta).
3. Correos de aviso y confirmación (`MAIL_*`, `CLINIC_EMAIL`).
4. Acceso del equipo en `/admin` (`ADMIN_*`, `SESSION_SECRET`).
