"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuditLogs", {
      audit_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      target_table: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.INTEGER,
      },
      details: {
        type: Sequelize.TEXT,
      },
      logged_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Feedbacks", {
      feedback_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rating: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comments: {
        type: Sequelize.STRING(500),
      },
      submitted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Notifications", {
      notification_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      request_id: {
        type: Sequelize.INTEGER,
      },
      message: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("alert", "info", "warning"),
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Roles", {
      role_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role_name: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("ServiceRequests", {
      request_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      requester_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      location_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      location_long: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      issue_type: {
        type: Sequelize.ENUM("blockage", "leakage", "overflow", "maintenance"),
        allowNull: false,
      },
      urgency_level: {
        type: Sequelize.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "assigned",
          "en_route",
          "in_progress",
          "completed",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      assigned_vehicle: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("ServiceStatusLogs", {
      log_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
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
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.STRING(255),
      },
      logged_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Users", {
      user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      firstname: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      middlename: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      lastname: {
        type: Sequelize.STRING(50),
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(15),
      },
      role_id: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("Vehicles", {
      vehicle_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      vehicle_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING(100),
      },
      longitude: {
        type: Sequelize.INTEGER,
      },
      latitude: {
        type: Sequelize.INTEGER,
      },
      capacity: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM("available", "in_service", "maintenance"),
        defaultValue: "available",
      },
      current_driver: {
        type: Sequelize.INTEGER,
      },
      ownership: {
        type: Sequelize.STRING(100),
      },
      last_service_date: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AuditLogs");
    await queryInterface.dropTable("Feedbacks");
    await queryInterface.dropTable("Notifications");
    await queryInterface.dropTable("Roles");
    await queryInterface.dropTable("ServiceRequests");
    await queryInterface.dropTable("ServiceStatusLogs");
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("Vehicles");
  },
};
