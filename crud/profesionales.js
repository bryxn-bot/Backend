const { Profesional, Especialidad, Consultorio } = require('../models');

const CAMPOS = ['slug', 'titulo', 'nombre', 'apellidos', 'especialidad_id', 'consultorio_id', 'activo'];

// Cada profesional llega con su especialidad y su consultorio
const incluir = [
  { model: Especialidad, as: 'especialidad', attributes: ['id', 'slug', 'nombre'] },
  { model: Consultorio, as: 'consultorio', attributes: ['id', 'nombre', 'direccion'] },
];

const listar = ({ especialidadId } = {}) =>
  Profesional.findAll({
    where: { activo: true, ...(especialidadId ? { especialidad_id: especialidadId } : {}) },
    include: incluir,
    order: [['id', 'ASC']],
  });

const obtenerPorId = (id) => Profesional.findOne({ where: { id, activo: true }, include: incluir });
const obtenerPorSlug = (slug) => Profesional.findOne({ where: { slug, activo: true }, include: incluir });

async function crear(datos) {
  const fila = await Profesional.create(datos, { fields: CAMPOS });
  return Profesional.findByPk(fila.id, { include: incluir });
}

async function actualizar(id, datos) {
  const fila = await Profesional.findByPk(id);
  if (!fila) return null;
  await fila.update(datos, { fields: CAMPOS });
  return Profesional.findByPk(id, { include: incluir });
}

const eliminar = (id) => actualizar(id, { activo: false });

module.exports = { listar, obtenerPorId, obtenerPorSlug, crear, actualizar, eliminar };