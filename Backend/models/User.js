const { query, transaction } = require('../database/connection');
const { hashPassword, comparePassword, generateSecureToken, calculateExpiration } = require('../utils/auth');

class User {
  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {object} - Created user (without password)
   */
  static async create(userData) {
    const {
      name,
      email,
      password,
      age,
      city,
      school,
      college,
      workplace,
      interests = [],
      latitude,
      longitude
    } = userData;

    // Hash the password
    const passwordHash = await hashPassword(password);

    const result = await query(`
      INSERT INTO users (
        name, email, password_hash, age, city, school, college, workplace, interests, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, age, city, school, college, workplace, interests, latitude, longitude, created_at
    `, [name, email, passwordHash, age, city, school, college, workplace, interests, latitude, longitude]);

    return result.rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {object|null} - User data or null
   */
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @param {boolean} includePassword - Whether to include password hash
   * @returns {object|null} - User data or null
   */
  static async findById(id, includePassword = false) {
    const fields = includePassword 
      ? '*'
      : 'id, name, email, age, city, school, college, workplace, interests, latitude, longitude, created_at, updated_at';
    
    const result = await query(
      `SELECT ${fields} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {object} updates - Fields to update
   * @returns {object} - Updated user data
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'age', 'city', 'school', 'college', 'workplace', 'interests', 'latitude', 'longitude'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id); // Add ID as last parameter

    const result = await query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, age, city, school, college, workplace, interests, latitude, longitude, updated_at
    `, values);

    return result.rows[0];
  }

  /**
   * Verify user password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {object|null} - User data (without password) if valid, null otherwise
   */
  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Create user session
   * @param {number} userId - User ID
   * @param {string} userAgent - User agent string
   * @param {string} ipAddress - Client IP address
   * @returns {object} - Session data
   */
  static async createSession(userId, userAgent, ipAddress) {
    const refreshToken = generateSecureToken();
    const expiresAt = calculateExpiration(30); // 30 days

    const result = await query(`
      INSERT INTO user_sessions (user_id, refresh_token, expires_at, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, refresh_token, expires_at
    `, [userId, refreshToken, expiresAt, userAgent, ipAddress]);

    return result.rows[0];
  }

  /**
   * Find valid session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {object|null} - Session data or null
   */
  static async findValidSession(refreshToken) {
    const result = await query(`
      SELECT s.*, u.id as user_id, u.name, u.email 
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = $1 AND s.expires_at > NOW()
    `, [refreshToken]);

    return result.rows[0] || null;
  }

  /**
   * Delete user session
   * @param {string} refreshToken - Refresh token
   * @returns {boolean} - True if session was deleted
   */
  static async deleteSession(refreshToken) {
    const result = await query(
      'DELETE FROM user_sessions WHERE refresh_token = $1',
      [refreshToken]
    );
    return result.rowCount > 0;
  }

  /**
   * Delete all sessions for a user
   * @param {number} userId - User ID
   * @returns {number} - Number of sessions deleted
   */
  static async deleteAllSessions(userId) {
    const result = await query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [userId]
    );
    return result.rowCount;
  }

  /**
   * Clean up expired sessions
   * @returns {number} - Number of expired sessions deleted
   */
  static async cleanupExpiredSessions() {
    const result = await query(
      'DELETE FROM user_sessions WHERE expires_at <= NOW()'
    );
    return result.rowCount;
  }

  /**
   * Find nearby users with commonalities
   * @param {object} params - Search parameters
   * @returns {array} - Array of nearby users with commonality scores
   */
  static async findNearbyWithCommonalities(params) {
    const {
      userId,
      latitude,
      longitude,
      radiusKm = 10,
      limit = 20,
      offset = 0
    } = params;

    // Get current user data for comparison
    const currentUser = await this.findById(userId);
    if (!currentUser) {
      throw new Error('Current user not found');
    }

    // Use user's location if not provided
    const searchLat = latitude || currentUser.latitude;
    const searchLng = longitude || currentUser.longitude;

    if (!searchLat || !searchLng) {
      throw new Error('Location coordinates required for discovery');
    }

    const result = await query(`
      WITH user_distances AS (
        SELECT 
          u.*,
          ST_Distance(
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            u.location
          ) / 1000 AS distance_km
        FROM users u
        WHERE u.id != $3
          AND u.location IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            u.location,
            $4 * 1000
          )
      ),
      user_commonalities AS (
        SELECT 
          ud.*,
          (
            CASE WHEN ud.city = $5 AND ud.city IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN ud.school = $6 AND ud.school IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN ud.college = $7 AND ud.college IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN ud.workplace = $8 AND ud.workplace IS NOT NULL THEN 1 ELSE 0 END +
            COALESCE(array_length(array(SELECT unnest(ud.interests) INTERSECT SELECT unnest($9::text[])), 1), 0)
          ) AS commonality_score,
          ARRAY[
            CASE WHEN ud.city = $5 AND ud.city IS NOT NULL THEN 'city' ELSE NULL END,
            CASE WHEN ud.school = $6 AND ud.school IS NOT NULL THEN 'school' ELSE NULL END,
            CASE WHEN ud.college = $7 AND ud.college IS NOT NULL THEN 'college' ELSE NULL END,
            CASE WHEN ud.workplace = $8 AND ud.workplace IS NOT NULL THEN 'workplace' ELSE NULL END
          ] AS common_attributes,
          array(SELECT unnest(ud.interests) INTERSECT SELECT unnest($9::text[])) AS common_interests
        FROM user_distances ud
      )
      SELECT 
        id, name, email, age, city, school, college, workplace, interests,
        latitude, longitude, distance_km, commonality_score,
        array_remove(common_attributes, NULL) AS common_attributes,
        common_interests,
        created_at
      FROM user_commonalities
      ORDER BY commonality_score DESC, distance_km ASC
      LIMIT $10 OFFSET $11
    `, [
      searchLat, searchLng, userId, radiusKm,
      currentUser.city, currentUser.school, currentUser.college, currentUser.workplace,
      currentUser.interests || [],
      limit, offset
    ]);

    return result.rows;
  }

  /**
   * Get user statistics
   * @param {number} userId - User ID
   * @returns {object} - User statistics
   */
  static async getStats(userId) {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE ST_DWithin(u.location, current_user.location, 10000)) AS nearby_users_10km,
        COUNT(*) FILTER (WHERE ST_DWithin(u.location, current_user.location, 5000)) AS nearby_users_5km,
        COUNT(*) FILTER (WHERE ST_DWithin(u.location, current_user.location, 1000)) AS nearby_users_1km
      FROM users u
      CROSS JOIN (SELECT location FROM users WHERE id = $1) AS current_user
      WHERE u.id != $1 AND u.location IS NOT NULL
    `, [userId]);

    return result.rows[0] || { nearby_users_10km: 0, nearby_users_5km: 0, nearby_users_1km: 0 };
  }
}

module.exports = User;
