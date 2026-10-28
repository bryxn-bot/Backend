const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profesional = sequelize.define('Profesional', {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  slug:            { type: DataTypes.STRING(60), allowNull: false, unique: true },
  titulo:          { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'Dr.' },
  nombre:          { type: DataTypes.STRING(60), allowNull: false },
  apellidos:       { type: DataTypes.STRING(80), allowNull: false },
  especialidad_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  consultorio_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  activo:          { type: DataTypes.BOOLEAN, defaultValue: true },
  // Campos calculados que usa el frontend: "Dra. Elena Martín" y "EM"
  nombre_completo: {
    type: DataTypes.VIRTUAL,
    get() { return `${this.titulo} ${this.nombre} ${this.apellidos}`; },
  },
  iniciales: {
    type: DataTypes.VIRTUAL,
    get() { return `${this.nombre[0]}${this.apellidos[0]}`.toUpperCase(); },
  },
}, { tableName: 'profesionales', timestamps: false });

module.exports = Profesional;