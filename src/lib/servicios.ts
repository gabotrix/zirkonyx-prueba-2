import type { NombreIcono } from "@/components/Icono";

// Textos e íconos de los cinco servicios para la página de inicio. La duración
// y si se pueden reservar están en la base de datos (tabla servicios); el
// `slug` es el mismo en los dos lados y es el que usa el enlace
// /agendar?servicio=<slug> para abrir la reserva con el servicio ya elegido.
export type Servicio = {
  slug: string;
  nombre: string;
  descripcion: string;
  icono: NombreIcono;
};

export const servicios: Servicio[] = [
  {
    slug: "limpieza",
    nombre: "Limpieza dental",
    descripcion: "Eliminamos sarro y manchas para mantener tus dientes y encías sanos.",
    icono: "brillo",
  },
  {
    slug: "ortodoncia",
    nombre: "Ortodoncia",
    descripcion: "Brackets y alineadores transparentes para una sonrisa alineada.",
    icono: "sonrisa",
  },
  {
    slug: "blanqueamiento",
    nombre: "Blanqueamiento",
    descripcion: "Dientes varios tonos más blancos, de forma segura y sin dolor.",
    icono: "sol",
  },
  {
    slug: "implantes",
    nombre: "Implantes",
    descripcion: "Reponemos piezas perdidas con resultados naturales y duraderos.",
    icono: "escudo",
  },
  {
    slug: "odontopediatria",
    nombre: "Odontopediatría",
    descripcion: "Atención amable y paciente para los más pequeños de la casa.",
    icono: "bebe",
  },
];

export function buscarServicio(slug: string | undefined): Servicio | undefined {
  return servicios.find((s) => s.slug === slug);
}
