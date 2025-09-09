import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// JWT token generation
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

// JWT token verification
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Database operations for sessions
const saveRefreshToken = async (userId, refreshToken, expiresAt, userAgent, ipAddress) => {
  const query = `
    INSERT INTO user_sessions (user_id, refresh_token, expires_at, user_agent, ip_address)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id)
    DO UPDATE SET
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      user_agent = EXCLUDED.user_agent,
      ip_address = EXCLUDED.ip_address,
      created_at = CURRENT_TIMESTAMP
  `;
  await db.query(query, [userId, refreshToken, expiresAt, userAgent, ipAddress]);
};

const getRefreshToken = async (refreshToken) => {
  const query = `
    SELECT us.*, u.name, u.email
    FROM user_sessions us
    JOIN users u ON us.user_id = u.id
    WHERE us.refresh_token = $1 AND us.expires_at > CURRENT_TIMESTAMP
  `;
  const result = await db.query(query, [refreshToken]);
  return result.rows[0];
};

const deleteRefreshToken = async (refreshToken) => {
  const query = 'DELETE FROM user_sessions WHERE refresh_token = $1';
  await db.query(query, [refreshToken]);
};

// Middleware helper to get user from token
const getUserFromToken = async (token) => {
  const decoded = verifyAccessToken(token);
  const query = 'SELECT id, name, email, age, city, school, college, workplace, interests, latitude, longitude, created_at FROM users WHERE id = $1';
  const result = await db.query(query, [decoded.userId]);
  return result.rows[0];
};

export default {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  getUserFromToken
};
