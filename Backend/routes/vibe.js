const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const nvidiaAIService = require('../services/nvidiaAIService');

// In-memory cache for weather and quests to optimize NIM and API usage
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Helper to check and retrieve cached response
 */
function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data;
  }
  return null;
}

/**
 * Helper to cache a response
 */
function setCached(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * GET /api/vibe/weather
 * Fetch weather from Open-Meteo and generate a weather-vibe via Llama
 */
router.get('/weather', authenticateToken, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const city = req.query.city || 'your area';

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
    }

    const cacheKey = `weather:${lat.toFixed(3)}:${lng.toFixed(3)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // 1. Fetch from Open-Meteo (Free API)
    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const meteoRes = await axios.get(meteoUrl);
    const weather = meteoRes.data?.current_weather;

    if (!weather) {
      throw new Error('Weather forecast not available');
    }

    // Map weather codes to simple descriptions
    const descMap = {
      0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
      45: 'foggy', 48: 'foggy', 51: 'drizzle', 53: 'drizzle', 55: 'heavy drizzle',
      61: 'rainy', 63: 'rainy', 65: 'heavy rain', 71: 'snowy', 73: 'snowy', 75: 'heavy snow',
      80: 'rain showers', 81: 'rain showers', 82: 'violent rain', 95: 'thunderstorm'
    };
    const condition = descMap[weather.weathercode] || 'settled conditions';

    // 2. Generate meteorological vibe with NVIDIA NIM Llama
    const prompt = `You are a microclimate vibe assistant. Write a short, atmospheric 1-sentence vibe check (max 100 characters) for a geospatial social app in ${city}.
Weather details: ${weather.temperature}°C, ${condition}, ${weather.windspeed} km/h wind speed.
Suggest a small, relevant outdoor or indoor activity. Be poetic, cozy, and concise. Don't use greeting prefixes or hashtags.`;

    let vibeText = `Enjoy the ${condition} of ${weather.temperature}°C. Perfect for a brisk walk!`;
    try {
      const aiResponse = await nvidiaAIService.chatCompletion([
        { role: 'user', content: prompt }
      ], { temperature: 0.5, max_tokens: 120 });
      
      if (aiResponse) {
        vibeText = aiResponse.trim().replace(/^"|"$/g, '');
      }
    } catch (e) {
      console.warn('[VibeAgent] AI completion failed, using default description:', e.message);
    }

    const responseData = {
      temperature: weather.temperature,
      windspeed: weather.windspeed,
      condition,
      isDay: weather.is_day === 1,
      vibeText
    };

    setCached(cacheKey, responseData);
    return res.json({ success: true, data: responseData });

  } catch (error) {
    console.error('[VibeAgent] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve weather vibe.' });
  }
});

/**
 * GET /api/vibe/landmark-quest
 * Fetch nearby historic spots from Overpass API and formulate a Llama scavenger quest
 */
router.get('/landmark-quest', authenticateToken, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const city = req.query.city || 'your area';

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
    }

    const cacheKey = `quest:${lat.toFixed(3)}:${lng.toFixed(3)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // 1. Query Overpass API (Free OSM) for historic/museum features
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:15];
      (
        node["historic"](around:4000,${lat},${lng});
        node["tourism"="museum"](around:4000,${lat},${lng});
        node["tourism"="viewpoint"](around:4000,${lat},${lng});
      );
      out body 10;
    `;

    let landmarks = [];
    try {
      const overpassRes = await axios.post(overpassUrl, query, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      });
      landmarks = overpassRes.data?.elements || [];
    } catch (e) {
      console.warn('[LandmarkQuest] Overpass request failed, using local mock data:', e.message);
    }

    // Fallback landmarks if Overpass is down/empty
    if (landmarks.length === 0) {
      landmarks = [
        { lat: lat + 0.005, lon: lng + 0.003, tags: { name: 'Historic Clock Tower', historic: 'monument' } },
        { lat: lat - 0.004, lon: lng - 0.005, tags: { name: 'Freedom Square Garden', historic: 'memorial' } }
      ];
    }

    // Filter landmarks that have names
    const namedLandmarks = landmarks.filter(l => l.tags && l.tags.name);
    const selected = namedLandmarks.length > 0 
      ? namedLandmarks[Math.floor(Math.random() * namedLandmarks.length)] 
      : landmarks[0];

    const name = selected.tags?.name || 'Local Monument';
    const type = selected.tags?.historic || selected.tags?.tourism || 'monument';

    // 2. Generate a custom time capsule/scavenger hunt quest via Llama
    const prompt = `You are a vintage cartographer and town historian. Write a fun, mysterious 1-sentence time capsule quest (max 120 characters) for a user to visit: "${name}" (${type}) in ${city}.
Make it sound adventurous or mysterious (e.g. "Discover the stone engravings..."). Keep it concise and direct.`;

    let questText = `Scout the grounds of ${name} and unlock its historical secrets.`;
    try {
      const aiResponse = await nvidiaAIService.chatCompletion([
        { role: 'user', content: prompt }
      ], { temperature: 0.6, max_tokens: 120 });
      
      if (aiResponse) {
        questText = aiResponse.trim().replace(/^"|"$/g, '');
      }
    } catch (e) {
      console.warn('[LandmarkQuest] AI completion failed:', e.message);
    }

    const responseData = {
      name,
      type,
      latitude: selected.lat,
      longitude: selected.lon,
      questText
    };

    setCached(cacheKey, responseData);
    return res.json({ success: true, data: responseData });

  } catch (error) {
    console.error('[LandmarkQuest] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve landmark quest.' });
  }
});

module.exports = router;
