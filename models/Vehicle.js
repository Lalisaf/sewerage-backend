import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Vehicle extends Model {
    static associate(models) {
      Vehicle.belongsTo(models.User, {
        foreignKey: 'driverId',
        as: 'driver'
      });
      Vehicle.hasMany(models.Request, {
        foreignKey: 'vehicleId',
        as: 'assignedRequests'
      });
    }
  }

  Vehicle.init({
    vehicleId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'vehicle_id'
    },
    plateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'plateNumber'
    },
    vehicleType: {
      type: DataTypes.ENUM(
        'tanker',
        'vacuum', 
        'jetting',
        'sewer_rodding',
        'dump_truck',
        'pickup'
      ),
      allowNull: false,
      field: 'vehicle_type'
    },
    location: {
      type: DataTypes.GEOGRAPHY('POINT'),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capabilities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['blockage', 'leakage', 'overflow', 'maintenance']
    },
    ownership: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('available', 'in_service', 'maintenance', 'out_of_service'),
      defaultValue: 'available'
    }
  }, {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
    timestamps: true,
    underscored: true
  });

  return Vehicle;
};