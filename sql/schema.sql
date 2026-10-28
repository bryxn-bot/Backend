CREATE DATABASE Citas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Citas;

CREATE TABLE especialidades (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(60)  NOT NULL,
  nombre      VARCHAR(80)  NOT NULL,
  descripcion VARCHAR(160) NOT NULL,
  icono       VARCHAR(40)  NULL,
  destacada   TINYINT(1)   NOT NULL DEFAULT 0,
  activo      TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_especialidad_slug (slug)
);

CREATE TABLE consultorios (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(80)  NOT NULL,
  direccion VARCHAR(160) NOT NULL
);

CREATE TABLE profesionales (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(60) NOT NULL,
  titulo          VARCHAR(10) NOT NULL DEFAULT 'Dr.',
  nombre          VARCHAR(60) NOT NULL,
  apellidos       VARCHAR(80) NOT NULL,
  especialidad_id INT UNSIGNED NOT NULL,
  consultorio_id  INT UNSIGNED NOT NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_profesional_slug (slug),
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id),
  FOREIGN KEY (consultorio_id)  REFERENCES consultorios(id)
);

-- dia_semana: 1 = lunes ... 7 = domingo
CREATE TABLE horarios_profesional (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profesional_id INT UNSIGNED NOT NULL,
  dia_semana     TINYINT UNSIGNED NOT NULL,
  hora_inicio    TIME NOT NULL,
  hora_fin       TIME NOT NULL,
  duracion_min   SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id)
);

CREATE TABLE pacientes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(60)  NOT NULL,
  apellidos        VARCHAR(80)  NOT NULL,
  documento        VARCHAR(20)  NOT NULL,
  fecha_nacimiento DATE         NOT NULL,
  telefono         VARCHAR(25)  NOT NULL,
  correo           VARCHAR(120) NOT NULL,
  UNIQUE KEY uq_paciente_documento (documento)
);

CREATE TABLE citas (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  localizador     VARCHAR(12) NOT NULL UNIQUE,
  paciente_id     INT UNSIGNED NOT NULL,
  profesional_id  INT UNSIGNED NOT NULL,
  especialidad_id INT UNSIGNED NOT NULL,
  tipo_consulta   ENUM('primera','seguimiento') NOT NULL,
  fecha           DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL,
  estado          ENUM('confirmada','cancelada','completada') NOT NULL DEFAULT 'confirmada',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- NULL si está cancelada: evita la doble reserva y libera el horario al cancelar
  slot_activo     TINYINT GENERATED ALWAYS AS (IF(estado = 'cancelada', NULL, 1)) STORED,
  UNIQUE KEY uq_cita_slot (profesional_id, fecha, hora_inicio, slot_activo),
  FOREIGN KEY (paciente_id)     REFERENCES pacientes(id),
  FOREIGN KEY (profesional_id)  REFERENCES profesionales(id),
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);