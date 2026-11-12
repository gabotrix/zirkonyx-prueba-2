import Link from "next/link";
import Icono from "@/components/Icono";
import { clinica } from "@/lib/clinica";
import { servicios } from "@/lib/servicios";

const razones = [
  { icono: "manos", titulo: "Trato cercano", texto: "Te explicamos cada paso de tu tratamiento." },
  { icono: "microscopio", titulo: "Equipos modernos", texto: "Diagnósticos precisos y tratamientos cómodos." },
  { icono: "reloj", titulo: "Horario amplio", texto: "Citas entre semana y los sábados por la mañana." },
] as const;

export default function Inicio() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="tag">{clinica.nombre}</span>
            <h1>Tu sonrisa, en las mejores manos</h1>
            <p>Cuidamos la salud dental de toda tu familia con un equipo cercano y tecnología moderna.</p>
            <div className="row">
              <Link className="btn" href="/agendar">
                Agendar cita
              </Link>
              <Link className="btn btn2" href="#servicios">
                Ver servicios
              </Link>
            </div>
          </div>
          <div className="foto">
            <Icono nombre="sonrisa" tamano={110} color="#fff" />
          </div>
        </div>
      </section>

      <section className="sec" id="servicios">
        <div className="wrap">
          <h2>Nuestros servicios</h2>
          <p className="sub">Tratamientos para cada etapa de tu vida</p>
          <div className="grid">
            {servicios.map((s) => (
              <div className="card" key={s.slug}>
                <div className="ic">
                  <Icono nombre={s.icono} />
                </div>
                <h3>{s.nombre}</h3>
                <p>{s.descripcion}</p>
                <Link className="lnk" href={`/agendar?servicio=${s.slug}`}>
                  Agendar →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt" id="nosotros">
        <div className="wrap">
          <h2>¿Por qué elegirnos?</h2>
          <p className="sub">Te atendemos como nos gustaría que nos atendieran</p>
          <div className="grid">
            {razones.map((r) => (
              <div className="por" key={r.titulo}>
                <div className="ic">
                  <Icono nombre={r.icono} />
                </div>
                <h3>{r.titulo}</h3>
                <p className="st">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>¿Listo para tu cita?</h2>
              <p>Elige el servicio, el día y la hora en menos de un minuto.</p>
            </div>
            <Link className="btn" href="/agendar">
              Agendar ahora
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
