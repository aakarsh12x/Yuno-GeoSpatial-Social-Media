const express = require('express');
const router = express.Router();
const socketService = require('../services/socketService');
const Chat = require('../models/Chat');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Get user's chats
router.get('/user/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.getChatsForUser(userId);
    
    res.json({
      success: true,
      message: 'User chats retrieved successfully',
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user chats',
      error: error.message
    });
  }
});

// Get specific chat with messages
router.get('/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const chat = await Chat.getChatWithMessages(
      parseInt(chatId), 
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      message: 'Chat retrieved successfully',
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat',
      error: error.message
    });
  }
});

// Mark chat as read
router.post('/chats/:chatId/read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    await Chat.markAsRead(parseInt(chatId), userId);
    
    res.json({
      success: true,
      message: 'Chat marked as read successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark chat as read',
      error: error.message
    });
  }
});

// Get chat statistics
router.get('/stats', (req, res) => {
  try {
    const stats = socketService.getStats();
    res.json({
      success: true,
      message: 'Chat statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat statistics',
      error: error.message
    });
  }
});

// Get chat rooms list
router.get('/rooms', (req, res) => {
  try {
    const rooms = Array.from(socketService.chatRooms.keys()).map(roomId => ({
      id: roomId,
      messageCount: socketService.chatRooms.get(roomId).length,
      lastMessage: socketService.chatRooms.get(roomId).slice(-1)[0] || null
    }));

    res.json({
      success: true,
      message: 'Chat rooms retrieved successfully',
      data: {
        rooms,
        totalRooms: rooms.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat rooms',
      error: error.message
    });
  }
});

// Get chat history for a specific room
router.get('/rooms/:roomId/messages', (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!socketService.chatRooms.has(roomId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    const messages = socketService.chatRooms.get(roomId);
    const paginatedMessages = messages
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse(); // Most recent first

    res.json({
      success: true,
      message: 'Chat messages retrieved successfully',
      data: {
        messages: paginatedMessages,
        totalMessages: messages.length,
        hasMore: parseInt(offset) + parseInt(limit) < messages.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat messages',
      error: error.message
    });
  }
});

// Get connected users
router.get('/users', (req, res) => {
  try {
    const users = Array.from(socketService.connectedUsers.values()).map(user => ({
      id: user.id,
      connectedAt: user.connectedAt,
      status: user.status || 'online',
      rooms: Array.from(user.rooms || [])
    }));

    res.json({
      success: true,
      message: 'Connected users retrieved successfully',
      data: {
        users,
        totalUsers: users.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve connected users',
      error: error.message
    });
  }
});

// Broadcast message to all users (admin only)
router.post('/broadcast', (req, res) => {
  try {
    const { message, event = 'broadcast' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    socketService.broadcast(event, {
      message,
      timestamp: new Date(),
      from: 'System'
    });

    res.json({
      success: true,
      message: 'Broadcast message sent successfully',
      data: {
        event,
        message,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast message',
      error: error.message
    });
  }
});

// Send message to specific room (admin only)
router.post('/rooms/:roomId/message', (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, event = 'system_message' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!socketService.chatRooms.has(roomId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    socketService.sendToRoom(roomId, event, {
      message,
      timestamp: new Date(),
      from: 'System'
    });

    res.json({
      success: true,
      message: 'Room message sent successfully',
      data: {
        roomId,
        event,
        message,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send room message',
      error: error.message
    });
  }
});

module.exports = router;
