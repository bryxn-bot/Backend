const { Paciente } = require('../models');
const { ErrorCrud } = require('./errores');

const CAMPOS = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento', 'telefono', 'correo'];

const listar = () => Paciente.findAll({ order: [['apellidos', 'ASC'], ['nombre', 'ASC']] });
const obtenerPorId = (id) => Paciente.findByPk(id);
const obtenerPorDocumento = (documento) => Paciente.findOne({ where: { documento } });

const crear = (datos, transaction) => Paciente.create(datos, { fields: CAMPOS, transaction });

async function actualizar(id, datos) {
  const fila = await Paciente.findByPk(id);
  if (!fila) return null;
  return fila.update(datos, { fields: CAMPOS });
}

// Si el documento ya existe actualiza sus datos de contacto; si no, crea el paciente
async function crearOActualizar(datos, transaction) {
  const existente = await Paciente.findOne({ where: { documento: datos.documento }, transaction });
  if (!existente) return crear(datos, transaction);
  return existente.update(datos, { fields: CAMPOS, transaction });
}

// Borra de verdad, pero no deja si el paciente ya tiene citas
async function eliminar(id) {
  const fila = await Paciente.findByPk(id);
  if (!fila) return false;
  try {
    await fila.destroy();
    return true;
  } catch (e) {
    if (e.name === 'SequelizeForeignKeyConstraintError') {
      throw new ErrorCrud('PACIENTE_CON_CITAS', 'No se puede eliminar: el paciente tiene citas registradas');
    }
    throw e;
  }
}

module.exports = { listar, obtenerPorId, obtenerPorDocumento, crear, actualizar, crearOActualizar, eliminar };