const { Especialidad } = require('../models');

const CAMPOS = ['slug', 'nombre', 'descripcion', 'icono', 'destacada', 'activo'];

// Sin parámetros: las 6 destacadas. Con { todas: true }: todas ("Ver todas las especialidades")
const listar = ({ todas = false } = {}) =>
  Especialidad.findAll({
    where: { activo: true, ...(todas ? {} : { destacada: true }) },
    order: [['id', 'ASC']],
  });

const obtenerPorId = (id) => Especialidad.findOne({ where: { id, activo: true } });
const obtenerPorSlug = (slug) => Especialidad.findOne({ where: { slug, activo: true } });

const crear = (datos) => Especialidad.create(datos, { fields: CAMPOS });

async function actualizar(id, datos) {
  const fila = await Especialidad.findByPk(id);
  if (!fila) return null;
  return fila.update(datos, { fields: CAMPOS });
}

const eliminar = (id) => actualizar(id, { activo: false });

module.exports = { listar, obtenerPorId, obtenerPorSlug, crear, actualizar, eliminar };