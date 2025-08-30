const { query, transaction } = require('../database/connection');

class Spark {
  /**
   * Send a spark (friend request)
   * @param {number} senderId - ID of the user sending the spark
   * @param {number} receiverId - ID of the user receiving the spark
   * @param {string} message - Optional message with the spark
   * @returns {object} - Created spark
   */
  static async sendSpark(senderId, receiverId, message = null) {
    const result = await query(`
      INSERT INTO sparks (sender_id, receiver_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, sender_id, receiver_id, status, message, created_at
    `, [senderId, receiverId, message]);

    return result.rows[0];
  }

  /**
   * Accept a spark (friend request)
   * @param {number} sparkId - ID of the spark to accept
   * @param {number} receiverId - ID of the user accepting the spark
   * @returns {object} - Updated spark and created chat
   */
  static async acceptSpark(sparkId, receiverId) {
    return await transaction(async (client) => {
      // Update spark status
      const sparkResult = await client.query(`
        UPDATE sparks 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
        RETURNING id, sender_id, receiver_id, status, message, created_at
      `, [sparkId, receiverId]);

      if (sparkResult.rows.length === 0) {
        throw new Error('Spark not found or already processed');
      }

      const spark = sparkResult.rows[0];

      // Create a new chat
      const chatResult = await client.query(`
        INSERT INTO chats (chat_type)
        VALUES ('direct')
        RETURNING id
      `);

      const chatId = chatResult.rows[0].id;

      // Add both users to the chat
      await client.query(`
        INSERT INTO chat_participants (chat_id, user_id)
        VALUES ($1, $2), ($1, $3)
      `, [chatId, spark.sender_id, spark.receiver_id]);

      // Add a system message
      await client.query(`
        INSERT INTO messages (chat_id, sender_id, content, message_type)
        VALUES ($1, $2, 'You are now connected! Start chatting.', 'system')
      `, [chatId, spark.sender_id]);

      return {
        spark: spark,
        chatId: chatId
      };
    });
  }

  /**
   * Reject a spark (friend request)
   * @param {number} sparkId - ID of the spark to reject
   * @param {number} receiverId - ID of the user rejecting the spark
   * @returns {object} - Updated spark
   */
  static async rejectSpark(sparkId, receiverId) {
    const result = await query(`
      UPDATE sparks 
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
      RETURNING id, sender_id, receiver_id, status, message, created_at
    `, [sparkId, receiverId]);

    return result.rows[0];
  }

  /**
   * Get all sparks for a user (sent and received)
   * @param {number} userId - ID of the user
   * @returns {object} - Object with sent and received sparks
   */
  static async getSparksForUser(userId) {
    const sentResult = await query(`
      SELECT s.*, 
             u.name as receiver_name, 
             u.email as receiver_email,
             u.city as receiver_city,
             u.school as receiver_school,
             u.college as receiver_college,
             u.workplace as receiver_workplace,
             u.interests as receiver_interests
      FROM sparks s
      JOIN users u ON s.receiver_id = u.id
      WHERE s.sender_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);

    const receivedResult = await query(`
      SELECT s.*, 
             u.name as sender_name, 
             u.email as sender_email,
             u.city as sender_city,
             u.school as sender_school,
             u.college as sender_college,
             u.workplace as sender_workplace,
             u.interests as sender_interests
      FROM sparks s
      JOIN users u ON s.sender_id = u.id
      WHERE s.receiver_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);

    return {
      sent: sentResult.rows,
      received: receivedResult.rows
    };
  }

  /**
   * Get pending sparks received by a user
   * @param {number} userId - ID of the user
   * @returns {array} - Array of pending sparks
   */
  static async getPendingSparks(userId) {
    const result = await query(`
      SELECT s.*, 
             u.name as sender_name, 
             u.email as sender_email,
             u.city as sender_city,
             u.school as sender_school,
             u.college as sender_college,
             u.workplace as sender_workplace,
             u.interests as sender_interests,
             u.age as sender_age
      FROM sparks s
      JOIN users u ON s.sender_id = u.id
      WHERE s.receiver_id = $1 AND s.status = 'pending'
      ORDER BY s.created_at DESC
    `, [userId]);

    return result.rows;
  }

  /**
   * Check if a spark already exists between two users
   * @param {number} senderId - ID of the sender
   * @param {number} receiverId - ID of the receiver
   * @returns {object|null} - Existing spark or null
   */
  static async getExistingSpark(senderId, receiverId) {
    const result = await query(`
      SELECT * FROM sparks 
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
    `, [senderId, receiverId]);

    return result.rows[0] || null;
  }

  /**
   * Get spark statistics for a user
   * @param {number} userId - ID of the user
   * @returns {object} - Spark statistics
   */
  static async getSparkStats(userId) {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE sender_id = $1 AND status = 'pending') as sent_pending,
        COUNT(*) FILTER (WHERE receiver_id = $1 AND status = 'pending') as received_pending,
        COUNT(*) FILTER (WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE sender_id = $1 AND status = 'rejected') as sent_rejected,
        COUNT(*) FILTER (WHERE receiver_id = $1 AND status = 'rejected') as received_rejected
      FROM sparks
      WHERE sender_id = $1 OR receiver_id = $1
    `, [userId]);

    return result.rows[0];
  }
}

module.exports = Spark;
