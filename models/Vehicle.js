const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Vehicle = sequelize.define("Vehicle", {
  licensePlate: { type: DataTypes.STRING, allowNull: false, unique: true },
  location: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM("Available", "Busy"), defaultValue: "Available" },
});

module.exports = Vehicle;