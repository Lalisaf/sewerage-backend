export default (sequelize, DataTypes) => {
const ServiceStatusLog = sequelize.define("ServiceStatusLog", {
  log_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    allowNull: false,
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING(255),
  },
  logged_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

return ServiceStatusLog;
}
