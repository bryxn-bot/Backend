USE Citas;

INSERT IGNORE INTO consultorios (id, nombre, direccion) VALUES
  (1, 'Edificio A · Planta baja', 'Av. del Olivo, 24 · Ciudad de ejemplo');

INSERT IGNORE INTO especialidades (id, slug, nombre, descripcion, icono, destacada) VALUES
  (1, 'medicina-general', 'Medicina general', 'Atención y orientación integral', 'estetoscopio',  1),
  (2, 'pediatria',        'Pediatría',        'Cuidado en cada etapa infantil',  'bebe',          1),
  (3, 'ginecologia',      'Ginecología',      'Salud y cuidado de la mujer',     'flor',          1),
  (4, 'cardiologia',      'Cardiología',      'Atención para tu corazón',        'corazon-pulso', 1),
  (5, 'traumatologia',    'Traumatología',    'Huesos y articulaciones',         'hueso',         1),
  (6, 'dermatologia',     'Dermatología',     'Cuidado de tu piel',              'mano',          1),
  (7, 'oftalmologia',     'Oftalmología',     'Salud de tus ojos',               'ojo',           0),
  (8, 'neurologia',       'Neurología',       'Cerebro y sistema nervioso',      'cerebro',       0),
  (9, 'urologia',         'Urología',         'Salud del aparato urinario',      'gota',          0);

INSERT IGNORE INTO profesionales (id, slug, titulo, nombre, apellidos, especialidad_id, consultorio_id) VALUES
  (1,  'elena-martin',    'Dra.', 'Elena',   'Martín',   1, 1),
  (2,  'pablo-ruiz',      'Dr.',  'Pablo',   'Ruiz',     1, 1),
  (3,  'lucia-herrera',   'Dra.', 'Lucía',   'Herrera',  2, 1),
  (4,  'andres-salas',    'Dr.',  'Andrés',  'Salas',    2, 1),
  (5,  'carmen-vidal',    'Dra.', 'Carmen',  'Vidal',    3, 1),
  (6,  'marta-ortega',    'Dra.', 'Marta',   'Ortega',   3, 1),
  (7,  'javier-roldan',   'Dr.',  'Javier',  'Roldán',   4, 1),
  (8,  'sofia-navarro',   'Dra.', 'Sofía',   'Navarro',  4, 1),
  (9,  'diego-castillo',  'Dr.',  'Diego',   'Castillo', 5, 1),
  (10, 'laura-prieto',    'Dra.', 'Laura',   'Prieto',   5, 1),
  (11, 'irene-campos',    'Dra.', 'Irene',   'Campos',   6, 1),
  (12, 'hugo-beltran',    'Dr.',  'Hugo',    'Beltrán',  6, 1),
  (13, 'natalia-rivas',   'Dra.', 'Natalia', 'Rivas',    7, 1),
  (14, 'marcos-pena',     'Dr.',  'Marcos',  'Peña',     7, 1),
  (15, 'alvaro-quintana', 'Dr.',  'Álvaro',  'Quintana', 8, 1),
  (16, 'paula-serrano',   'Dra.', 'Paula',   'Serrano',  8, 1),
  (17, 'raul-medina',     'Dr.',  'Raúl',    'Medina',   9, 1),
  (18, 'tomas-aguirre',   'Dr.',  'Tomás',   'Aguirre',  9, 1);

-- Horarios: lunes a viernes, 09:00 a 12:00, citas de 30 min (se rehacen en cada ejecución)
DELETE FROM horarios_profesional;
INSERT INTO horarios_profesional (profesional_id, dia_semana, hora_inicio, hora_fin, duracion_min)
SELECT p.id, d.dia, '09:00:00', '12:00:00', 30
FROM profesionales p
CROSS JOIN (SELECT 1 AS dia UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) d;