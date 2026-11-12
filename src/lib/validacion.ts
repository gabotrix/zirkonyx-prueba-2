// Validación de los datos del paciente (paso 3). Se usa en el servidor,
// aunque el formulario también avisa en el navegador.

export type CamposPaciente = { nombre: string; telefono: string; correo: string; comentarios: string };
export type ErroresCampos = Partial<Record<keyof CamposPaciente | "privacidad", string>>;

function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export function validarDatosPaciente(
  formData: FormData,
): { ok: true; datos: CamposPaciente } | { ok: false; errores: ErroresCampos } {
  const nombre = texto(formData, "nombre").replace(/\s+/g, " ");
  const telefono = texto(formData, "telefono");
  const correo = texto(formData, "correo").toLowerCase();
  const comentarios = texto(formData, "comentarios");
  const errores: ErroresCampos = {};

  if (nombre.length < 3) errores.nombre = "Escribe tu nombre completo.";
  else if (nombre.length > 100) errores.nombre = "El nombre es demasiado largo.";

  const digitos = telefono.replace(/\D/g, "");
  if (!/^[\d\s+()-]+$/.test(telefono) || digitos.length < 7 || digitos.length > 15) {
    errores.telefono = "Escribe un teléfono válido, solo con números.";
  }

  if (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
  }

  if (comentarios.length > 500) errores.comentarios = "Máximo 500 caracteres.";

  if (formData.get("privacidad") !== "si") errores.privacidad = "Debes aceptar el aviso de privacidad para continuar.";

  if (Object.keys(errores).length > 0) return { ok: false, errores };
  return { ok: true, datos: { nombre, telefono, correo, comentarios } };
}
