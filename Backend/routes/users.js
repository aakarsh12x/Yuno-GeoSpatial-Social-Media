const express = require('express');
const User = require('../models/User');
const { query } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, validateCoordinates } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   PUT /user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticateToken,
  validateRequest('updateProfile'),
  validateCoordinates,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    // Check if there are any valid updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    // Update user profile
    const updatedUser = await User.update(userId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  })
);

/**
 * @route   GET /user/:id
 * @desc    Get specific user profile (public data only)
 * @access  Private (requires authentication to view others)
 */
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const requestingUserId = req.user.id;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Find the requested user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare response data
    let responseData = {
      id: user.id,
      name: user.name,
      age: user.age,
      city: user.city,
      school: user.school,
      college: user.college,
      workplace: user.workplace,
      interests: user.interests,
      createdAt: user.created_at
    };

    // If requesting own profile, include additional details
    if (userId === requestingUserId) {
      responseData = {
        ...responseData,
        email: user.email,
        latitude: user.latitude,
        longitude: user.longitude,
        updatedAt: user.updated_at
      };
    } else {
      // For other users, calculate commonalities if both users have location
      const currentUser = await User.findById(requestingUserId);
      if (currentUser && currentUser.latitude && currentUser.longitude && 
          user.latitude && user.longitude) {
        
        // Calculate common attributes
        const commonalities = [];
        if (currentUser.city === user.city && user.city) commonalities.push('city');
        if (currentUser.school === user.school && user.school) commonalities.push('school');
        if (currentUser.college === user.college && user.college) commonalities.push('college');
        if (currentUser.workplace === user.workplace && user.workplace) commonalities.push('workplace');
        
        // Calculate common interests
        const currentInterests = currentUser.interests || [];
        const userInterests = user.interests || [];
        const commonInterests = currentInterests.filter(interest => 
          userInterests.includes(interest)
        );

        responseData.commonalities = {
          attributes: commonalities,
          interests: commonInterests,
          count: commonalities.length + commonInterests.length
        };
      }
    }

    res.json({
      success: true,
      data: {
        user: responseData
      }
    });
  })
);

/**
 * @route   GET /user/profile/me
 * @desc    Get current user's full profile
 * @access  Private
 */
router.get('/profile/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = await User.getStats(userId);

    res.json({
      success: true,
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
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        stats
      }
    });
  })
);

/**
 * @route   DELETE /user/profile
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // Delete all user sessions first
    await User.deleteAllSessions(userId);
    
    // Delete user account (this will cascade to sessions due to FK constraint)
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  })
);

/**
 * @route   GET /user/search
 * @desc    Search users by name, city, school, college, workplace
 * @access  Private
 */
router.get('/search',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { q, limit = 20, offset = 0 } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const result = await query(`
      SELECT 
        id, name, age, city, school, college, workplace, interests,
        CASE 
          WHEN name ILIKE $1 THEN 3
          WHEN city ILIKE $1 THEN 2
          WHEN school ILIKE $1 OR college ILIKE $1 OR workplace ILIKE $1 THEN 1
          ELSE 0
        END as relevance_score
      FROM users 
      WHERE id != $2 
        AND (
          name ILIKE $1 OR 
          city ILIKE $1 OR 
          school ILIKE $1 OR 
          college ILIKE $1 OR 
          workplace ILIKE $1 OR
          EXISTS (
            SELECT 1 FROM unnest(interests) interest 
            WHERE interest ILIKE $1
          )
        )
      ORDER BY relevance_score DESC, name ASC
      LIMIT $3 OFFSET $4
    `, [searchTerm, currentUserId, limit, offset]);

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rows.length
        }
      }
    });
  })
);

module.exports = router;
