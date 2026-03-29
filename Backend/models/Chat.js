const { query } = require('../database/connection');

const Chat = {
  /**
   * Get all chats for a user with last message & participant info
   */
  async getChatsForUser(userId) {
    try {
      const result = await query(
        `SELECT
          c.id, c.chat_type, c.created_at,
          -- Participants
          ARRAY_AGG(
            JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'email', u.email)
          ) AS participants
         FROM chats c
         JOIN chat_participants cp ON cp.chat_id = c.id
         JOIN users u ON u.id = cp.user_id
         WHERE c.id IN (
           SELECT chat_id FROM chat_participants WHERE user_id = $1
         )
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch {
      return [];
    }
  },

  /**
   * Get a single chat with paginated messages
   */
  async getChatWithMessages(chatId, userId, limit = 50, offset = 0) {
    try {
      // Verify user is a participant
      const participantCheck = await query(
        `SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2 LIMIT 1`,
        [chatId, userId]
      );
      if (participantCheck.rows.length === 0) {
        throw new Error('Access denied to this chat');
      }

      // Get chat info
      const chatResult = await query(
        `SELECT c.*, ARRAY_AGG(
          JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'email', u.email)
         ) AS participants
         FROM chats c
         JOIN chat_participants cp ON cp.chat_id = c.id
         JOIN users u ON u.id = cp.user_id
         WHERE c.id = $1
         GROUP BY c.id`,
        [chatId]
      );
      const chat = chatResult.rows[0];

      // Get messages
      const messagesResult = await query(
        `SELECT m.*, u.name AS sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.chat_id = $1
         ORDER BY m.created_at DESC
         LIMIT $2 OFFSET $3`,
        [chatId, limit, offset]
      );

      return { ...chat, messages: messagesResult.rows };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Mark all messages in a chat as read for a user
   */
  async markAsRead(chatId, userId) {
    try {
      await query(
        `UPDATE messages SET read_at = NOW()
         WHERE chat_id = $1 AND sender_id != $2 AND read_at IS NULL`,
        [chatId, userId]
      );
    } catch {
      // Fail silently if messages table doesn't have read_at column
    }
  },
};

module.exports = Chat;
