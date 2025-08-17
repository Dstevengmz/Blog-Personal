'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Articulo extends Model {
    static associate(models) {
       Articulo.belongsTo(models.Usuario, { foreignKey: 'idUsuario', as: 'autor' });
       Articulo.hasMany(models.Imagen, { foreignKey: 'idArticulo', as: 'imagenes' });
    }
  }
  Articulo.init({
    titulo: DataTypes.STRING,
    contenido: DataTypes.TEXT,
    slug: DataTypes.STRING,
    imagen: DataTypes.STRING,
    tags: DataTypes.STRING,
    idUsuario: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Articulo',
  });
  return Articulo;
};