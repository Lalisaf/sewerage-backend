const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('RBSSS', 'postgres', 'lalisa', {
    host: 'localhost',
    dialect: 'postgres',
});

const AuditLog = sequelize.define('AuditLog', {
    audit_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING(100), allowNull: false },
    target_table: { type: DataTypes.STRING(50), allowNull: false },
    target_id: { type: DataTypes.INTEGER },
    details: { type: DataTypes.TEXT },
    logged_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});

const Feedback = sequelize.define('Feedback', {
    feedback_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    request_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
    comments: { type: DataTypes.STRING(500) },
    submitted_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});

const Notification = sequelize.define('Notification', {
    notification_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    request_id: { type: DataTypes.INTEGER },
    message: { type: DataTypes.STRING(255), allowNull: false },
    type: { type: DataTypes.ENUM('alert', 'info', 'warning'), allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});

const Role = sequelize.define('Role', {
    role_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role_name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    description: { type: DataTypes.STRING(255) }
});

const ServiceRequest = sequelize.define('ServiceRequest', {
    request_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    requester_id: { type: DataTypes.INTEGER, allowNull: false },
    location_lat: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    location_long: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: false },
    issue_type: { type: DataTypes.ENUM('blockage', 'leakage', 'overflow', 'maintenance'), allowNull: false },
    urgency_level: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
    status: { type: DataTypes.ENUM('pending', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled'), defaultValue: 'pending' },
    assigned_vehicle: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), onUpdate: Sequelize.literal('CURRENT_TIMESTAMP') }
});

const ServiceStatusLog = sequelize.define('ServiceStatusLog', {
    log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    request_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled'), allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.STRING(255) },
    logged_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});

const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    firstname: { type: DataTypes.STRING(50), allowNull: false },
    middlename: { type: DataTypes.STRING(50), allowNull: false },
    lastname: { type: DataTypes.STRING(50) },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    phone_number: { type: DataTypes.STRING(15) },
    role_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), onUpdate: Sequelize.literal('CURRENT_TIMESTAMP') }
});

const Vehicle = sequelize.define('Vehicle', {
    vehicle_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vehicle_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    model: { type: DataTypes.STRING(100) },
    currentLocation: { type: DataTypes.GEOGRAPHY('POINT') },
    capacity: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM('available', 'in_service', 'maintenance'), defaultValue: 'available' },
    current_driver: { type: DataTypes.INTEGER },
    ownership: { type: DataTypes.STRING(100) },
    last_service_date: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), onUpdate: Sequelize.literal('CURRENT_TIMESTAMP') }
});

// Associations
User.belongsTo(Role, { foreignKey: 'role_id' });
ServiceRequest.belongsTo(User, { foreignKey: 'requester_id' });
ServiceRequest.belongsTo(Vehicle, { foreignKey: 'assigned_vehicle' });
Feedback.belongsTo(User, { foreignKey: 'user_id' });
Feedback.belongsTo(ServiceRequest, { foreignKey: 'request_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });
Notification.belongsTo(ServiceRequest, { foreignKey: 'request_id' });
ServiceStatusLog.belongsTo(ServiceRequest, { foreignKey: 'request_id' });
ServiceStatusLog.belongsTo(User, { foreignKey: 'updated_by' });
Vehicle.belongsTo(User, { foreignKey: 'current_driver' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, AuditLog, Feedback, Notification, Role, ServiceRequest, ServiceStatusLog, User, Vehicle };
