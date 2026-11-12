"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { reservarCita, type RespuestaReserva } from "@/app/agendar/acciones";
import { clinica } from "@/lib/clinica";
import { urlReserva } from "@/lib/rutasReserva";
import type { ErroresCampos } from "@/lib/validacion";

type Props = { servicio: string; fecha: string; hora: string; atras: string };

export default function FormularioDatos({ servicio, fecha, hora, atras }: Props) {
  const router = useRouter();
  const [errores, setErrores] = useState<ErroresCampos>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const formData = new FormData(evento.currentTarget);
    setEnviando(true);
    setMensaje("");
    setErrores({});

    let respuesta: RespuestaReserva;
    try {
      respuesta = await reservarCita(formData);
    } catch {
      respuesta = { ok: false, tipo: "error" };
    }

    if (respuesta.ok) {
      router.push("/agendar/confirmacion");
      return;
    }
    if (respuesta.tipo === "ocupada") {
      router.push(urlReserva("dia-hora", { servicio, fecha, ocupada: true }));
      return;
    }
    if (respuesta.tipo === "servicio") {
      router.push("/agendar");
      return;
    }
    if (respuesta.tipo === "datos") setErrores(respuesta.errores);
    else setMensaje(`No pudimos guardar tu cita. Intenta de nuevo o llámanos al ${clinica.telefono}.`);
    setEnviando(false);
  }

  const error = (campo: keyof ErroresCampos) =>
    errores[campo] ? (
      <p className="error-campo" id={`error-${campo}`}>
        {errores[campo]}
      </p>
    ) : null;
  const invalido = (campo: keyof ErroresCampos) =>
    errores[campo] ? { "aria-invalid": true, "aria-describedby": `error-${campo}` } : {};

  return (
    <form onSubmit={enviar}>
      <input type="hidden" name="servicio" value={servicio} />
      <input type="hidden" name="fecha" value={fecha} />
      <input type="hidden" name="hora" value={hora} />

      {mensaje && (
        <p className="alerta" role="alert">
          {mensaje}
        </p>
      )}

      <div className="campos">
        <div className="campo">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            className="inp"
            id="nombre"
            name="nombre"
            autoComplete="name"
            required
            minLength={3}
            maxLength={100}
            placeholder="María González"
            {...invalido("nombre")}
          />
          {error("nombre")}
        </div>
        <div className="campo">
          <label htmlFor="telefono">Teléfono</label>
          <input
            className="inp"
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            required
            maxLength={20}
            placeholder="300 123 4567"
            {...invalido("telefono")}
          />
          {error("telefono")}
        </div>
        <div className="campo full">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            className="inp"
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="maria@correo.com"
            {...invalido("correo")}
          />
          {error("correo")}
        </div>
        <div className="campo full">
          <label htmlFor="comentarios">Comentarios (opcional)</label>
          <textarea
            className="inp"
            id="comentarios"
            name="comentarios"
            maxLength={500}
            placeholder="Cuéntanos si tienes alguna molestia…"
            {...invalido("comentarios")}
          />
          {error("comentarios")}
        </div>
        <div className="campo full">
          <label className="casilla">
            <input type="checkbox" name="privacidad" value="si" required {...invalido("privacidad")} />
            <span>
              He leído y acepto el{" "}
              <Link className="lnk" href="/privacidad" target="_blank">
                aviso de privacidad
              </Link>
              .
            </span>
          </label>
          {error("privacidad")}
        </div>
      </div>

      <div className="acc">
        <Link className="btn btn2" href={atras}>
          Atrás
        </Link>
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? "Confirmando…" : "Confirmar cita"}
        </button>
      </div>
    </form>
  );
}
