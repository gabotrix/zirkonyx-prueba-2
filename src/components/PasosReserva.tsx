const pasos = ["Servicio", "Día y hora", "Tus datos", "Confirmación"];

// Barra de los 4 pasos: el actual en azul y los terminados con ✓.
export default function PasosReserva({ actual }: { actual: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="pasos" aria-label="Pasos de la reserva">
      {pasos.map((nombre, i) => {
        const numero = i + 1;
        const clase = numero < actual ? "paso ok" : numero === actual ? "paso on" : "paso";
        return (
          <li key={nombre} className={clase} aria-current={numero === actual ? "step" : undefined}>
            {numero < actual ? `✓ ${nombre}` : `${numero}. ${nombre}`}
          </li>
        );
      })}
    </ol>
  );
}
