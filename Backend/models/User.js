const { query } = require('../database/connection');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const User = {
  /**
   * Find a user by email address
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user
   */
  async create({ name, email, password, username, age, city, school, college, workplace, interests, bio, profession, latitude, longitude }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await query(
      `INSERT INTO users
        (name, email, password_hash, username, age, city, school, college, workplace, interests, bio, profession, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        name,
        email,
        hashedPassword,
        username || null,
        age || null,
        city || null,
        school || null,
        college || null,
        workplace || null,
        interests || [],
        bio || null,
        profession || null,
        latitude || null,
        longitude || null,
      ]
    );
    return result.rows[0];
  },

  /**
   * Update a user's profile fields
   */
  async update(userId, updates) {
    const allowed = [
      'name', 'email', 'username', 'age', 'city', 'school', 'college', 'workplace', 
      'interests', 'bio', 'profession', 'languages', 'skills', 'clubs', 
      'favorite_shows', 'favorite_movies', 'favorite_music',
      'latitude', 'longitude'
    ];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));

    if (fields.length === 0) return await this.findById(userId);

    const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => updates[f]);

    const result = await query(
      `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0] || null;
  },

  /**
   * Verify email + password and return user if valid
   */
  async verifyPassword(email, password) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    return valid ? user : null;
  },

  /**
   * Find nearby users with commonality scores using PostGIS
   */
  async findNearbyWithCommonalities({ userId, latitude, longitude, radiusKm = 10, limit = 20, offset = 0 }) {
    // Fallback: get current user's coords if not supplied
    if (!latitude || !longitude) {
      const me = await this.findById(userId);
      latitude = me?.latitude;
      longitude = me?.longitude;
    }
    if (!latitude || !longitude) throw new Error('Location coordinates required');

    const result = await query(
      `SELECT 
        u.id, u.name, u.age, u.city, u.school, u.college, u.workplace, u.interests,
        u.latitude, u.longitude,
        -- Haversine distance in km
        (6371 * acos(
          cos(radians($2)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians($3)) +
          sin(radians($2)) * sin(radians(u.latitude))
        )) AS distance_km,
        -- Commonality score
        (
          CASE WHEN u.city IS NOT NULL AND u.city = me.city THEN 1 ELSE 0 END +
          CASE WHEN u.school IS NOT NULL AND u.school = me.school THEN 1 ELSE 0 END +
          CASE WHEN u.college IS NOT NULL AND u.college = me.college THEN 1 ELSE 0 END +
          CASE WHEN u.workplace IS NOT NULL AND u.workplace = me.workplace THEN 1 ELSE 0 END +
          COALESCE(array_length(ARRAY(
            SELECT unnest(u.interests) INTERSECT SELECT unnest(me.interests)
          ), 1), 0)
        ) AS commonality_score,
        ARRAY(
          SELECT a FROM (VALUES
            (CASE WHEN u.city IS NOT NULL AND u.city = me.city THEN 'city' ELSE NULL END),
            (CASE WHEN u.school IS NOT NULL AND u.school = me.school THEN 'school' ELSE NULL END),
            (CASE WHEN u.college IS NOT NULL AND u.college = me.college THEN 'college' ELSE NULL END),
            (CASE WHEN u.workplace IS NOT NULL AND u.workplace = me.workplace THEN 'workplace' ELSE NULL END)
          ) AS t(a) WHERE a IS NOT NULL
        ) AS common_attributes,
        ARRAY(
          SELECT unnest(u.interests) INTERSECT SELECT unnest(me.interests)
        ) AS common_interests
      FROM users u
      CROSS JOIN (SELECT * FROM users WHERE id = $1) me
      WHERE u.id != $1
        AND u.latitude IS NOT NULL
        AND u.longitude IS NOT NULL
        AND (6371 * acos(
          cos(radians($2)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians($3)) +
          sin(radians($2)) * sin(radians(u.latitude))
        )) <= $4
      ORDER BY commonality_score DESC, distance_km ASC
      LIMIT $5 OFFSET $6`,
      [userId, latitude, longitude, radiusKm, limit, offset]
    );
    return result.rows;
  },

  /**
   * Get user statistics (spark counts, chat counts, etc.)
   */
  async getStats(userId) {
    try {
      const stats = await query(
        `SELECT
          (SELECT COUNT(*) FROM sparks WHERE sender_id = $1 OR receiver_id = $1) AS total_sparks,
          (SELECT COUNT(*) FROM sparks WHERE receiver_id = $1 AND status = 'pending') AS pending_sparks,
          (SELECT COUNT(*) FROM sparks WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted') AS accepted_sparks
        `,
        [userId]
      );
      return stats.rows[0] || {};
    } catch {
      return {};
    }
  },

  // ─── Session management ────────────────────────────────────────────────────

  /**
   * Create a new session for a user
   */
  async createSession(userId, userAgent, ipAddress, refreshToken) {
    try {
      await query(
        `INSERT INTO user_sessions (user_id, refresh_token, user_agent, ip_address, created_at, expires_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '7 days')`,
        [userId, refreshToken || 'none', userAgent || 'Unknown', ipAddress || 'Unknown']
      );
    } catch {
      // Sessions table may not exist in all environments — fail silently
    }
  },

  /**
   * Find a valid (non-expired) session by refresh token
   */
  async findValidSession(refreshToken) {
    try {
      const result = await query(
        `SELECT s.*, u.email
         FROM user_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.refresh_token = $1
           AND s.expires_at > NOW()
         LIMIT 1`,
        [refreshToken]
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  },

  /**
   * Delete a single session by refresh token
   */
  async deleteSession(refreshToken) {
    try {
      await query(
        'DELETE FROM user_sessions WHERE refresh_token = $1',
        [refreshToken]
      );
    } catch {
      // Fail silently
    }
  },

  /**
   * Delete all sessions for a user (logout everywhere)
   */
  async deleteAllSessions(userId) {
    try {
      const result = await query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [userId]
      );
      return result.rowCount || 0;
    } catch {
      return 0;
    }
  },
};

module.exports = User;
