const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Especialidad = sequelize.define('Especialidad', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  slug:        { type: DataTypes.STRING(60), allowNull: false, unique: true },
  nombre:      { type: DataTypes.STRING(80), allowNull: false },
  descripcion: { type: DataTypes.STRING(160), allowNull: false },
  icono:       { type: DataTypes.STRING(40) },
  destacada:   { type: DataTypes.BOOLEAN, defaultValue: false },
  activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'especialidades', timestamps: false });

module.exports = Especialidad;