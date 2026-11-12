import type { NombreIcono } from "@/components/Icono";

// Los cinco servicios de la clínica. En la etapa 2 (reservas) la duración
// pasará a la base de datos; el `slug` es el que usa el enlace
// /agendar?servicio=<slug> para abrir la reserva con el servicio ya elegido.
export type Servicio = {
  slug: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  icono: NombreIcono;
};

export const servicios: Servicio[] = [
  {
    slug: "limpieza",
    nombre: "Limpieza dental",
    descripcion: "Eliminamos sarro y manchas para mantener tus dientes y encías sanos.",
    duracion: "45 minutos",
    icono: "brillo",
  },
  {
    slug: "ortodoncia",
    nombre: "Ortodoncia",
    descripcion: "Brackets y alineadores transparentes para una sonrisa alineada.",
    duracion: "Valoración de 30 minutos",
    icono: "sonrisa",
  },
  {
    slug: "blanqueamiento",
    nombre: "Blanqueamiento",
    descripcion: "Dientes varios tonos más blancos, de forma segura y sin dolor.",
    duracion: "60 minutos",
    icono: "sol",
  },
  {
    slug: "implantes",
    nombre: "Implantes",
    descripcion: "Reponemos piezas perdidas con resultados naturales y duraderos.",
    duracion: "Valoración de 30 minutos",
    icono: "escudo",
  },
  {
    slug: "odontopediatria",
    nombre: "Odontopediatría",
    descripcion: "Atención amable y paciente para los más pequeños de la casa.",
    duracion: "40 minutos",
    icono: "bebe",
  },
];

export function buscarServicio(slug: string | undefined): Servicio | undefined {
  return servicios.find((s) => s.slug === slug);
}
