"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Usuarios", "passwordResetToken", {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn("Usuarios", "passwordResetExpires", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("Usuarios", ["passwordResetToken"], {
      name: "usuarios_password_reset_token_unique",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Usuarios", "usuarios_password_reset_token_unique");
    await queryInterface.removeColumn("Usuarios", "passwordResetExpires");
    await queryInterface.removeColumn("Usuarios", "passwordResetToken");
  },
};
