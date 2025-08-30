const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.chatRooms = new Map();
    this.connectedUsers = new Map();
    this.userLocations = new Map(); // Track user locations for geospatial discovery
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001'
        ],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('🔌 Socket.IO service initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('👤 User connected:', socket.id);
      this.connectedUsers.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        rooms: new Set()
      });

      // Join a chat room
      socket.on('join_chat', (chatId) => {
        this.handleJoinChat(socket, chatId);
      });

      // Handle incoming messages
      socket.on('send_message', (data) => {
        this.handleSendMessage(socket, data);
      });

      // Handle user typing
      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      // Handle user stop typing
      socket.on('stop_typing', (data) => {
        this.handleStopTyping(socket, data);
      });

      // Handle user status updates
      socket.on('update_status', (status) => {
        this.handleStatusUpdate(socket, status);
      });

      // Handle user location updates for geospatial discovery
      socket.on('update_location', (data) => {
        this.handleLocationUpdate(socket, data);
      });

      // Handle geospatial discovery requests
      socket.on('discover_nearby', (data) => {
        this.handleDiscoverNearby(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  handleJoinChat(socket, chatId) {
    try {
      // Leave previous rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      // Join new chat room
      socket.join(chatId);
      
      // Update user's room tracking
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        user.rooms.add(chatId);
      }

      console.log(`👥 User ${socket.id} joined chat: ${chatId}`);
      
      // Send chat history if available
      if (this.chatRooms.has(chatId)) {
        const chatHistory = this.chatRooms.get(chatId).map(msg => ({
          ...msg,
          isOwn: false // Will be determined by frontend based on sender
        }));
        socket.emit('chat_history', chatHistory);
      } else {
        socket.emit('chat_history', []);
      }

      // Notify other users in the room
      socket.to(chatId).emit('user_joined', {
        userId: socket.id,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  }

  handleSendMessage(socket, data) {
    try {
      const { chatId, message } = data;
      
      if (!chatId || !message || !message.text) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      // Create message object that matches frontend interface
      const messageObj = {
        id: message.id || Date.now().toString(),
        text: message.text,
        sender: message.sender || 'Anonymous',
        timestamp: message.timestamp || new Date(),
        isOwn: message.isOwn || false,
        chatId: chatId
      };

      // Store message in chat room
      if (!this.chatRooms.has(chatId)) {
        this.chatRooms.set(chatId, []);
      }
      this.chatRooms.get(chatId).push(messageObj);

      // Keep only last 100 messages per room
      const messages = this.chatRooms.get(chatId);
      if (messages.length > 100) {
        this.chatRooms.set(chatId, messages.slice(-100));
      }

      // Broadcast message to all OTHER users in the chat room (not the sender)
      socket.to(chatId).emit('message', {
        ...messageObj,
        isOwn: false // Always false for recipients
      });

      // The sender already added the message to their local state,
      // so we don't need to send it back unless there's an error
      console.log(`💬 Message sent in chat ${chatId}:`, message.text);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTyping(socket, data) {
    try {
      const { chatId, isTyping } = data;
      socket.to(chatId).emit('user_typing', {
        userId: socket.id,
        isTyping: isTyping
      });
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  }

  handleStopTyping(socket, data) {
    try {
      const { chatId } = data;
      socket.to(chatId).emit('user_stop_typing', {
        userId: socket.id
      });
    } catch (error) {
      console.error('Error handling stop typing:', error);
    }
  }

  handleStatusUpdate(socket, status) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        user.status = status;
        user.lastStatusUpdate = new Date();
      }

      // Broadcast status update to all connected users
      this.io.emit('user_status_update', {
        userId: socket.id,
        status: status,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  handleLocationUpdate(socket, data) {
    try {
      const { latitude, longitude, userId, userData } = data;
      
      // Store user location
      this.userLocations.set(socket.id, {
        userId: userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        userData: userData,
        lastUpdate: new Date()
      });

      console.log(`📍 User ${userId} location updated: ${latitude}, ${longitude}`);

      // Broadcast to nearby users (within 20km)
      this.broadcastToNearbyUsers(socket.id, latitude, longitude, 20, {
        type: 'user_location_update',
        userId: userId,
        userData: userData,
        latitude: latitude,
        longitude: longitude,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  handleDiscoverNearby(socket, data) {
    try {
      const { latitude, longitude, radius = 20 } = data;
      
      // Find nearby users
      const nearbyUsers = this.findNearbyUsers(latitude, longitude, radius);
      
      // Send nearby users to requesting user
      socket.emit('nearby_users', {
        users: nearbyUsers,
        radius: radius,
        timestamp: new Date()
      });

      console.log(`🔍 User ${socket.id} discovered ${nearbyUsers.length} nearby users`);

    } catch (error) {
      console.error('Error discovering nearby users:', error);
    }
  }

  findNearbyUsers(latitude, longitude, radiusKm) {
    const nearbyUsers = [];
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    for (const [socketId, locationData] of this.userLocations) {
      const distance = this.calculateDistance(
        userLat, userLng,
        locationData.latitude, locationData.longitude
      );

      if (distance <= radiusKm) {
        nearbyUsers.push({
          socketId: socketId,
          userId: locationData.userId,
          userData: locationData.userData,
          distance: distance,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        });
      }
    }

    return nearbyUsers.sort((a, b) => a.distance - b.distance);
  }

  broadcastToNearbyUsers(excludeSocketId, latitude, longitude, radiusKm, data) {
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    for (const [socketId, locationData] of this.userLocations) {
      if (socketId === excludeSocketId) continue;

      const distance = this.calculateDistance(
        userLat, userLng,
        locationData.latitude, locationData.longitude
      );

      if (distance <= radiusKm) {
        // Send to nearby user
        this.sendToUser(socketId, 'nearby_user_update', data);
      }
    }
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  handleDisconnect(socket) {
    try {
      console.log('👤 User disconnected:', socket.id);
      
      // Remove user from tracking
      this.connectedUsers.delete(socket.id);
      this.userLocations.delete(socket.id);

      // Notify other users about disconnection
      this.io.emit('user_disconnected', {
        userId: socket.id,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get chat rooms count
  getChatRoomsCount() {
    return this.chatRooms.size;
  }

  // Get server stats
  getStats() {
    return {
      connectedUsers: this.getConnectedUsersCount(),
      chatRooms: this.getChatRoomsCount(),
      totalMessages: Array.from(this.chatRooms.values()).reduce((total, messages) => total + messages.length, 0)
    };
  }

  // Broadcast to all users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Send to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(userId).emit(event, data);
    }
  }

  // Send to specific room
  sendToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }
}

module.exports = new SocketService();
