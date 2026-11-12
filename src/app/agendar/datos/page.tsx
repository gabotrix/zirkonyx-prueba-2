import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PasosReserva from "@/components/PasosReserva";
import { conConexion } from "@/lib/db";
import { fechaLarga, horaCorta } from "@/lib/fechas";
import { buscarServicioActivo, turnosDelDia } from "@/lib/reservas";
import { parametro, urlReserva, type Parametros } from "@/lib/rutasReserva";
import FormularioDatos from "./FormularioDatos";

export const metadata: Metadata = {
  title: "Tus datos · Clínica Dental Sonrisa Viva",
};

export const dynamic = "force-dynamic";

// Paso 3 · Tus datos. Antes de mostrar el formulario se comprueba que la hora
// sigue libre; al confirmar se vuelve a comprobar dentro de la transacción.
export default async function PasoDatos({ searchParams }: { searchParams: Parametros }) {
  const slug = parametro(searchParams.servicio);
  const fecha = parametro(searchParams.fecha);
  const hora = parametro(searchParams.hora);

  const { servicio, libre } = await conConexion(async (c) => {
    const servicio = slug ? await buscarServicioActivo(c, slug) : undefined;
    if (!servicio || !fecha || !hora) return { servicio, libre: false };
    const turnos = await turnosDelDia(c, servicio, fecha);
    return { servicio, libre: turnos.some((t) => t.hora === hora && t.libre) };
  });
  if (!servicio) redirect("/agendar");
  if (!fecha || !hora || !libre) {
    redirect(urlReserva("dia-hora", { servicio: servicio.slug, fecha, ocupada: Boolean(fecha && hora) }));
  }

  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box">
          <PasosReserva actual={3} />
          <h1 className="t">Tus datos</h1>
          <p className="st">Los usamos solo para confirmar y recordarte la cita.</p>
          <div className="resumen">
            <span>
              Servicio<b>{servicio.nombre}</b>
            </span>
            <span>
              Día<b>{fechaLarga(fecha)}</b>
            </span>
            <span>
              Hora<b>{horaCorta(hora)}</b>
            </span>
          </div>
          <FormularioDatos
            servicio={servicio.slug}
            fecha={fecha}
            hora={hora}
            atras={urlReserva("dia-hora", { servicio: servicio.slug, fecha, hora })}
          />
        </div>
      </div>
    </main>
  );
}
