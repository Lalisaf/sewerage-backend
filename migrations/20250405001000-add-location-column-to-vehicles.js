'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('vehicles', 'location', {
      type: Sequelize.GEOGRAPHY('POINT'),
      allowNull: false,
      defaultValue: Sequelize.fn('ST_GeomFromText', 'POINT(0 0)')
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('vehicles', 'location');
  }
};
