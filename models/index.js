const sequelize = require('../config/db');
const Especialidad = require('./especialidad');
const Consultorio = require('./consultorio');
const Profesional = require('./profesional');
const HorarioProfesional = require('./horarioProfesional');
const Paciente = require('./paciente');
const Cita = require('./cita');

Especialidad.hasMany(Profesional, { foreignKey: 'especialidad_id', as: 'profesionales' });
Profesional.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });

Consultorio.hasMany(Profesional, { foreignKey: 'consultorio_id', as: 'profesionales' });
Profesional.belongsTo(Consultorio, { foreignKey: 'consultorio_id', as: 'consultorio' });

Profesional.hasMany(HorarioProfesional, { foreignKey: 'profesional_id', as: 'horarios' });
HorarioProfesional.belongsTo(Profesional, { foreignKey: 'profesional_id', as: 'profesional' });

Paciente.hasMany(Cita, { foreignKey: 'paciente_id', as: 'citas' });
Cita.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

Profesional.hasMany(Cita, { foreignKey: 'profesional_id', as: 'citas' });
Cita.belongsTo(Profesional, { foreignKey: 'profesional_id', as: 'profesional' });

Especialidad.hasMany(Cita, { foreignKey: 'especialidad_id', as: 'citas' });
Cita.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });

module.exports = { sequelize, Especialidad, Consultorio, Profesional, HorarioProfesional, Paciente, Cita };