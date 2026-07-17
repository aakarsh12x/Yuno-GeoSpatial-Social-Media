const axios = require('axios');
const { query } = require('../database/connection');
const osmEventsService = require('./osmEventsService');
// Nominatim rate-limit: 1 req/sec — enforce with a simple delay
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PIN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class EventPinAgent {
  constructor() {
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

      // ── 1. Try OSM Overpass (free, no key) ──────────────────────────
      let events = await this._fetchOsmEvents(city);
      console.log(`[EventPinAgent] OSM returned ${events.length} candidate events for ${city}`);

      if (!events.length) {
        console.log(`[EventPinAgent] No events found for ${city}`);
        return;
      }

      // ── 3. Persist + broadcast ────────────────────────────────────────────
      for (const event of events) {
        if (!event.latitude || !event.longitude) {
          // If the event has no coords (e.g. from Reddit), geocode the location hint
          if (event.locationHint) {
            const coords = await this._geocode(event.locationHint, city);
            if (!coords) continue;
            event.latitude = coords.latitude;
            event.longitude = coords.longitude;
            event.location_name = coords.location_name;
          } else {
            continue;
          }
        }

        const pin = await this._savePin(event, city);
        if (pin && io) {
          io.emit('new_event_pin', pin);
        }

        await sleep(200); // small throttle
      }

      console.log(`[EventPinAgent] ✅ Done: ${city}`);
    } catch (err) {
      console.error(`[EventPinAgent] Error for ${city}:`, err.message);
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /**
   * Pull event-like spots from OSM Overpass for a city.
   * Returns an array of event-shaped objects with lat/lng already set.
   */
  async _fetchOsmEvents(city) {
    try {
      const activities = await osmEventsService.fetchActivitiesByCity(city, 12);
      return activities.map(a => ({
        title: a.title,
        description: a.description,
        category: a.category,
        vibe: a.vibe,
        source_url: a.permalink || null,
        subreddit: null,
        reddit_score: 0,
        latitude: a.latitude,
        longitude: a.longitude,
        location_name: a.location_name || a.title,
      })).filter(e => e.latitude && e.longitude);
    } catch (err) {
      console.warn('[EventPinAgent] OSM fetch failed:', err.message);
      return [];
    }
  }

  /**
   * NIM call: extract events with location hints from raw Reddit posts.
   */


  /** Geocode a location hint via Nominatim (free, no key). */
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
      await sleep(1100); // Nominatim: max 1 req/sec
      return result;
    } catch (err) {
      console.error('[EventPinAgent] Geocode error:', err.message);
      return null;
    }
  }

  /** Persist a pin to the DB. Returns the saved row or null on failure. */
  async _savePin(event, city) {
    const expiresAt = new Date(Date.now() + PIN_TTL_MS);

    // Avoid duplicates: same title + coords in active window
    try {
      const exists = await query(
        `SELECT id FROM event_pins
         WHERE title = $1 AND city = $2 AND expires_at > NOW() LIMIT 1`,
        [event.title.substring(0, 120), city]
      );
      if (exists.rows.length) return null;
    } catch (err) {
      // Non-fatal — proceed to insert
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
          event.source_url || null,
          event.subreddit || null,
          event.reddit_score || 0,
          event.latitude,
          event.longitude,
          event.location_name,
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
