import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Request, { 
        foreignKey: 'requesterId',
        as: 'requests'
      });
      User.hasMany(models.Notification);
      User.hasMany(models.Message, { as: 'sentMessages' });
      User.hasMany(models.Vehicle, { 
        foreignKey: 'driverId',
        as: 'assignedVehicles'
      });
    }

    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }

  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'user_id'
    },
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'operator', 'driver', 'user'),
      defaultValue: 'user'
    },
    phone: {
      type: DataTypes.STRING(15),
      unique: true,
      field: 'phone'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    verificationToken: {
      type: DataTypes.STRING,
      field: 'verification_token'
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
      field: 'verification_token_expires'
    },
    lastVerificationAttempt: {
      type: DataTypes.DATE,
      field: 'last_verification_attempt'
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'country'
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'region'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city'
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
};