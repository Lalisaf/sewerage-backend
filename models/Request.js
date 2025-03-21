const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Request = sequelize.define("Request", {
  location: { type: DataTypes.STRING, allowNull: false },
  problem: { type: DataTypes.STRING, allowNull: false },
  urgency: { type: DataTypes.ENUM("Low", "Medium", "High"), defaultValue: "Medium" },
  status: { type: DataTypes.ENUM("Pending", "In Progress", "Completed"), defaultValue: "Pending" },
});

module.exports = Request;