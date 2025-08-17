"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Imagen extends Model {
    static associate(models) {
      Imagen.belongsTo(models.Articulo, {
        foreignKey: "idArticulo",
        as: "articulo",
      });
      Imagen.belongsTo(models.Proyecto, {
        foreignKey: "idProyecto",
        as: "proyecto",
      });
    }
  }
  Imagen.init(
    {
      url: DataTypes.STRING,
      idArticulo: DataTypes.INTEGER,
      idProyecto: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Imagen",
    }
  );
  return Imagen;
};
