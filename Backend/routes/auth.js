const express = require('express');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');
const { validateRequest, validateCoordinates } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  validateRequest('register'),
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      age,
      city,
      school,
      college,
      workplace,
      interests,
      latitude,
      longitude
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      age,
      city,
      school,
      college,
      workplace,
      interests,
      latitude,
      longitude
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    // Create session
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await User.createSession(user.id, userAgent, ipAddress);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          city: user.city,
          school: user.school,
          college: user.college,
          workplace: user.workplace,
          interests: user.interests,
          latitude: user.latitude,
          longitude: user.longitude,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  })
);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 */
router.post('/login',
  validateRequest('login'),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Verify user credentials
    const user = await User.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    // Create session
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await User.createSession(user.id, userAgent, ipAddress);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          city: user.city,
          school: user.school,
          college: user.college,
          workplace: user.workplace,
          interests: user.interests,
          latitude: user.latitude,
          longitude: user.longitude
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  })
);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Validate refresh token and get user
    const session = await User.findValidSession(refreshToken);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: session.user_id,
      email: session.email
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });
  })
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Public
 */
router.post('/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.deleteSession(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
);

/**
 * @route   POST /auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private (requires valid refresh token)
 */
router.post('/logout-all',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Validate refresh token to get user ID
    const session = await User.findValidSession(refreshToken);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Delete all sessions for this user
    const deletedCount = await User.deleteAllSessions(session.user_id);

    res.json({
      success: true,
      message: `Logged out from ${deletedCount} devices`
    });
  })
);

module.exports = router;
