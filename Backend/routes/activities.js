const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const osmEventsService = require('../services/osmEventsService');
const redisService = require('../services/redisService');
const rateLimit = require('express-rate-limit');

// Specific rate limit for activities (potentially expensive calls)
const activitiesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 30 : 100000,
  message: {
    success: false,
    message: 'Too many requests for local activities, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// In-memory fallback cache (used if Redis is down or for very fast local access)
const localCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;  // 30 minutes
const CACHE_TTL_SEC = 1800;             // 30 minutes in seconds for Redis

/**
 * GET /api/activities
 * Fetch local activities based on user's city.
 *
 * Data source:
 *   1. Redis / in-memory cache
 *   2. OSM Overpass API
 */
router.get('/',
  authenticateToken,
  activitiesLimiter,
  async (req, res) => {
    try {
      const city = req.query.city || req.user?.city || 'Mumbai';
      const lat  = parseFloat(req.query.lat)  || null;
      const lng  = parseFloat(req.query.lng)  || null;
      const cacheKey = `activities_v2:${city.toLowerCase().replace(/\s+/g, '_')}`;

      // ── 1. Check caches ──────────────────────────────────────────────────
      let activities = await redisService.get(cacheKey);
      let cacheSource = 'redis';

      if (!activities) {
        const localCached = localCache.get(cacheKey);
        if (localCached && Date.now() - localCached.timestamp < CACHE_TTL_MS) {
          activities = localCached.activities;
          cacheSource = 'local';
        }
      }

      if (activities) {
        return res.json({
          success: true,
          data: { activities, city, cached: true, source: cacheSource }
        });
      }

      // ── 2. Fetch from OSM Overpass ───────────────────────────────────────
      console.log(`[Activities] Cache miss for "${city}". Fetching OSM data...`);

      let osmActivities = [];
      try {
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          osmActivities = await osmEventsService.fetchNearbyActivities(lat, lng, 10, city);
        } else {
          osmActivities = await osmEventsService.fetchActivitiesByCity(city, 10);
        }
        console.log(`[Activities] OSM returned ${osmActivities.length} spots for "${city}"`);
      } catch (osmErr) {
        console.warn('[Activities] OSM fetch failed:', osmErr.message);
      }

      // Prioritize by relevance score, then limit to 12
      const finalActivities = osmActivities
        .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
        .slice(0, 12);

      // ── 3. Update caches ─────────────────────────────────────────────────
      if (finalActivities.length > 0) {
        localCache.set(cacheKey, { activities: finalActivities, timestamp: Date.now() });
        await redisService.set(cacheKey, finalActivities, CACHE_TTL_SEC);
      }

      // If both sources returned nothing, send a graceful empty response
      if (finalActivities.length === 0) {
        return res.json({
          success: true,
          data: {
            activities: [],
            city,
            message: 'No local activity data found for this area yet — try a larger city.'
          }
        });
      }

      return res.json({
        success: true,
        data: {
          activities: finalActivities,
          city,
          total: finalActivities.length,
          sources: {
            osm: osmActivities.length,
            reddit: 0,
          },
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
