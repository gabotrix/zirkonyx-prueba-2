-- 001 · Reservas de citas (etapa 2)
-- Las fechas y horas se guardan en la hora local de la clínica
-- (America/Bogota), sin zona horaria. Las citas son para la clínica en
-- general: no hay odontólogo asignado y se atiende un paciente por turno.

CREATE TABLE servicios (
  id            serial PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  nombre        text NOT NULL,
  duracion_min  integer NOT NULL CHECK (duracion_min > 0 AND duracion_min <= 480),
  es_valoracion boolean NOT NULL DEFAULT false,
  activo        boolean NOT NULL DEFAULT true,
  orden         integer NOT NULL DEFAULT 0
);

-- Un día puede tener varias franjas (por ejemplo, mañana y tarde).
CREATE TABLE horario_atencion (
  id          serial PRIMARY KEY,
  dia_semana  smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0 = domingo
  hora_inicio time NOT NULL,
  hora_fin    time NOT NULL,
  CHECK (hora_fin > hora_inicio)
);

-- Días sin atención: festivos, vacaciones (un día o un rango, ambos incluidos).
CREATE TABLE bloqueos (
  id           serial PRIMARY KEY,
  fecha_inicio date NOT NULL,
  fecha_fin    date NOT NULL,
  motivo       text NOT NULL DEFAULT '',
  creado_en    timestamptz NOT NULL DEFAULT now(),
  CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE citas (
  id          serial PRIMARY KEY,
  token       uuid NOT NULL UNIQUE, -- identificador no adivinable para la confirmación
  servicio_id integer NOT NULL REFERENCES servicios (id),
  fecha       date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin    time NOT NULL,
  nombre      text NOT NULL,
  telefono    text NOT NULL,
  correo      text NOT NULL,
  comentarios text NOT NULL DEFAULT '',
  estado      text NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada')),
  creada_en   timestamptz NOT NULL DEFAULT now(),
  CHECK (hora_fin > hora_inicio),
  -- Dos citas confirmadas nunca se cruzan, aunque se reserven a la vez.
  -- Una cita cancelada deja de contar y libera su hora.
  CONSTRAINT citas_sin_choques EXCLUDE USING gist (
    tsrange(fecha + hora_inicio, fecha + hora_fin) WITH &&
  ) WHERE (estado = 'confirmada')
);

CREATE INDEX citas_fecha_idx ON citas (fecha) WHERE estado = 'confirmada';
CREATE INDEX bloqueos_fechas_idx ON bloqueos (fecha_inicio, fecha_fin);
