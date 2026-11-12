import { clinica } from "@/lib/clinica";

// Fechas y horas en la zona horaria de la clínica. Las fechas van como
// "AAAA-MM-DD" y las horas como "HH:MM" (24 h), igual que en la base de datos.

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Fecha de hoy y minutos desde la medianoche, en la hora de la clínica. */
export function ahoraEnClinica(): { fecha: string; minutos: number } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: clinica.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "00";
  return {
    fecha: `${valor("year")}-${valor("month")}-${valor("day")}`,
    minutos: Number(valor("hour")) * 60 + Number(valor("minute")),
  };
}

function aFechaUTC(fecha: string): Date {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

export function esFechaValida(fecha: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && aFechaUTC(fecha).toISOString().slice(0, 10) === fecha;
}

export function esHoraValida(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

export function sumarDias(fecha: string, dias: number): string {
  const f = aFechaUTC(fecha);
  f.setUTCDate(f.getUTCDate() + dias);
  return f.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado. */
export function diaSemana(fecha: string): number {
  return aFechaUTC(fecha).getUTCDay();
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function deMinutos(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** "08:30" → "8:30" */
export function horaCorta(hora: string): string {
  return hora.replace(/^0(?=\d)/, "");
}

/** "Mar" */
export function diaCorto(fecha: string): string {
  return DIAS_CORTOS[diaSemana(fecha)];
}

/** 10 */
export function numeroDia(fecha: string): number {
  return aFechaUTC(fecha).getUTCDate();
}

/** "Junio" */
export function nombreMes(fecha: string): string {
  return mayuscula(MESES[aFechaUTC(fecha).getUTCMonth()]);
}

/** "martes 10" */
export function diaYNumero(fecha: string): string {
  return `${DIAS[diaSemana(fecha)]} ${numeroDia(fecha)}`;
}

/** "Martes 10 de junio" */
export function fechaLarga(fecha: string): string {
  return `${mayuscula(diaYNumero(fecha))} de ${MESES[aFechaUTC(fecha).getUTCMonth()]}`;
}
