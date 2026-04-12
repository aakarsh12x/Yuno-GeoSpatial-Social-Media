const { createClient } = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = createClient({
        url: this.redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.log('[Redis] Max reconnect retries reached. Falling back to local cache.');
              return false; // Stop reconnecting
            }
            return Math.min(retries * 50, 2000); // Backoff
          }
        }
      });

      this.client.on('error', (err) => {
        // console.error('[Redis] Client Error:', err.message);
        this.isReady = false;
      });

      this.client.on('connect', () => {
        console.log('[Redis] Connecting...');
      });

      this.client.on('ready', () => {
        console.log('[Redis] Connected and ready');
        this.isReady = true;
      });

      await this.client.connect();
    } catch (error) {
      console.log('[Redis] Could not connect. Application will use in-memory fallback.');
      this.isReady = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isReady) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[Redis] Get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttlSeconds = 600) {
    if (!this.isReady) return false;
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds
      });
      return true;
    } catch (error) {
      console.error(`[Redis] Set error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.isReady) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const redisService = new RedisService();

// Auto-connect on import
redisService.connect();

module.exports = redisService;
