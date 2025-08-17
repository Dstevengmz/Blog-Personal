'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Proyecto extends Model {
    static associate(models) {
    Proyecto.belongsTo(models.Usuario, { foreignKey: 'idUsuario', as: 'autor' });
    Proyecto.hasMany(models.Imagen, { foreignKey: 'idProyecto', as: 'imagenes' });
  Proyecto.hasMany(models.Comentario, { foreignKey: 'idProyecto', as: 'comentarios' });
    }
  }
  Proyecto.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    github: DataTypes.STRING,
    demoUrl: DataTypes.STRING,
    imagen: DataTypes.STRING,
    tecnologias: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Proyecto',
  });
  return Proyecto;
};