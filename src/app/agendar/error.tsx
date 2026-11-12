"use client";

import Link from "next/link";
import { clinica } from "@/lib/clinica";

// Si la agenda no responde (por ejemplo, la base de datos no está disponible),
// el paciente ve un aviso con el teléfono en vez de una pantalla en blanco.
export default function ErrorReserva() {
  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box ctr">
          <h1 className="t">No pudimos cargar la agenda</h1>
          <p className="st">Intenta de nuevo en un momento o llámanos y con gusto te damos una cita.</p>
          <p className="st">
            {clinica.horario[0]} · {clinica.horario[1]}
          </p>
          <div className="row" style={{ justifyContent: "center" }}>
            <a className="btn" href={clinica.telefonoEnlace}>
              Llamar al {clinica.telefono}
            </a>
            <a className="btn btn2" href="/agendar">
              Intentar de nuevo
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
