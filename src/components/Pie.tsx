import Link from "next/link";
import { clinica } from "@/lib/clinica";

export default function Pie() {
  return (
    <footer className="ft2" id="contacto">
      <div className="wrap">
        <div className="fcols">
          <div>
            <b>{clinica.nombreCorto}</b>
            <p>{clinica.lema}</p>
          </div>
          <div>
            <b>Horario</b>
            <p>
              {clinica.horario[0]}
              <br />
              {clinica.horario[1]}
            </p>
          </div>
          <div>
            <b>Contacto</b>
            <p>
              {clinica.direccion}
              <br />
              <a href={clinica.telefonoEnlace}>{clinica.telefono}</a>
            </p>
          </div>
        </div>
        <p className="copy">
          © {clinica.nombre} · <Link href="/privacidad">Aviso de privacidad</Link>
        </p>
      </div>
    </footer>
  );
}
