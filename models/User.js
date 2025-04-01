/*const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fristname: {
  type: DataTypes.STRING(50),
  allowNull:false,
  },
  middlename: {
    type: DataTypes.STRING(50),
    allowNull: false},
  lastname: DataTypes.STRING(100),
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },

  phone_number: DataTypes.STRING(15),
  role_id: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = User;
*/

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name'
  },
  middleName: {
    type: DataTypes.STRING(50),
    field: 'middle_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      const hash = bcrypt.hashSync(value, 10);
      this.setDataValue('password', hash);
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  subcity: {
    type: DataTypes.STRING(50),
    field: 'subcity'
  },
  role: {
    type: DataTypes.ENUM("admin", "operator", "driver","user"),
    defaultValue: "user"
  },
  phone_number: DataTypes.STRING(15),
  role_id: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active"
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  getterMethods: {
    fullName() {
      return `${this.firstName} ${this.middleName || ''}`.trim();
    }
  }
});

module.exports = User;