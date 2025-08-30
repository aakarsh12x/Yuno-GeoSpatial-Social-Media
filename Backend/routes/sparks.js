const express = require('express');
const Spark = require('../models/Spark');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /sparks/send
 * @desc    Send a spark (friend request)
 * @access  Private
 */
router.post('/send', 
  authenticateToken,
  validateRequest('sendSpark'),
  asyncHandler(async (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to send spark to self
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send spark to yourself'
      });
    }

    // Check if spark already exists
    const existingSpark = await Spark.getExistingSpark(senderId, receiverId);
    if (existingSpark) {
      return res.status(409).json({
        success: false,
        message: 'Spark already exists between these users',
        spark: existingSpark
      });
    }

    // Send spark
    const spark = await Spark.sendSpark(senderId, receiverId, message);

    res.status(201).json({
      success: true,
      message: 'Spark sent successfully',
      data: spark
    });
  })
);

/**
 * @route   POST /sparks/:sparkId/accept
 * @desc    Accept a spark (friend request)
 * @access  Private
 */
router.post('/:sparkId/accept',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { sparkId } = req.params;
    const receiverId = req.user.id;

    try {
      const result = await Spark.acceptSpark(parseInt(sparkId), receiverId);
      
      res.json({
        success: true,
        message: 'Spark accepted successfully',
        data: {
          spark: result.spark,
          chatId: result.chatId
        }
      });
    } catch (error) {
      if (error.message === 'Spark not found or already processed') {
        return res.status(404).json({
          success: false,
          message: 'Spark not found or already processed'
        });
      }
      throw error;
    }
  })
);

/**
 * @route   POST /sparks/:sparkId/reject
 * @desc    Reject a spark (friend request)
 * @access  Private
 */
router.post('/:sparkId/reject',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { sparkId } = req.params;
    const receiverId = req.user.id;

    const spark = await Spark.rejectSpark(parseInt(sparkId), receiverId);
    
    if (!spark) {
      return res.status(404).json({
        success: false,
        message: 'Spark not found or already processed'
      });
    }

    res.json({
      success: true,
      message: 'Spark rejected successfully',
      data: spark
    });
  })
);

/**
 * @route   GET /sparks
 * @desc    Get all sparks for the authenticated user
 * @access  Private
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const sparks = await Spark.getSparksForUser(userId);

    res.json({
      success: true,
      data: sparks
    });
  })
);

/**
 * @route   GET /sparks/pending
 * @desc    Get pending sparks received by the authenticated user
 * @access  Private
 */
router.get('/pending',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const pendingSparks = await Spark.getPendingSparks(userId);

    res.json({
      success: true,
      data: pendingSparks
    });
  })
);

/**
 * @route   GET /sparks/stats
 * @desc    Get spark statistics for the authenticated user
 * @access  Private
 */
router.get('/stats',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const stats = await Spark.getSparkStats(userId);

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * @route   GET /sparks/nearby
 * @desc    Get nearby users who can receive sparks
 * @access  Private
 */
router.get('/nearby',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { radius = 10, limit = 20, offset = 0 } = req.query;

    // Get current user's location
    const currentUser = await User.findById(userId);
    if (!currentUser.latitude || !currentUser.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location required to find nearby users'
      });
    }

    // Get nearby users with commonalities
    const nearbyUsers = await User.findNearbyWithCommonalities({
      userId,
      searchLat: currentUser.latitude,
      searchLng: currentUser.longitude,
      radiusKm: parseFloat(radius),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Filter out users who already have sparks with current user
    const filteredUsers = await Promise.all(
      nearbyUsers.map(async (user) => {
        const existingSpark = await Spark.getExistingSpark(userId, user.id);
        return {
          ...user,
          hasSpark: !!existingSpark,
          sparkStatus: existingSpark ? existingSpark.status : null
        };
      })
    );

    res.json({
      success: true,
      data: filteredUsers
    });
  })
);

module.exports = router;
