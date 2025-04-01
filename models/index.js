/*const User = require("./User");
const Role = require("./Role");
const ServiceRequest = require("./ServiceRequest");
const Vehicle = require("./Vehicle");
const Request=require("./Request");
const Feedback = require("./Feedback");
const Notification = require("./Notification");
const ServiceStatusLog = require("./ServiceStatusLog");
const AuditLog = require("./AuditLog");

// User ↔ Role (Many-to-One)
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

// ServiceRequest ↔ User (Requester)
ServiceRequest.belongsTo(User, {
  foreignKey: "requester_id",
  as: "Requester",
});
User.hasMany(ServiceRequest, { foreignKey: "requester_id" });

// ServiceRequest ↔ Vehicle
ServiceRequest.belongsTo(Vehicle, { foreignKey: "assigned_vehicle" });
Vehicle.hasMany(ServiceRequest, { foreignKey: "assigned_vehicle" });

// Feedback ↔ ServiceRequest
Feedback.belongsTo(ServiceRequest, { foreignKey: "request_id" });
ServiceRequest.hasMany(Feedback, { foreignKey: "request_id" });

// Add other associations similarly...
// backend/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/db');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./User')(sequelize, Sequelize),
  Request: require('./Request')(sequelize, Sequelize),
  Vehicle: require('./Vehicle')(sequelize, Sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
*/
// backend/models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;