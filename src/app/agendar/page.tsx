import type { Metadata } from "next";
import Link from "next/link";
import Icono from "@/components/Icono";
import { clinica } from "@/lib/clinica";
import { buscarServicio } from "@/lib/servicios";

export const metadata: Metadata = {
  title: "Agendar cita · Clínica Dental Sonrisa Viva",
};

// Etapa 1: aviso provisional. En la etapa 2 esta ruta será el paso 1
// de la reserva («Servicio») y usará ?servicio=<slug> para dejarlo elegido.
export default function Agendar({
  searchParams,
}: {
  searchParams: { servicio?: string | string[] };
}) {
  const slug = Array.isArray(searchParams.servicio) ? searchParams.servicio[0] : searchParams.servicio;
  const servicio = buscarServicio(slug);

  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box ctr">
          <div className="okc">
            <Icono nombre="calendario" tamano={40} />
          </div>
          <h1 className="t">Muy pronto podrás agendar en línea</h1>
          <p className="st">
            {servicio
              ? `Mientras tanto, llámanos para agendar tu cita de ${servicio.nombre.toLowerCase()}.`
              : "Mientras tanto, llámanos y con gusto te damos una cita."}
          </p>
          <p className="st">
            {clinica.horario[0]} · {clinica.horario[1]}
          </p>
          <div className="row" style={{ justifyContent: "center" }}>
            <a className="btn" href={clinica.telefonoEnlace}>
              Llamar al {clinica.telefono}
            </a>
            <Link className="btn btn2" href="/">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
