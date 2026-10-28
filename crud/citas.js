const crypto = require('node:crypto');
const { Op } = require('sequelize');
const { sequelize, Cita, Paciente, Profesional, Especialidad, Consultorio, HorarioProfesional } = require('../models');
const pacientes = require('./pacientes');
const { ErrorCrud } = require('./errores');

const ZONA = 'America/Lima'; // define qué es "hoy" y "ahora" para validar horarios
const PREFIJO = 'SS';        // los localizadores quedan como SS-7K3M9Q

const incluir = [
  { model: Paciente, as: 'paciente' },
  { model: Especialidad, as: 'especialidad', attributes: ['id', 'slug', 'nombre'] },
  {
    model: Profesional,
    as: 'profesional',
    include: [{ model: Consultorio, as: 'consultorio', attributes: ['id', 'nombre', 'direccion'] }],
  },
];

// ---------- utilidades ----------
function ahoraEnZona() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const g = (tipo) => partes.find((p) => p.type === tipo).value;
  return { fecha: `${g('year')}-${g('month')}-${g('day')}`, hora: `${g('hour')}:${g('minute')}` };
}
const aMin = (h) => { const [a, b] = h.split(':'); return Number(a) * 60 + Number(b); };
const aHora = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const diaSemana = (fecha) => { const d = new Date(`${fecha}T00:00:00Z`).getUTCDay(); return d === 0 ? 7 : d; }; // 1 = lunes

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para poder dictarlo
const generarLocalizador = () =>
  `${PREFIJO}-` + Array.from({ length: 6 }, () => ALFABETO[crypto.randomInt(ALFABETO.length)]).join('');

const esDuplicado = (e, clave) =>
  e.name === 'SequelizeUniqueConstraintError' && String(e.parent?.sqlMessage || e.message).includes(clave);

const esFutura = (cita) => {
  const ahora = ahoraEnZona();
  return cita.fecha > ahora.fecha || (cita.fecha === ahora.fecha && cita.hora_inicio.slice(0, 5) > ahora.hora);
};

// ---------- disponibilidad ----------
// Horas de un profesional en una fecha: [{ hora: '09:00', hora_fin: '09:30', disponible: true }, ...]
async function horasDelDia(profesionalId, fecha) {
  const [horarios, ocupadas] = await Promise.all([
    HorarioProfesional.findAll({ where: { profesional_id: profesionalId, dia_semana: diaSemana(fecha) } }),
    Cita.findAll({
      where: { profesional_id: profesionalId, fecha, estado: { [Op.ne]: 'cancelada' } },
      attributes: ['hora_inicio'],
    }),
  ]);
  const ocupado = new Set(ocupadas.map((c) => c.hora_inicio.slice(0, 5)));
  const ahora = ahoraEnZona();
  const horas = [];

  for (const h of horarios) {
    for (let m = aMin(h.hora_inicio); m + h.duracion_min <= aMin(h.hora_fin); m += h.duracion_min) {
      const hora = aHora(m);
      const pasada = fecha < ahora.fecha || (fecha === ahora.fecha && hora <= ahora.hora);
      horas.push({ hora, hora_fin: aHora(m + h.duracion_min), disponible: !pasada && !ocupado.has(hora) });
    }
  }
  return horas.sort((a, b) => a.hora.localeCompare(b.hora));
}

// Para el selector de semana: [{ fecha, libres: 3, disponible: true }, ...]
const estadoDeDias = (profesionalId, fechas) =>
  Promise.all(
    fechas.map(async (fecha) => {
      const libres = (await horasDelDia(profesionalId, fecha)).filter((h) => h.disponible).length;
      return { fecha, libres, disponible: libres > 0 };
    }),
  );

// ---------- CRUD de citas ----------
// Read: lista con filtros opcionales
const listar = ({ fecha, profesionalId, estado } = {}) =>
  Cita.findAll({
    where: {
      ...(fecha && { fecha }),
      ...(profesionalId && { profesional_id: profesionalId }),
      ...(estado && { estado }),
    },
    include: incluir,
    order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']],
  });

// Read: una cita. Con `correo` solo la devuelve si coincide con el del paciente (para "Mis citas")
async function obtenerPorLocalizador(localizador, correo) {
  const cita = await Cita.findOne({ where: { localizador: String(localizador).toUpperCase() }, include: incluir });
  if (!cita) return null;
  if (correo && cita.paciente.correo.toLowerCase() !== String(correo).toLowerCase()) return null;
  return cita;
}

// Create: datos = { especialidad_id, profesional_id, tipo_consulta, fecha, hora, paciente: {...} }
async function crear(datos) {
  const { especialidad_id, profesional_id, tipo_consulta, fecha, hora, paciente } = datos;

  const profesional = await Profesional.findOne({ where: { id: profesional_id, activo: true } });
  if (!profesional) throw new ErrorCrud('PROFESIONAL_NO_ENCONTRADO', 'El profesional no existe');
  if (profesional.especialidad_id !== Number(especialidad_id)) {
    throw new ErrorCrud('ESPECIALIDAD_NO_COINCIDE', 'El profesional no atiende esa especialidad');
  }
  if (fecha < ahoraEnZona().fecha) throw new ErrorCrud('FECHA_PASADA', 'No puedes reservar en una fecha pasada');

  const slot = (await horasDelDia(profesional_id, fecha)).find((h) => h.hora === hora && h.disponible);
  if (!slot) throw new ErrorCrud('HORARIO_NO_DISPONIBLE', 'Ese horario ya no está disponible');

  try {
    const id = await sequelize.transaction(async (t) => {
      const pac = await pacientes.crearOActualizar(paciente, t);

      const choque = await Cita.findOne({
        where: { paciente_id: pac.id, fecha, hora_inicio: hora, estado: { [Op.ne]: 'cancelada' } },
        transaction: t,
      });
      if (choque) throw new ErrorCrud('CITA_DUPLICADA', 'El paciente ya tiene una cita a esa fecha y hora');

      for (let intento = 0; intento < 5; intento++) {
        try {
          const cita = await Cita.create(
            {
              localizador: generarLocalizador(),
              paciente_id: pac.id,
              profesional_id,
              especialidad_id,
              tipo_consulta,
              fecha,
              hora_inicio: hora,
              hora_fin: slot.hora_fin,
            },
            { transaction: t },
          );
          return cita.id;
        } catch (e) {
          if (!esDuplicado(e, 'localizador')) throw e; // localizador repetido: prueba otro
        }
      }
      throw new Error('No se pudo generar un localizador único');
    });
    return Cita.findByPk(id, { include: incluir });
  } catch (e) {
    // Dos personas reservaron el mismo hueco a la vez: la base de datos deja pasar solo a una
    if (esDuplicado(e, 'uq_cita_slot')) throw new ErrorCrud('HORARIO_NO_DISPONIBLE', 'Ese horario ya no está disponible');
    throw e;
  }
}

// Update: cambiar fecha u hora (mismo profesional)
async function reprogramar(localizador, correo, { fecha, hora }) {
  const cita = await obtenerPorLocalizador(localizador, correo);
  if (!cita) return null;
  if (cita.estado !== 'confirmada' || !esFutura(cita)) {
    throw new ErrorCrud('CITA_NO_MODIFICABLE', 'Esta cita ya no se puede modificar');
  }
  if (fecha < ahoraEnZona().fecha) throw new ErrorCrud('FECHA_PASADA', 'No puedes elegir una fecha pasada');

  const slot = (await horasDelDia(cita.profesional_id, fecha)).find((h) => h.hora === hora && h.disponible);
  if (!slot) throw new ErrorCrud('HORARIO_NO_DISPONIBLE', 'Ese horario ya no está disponible');

  try {
    await cita.update({ fecha, hora_inicio: hora, hora_fin: slot.hora_fin });
  } catch (e) {
    if (esDuplicado(e, 'uq_cita_slot')) throw new ErrorCrud('HORARIO_NO_DISPONIBLE', 'Ese horario ya no está disponible');
    throw e;
  }
  return obtenerPorLocalizador(localizador, correo);
}

// Delete: una cita no se borra, se cancela (así queda el historial y el horario se libera solo)
async function cancelar(localizador, correo) {
  const cita = await obtenerPorLocalizador(localizador, correo);
  if (!cita) return null;
  if (cita.estado !== 'confirmada' || !esFutura(cita)) {
    throw new ErrorCrud('CITA_NO_MODIFICABLE', 'Esta cita ya no se puede cancelar');
  }
  await cita.update({ estado: 'cancelada' });
  return cita;
}

module.exports = { horasDelDia, estadoDeDias, listar, obtenerPorLocalizador, crear, reprogramar, cancelar };