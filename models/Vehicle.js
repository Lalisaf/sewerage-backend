module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.STRING
    },
    currentLocation: {
      type: DataTypes.GEOGRAPHY('POINT')
    },
    status: {
      type: DataTypes.ENUM('available', 'in_service', 'maintenance', 'out_of_service'),
      defaultValue: 'available'
    }
  }, {
    timestamps: true
  });

  Vehicle.associate = (models) => {
    Vehicle.hasMany(models.Request, {
      foreignKey: 'vehicleId',
      as: 'assignedRequests'
    });
    Vehicle.belongsTo(models.User, {
      foreignKey: 'driverId',
      as: 'driver'
    });
  };

  return Vehicle;
};