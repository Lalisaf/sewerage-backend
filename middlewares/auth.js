// middlewares/auth.js
import jwt from 'jsonwebtoken';
//import  User  from '../models/index.js'; // Adjust if necessary
import db from '../models/index.js'; // Adjust if necessary
const { User } = db; // Adjust if necessary

export const verifyToken = async (req, res, next) => {
  try {
    // Check for token in headers or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User no longer exists' 
      });
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ 
        success: false,
        message: 'Password changed recently. Please log in again' 
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token; // Attach token to request if needed
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from headers or cookies
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        code: 'MISSING_TOKEN',
        message: 'Authorization token required' 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
  
    // 3. Get fresh user from DB
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
 

    if (!user) {
      return res.status(401).json({ 
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User no longer exists' 
      });
    }

    // 4. Check if password changed after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ 
        success: false,
        code: 'PASSWORD_CHANGED',
        message: 'Password changed recently. Please log in again' 
      });
    }

    // 5. Attach user and token to request
    req.user = user;
    req.token = token;
    next();
    
  } catch (error) {
    
    let message = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }

    return res.status(401).json({ 
      success: false,
      code: 'INVALID_TOKEN',
      message 
    });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. No user information.'
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin privileges required' 
    });
  }
  next();
};

export const verifyOperator = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. No user information.'
    });
  }
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: 'Operator privileges required' 
    });
  }
  next();
};
