const axios = require('axios');
const { query } = require('../database/connection');
const redditService = require('./redditService');

// Nominatim rate-limit: 1 req/sec — enforce with a simple delay
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-3.1-8b-instruct';
const PIN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class EventPinAgent {
  constructor() {
    // Simple in-process geocode cache to avoid redundant Nominatim calls
    this._geocodeCache = new Map();
  }

  /**
   * Entry point — called by the cron job in server.js.
   * @param {string} city
   * @param {import('socket.io').Server} io
   */
  async run(city, io) {
    try {
      console.log(`[EventPinAgent] ▶ Pipeline start: ${city}`);

      // 1. Pull Reddit posts (reuse existing service, max 20 posts to keep NIM tokens low)
      const posts = await redditService.fetchLocalActivities(city, 20);
      if (!posts.length) {
        console.log(`[EventPinAgent] No posts for ${city}`);
        return;
      }

      // 2. Ask NIM to extract events with location hints
      const events = await this._extractEvents(posts, city);
      if (!events.length) {
        console.log(`[EventPinAgent] No events extracted for ${city}`);
        return;
      }

      // 3. Geocode + persist + broadcast
      for (const event of events) {
        const coords = await this._geocode(event.locationHint, city);
        if (!coords) continue;

        const pin = await this._savePin(event, coords, city, posts);
        if (pin && io) {
          io.emit('new_event_pin', pin);
        }

        await sleep(1100); // Nominatim: max 1 req/sec
      }

      console.log(`[EventPinAgent] ✅ Done: ${city}`);
    } catch (err) {
      console.error(`[EventPinAgent] Error for ${city}:`, err.message);
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /**
   * NIM call: extract events with location hints from raw Reddit posts.
   * Prompt is intentionally terse to minimise token usage.
   */
  async _extractEvents(posts, city) {
    const postList = posts
      .map((p, i) => `${i + 1}. "${p.title}"${p.selftext ? ' — ' + p.selftext.substring(0, 120) : ''}`)
      .join('\n');

    const userPrompt =
      `City: ${city}. Extract events/activities with a real physical location from these Reddit posts.\n\n` +
      postList +
      `\n\nReturn ONLY a JSON array. Each object: ` +
      `{"title":"<60 chars>","description":"<2 sentences>","category":"event|food|culture|outdoors|nightlife|community|tech|sports","vibe":"chill|energetic|intellectual|social|adventurous|cozy","locationHint":"<neighbourhood or place name, or null>","sourceIndex":<1-based int>}. ` +
      `Skip posts with no clear location. Return [] if none qualify.`;

    const raw = await this._nimCall(userPrompt);
    if (!raw) return [];

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];

    try {
      const parsed = JSON.parse(match[0]);
      return parsed.filter((e) => e.locationHint && e.title && e.category);
    } catch {
      return [];
    }
  }

  /** Hit NVIDIA NIM with a single user message. Returns content string or null. */
  async _nimCall(userMessage) {
    try {
      const resp = await axios.post(
        NVIDIA_API_URL,
        {
          model: MODEL,
          messages: [{ role: 'user', content: userMessage }],
          temperature: 0.2,
          max_tokens: 1024,
        },
        {
          headers: { Authorization: `Bearer ${process.env.NVIDIA_KEY}` },
          timeout: 60000,
        }
      );
      return resp.data.choices[0].message.content;
    } catch (err) {
      console.error('[EventPinAgent] NIM error:', err.response?.data?.detail || err.message);
      return null;
    }
  }

  /** Geocode a location hint via Nominatim (free, no key). Returns {lat, lng, display_name} or null. */
  async _geocode(locationHint, city) {
    const cacheKey = `${locationHint}|${city}`.toLowerCase();
    if (this._geocodeCache.has(cacheKey)) return this._geocodeCache.get(cacheKey);

    try {
      const q = encodeURIComponent(`${locationHint}, ${city}`);
      const resp = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        {
          headers: { 'User-Agent': 'YunoApp/1.0 (geospatial-social-platform)' },
          timeout: 8000,
        }
      );

      if (!resp.data.length) return null;

      const { lat, lon, display_name } = resp.data[0];
      const result = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        location_name: display_name,
      };
      this._geocodeCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('[EventPinAgent] Geocode error:', err.message);
      return null;
    }
  }

  /** Persist a pin to the DB. Returns the saved row or null on failure. */
  async _savePin(event, coords, city, posts) {
    const source = posts[event.sourceIndex - 1];
    const expiresAt = new Date(Date.now() + PIN_TTL_MS);

    // Avoid duplicate pins for the same source URL within the TTL window
    if (source?.permalink) {
      const exists = await query(
        `SELECT id FROM event_pins WHERE source_url = $1 AND expires_at > NOW() LIMIT 1`,
        [source.permalink]
      );
      if (exists.rows.length) return null;
    }

    try {
      const res = await query(
        `INSERT INTO event_pins
           (title, description, category, vibe, source_url, subreddit, reddit_score,
            latitude, longitude, location_name, city, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          event.title.substring(0, 120),
          event.description.substring(0, 300),
          event.category,
          event.vibe,
          source?.permalink || null,
          source?.subreddit || null,
          source?.score || 0,
          coords.latitude,
          coords.longitude,
          coords.location_name,
          city,
          expiresAt,
        ]
      );
      return res.rows[0];
    } catch (err) {
      console.error('[EventPinAgent] DB insert error:', err.message);
      return null;
    }
  }
}

module.exports = new EventPinAgent();
