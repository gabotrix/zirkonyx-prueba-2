"use server";

import { cookies } from "next/headers";
import { esFechaValida, esHoraValida } from "@/lib/fechas";
import { crearCita } from "@/lib/reservas";
import { COOKIE_CITA } from "@/lib/rutasReserva";
import { validarDatosPaciente, type ErroresCampos } from "@/lib/validacion";

export type RespuestaReserva =
  | { ok: true }
  | { ok: false; tipo: "ocupada" | "servicio" | "error" }
  | { ok: false; tipo: "datos"; errores: ErroresCampos };

/** Paso 3 → guarda la cita. Todo se valida aquí, en el servidor. */
export async function reservarCita(formData: FormData): Promise<RespuestaReserva> {
  const servicio = String(formData.get("servicio") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  if (!servicio) return { ok: false, tipo: "servicio" };
  if (!esFechaValida(fecha) || !esHoraValida(hora)) return { ok: false, tipo: "ocupada" };

  const validacion = validarDatosPaciente(formData);
  if (!validacion.ok) return { ok: false, tipo: "datos", errores: validacion.errores };

  try {
    const resultado = await crearCita({ servicio, fecha, hora, ...validacion.datos });
    if (!resultado.ok) return { ok: false, tipo: resultado.motivo };

    // Solo este navegador puede ver la confirmación, durante una hora.
    cookies().set(COOKIE_CITA, resultado.cita.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/agendar",
    });

    // Etapa 3: aquí se enviarán los correos a la clínica y al paciente con
    // resultado.cita. Si el envío falla, la cita ya quedó guardada.
    return { ok: true };
  } catch (error) {
    // Sin datos del paciente en los registros.
    console.error("No se pudo guardar la cita:", error instanceof Error ? error.message : "error desconocido");
    return { ok: false, tipo: "error" };
  }
}
