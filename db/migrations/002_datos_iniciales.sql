-- 002 · Servicios y horario de atención iniciales (los del boceto aprobado)

INSERT INTO servicios (slug, nombre, duracion_min, es_valoracion, orden) VALUES
  ('limpieza',        'Limpieza dental', 45, false, 1),
  ('ortodoncia',      'Ortodoncia',      30, true,  2),
  ('blanqueamiento',  'Blanqueamiento',  60, false, 3),
  ('implantes',       'Implantes',       30, true,  4),
  ('odontopediatria', 'Odontopediatría', 40, false, 5);

-- Lunes a viernes 8:00 – 19:00 y sábados 9:00 – 13:00. Domingo sin atención.
INSERT INTO horario_atencion (dia_semana, hora_inicio, hora_fin) VALUES
  (1, '08:00', '19:00'),
  (2, '08:00', '19:00'),
  (3, '08:00', '19:00'),
  (4, '08:00', '19:00'),
  (5, '08:00', '19:00'),
  (6, '09:00', '13:00');
