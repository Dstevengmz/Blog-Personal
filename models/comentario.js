'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    static associate(models) {
      Comentario.belongsTo(models.Usuario, { foreignKey: 'idUsuario', as: 'autor' });
      Comentario.belongsTo(models.Proyecto, { foreignKey: 'idProyecto', as: 'proyecto' });
    }
  }
  Comentario.init({
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Comentario',
  });
  return Comentario;
};
