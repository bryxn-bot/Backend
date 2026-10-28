const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// OJO: la columna slot_activo es generada por MySQL, por eso no se declara aquí
const Cita = sequelize.define('Cita', {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  localizador:     { type: DataTypes.STRING(12), allowNull: false, unique: true },
  paciente_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  profesional_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  especialidad_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tipo_consulta:   { type: DataTypes.ENUM('primera', 'seguimiento'), allowNull: false },
  fecha:           { type: DataTypes.DATEONLY, allowNull: false },
  hora_inicio:     { type: DataTypes.TIME, allowNull: false },
  hora_fin:        { type: DataTypes.TIME, allowNull: false },
  estado:          { type: DataTypes.ENUM('confirmada', 'cancelada', 'completada'), allowNull: false, defaultValue: 'confirmada' },
  created_at:      { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
}, { tableName: 'citas', timestamps: false });

module.exports = Cita;