import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PasosReserva from "@/components/PasosReserva";
import { clinica } from "@/lib/clinica";
import { conConexion } from "@/lib/db";
import { diaCorto, diaYNumero, horaCorta, nombreMes, numeroDia } from "@/lib/fechas";
import { buscarServicioActivo, diasReservables, textoDuracion, turnosDelDia, type Turno } from "@/lib/reservas";
import { parametro, urlReserva, type Parametros } from "@/lib/rutasReserva";

export const metadata: Metadata = {
  title: "Elige el día y la hora · Clínica Dental Sonrisa Viva",
};

export const dynamic = "force-dynamic";

// Paso 2 · Día y hora. Las horas que se cruzan con otra cita salen tachadas.
export default async function PasoDiaHora({ searchParams }: { searchParams: Parametros }) {
  const slug = parametro(searchParams.servicio);
  const fechaPedida = parametro(searchParams.fecha);
  const horaPedida = parametro(searchParams.hora);
  const ocupada = parametro(searchParams.ocupada) === "1";

  const datos = await conConexion(async (c) => {
    const servicio = slug ? await buscarServicioActivo(c, slug) : undefined;
    if (!servicio) return null;

    const dias = await diasReservables(c);
    let fecha: string | undefined;
    let turnos: Turno[] = [];
    if (fechaPedida && dias.includes(fechaPedida)) {
      fecha = fechaPedida;
      turnos = await turnosDelDia(c, servicio, fecha);
    } else {
      // Sin día elegido: el primero que todavía tenga alguna hora libre.
      for (const dia of dias) {
        fecha = dia;
        turnos = await turnosDelDia(c, servicio, dia);
        if (turnos.some((t) => t.libre)) break;
      }
      if (fecha && !turnos.some((t) => t.libre)) {
        fecha = dias[0];
        turnos = await turnosDelDia(c, servicio, fecha);
      }
    }
    return { servicio, dias, fecha, turnos };
  });
  if (!datos) redirect("/agendar");

  const { servicio, dias, fecha, turnos } = datos;
  const hora = turnos.some((t) => t.hora === horaPedida && t.libre) ? horaPedida : undefined;

  // Días agrupados por mes (por si la lista pasa de un mes a otro).
  const meses: { mes: string; dias: string[] }[] = [];
  for (const dia of dias) {
    const mes = nombreMes(dia);
    const ultimo = meses[meses.length - 1];
    if (ultimo?.mes === mes) ultimo.dias.push(dia);
    else meses.push({ mes, dias: [dia] });
  }

  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box">
          <PasosReserva actual={2} />
          <h1 className="t">Elige el día y la hora</h1>
          <p className="st">
            {servicio.nombre} · {textoDuracion(servicio)}
          </p>

          {ocupada && (
            <p className="alerta" role="alert">
              Esa hora acaba de ser reservada, elige otra.
            </p>
          )}

          {dias.length === 0 ? (
            <p className="st">
              Por ahora no hay días disponibles para reservar en línea. Llámanos al{" "}
              <a href={clinica.telefonoEnlace}>{clinica.telefono}</a> y te damos una cita.
            </p>
          ) : (
            <>
              {meses.map((grupo) => (
                <div key={grupo.mes}>
                  <p className="lbl">{grupo.mes}</p>
                  <div className="dias">
                    {grupo.dias.map((dia) => (
                      <Link
                        key={dia}
                        scroll={false}
                        className={dia === fecha ? "dia sel" : "dia"}
                        href={urlReserva("dia-hora", { servicio: servicio.slug, fecha: dia })}
                        aria-current={dia === fecha ? "date" : undefined}
                      >
                        {diaCorto(dia)}
                        <b>{numeroDia(dia)}</b>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {fecha && (
                <>
                  <p className="lbl">Horas disponibles el {diaYNumero(fecha)}</p>
                  {turnos.some((t) => t.libre) ? (
                    <div className="horas">
                      {turnos.map((t) =>
                        t.libre ? (
                          <Link
                            key={t.hora}
                            scroll={false}
                            className={t.hora === hora ? "hora sel" : "hora"}
                            href={urlReserva("dia-hora", { servicio: servicio.slug, fecha, hora: t.hora })}
                            aria-current={t.hora === hora ? "true" : undefined}
                          >
                            {horaCorta(t.hora)}
                          </Link>
                        ) : (
                          <span key={t.hora} className="hora no" title="Ocupada">
                            {horaCorta(t.hora)}
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="st">Ya no quedan horas libres este día. Elige otro día.</p>
                  )}
                </>
              )}
            </>
          )}

          <div className="acc">
            <Link className="btn btn2" href={urlReserva("", { servicio: servicio.slug })}>
              Atrás
            </Link>
            {fecha && hora ? (
              <Link className="btn" href={urlReserva("datos", { servicio: servicio.slug, fecha, hora })}>
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
