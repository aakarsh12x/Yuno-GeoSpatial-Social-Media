const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const redditService = require('../services/redditService');
const nvidiaAIService = require('../services/nvidiaAIService');
const redisService = require('../services/redisService');
const rateLimit = require('express-rate-limit');

// Specific rate limit for activities (expensive AI + Reddit calls)
const activitiesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests for local activities, please try again later.'
  }
});

// In-memory fallback cache (used if Redis is down or for very fast local access)
const localCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL_SEC = 600; // 10 minutes in seconds for Redis

/**
 * GET /api/activities
 * Fetch AI-curated local activities based on user's city
 */
router.get('/',
  authenticateToken,
  activitiesLimiter,
  async (req, res) => {
    try {
      const city = req.query.city || req.user.city || 'Mumbai';
      const cacheKey = `activities:${city.toLowerCase().replace(/\s+/g, '_')}`;

      // 1. Try REDIS Cache first
      let activities = await redisService.get(cacheKey);
      let cacheSource = 'redis';

      // 2. Try LOCAL MEMORY Cache if Redis miss or down
      if (!activities) {
        const localCached = localCache.get(cacheKey);
        if (localCached && Date.now() - localCached.timestamp < CACHE_TTL_MS) {
          activities = localCached.activities;
          cacheSource = 'local';
        }
      }

      // If we found cached data, return it
      if (activities) {
        return res.json({
          success: true,
          data: {
            activities,
            city,
            cached: true,
            source: cacheSource,
            generated_at: cacheSource === 'local' 
              ? new Date(localCache.get(cacheKey).timestamp).toISOString()
              : new Date().toISOString() // Redis TTL handles timing
          }
        });
      }

      // 3. CACHE MISS - Fetch raw posts from Reddit
      console.log(`[Activities] Cache miss for ${city}. Fetching Reddit posts...`);
      const rawPosts = await redditService.fetchLocalActivities(city, 15);

      if (rawPosts.length === 0) {
        return res.json({
          success: true,
          data: {
            activities: [],
            city,
            message: 'No local posts found for this area'
          }
        });
      }

      // 4. Curate with NVIDIA AI
      console.log(`[Activities] Curating ${rawPosts.length} posts with AI...`);
      const curatedActivities = await nvidiaAIService.curateActivities(rawPosts, city);

      // 5. Update both caches
      localCache.set(cacheKey, {
        activities: curatedActivities,
        timestamp: Date.now()
      });
      
      await redisService.set(cacheKey, curatedActivities, CACHE_TTL_SEC);

      return res.json({
        success: true,
        data: {
          activities: curatedActivities,
          city,
          total_raw_posts: rawPosts.length,
          cached: false,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[Activities] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch local activities',
        error: error.message
      });
    }
  }
);

module.exports = router;
