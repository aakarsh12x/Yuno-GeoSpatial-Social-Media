require('dotenv').config();
const cron = require('node-cron');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-nine-orcin-70.vercel.app",
  "https://frontend-6sa6005p4-aakarsh12xs-projects.vercel.app",
  "https://frontend-1bb4xlg0f-aakarsh12xs-projects.vercel.app",
  "https://frontend-phq7cizpc-aakarsh12xs-projects.vercel.app",
  process.env.FRONTEND_URL,
  "*" // Optional but kept for broad compatibility
].filter(Boolean);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const sparksRoutes = require('./routes/sparks');
const discoverRoutes = require('./routes/discover');
const activitiesRoutes = require('./routes/activities');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sparks', sparksRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/activities', activitiesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Backend is running!'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('sendMessage', (data) => {
    // Handle real-time messaging
    socket.to(data.receiverId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // ── Geospatial Events ───────────────────────────────────────────────────

  socket.on('update_location', async (data) => {
    const { userId, latitude, longitude, userData } = data;
    if (!userId || latitude === undefined || longitude === undefined) return;

    // Update location in database (async, don't wait)
    User.update(userId, { latitude, longitude }).catch(err => 
      console.error(`Failed to update location for user ${userId}:`, err.message)
    );

    // Store in socket for proximity checks
    socket.userId = userId;
    socket.location = { latitude, longitude };
    socket.userData = userData;

    console.log(`📍 Real-time location update for ${userData?.name} (${userId}): ${latitude}, ${longitude}`);

    // Notify other users who are "discovering" this area
    // In a production app, we would use a more efficient spatial indexing (like Redis Geo)
    // For now, we'll iterate through connected sockets
    const sockets = await io.fetchSockets();
    for (const s of sockets) {
      if (s.id !== socket.id && s.discoveryParams) {
        const { lat: dLat, lng: dLng, radius: dRadius } = s.discoveryParams;
        
        // Simple Haversine distance check
        const distance = calculateDistance(latitude, longitude, dLat, dLng);
        if (distance <= dRadius) {
          s.emit('nearby_user_update', {
            userId,
            latitude,
            longitude,
            userData,
            timestamp: new Date()
          });
        }
      }
    }
  });

  socket.on('discover_nearby', async (data) => {
    const { latitude, longitude, radius = 10 } = data;
    if (latitude === undefined || longitude === undefined) return;

    // Store discovery parameters in socket session
    socket.discoveryParams = { lat: latitude, lng: longitude, radius };

    console.log(`🔍 User ${socket.id} discovering nearby in ${radius}km radius at ${latitude}, ${longitude}`);

    // Find all currently "active" users in the area from connected sockets
    const nearbyUsers = [];
    const sockets = await io.fetchSockets();
    
    for (const s of sockets) {
      if (s.id !== socket.id && s.location) {
        const distance = calculateDistance(latitude, longitude, s.location.latitude, s.location.longitude);
        if (distance <= radius) {
          nearbyUsers.push({
            socketId: s.id,
            userId: s.userId,
            userData: s.userData,
            distance: Math.round(distance * 100) / 100,
            latitude: s.location.latitude,
            longitude: s.location.longitude
          });
        }
      }
    }

    socket.emit('nearby_users', {
      users: nearbyUsers,
      radius,
      timestamp: new Date()
    });
  });
});

/**
 * Helper: Calculate Haversine distance in km
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO enabled`);

  // ── Keep-alive cron job for Render free tier ──────────────────────────────
  // Render spins down free instances after 15 min of inactivity.
  // We self-ping /health every 14 minutes to prevent that.
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  if (SELF_URL) {
    const axios = require('axios');
    cron.schedule('*/14 * * * *', async () => {
      try {
        const res = await axios.get(`${SELF_URL}/health`, { timeout: 10000 });
        console.log(`🏓 Keep-alive ping OK — ${res.data.timestamp}`);
      } catch (err) {
        console.error('❌ Keep-alive ping failed:', err.message);
      }
    });
    console.log(`⏰ Keep-alive cron started — pinging ${SELF_URL}/health every 14 min`);
  } else {
    console.log('ℹ️  Keep-alive cron disabled (set RENDER_EXTERNAL_URL or BACKEND_URL to enable)');
  }
  // ─────────────────────────────────────────────────────────────────────────
});