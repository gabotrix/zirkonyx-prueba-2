import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { enTransaccion } from "@/lib/db";
import { ahoraEnClinica, aMinutos, deMinutos, diaSemana, sumarDias } from "@/lib/fechas";

// Disponibilidad y creación de citas. Solo se usa en el servidor.

/** Cada cuántos minutos empieza un turno (8:00, 8:30, 9:00…). */
export const INTERVALO_MIN = 30;
/** Cuántos días hacia adelante, contando hoy, se pueden reservar. */
export const DIAS_RESERVA = 14;
/** Anticipación mínima para reservar una hora del mismo día. */
export const ANTICIPACION_MIN = 60;

export type ServicioReserva = {
  id: number;
  slug: string;
  nombre: string;
  duracionMin: number;
  esValoracion: boolean;
};

export type Turno = { hora: string; libre: boolean };

const COLUMNAS_SERVICIO = `id, slug, nombre, duracion_min AS "duracionMin", es_valoracion AS "esValoracion"`;

/** "45 minutos" o "Valoración de 30 minutos" */
export function textoDuracion(s: ServicioReserva): string {
  return s.esValoracion ? `Valoración de ${s.duracionMin} minutos` : `${s.duracionMin} minutos`;
}

export async function serviciosActivos(c: PoolClient): Promise<ServicioReserva[]> {
  const { rows } = await c.query<ServicioReserva>(
    `SELECT ${COLUMNAS_SERVICIO} FROM servicios WHERE activo ORDER BY orden, id`,
  );
  return rows;
}

export async function buscarServicioActivo(c: PoolClient, slug: string): Promise<ServicioReserva | undefined> {
  const { rows } = await c.query<ServicioReserva>(
    `SELECT ${COLUMNAS_SERVICIO} FROM servicios WHERE activo AND slug = $1`,
    [slug],
  );
  return rows[0];
}

/**
 * Días que se ofrecen: desde hoy y durante DIAS_RESERVA días, solo los que
 * tienen horario de atención (no domingos) y no están bloqueados.
 */
export async function diasReservables(c: PoolClient): Promise<string[]> {
  const { fecha: hoy } = ahoraEnClinica();
  const ultimo = sumarDias(hoy, DIAS_RESERVA - 1);

  const horario = await c.query<{ dia_semana: number }>("SELECT DISTINCT dia_semana FROM horario_atencion");
  const bloqueos = await c.query<{ inicio: string; fin: string }>(
    `SELECT to_char(fecha_inicio, 'YYYY-MM-DD') AS inicio, to_char(fecha_fin, 'YYYY-MM-DD') AS fin
       FROM bloqueos
      WHERE fecha_fin >= $1::date AND fecha_inicio <= $2::date`,
    [hoy, ultimo],
  );

  const diasConHorario = new Set(horario.rows.map((r) => r.dia_semana));
  const dias: string[] = [];
  for (let i = 0; i < DIAS_RESERVA; i++) {
    const fecha = sumarDias(hoy, i);
    if (!diasConHorario.has(diaSemana(fecha))) continue;
    if (bloqueos.rows.some((b) => fecha >= b.inicio && fecha <= b.fin)) continue;
    dias.push(fecha);
  }
  return dias;
}

/**
 * Turnos de un día para un servicio, según el horario de atención, los
 * bloqueos, las citas ya hechas y la duración del servicio. Los que se cruzan
 * con otra cita salen con libre = false (se muestran tachados).
 */
export async function turnosDelDia(c: PoolClient, servicio: ServicioReserva, fecha: string): Promise<Turno[]> {
  if (!(await diasReservables(c)).includes(fecha)) return [];

  const horario = await c.query<{ inicio: string; fin: string }>(
    `SELECT to_char(hora_inicio, 'HH24:MI') AS inicio, to_char(hora_fin, 'HH24:MI') AS fin
       FROM horario_atencion
      WHERE dia_semana = $1
      ORDER BY hora_inicio`,
    [diaSemana(fecha)],
  );
  const citas = await c.query<{ inicio: string; fin: string }>(
    `SELECT to_char(hora_inicio, 'HH24:MI') AS inicio, to_char(hora_fin, 'HH24:MI') AS fin
       FROM citas
      WHERE fecha = $1::date AND estado = 'confirmada'`,
    [fecha],
  );

  const { fecha: hoy, minutos: ahora } = ahoraEnClinica();
  const ocupadas = citas.rows.map((r) => [aMinutos(r.inicio), aMinutos(r.fin)] as const);
  const turnos: Turno[] = [];

  for (const franja of horario.rows) {
    const finFranja = aMinutos(franja.fin);
    for (let t = aMinutos(franja.inicio); t + servicio.duracionMin <= finFranja; t += INTERVALO_MIN) {
      if (fecha === hoy && t < ahora + ANTICIPACION_MIN) continue;
      const fin = t + servicio.duracionMin;
      const libre = !ocupadas.some(([inicio, final]) => t < final && inicio < fin);
      turnos.push({ hora: deMinutos(t), libre });
    }
  }
  return turnos;
}

export type DatosCita = {
  servicio: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  correo: string;
  comentarios: string;
};

export type CitaCreada = Omit<DatosCita, "servicio"> & {
  token: string;
  servicio: ServicioReserva;
  horaFin: string;
};

export type ResultadoReserva = { ok: true; cita: CitaCreada } | { ok: false; motivo: "ocupada" | "servicio" };

/**
 * Guarda la cita dentro de una transacción que vuelve a comprobar que la hora
 * sigue libre. Si dos pacientes confirman la misma hora a la vez, la
 * restricción citas_sin_choques de la base deja pasar solo a uno.
 */
export async function crearCita(datos: DatosCita): Promise<ResultadoReserva> {
  try {
    return await enTransaccion<ResultadoReserva>(async (c) => {
      const servicio = await buscarServicioActivo(c, datos.servicio);
      if (!servicio) return { ok: false, motivo: "servicio" };

      const turnos = await turnosDelDia(c, servicio, datos.fecha);
      if (!turnos.some((t) => t.hora === datos.hora && t.libre)) return { ok: false, motivo: "ocupada" };

      const token = randomUUID();
      const horaFin = deMinutos(aMinutos(datos.hora) + servicio.duracionMin);
      await c.query(
        `INSERT INTO citas (token, servicio_id, fecha, hora_inicio, hora_fin, nombre, telefono, correo, comentarios)
         VALUES ($1, $2, $3::date, $4::time, $5::time, $6, $7, $8, $9)`,
        [token, servicio.id, datos.fecha, datos.hora, horaFin, datos.nombre, datos.telefono, datos.correo, datos.comentarios],
      );

      const { servicio: _slug, ...resto } = datos;
      return { ok: true, cita: { ...resto, token, servicio, horaFin } };
    });
  } catch (error) {
    // 23P01: otra cita confirmada se cruza con esta (la tomaron justo antes).
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "23P01") {
      return { ok: false, motivo: "ocupada" };
    }
    throw error;
  }
}

export type CitaConfirmada = { nombre: string; servicio: string; fecha: string; horaInicio: string };

/** Lo justo para mostrar la confirmación al paciente que acaba de reservar. */
export async function citaPorToken(c: PoolClient, token: string): Promise<CitaConfirmada | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return null;
  const { rows } = await c.query<CitaConfirmada>(
    `SELECT c.nombre, s.nombre AS servicio,
            to_char(c.fecha, 'YYYY-MM-DD') AS fecha, to_char(c.hora_inicio, 'HH24:MI') AS "horaInicio"
       FROM citas c
       JOIN servicios s ON s.id = c.servicio_id
      WHERE c.token = $1 AND c.estado = 'confirmada'`,
    [token],
  );
  return rows[0] ?? null;
}
