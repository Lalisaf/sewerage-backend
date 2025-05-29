import dotenv from 'dotenv';

dotenv.config();

// Application Configuration
export const APP_CONFIG = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  appName: process.env.APP_NAME || 'Sewerage Service System'
};

// JWT Configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expire: process.env.JWT_EXPIRE || '30d',
  algorithm: 'HS256',
  issuer: APP_CONFIG.appName,
  audience: APP_CONFIG.clientUrl
};

// File Upload Configuration
export const FILE_CONFIG = {
  uploadPath: process.env.PLOAD_PATH || './public/uploads',
  maxFileUpload: parseInt(process.env.MAX_FILE_UPLOAD || '1000000', 10), // 1MB
  fileFormats: (process.env.FILE_UPLOAD_FORMATS || 'image/jpeg,image/png').split(','),
  maxFiles: parseInt(process.env.MAX_FILES_UPLOAD || '5', 10)
};

// SMS Configuration (Twilio)
export const SMS_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
};

// Map Configuration
export const MAP_CONFIG = {
  accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  defaultZoom: 12,
  defaultCenter: {
    lat: parseFloat(process.env.MAP_DEFAULT_LAT || '27.7172'),
    lng: parseFloat(process.env.MAP_DEFAULT_LNG || '85.3240')
  }
};

// Database Configuration (additional to your existing db config)
export const DB_CONFIG = {
  maxPoolConnections: parseInt(process.env.DB_MAX_POOL || '10', 10),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '10000', 10), // 10 seconds
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10) // 2 seconds
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per window
  message: 'Too many requests from this IP, please try again later'
};

// CORS Configuration
export const CORS_CONFIG = {
  origin: APP_CONFIG.clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// Session Configuration
export const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET || JWT_CONFIG.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: APP_CONFIG.env === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Export all configurations
export default {
  APP_CONFIG,
  JWT_CONFIG,
  FILE_CONFIG,
  SMS_CONFIG,
  MAP_CONFIG,
  DB_CONFIG,
  RATE_LIMIT_CONFIG,
  CORS_CONFIG,
  SESSION_CONFIG
};