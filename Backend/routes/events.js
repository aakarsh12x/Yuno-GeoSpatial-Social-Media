const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/events/nearby
 * Returns live event pins within a radius of the caller's position.
 * Query params: lat, lng, radius (km, default 15)
 */
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || req.user.latitude);
    const lng = parseFloat(req.query.lng || req.user.longitude);
    const radius = parseFloat(req.query.radius || 15);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng are required' });
    }

    // Haversine with acos argument clamped to [-1,1] to prevent NaN on
    // floating-point edge cases (same defensive pattern needed in all raw Haversine SQL)
    const result = await query(
      `SELECT
         id, title, description, category, vibe,
         source_url, subreddit, reddit_score,
         latitude, longitude, location_name, city,
         expires_at, created_at,
         (6371 * acos(GREATEST(-1, LEAST(1,
           cos(radians($1)) * cos(radians(latitude)) *
           cos(radians(longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(latitude))
         )))) AS distance_km
       FROM event_pins
       WHERE expires_at > NOW()
         AND (6371 * acos(GREATEST(-1, LEAST(1,
           cos(radians($1)) * cos(radians(latitude)) *
           cos(radians(longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(latitude))
         )))) <= $3
       ORDER BY reddit_score DESC, created_at DESC
       LIMIT 50`,
      [lat, lng, radius]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Events] nearby error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby events' });
  }
});

/**
 * GET /api/events/places
 * Returns famous nearby POIs (landmarks, museums, parks, etc.) fetched from
 * the Overpass API (OpenStreetMap) — completely free, no key required.
 * Query params: lat, lng, radius (km, default 10)
 */
router.get('/places', authenticateToken, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius || 10);
    const radiusM = radiusKm * 1000;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng are required' });
    }

    // Overpass QL: fetch tourist attractions, museums, parks, monuments, historic sites
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["tourism"~"attraction|museum|artwork|viewpoint|zoo|gallery|theme_park"](around:${radiusM},${lat},${lng});
        node["historic"~"monument|memorial|castle|ruins|archaeological_site|fort"](around:${radiusM},${lat},${lng});
        node["leisure"~"park|nature_reserve|garden"](around:${radiusM},${lat},${lng});
        node["amenity"~"theatre|cinema|library|place_of_worship"](around:${radiusM},${lat},${lng});
      );
      out body 40;
    `.trim();

    const axios = require('axios');
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: { 'Content-Type': 'text/plain', 'User-Agent': 'YunoApp/1.0' },
        timeout: 12000,
      }
    );

    const elements = response.data?.elements || [];

    // Category mapping from OSM tags → human-readable label
    const resolveCategory = (tags) => {
      if (tags.tourism) return tags.tourism.replace(/_/g, ' ');
      if (tags.historic) return tags.historic.replace(/_/g, ' ');
      if (tags.leisure) return tags.leisure.replace(/_/g, ' ');
      if (tags.amenity) return tags.amenity.replace(/_/g, ' ');
      return 'landmark';
    };

    const places = elements
      .filter(el => el.tags && el.tags.name)
      .map(el => ({
        id: `osm-${el.id}`,
        name: el.tags.name,
        category: resolveCategory(el.tags),
        description: el.tags['description'] || el.tags['wikipedia'] || null,
        latitude: el.lat,
        longitude: el.lon,
        website: el.tags['website'] || el.tags['contact:website'] || null,
      }));

    res.json({ success: true, data: places });
  } catch (err) {
    console.error('[Events] places error:', err.message);
    // Graceful degradation — return empty array, don't break the map
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
