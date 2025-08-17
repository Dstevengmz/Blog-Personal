'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
Usuario.hasMany(models.Articulo, { foreignKey: 'idUsuario', as: 'articulos' });
Usuario.hasMany(models.Proyecto, { foreignKey: 'idUsuario', as: 'proyectos' });
Usuario.hasMany(models.Comentario, { foreignKey: 'idUsuario', as: 'comentarios' });

    }
  }
  Usuario.init({
    nombre: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    rol: DataTypes.ENUM('admin','visitante')
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};