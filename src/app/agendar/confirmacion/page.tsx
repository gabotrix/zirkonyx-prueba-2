import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Icono from "@/components/Icono";
import PasosReserva from "@/components/PasosReserva";
import { clinica } from "@/lib/clinica";
import { conConexion } from "@/lib/db";
import { fechaLarga, horaCorta } from "@/lib/fechas";
import { citaPorToken } from "@/lib/reservas";
import { COOKIE_CITA } from "@/lib/rutasReserva";

export const metadata: Metadata = {
  title: "Cita agendada · Clínica Dental Sonrisa Viva",
};

export const dynamic = "force-dynamic";

// Paso 4 · Confirmación. Solo la ve el navegador que acaba de reservar
// (cookie con el identificador de la cita); nadie más puede abrirla.
export default async function PasoConfirmacion() {
  const token = cookies().get(COOKIE_CITA)?.value;
  const cita = token ? await conConexion((c) => citaPorToken(c, token)) : null;
  if (!cita) redirect("/agendar");

  const primerNombre = cita.nombre.split(" ")[0];

  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box ctr">
          <PasosReserva actual={4} />
          <div className="okc">
            <Icono nombre="listo" tamano={44} />
          </div>
          <h1 className="t">¡Tu cita está agendada, {primerNombre}!</h1>
          <p className="st">Guarda estos datos de tu cita.</p>
          <div className="resumen" style={{ justifyContent: "center", textAlign: "left" }}>
            <span>
              Servicio<b>{cita.servicio}</b>
            </span>
            <span>
              Día<b>{fechaLarga(cita.fecha)}</b>
            </span>
            <span>
              Hora<b>{horaCorta(cita.horaInicio)}</b>
            </span>
            <span>
              Lugar<b>{clinica.direccion}</b>
            </span>
          </div>
          <p className="st">
            Si necesitas cambiarla, llámanos al <a href={clinica.telefonoEnlace}>{clinica.telefono}</a>.
          </p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Link className="btn" href="/">
              Volver al inicio
            </Link>
            <Link className="btn btn2" href="/agendar">
              Agendar otra cita
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
