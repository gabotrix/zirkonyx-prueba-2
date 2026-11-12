import type { Metadata } from "next";
import Link from "next/link";
import Icono from "@/components/Icono";
import PasosReserva from "@/components/PasosReserva";
import { conConexion } from "@/lib/db";
import { serviciosActivos, textoDuracion } from "@/lib/reservas";
import { parametro, urlReserva, type Parametros } from "@/lib/rutasReserva";
import { buscarServicio } from "@/lib/servicios";

export const metadata: Metadata = {
  title: "Agendar cita · Clínica Dental Sonrisa Viva",
};

export const dynamic = "force-dynamic";

// Paso 1 · Servicio. Con ?servicio=<slug> (tarjetas de la página de inicio
// o al volver con Atrás) el servicio ya aparece elegido.
export default async function PasoServicio({ searchParams }: { searchParams: Parametros }) {
  const lista = await conConexion(serviciosActivos);
  const elegido = lista.find((s) => s.slug === parametro(searchParams.servicio));

  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box">
          <PasosReserva actual={1} />
          <h1 className="t">¿Qué servicio necesitas?</h1>
          <p className="st">Elige uno para ver los horarios disponibles.</p>
          <div className="lista">
            {lista.map((s) => {
              const sel = s.slug === elegido?.slug;
              return (
                <Link
                  key={s.slug}
                  className={sel ? "opc sel" : "opc"}
                  href={urlReserva("dia-hora", { servicio: s.slug })}
                  aria-current={sel ? "true" : undefined}
                >
                  <span className="ic">
                    <Icono nombre={buscarServicio(s.slug)?.icono ?? "sonrisa"} tamano={22} />
                  </span>
                  <span>
                    <b>{s.nombre}</b>
                    <small>{textoDuracion(s)}</small>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="acc">
            <Link className="btn btn2" href="/">
              Volver
            </Link>
            {elegido ? (
              <Link className="btn" href={urlReserva("dia-hora", { servicio: elegido.slug })}>
                Continuar
              </Link>
            ) : (
              <span className="btn btn-off" aria-disabled="true">
                Continuar
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
