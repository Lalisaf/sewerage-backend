module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("Requests", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 8)
        },
        longitude: {
          type: Sequelize.DECIMAL(11, 8)
        },
        problemType: {
          type: Sequelize.ENUM('blockage', 'leakage', 'overflow', 'maintenance', 'other'),
          allowNull: false
        },
        urgency: {
          type: Sequelize.ENUM('low', 'medium', 'high', 'emergency'),
          defaultValue: 'medium'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('submitted', 'assigned', 'en_route', 'in_progress', 'completed'),
          defaultValue: 'submitted'
        },
        images: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          defaultValue: []
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deletedAt: {
          type: Sequelize.DATE
        }
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable("Requests");
    }
  };
  