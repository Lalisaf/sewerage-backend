export default (sequelize, DataTypes) => {
const ServiceRequest = sequelize.define("ServiceRequest", {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  location_lat: DataTypes.DECIMAL(10, 7),
  location_long: DataTypes.DECIMAL(10, 7),
  address: DataTypes.STRING(255),
  issue_type: {
    type: DataTypes.ENUM("blockage", "leakage", "overflow", "maintenance"),
    allowNull: false,
  },
  urgency_level: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "assigned",
      "en_route",
      "in_progress",
      "completed",
      "cancelled"
    ),
    defaultValue: "pending",
  },
  assigned_vehicle: DataTypes.INTEGER,
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

return ServiceRequest;
}