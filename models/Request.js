import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Request extends Model {
    static associate(models) {
      Request.belongsTo(models.User, { foreignKey: 'requesterId', as: 'requester' });
      Request.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
      Request.hasMany(models.Message);
      Request.hasMany(models.ServiceStatusLog, { foreignKey: 'requestId' });
    }
  }

  Request.init({
    request_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'request_id',
    },
    problemType: {
      type: DataTypes.ENUM('blockage', 'leakage', 'overflow', 'maintenance', 'other'),
      allowNull: false,
      field: 'problem_type',
    },
    status: {
      type: DataTypes.ENUM('submitted', 'assigned', 'en_route', 'in_progress', 'cancelled', 'completed'),
      defaultValue: 'submitted',
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
      defaultValue: 'medium',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    location: {
      type: DataTypes.GEOGRAPHY('POINT'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Request',
    tableName: 'requests',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  return Request;
};
