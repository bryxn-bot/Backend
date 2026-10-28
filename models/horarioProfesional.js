const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HorarioProfesional = sequelize.define('HorarioProfesional', {
  id:             { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  profesional_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  dia_semana:     { type: DataTypes.TINYINT.UNSIGNED, allowNull: false }, // 1 = lunes ... 7 = domingo
  hora_inicio:    { type: DataTypes.TIME, allowNull: false },
  hora_fin:       { type: DataTypes.TIME, allowNull: false },
  duracion_min:   { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 30 },
}, { tableName: 'horarios_profesional', timestamps: false });

module.exports = HorarioProfesional;