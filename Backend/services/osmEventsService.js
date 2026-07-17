const axios = require('axios');

/**
 * OSM Events Service
 * Fetches local events and activity spots using the Overpass API (OpenStreetMap).
 * Completely free — no API key required. Same source as the Places/Landmark feature.
 */
class OsmEventsService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.nominatimUrl = 'https://nominatim.openstreetmap.org';
  }

  /**
   * Reverse geocode lat/lng to a city name via Nominatim (free, no key).
   */
  async reverseGeocode(lat, lng) {
    try {
      const res = await axios.get(`${this.nominatimUrl}/reverse`, {
        params: { format: 'json', lat, lon: lng, zoom: 10 },
        headers: { 'User-Agent': 'YunoApp/1.0 (geospatial-social-platform)' },
        timeout: 6000,
      });
      const addr = res.data?.address || {};
      return addr.city || addr.town || addr.village || addr.state_district || addr.county || '';
    } catch {
      return '';
    }
  }

  /**
   * Geocode a city name to lat/lng via Nominatim.
   */
  async geocodeCity(city) {
    try {
      const res = await axios.get(`${this.nominatimUrl}/search`, {
        params: { q: city, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'YunoApp/1.0 (geospatial-social-platform)' },
        timeout: 6000,
      });
      if (!res.data?.length) return null;
      return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
    } catch {
      return null;
    }
  }

  /**
   * Fetch local event spots and community activity places from OSM.
   * Returns an array of activity-like objects compatible with the existing UI schema.
   * @param {number} lat
   * @param {number} lng
   * @param {number} radiusKm
   * @param {string} city - used for description context
   */
  async fetchNearbyActivities(lat, lng, radiusKm = 10, city = '') {
    const radiusM = radiusKm * 1000;

    // Overpass QL: fetch real event venues and activity spots
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["event"](around:${radiusM},${lat},${lng});
        node["amenity"~"arts_centre|community_centre|cinema|theatre|music_venue|nightclub|pub|bar|food_court|marketplace|library|social_facility"](around:${radiusM},${lat},${lng});
        node["shop"~"mall|department_store|market|supermarket|bakery|pastry|deli|coffee"](around:${radiusM},${lat},${lng});
        node["leisure"~"fitness_centre|sports_centre|stadium|park|garden|swimming_pool|golf_course|dance"](around:${radiusM},${lat},${lng});
        node["tourism"~"attraction|gallery|museum|artwork|viewpoint|theme_park|zoo"](around:${radiusM},${lat},${lng});
        node["historic"~"monument|memorial|castle|ruins|archaeological_site|fort"](around:${radiusM},${lat},${lng});
        node["sport"](around:${radiusM},${lat},${lng});
      );
      out body 60;
    `.trim();

    try {
      const res = await axios.post(this.overpassUrl, overpassQuery, {
        headers: { 'Content-Type': 'text/plain', 'User-Agent': 'YunoApp/1.0' },
        timeout: 15000,
      });

      const elements = (res.data?.elements || []).filter(el => el.tags?.name);

      return elements.map(el => this._mapToActivity(el, city)).filter(Boolean);
    } catch (err) {
      console.error('[OsmEventsService] Overpass error:', err.message);
      return [];
    }
  }

  /**
   * Fetch activities by city name (geocodes first, then fetches by coords).
   */
  async fetchActivitiesByCity(city, radiusKm = 10) {
    const coords = await this.geocodeCity(city);
    if (!coords) {
      console.warn(`[OsmEventsService] Could not geocode city: ${city}`);
      return [];
    }
    return this.fetchNearbyActivities(coords.lat, coords.lng, radiusKm, city);
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Map an OSM element to an activity card schema.
   * Returns null if the element isn't useful enough.
   */
  _mapToActivity(el, city) {
    const tags = el.tags || {};
    const name = tags.name;
    if (!name) return null;

    const { category, vibe } = this._resolveCategory(tags, name);
    const description = this._buildDescription(tags, name, city);

    return {
      title: name.length > 80 ? name.substring(0, 77) + '...' : name,
      description,
      category,
      vibe,
      relevance: 7, // OSM data is inherently relevant — real places
      permalink: tags.website || tags['contact:website'] || null,
      score: 0,        // no upvote metric for OSM
      subreddit: null, // not from Reddit
      thumbnail: null,
      // Extra geo fields for map pins
      latitude: el.lat,
      longitude: el.lon,
      location_name: name,
    };
  }

  _resolveCategory(tags, name) {
    const n = name.toLowerCase();
    const amenity = (tags.amenity || '').toLowerCase();
    const leisure = (tags.leisure || '').toLowerCase();
    const tourism = (tags.tourism || '').toLowerCase();
    const historic = (tags.historic || '').toLowerCase();
    const shop = (tags.shop || '').toLowerCase();
    const sport = (tags.sport || '').toLowerCase();

    // Nightlife
    if (amenity.match(/nightclub|pub|bar|music_venue/)) {
      return { category: 'nightlife', vibe: 'energetic' };
    }
    // Food & dining
    if (amenity.match(/food_court|marketplace/) || shop.match(/bakery|pastry|deli|coffee|supermarket/) || n.match(/cafe|coffee|dhaba|bistro|restaurant|eatery/)) {
      return { category: 'food', vibe: 'cozy' };
    }
    // Shopping
    if (shop.match(/mall|department_store|market/) || n.match(/mall|bazaar|market/)) {
      return { category: 'shopping', vibe: 'social' };
    }
    // Sports & fitness
    if (leisure.match(/fitness_centre|sports_centre|stadium|swimming_pool|golf_course|dance/) || sport || n.match(/gym|fitness|sport|stadium|arena/)) {
      return { category: 'sports', vibe: 'energetic' };
    }
    // Outdoors & parks
    if (leisure.match(/park|garden/) || n.match(/park|garden|lake|river|waterfall|trail|jungle/)) {
      return { category: 'outdoors', vibe: 'adventurous' };
    }
    // Culture & arts
    if (tourism.match(/gallery|museum|artwork/) || historic || amenity.match(/arts_centre|cinema|theatre|library/) || n.match(/museum|art|gallery|heritage|fort|palace|monument/)) {
      return { category: 'culture', vibe: 'intellectual' };
    }
    // Community & social
    if (amenity.match(/community_centre|social_facility/) || n.match(/club|society|community|ngo|volunteer/)) {
      return { category: 'community', vibe: 'social' };
    }
    // Events & attractions
    if (tourism.match(/attraction|theme_park|zoo|viewpoint/) || tags.event) {
      return { category: 'event', vibe: 'energetic' };
    }

    return { category: 'community', vibe: 'social' };
  }

  _buildDescription(tags, name, city) {
    const parts = [];

    if (tags.description) return tags.description.substring(0, 150);

    const amenity = tags.amenity || tags.leisure || tags.tourism || tags.historic || tags.shop || tags.sport || '';
    const readableType = amenity.replace(/_/g, ' ');

    if (readableType) {
      parts.push(`A local ${readableType}`);
    } else {
      parts.push(`A local spot`);
    }

    if (city) parts.push(`in ${city}`);

    if (tags.opening_hours) {
      parts.push(`· Open: ${tags.opening_hours}`);
    }

    if (tags['addr:street']) {
      parts.push(`· ${tags['addr:street']}${tags['addr:housenumber'] ? ' ' + tags['addr:housenumber'] : ''}`);
    }

    return parts.join(' ') + '.';
  }
}

module.exports = new OsmEventsService();
