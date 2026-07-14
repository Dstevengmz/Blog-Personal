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
    rol: DataTypes.ENUM('admin','visitante'),
    passwordResetToken: DataTypes.STRING(64),
    passwordResetExpires: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Usuario',
    defaultScope: {
      attributes: {
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires']
      }
    }
  });
  return Usuario;
};
