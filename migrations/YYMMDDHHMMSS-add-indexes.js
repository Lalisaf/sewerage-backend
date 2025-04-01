// backend/migrations/YYYYMMDDHHMMSS-add-indexes.js
'use strict';

module.exports = { 
    async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('Requests', ['status']);
    await queryInterface.addIndex('Requests', ['problemType']);
    await queryInterface.addIndex('Requests', ['createdAt']);
    await queryInterface.addIndex('Vehicles', ['status']);
    await queryInterface.addIndex('Users', ['role']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Requests', ['status']);
    await queryInterface.removeIndex('Requests', ['problemType']);
    await queryInterface.removeIndex('Requests', ['createdAt']);
    await queryInterface.removeIndex('Vehicles', ['status']);
    await queryInterface.removeIndex('Users', ['role']);
  }
};