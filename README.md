# zirkonyx-prueba-2
Prueba de ZIRKONYX: página creada desde cero (clínica odontológica)

Página de **Clínica Dental Sonrisa Viva**, hecha con Next.js (App Router) y TypeScript.

## Instalar y ejecutar

Requisitos: Node.js 18.17 o superior.

```bash
npm install
cp .env.example .env.local   # en la etapa 1 no hace falta completar nada
npx next dev                 # http://localhost:3000
```

Para publicar: `npx next build` y luego `npx next start`.

## Cómo está organizado

- `src/app/page.tsx`: página de inicio (portada, servicios, ¿Por qué elegirnos?, llamada a agendar).
- `src/app/agendar/page.tsx`: por ahora un aviso de «Muy pronto» con el teléfono. Acepta `?servicio=<slug>`.
- `src/app/privacidad/page.tsx`: aviso de privacidad (texto definitivo pendiente).
- `src/components/`: cabecera (con menú desplegable en celular), pie de página e íconos.
- `src/lib/clinica.ts`: dirección, teléfono y horario de la clínica, en un solo lugar.
- `src/lib/servicios.ts`: los cinco servicios.
- `src/app/globals.css`: estilo «Azul claro, paso a paso» (azul `#1d4ed8`, títulos `#0f2a6b`, letra Poppins).

## Etapas

1. La página de la clínica (esta).
2. Agendar una cita paso a paso (base de datos PostgreSQL, `DATABASE_URL`).
3. Correos de aviso y confirmación (`MAIL_*`, `CLINIC_EMAIL`).
4. Acceso del equipo en `/admin` (`ADMIN_*`, `SESSION_SECRET`).
