export default (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
  totalRequests: { type: DataTypes.INTEGER, allowNull: false },
  completedRequests: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
return Report;
}