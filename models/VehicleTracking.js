import { Model, DataTypes } from 'sequelize';
export default (sequelize, DataTypes) => {
  const VehicleTracking = sequelize.define('VehicleTracking', {
    tracking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vehicle_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    speed: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: false, // No createdAt, updatedAt columns
  });

  VehicleTracking.associate = (models) => {
    VehicleTracking.belongsTo(models.Vehicle, { foreignKey: 'vehicle_id' });
  };

  return VehicleTracking;
};
