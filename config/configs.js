import 'dotenv/config';
import { Sequelize } from 'sequelize';

const NODE_ENV = process.env.NODE_ENV || 'development';

const dbConfig = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true' ? { 
      ssl: { 
        require: true, 
        rejectUnauthorized: false 
      } 
    } : {},
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: process.env.DB_SSL === 'true' ? { 
      ssl: { 
        require: true, 
        rejectUnauthorized: false 
      } 
    } : {},
  },
};

// Validate configuration
if (!dbConfig[NODE_ENV].dialect) {
  console.error('❌ Database dialect is missing');
  process.exit(1);
}

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST) {
  console.error('❌ Missing required database environment variables');
  process.exit(1);
}

// Initialize Sequelize
const sequelize = new Sequelize({
  database: dbConfig[NODE_ENV].database,
  username: dbConfig[NODE_ENV].username,
  password: dbConfig[NODE_ENV].password,
  host: dbConfig[NODE_ENV].host,
  port: dbConfig[NODE_ENV].port,
  dialect: dbConfig[NODE_ENV].dialect,
  logging: dbConfig[NODE_ENV].logging,
  pool: dbConfig[NODE_ENV].pool,
  dialectOptions: dbConfig[NODE_ENV].dialectOptions,
});

// Database connection function
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to ${NODE_ENV} database: ${dbConfig[NODE_ENV].database}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Email configuration
export const emailConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD,
  from: process.env.EMAIL_FROM,
};

// JWT configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE,
};

// File upload configuration
export const fileConfig = {
  uploadPath: process.env.UPLOAD_PATH,  // Changed PLOAD_PATH to UPLOAD_PATH for clarity
  maxFileSize: process.env.MAX_FILE_UPLOAD,
  allowedFormats: process.env.FILE_UPLOAD_FORMATS?.split(','),
};

// SMS configuration
export const smsConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

// Map configuration
export const mapConfig = {
  accessToken: process.env.MAPBOX_ACCESS_TOKEN,
};

export default sequelize;
