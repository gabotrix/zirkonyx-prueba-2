import type { Metadata } from "next";
import Link from "next/link";
import { clinica } from "@/lib/clinica";

export const metadata: Metadata = {
  title: "Aviso de privacidad · Clínica Dental Sonrisa Viva",
};

// PENDIENTE: el texto legal definitivo y el nombre del responsable del
// tratamiento de datos los debe entregar la clínica. Aquí solo va la
// estructura y la información de contacto que ya existe en la página.
export default function Privacidad() {
  return (
    <main className="sec alt">
      <div className="wrap">
        <div className="box texto">
          <h1 className="t">Aviso de privacidad</h1>
          <p className="st">Tratamiento de datos personales y de salud en {clinica.nombre}.</p>

          <p className="aviso-pendiente">
            Estamos terminando el texto completo de este aviso. Si tienes preguntas sobre tus datos, escríbenos o
            llámanos y te atenderemos.
          </p>

          <h2>Responsable del tratamiento</h2>
          <p>{clinica.nombre}</p>

          <h2>Contacto</h2>
          <p>
            {clinica.direccion}
            <br />
            <a href={clinica.telefonoEnlace}>{clinica.telefono}</a>
          </p>

          <p style={{ marginTop: 28 }}>
            <Link className="lnk" href="/">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
