'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const nombre = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const plainPassword = process.env.ADMIN_PASSWORD;
    const hashed = await bcrypt.hash(plainPassword, 10);

    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre,
        email,
        password: hashed,
        rol: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const email = process.env.ADMIN_EMAIL;
    await queryInterface.bulkDelete('Usuarios', { email }, {});
  },
};
