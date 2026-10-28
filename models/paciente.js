const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Paciente = sequelize.define('Paciente', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nombre:           { type: DataTypes.STRING(60), allowNull: false },
  apellidos:        { type: DataTypes.STRING(80), allowNull: false },
  documento:        { type: DataTypes.STRING(20), allowNull: false, unique: true },
  fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: false },
  telefono:         { type: DataTypes.STRING(25), allowNull: false },
  correo:           { type: DataTypes.STRING(120), allowNull: false },
}, { tableName: 'pacientes', timestamps: false });

module.exports = Paciente;