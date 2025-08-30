const { verifyToken, extractToken } = require('../utils/auth');
const { query } = require('../database/connection');

/**
 * Middleware to authenticate JWT tokens
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Check if user still exists in database
    const userResult = await query(
      'SELECT id, name, email, age, city, school, college, workplace, interests, latitude, longitude FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user info to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      ...userResult.rows[0]
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * Used for endpoints that may work differently for authenticated vs anonymous users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    
    const userResult = await query(
      'SELECT id, name, email, age, city, school, college, workplace, interests, latitude, longitude FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        ...userResult.rows[0]
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
