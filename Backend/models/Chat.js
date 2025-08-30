const { query, transaction } = require('../database/connection');

class Chat {
  /**
   * Create a new chat
   * @param {string} chatType - Type of chat ('direct' or 'group')
   * @returns {object} - Created chat
   */
  static async createChat(chatType = 'direct') {
    const result = await query(`
      INSERT INTO chats (chat_type)
      VALUES ($1)
      RETURNING id, chat_type, created_at, updated_at
    `, [chatType]);

    return result.rows[0];
  }

  /**
   * Add participants to a chat
   * @param {number} chatId - ID of the chat
   * @param {array} userIds - Array of user IDs to add
   * @returns {array} - Added participants
   */
  static async addParticipants(chatId, userIds) {
    const participants = [];
    
    for (const userId of userIds) {
      const result = await query(`
        INSERT INTO chat_participants (chat_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (chat_id, user_id) DO NOTHING
        RETURNING id, chat_id, user_id, joined_at, last_read_at
      `, [chatId, userId]);

      if (result.rows.length > 0) {
        participants.push(result.rows[0]);
      }
    }

    return participants;
  }

  /**
   * Get all chats for a user
   * @param {number} userId - ID of the user
   * @returns {array} - Array of chats with participant info
   */
  static async getChatsForUser(userId) {
    const result = await query(`
      SELECT 
        c.id,
        c.chat_type,
        c.created_at,
        c.updated_at,
        cp.joined_at,
        cp.last_read_at,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.chat_id = c.id
        ) as message_count,
        (
          SELECT m.content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message_time
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC
    `, [userId]);

    // Get participants for each chat
    const chatsWithParticipants = await Promise.all(
      result.rows.map(async (chat) => {
        const participantsResult = await query(`
          SELECT 
            u.id,
            u.name,
            u.email,
            u.city,
            u.school,
            u.college,
            u.workplace,
            u.interests,
            cp.joined_at,
            cp.last_read_at
          FROM chat_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.chat_id = $1
        `, [chat.id]);

        return {
          ...chat,
          participants: participantsResult.rows
        };
      })
    );

    return chatsWithParticipants;
  }

  /**
   * Get a specific chat with messages
   * @param {number} chatId - ID of the chat
   * @param {number} userId - ID of the user requesting the chat
   * @param {number} limit - Number of messages to return
   * @param {number} offset - Offset for pagination
   * @returns {object} - Chat with messages and participants
   */
  static async getChatWithMessages(chatId, userId, limit = 50, offset = 0) {
    // Verify user is participant
    const participantResult = await query(`
      SELECT * FROM chat_participants
      WHERE chat_id = $1 AND user_id = $2
    `, [chatId, userId]);

    if (participantResult.rows.length === 0) {
      throw new Error('User is not a participant in this chat');
    }

    // Get chat info
    const chatResult = await query(`
      SELECT * FROM chats WHERE id = $1
    `, [chatId]);

    if (chatResult.rows.length === 0) {
      throw new Error('Chat not found');
    }

    const chat = chatResult.rows[0];

    // Get participants
    const participantsResult = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.city,
        u.school,
        u.college,
        u.workplace,
        u.interests,
        cp.joined_at,
        cp.last_read_at
      FROM chat_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.chat_id = $1
    `, [chatId]);

    // Get messages
    const messagesResult = await query(`
      SELECT 
        m.id,
        m.content,
        m.message_type,
        m.created_at,
        m.updated_at,
        u.id as sender_id,
        u.name as sender_name,
        u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [chatId, limit, offset]);

    // Update last read time
    await query(`
      UPDATE chat_participants
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE chat_id = $1 AND user_id = $2
    `, [chatId, userId]);

    return {
      chat: chat,
      participants: participantsResult.rows,
      messages: messagesResult.rows.reverse() // Reverse to get chronological order
    };
  }

  /**
   * Add a message to a chat
   * @param {number} chatId - ID of the chat
   * @param {number} senderId - ID of the sender
   * @param {string} content - Message content
   * @param {string} messageType - Type of message ('text', 'image', 'file', 'system')
   * @returns {object} - Created message
   */
  static async addMessage(chatId, senderId, content, messageType = 'text') {
    const result = await query(`
      INSERT INTO messages (chat_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, chat_id, sender_id, content, message_type, created_at, updated_at
    `, [chatId, senderId, content, messageType]);

    // Update chat's updated_at timestamp
    await query(`
      UPDATE chats
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [chatId]);

    return result.rows[0];
  }

  /**
   * Get unread message count for a user in a chat
   * @param {number} chatId - ID of the chat
   * @param {number} userId - ID of the user
   * @returns {number} - Number of unread messages
   */
  static async getUnreadCount(chatId, userId) {
    const result = await query(`
      SELECT COUNT(*)
      FROM messages m
      JOIN chat_participants cp ON m.chat_id = cp.chat_id
      WHERE m.chat_id = $1 
        AND cp.user_id = $2 
        AND m.created_at > cp.last_read_at
        AND m.sender_id != $2
    `, [chatId, userId]);

    return parseInt(result.rows[0].count);
  }

  /**
   * Mark messages as read for a user in a chat
   * @param {number} chatId - ID of the chat
   * @param {number} userId - ID of the user
   * @returns {object} - Updated participant info
   */
  static async markAsRead(chatId, userId) {
    const result = await query(`
      UPDATE chat_participants
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE chat_id = $1 AND user_id = $2
      RETURNING id, chat_id, user_id, joined_at, last_read_at
    `, [chatId, userId]);

    return result.rows[0];
  }

  /**
   * Get direct chat between two users
   * @param {number} userId1 - First user ID
   * @param {number} userId2 - Second user ID
   * @returns {object|null} - Chat object or null if not found
   */
  static async getDirectChat(userId1, userId2) {
    const result = await query(`
      SELECT c.*
      FROM chats c
      JOIN chat_participants cp1 ON c.id = cp1.chat_id
      JOIN chat_participants cp2 ON c.id = cp2.chat_id
      WHERE c.chat_type = 'direct'
        AND cp1.user_id = $1
        AND cp2.user_id = $2
        AND cp1.user_id != cp2.user_id
    `, [userId1, userId2]);

    return result.rows[0] || null;
  }
}

module.exports = Chat;
