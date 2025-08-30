const express = require('express');
const User = require('../models/User');
const { query } = require('../database/connection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /discover
 * @desc    Discover nearby users with commonalities
 * @access  Public (Development Mode)
 */
router.get('/',
  // authenticateToken, // Temporarily disabled for development
  validateRequest('discover', 'query'),
  asyncHandler(async (req, res) => {
    const {
      radius = 10,
      latitude,
      longitude,
      limit = 20,
      offset = 0
    } = req.query;

          // For development, use a default user ID that exists in the database
      const currentUserId = req.user?.id || 1; // We'll use user ID 1, but first let's create it

      try {
        // First, ensure we have a current user for comparison
        let currentUser = await User.findById(currentUserId);
        if (!currentUser) {
          // Create a default current user if none exists
          await query(`
            INSERT INTO users (name, email, password_hash, age, city, school, college, workplace, interests, latitude, longitude, location) 
            VALUES ('Current User', 'current@test.com', 'hash000', 24, 'Mumbai', 'Mumbai University', 'Mumbai University', 'Tech Company', ARRAY['coding', 'music', 'sports'], 19.0760, 72.8777, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326))
            ON CONFLICT (id) DO NOTHING
          `);
          currentUser = await User.findById(currentUserId);
        }

        // Use Mumbai coordinates as default if no coordinates provided
        const defaultLatitude = 19.0760; // Mumbai
        const defaultLongitude = 72.8777; // Mumbai

              // Find nearby users with commonalities using real database query
        const nearbyUsers = await User.findNearbyWithCommonalities({
          userId: currentUserId,
          latitude: latitude ? parseFloat(latitude) : defaultLatitude,
          longitude: longitude ? parseFloat(longitude) : defaultLongitude,
          radiusKm: parseFloat(radius),
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

      // Format the response
      const formattedUsers = nearbyUsers.map(user => ({
        id: user.id,
        name: user.name,
        age: user.age,
        city: user.city,
        school: user.school,
        college: user.college,
        workplace: user.workplace,
        interests: user.interests,
        distance: {
          km: Math.round(user.distance_km * 100) / 100,
          miles: Math.round(user.distance_km * 0.621371 * 100) / 100
        },
        commonalities: {
          score: user.commonality_score,
          attributes: user.common_attributes || [],
          interests: user.common_interests || [],
          total: user.commonality_score
        },
        // Include coordinates for development (remove in production)
        latitude: user.latitude,
        longitude: user.longitude,
        location: {
          hasLocation: !!(user.latitude && user.longitude),
          approximateArea: user.city || 'Unknown'
        }
      }));

      res.json({
        success: true,
        data: {
          users: formattedUsers,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: formattedUsers.length === parseInt(limit)
          },
          searchParameters: {
            radius: parseFloat(radius),
            center: {
              latitude: latitude ? parseFloat(latitude) : (req.user?.latitude || 0),
              longitude: longitude ? parseFloat(longitude) : (req.user?.longitude || 0)
            }
          },
          summary: {
            totalFound: formattedUsers.length,
            averageDistance: formattedUsers.length > 0 
              ? Math.round((formattedUsers.reduce((sum, user) => sum + user.distance.km, 0) / formattedUsers.length) * 100) / 100
              : 0,
            commonalityStats: {
              withCommonalities: formattedUsers.filter(user => user.commonalities.score > 0).length,
              averageScore: formattedUsers.length > 0
                ? Math.round((formattedUsers.reduce((sum, user) => sum + user.commonalities.score, 0) / formattedUsers.length) * 100) / 100
                : 0
            }
          }
        }
      });

    } catch (error) {
      if (error.message.includes('Location coordinates required')) {
        return res.status(400).json({
          success: false,
          message: 'Location coordinates are required for discovery. Please update your profile with your location or provide latitude/longitude parameters.'
        });
      }
      throw error;
    }
  })
);

/**
 * @route   GET /discover/stats
 * @desc    Get discovery statistics for the user
 * @access  Public (Development Mode)
 */
router.get('/stats',
  // authenticateToken, // Temporarily disabled for development
  asyncHandler(async (req, res) => {
    // For development, use a default user ID
    const currentUserId = req.user?.id || 1;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser || !currentUser.latitude || !currentUser.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location required to get discovery statistics'
      });
    }

    // Get user statistics
    const stats = await User.getStats(currentUserId);

    // Get commonality breakdown
    const commonalityStats = await User.findNearbyWithCommonalities({
      userId: currentUserId,
      radiusKm: 10,
      limit: 100,
      offset: 0
    });

    const breakdown = {
      byCommonality: {
        noCommonalities: commonalityStats.filter(u => u.commonality_score === 0).length,
        lowCommonalities: commonalityStats.filter(u => u.commonality_score >= 1 && u.commonality_score <= 2).length,
        mediumCommonalities: commonalityStats.filter(u => u.commonality_score >= 3 && u.commonality_score <= 4).length,
        highCommonalities: commonalityStats.filter(u => u.commonality_score >= 5).length
      },
      byAttribute: {
        sameCity: commonalityStats.filter(u => u.common_attributes && u.common_attributes.includes('city')).length,
        sameSchool: commonalityStats.filter(u => u.common_attributes && u.common_attributes.includes('school')).length,
        sameCollege: commonalityStats.filter(u => u.common_attributes && u.common_attributes.includes('college')).length,
        sameWorkplace: commonalityStats.filter(u => u.common_attributes && u.common_attributes.includes('workplace')).length,
        sharedInterests: commonalityStats.filter(u => u.common_interests && u.common_interests.length > 0).length
      }
    };

    res.json({
      success: true,
      data: {
        nearby: {
          within1km: stats.nearby_users_1km || 0,
          within5km: stats.nearby_users_5km || 0,
          within10km: stats.nearby_users_10km || 0
        },
        commonalities: breakdown,
        recommendations: {
          completeProfile: !currentUser.city || !currentUser.school || !currentUser.college || !currentUser.workplace || !currentUser.interests || currentUser.interests.length === 0,
          addInterests: !currentUser.interests || currentUser.interests.length < 3,
          updateLocation: !currentUser.latitude || !currentUser.longitude
        }
      }
    });
  })
);

/**
 * @route   GET /discover/popular-interests
 * @desc    Get popular interests in the area
 * @access  Public (Development Mode)
 */
router.get('/popular-interests',
  // authenticateToken, // Temporarily disabled for development
  asyncHandler(async (req, res) => {
    const { radius = 10 } = req.query;
    // For development, use a default user
    const currentUser = req.user || { id: 1, latitude: 0, longitude: 0 };

    if (!currentUser.latitude || !currentUser.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location required to get popular interests'
      });
    }

    // Get popular interests in the area
    const result = await query(`
      WITH nearby_users AS (
        SELECT interests
        FROM users
        WHERE id != $1
          AND location IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography,
            location,
            $4 * 1000
          )
      ),
      interest_counts AS (
        SELECT 
          unnest(interests) as interest,
          COUNT(*) as count
        FROM nearby_users
        WHERE interests IS NOT NULL
        GROUP BY unnest(interests)
      )
      SELECT interest, count
      FROM interest_counts
      ORDER BY count DESC, interest ASC
      LIMIT 20
    `, [currentUser.id, currentUser.latitude, currentUser.longitude, radius]);

    res.json({
      success: true,
      data: {
        popularInterests: result.rows,
        searchRadius: parseFloat(radius),
        totalUsers: result.rows.reduce((sum, item) => sum + parseInt(item.count), 0)
      }
    });
  })
);

module.exports = router;
