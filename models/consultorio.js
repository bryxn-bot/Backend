const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Consultorio = sequelize.define('Consultorio', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nombre:    { type: DataTypes.STRING(80), allowNull: false },
  direccion: { type: DataTypes.STRING(160), allowNull: false },
}, { tableName: 'consultorios', timestamps: false });

module.exports = Consultorio;