const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define("Role", {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  assignedby:DataTypes.STRING(11),
  description: DataTypes.STRING(255),
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

module.exports = Role;