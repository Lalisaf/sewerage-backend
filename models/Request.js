const { DataTypes } = require("sequelize");
const sequelize = require('../config/db'); // Import the Sequelize instance

  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    problemType: {
      type: DataTypes.ENUM('blockage', 'leakage', 'overflow', 'maintenance', 'other'),
      allowNull: false
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
      defaultValue: 'medium'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('submitted', 'assigned', 'en_route', 'in_progress', 'completed'),
      defaultValue: 'submitted'
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Request.associate = (models) => {
    Request.belongsTo(models.User, {
      foreignKey: 'requesterId',
      as: 'requester'
    });
    Request.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
  };

 module.exports Request;