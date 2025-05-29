import jwt from 'jsonwebtoken';
import db from '../models/index.js';
const { User } = db;
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Authorization token required', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Find user
    const user = await User.findOne({
      where: { user_id: decoded.id },
      attributes: { exclude: ['password'] },
      raw: true // Convert to plain object
    });

    if (!user) {
      return next(new ErrorResponse('User not found', 401));
    }

    req.user = user;
    req.token = token;
    next();
    
  } catch (err) {
    let message = 'Invalid token';
    if (err.name === 'TokenExpiredError') {
      message = 'Token expired. Please login again';
    }
    return next(new ErrorResponse(message, 401));
  }
};

// @desc    Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`, 
          403
        )
      );
    }

    next();
  };
};

// @desc    Verify admin only
export const verifyAdmin = (req, res, next) => {
  if (!req.user?.role) {
    return next(new ErrorResponse('Access denied. No user information.', 403));
  }
  
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Admin privileges required', 403)
    );
  }
  
  next();
};

// @desc    Verify admin or operator
export const verifyOperator = (req, res, next) => {
  if (!req.user?.role) {
    return next(new ErrorResponse('Access denied. No user information.', 403));
  }

  if (!['admin', 'operator'].includes(req.user.role)) {
    return next(
      new ErrorResponse('Operator privileges required', 403)
    );
  }
  
  next();
};