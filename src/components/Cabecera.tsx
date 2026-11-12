import Link from "next/link";
import Icono from "@/components/Icono";
import { clinica } from "@/lib/clinica";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/#servicios", texto: "Servicios" },
  { href: "/#nosotros", texto: "Nosotros" },
  { href: "#contacto", texto: "Contacto" },
];

export default function Cabecera() {
  return (
    <header className="top">
      <div className="wrap nav">
        <Link href="/" className="logo">
          <i>
            <Icono nombre="sonrisa" tamano={22} color="#fff" />
          </i>
          {clinica.nombreCorto}
        </Link>
        <nav className="menu" aria-label="Menú principal">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href}>
              {e.texto}
            </Link>
          ))}
        </nav>
        <div className="nav-acciones">
          <Link className="btn" href="/agendar">
            Agendar cita
          </Link>
          {/* Menú desplegable para celular (el menú normal se oculta bajo 760px) */}
          <details className="menu-movil">
            <summary aria-label="Abrir menú">
              <Icono nombre="menu" tamano={24} color="#1e3a8a" />
            </summary>
            <nav aria-label="Menú principal en celular">
              {enlaces.map((e) => (
                <Link key={e.href} href={e.href}>
                  {e.texto}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
