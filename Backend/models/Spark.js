const { query, transaction } = require('../database/connection');

const Spark = {
  /**
   * Send a spark from sender to receiver
   */
  async sendSpark(senderId, receiverId, message) {
    const result = await query(
      `INSERT INTO sparks (sender_id, receiver_id, message, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW())
       RETURNING *`,
      [senderId, receiverId, message || null]
    );
    return result.rows[0];
  },

  /**
   * Check if a spark already exists between two users (in either direction)
   */
  async getExistingSpark(userAId, userBId) {
    const result = await query(
      `SELECT * FROM sparks
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       LIMIT 1`,
      [userAId, userBId]
    );
    return result.rows[0] || null;
  },

  /**
   * Accept a spark and create a chat room between the two users
   */
  async acceptSpark(sparkId, receiverId) {
    return transaction(async (client) => {
      // Update spark status
      const sparkResult = await client.query(
        `UPDATE sparks
         SET status = 'accepted', updated_at = NOW()
         WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
         RETURNING *`,
        [sparkId, receiverId]
      );

      const spark = sparkResult.rows[0];
      if (!spark) throw new Error('Spark not found or already processed');

      // Create a direct chat between sender and receiver
      const chatResult = await client.query(
        `INSERT INTO chats (chat_type, created_at)
         VALUES ('direct', NOW())
         RETURNING id`,
        []
      ).catch(() => ({ rows: [{ id: null }] })); // Gracefully handle missing chats table

      const chatId = chatResult.rows[0]?.id;

      // Add participants if chat was created
      if (chatId) {
        await client.query(
          `INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)
           ON CONFLICT DO NOTHING`,
          [chatId, spark.sender_id, spark.receiver_id]
        ).catch(() => {});
      }

      return { spark, chatId };
    });
  },

  /**
   * Reject a spark
   */
  async rejectSpark(sparkId, receiverId) {
    const result = await query(
      `UPDATE sparks
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING *`,
      [sparkId, receiverId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all sparks for a user (sent and received)
   */
  async getSparksForUser(userId) {
    const result = await query(
      `SELECT s.*,
        sender.name AS sender_name, sender.email AS sender_email,
        sender.city AS sender_city, sender.age AS sender_age,
        receiver.name AS receiver_name, receiver.email AS receiver_email
       FROM sparks s
       JOIN users sender ON sender.id = s.sender_id
       JOIN users receiver ON receiver.id = s.receiver_id
       WHERE s.sender_id = $1 OR s.receiver_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Get pending sparks received by a user
   */
  async getPendingSparks(userId) {
    const result = await query(
      `SELECT s.*,
        u.name AS sender_name, u.email AS sender_email,
        u.city AS sender_city, u.age AS sender_age
       FROM sparks s
       JOIN users u ON u.id = s.sender_id
       WHERE s.receiver_id = $1 AND s.status = 'pending'
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Get spark statistics for a user
   */
  async getSparkStats(userId) {
    const result = await query(
      `SELECT
        COUNT(*) FILTER (WHERE sender_id = $1)      AS sent_count,
        COUNT(*) FILTER (WHERE receiver_id = $1)     AS received_count,
        COUNT(*) FILTER (WHERE receiver_id = $1 AND status = 'pending') AS pending_count,
        COUNT(*) FILTER (
          WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted'
        ) AS accepted_count,
        COUNT(*) FILTER (
          WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'rejected'
        ) AS rejected_count
       FROM sparks
       WHERE sender_id = $1 OR receiver_id = $1`,
      [userId]
    );
    return result.rows[0] || {};
  },
};

module.exports = Spark;
