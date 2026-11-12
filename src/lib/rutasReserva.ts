// Direcciones de los pasos de la reserva. Lo elegido (servicio, día y hora)
// viaja en la dirección, así los botones Atrás no lo pierden. Los datos del
// paciente nunca van en la dirección.

export type Parametros = Record<string, string | string[] | undefined>;

/** Nombre de la cookie con la que el paso 4 sabe qué cita acaba de reservar este navegador. */
export const COOKIE_CITA = "cita_confirmada";

export function parametro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export function urlReserva(
  paso: "" | "dia-hora" | "datos",
  datos: { servicio?: string; fecha?: string; hora?: string; ocupada?: boolean } = {},
): string {
  const q = new URLSearchParams();
  if (datos.servicio) q.set("servicio", datos.servicio);
  if (datos.fecha) q.set("fecha", datos.fecha);
  if (datos.hora) q.set("hora", datos.hora);
  if (datos.ocupada) q.set("ocupada", "1");
  const base = paso ? `/agendar/${paso}` : "/agendar";
  const consulta = q.toString();
  return consulta ? `${base}?${consulta}` : base;
}
