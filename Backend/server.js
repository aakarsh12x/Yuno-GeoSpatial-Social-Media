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

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["https://frontend-nine-orcin-70.vercel.app", "https://frontend-6sa6005p4-aakarsh12xs-projects.vercel.app", "https://frontend-1bb4xlg0f-aakarsh12xs-projects.vercel.app", "https://frontend-phq7cizpc-aakarsh12xs-projects.vercel.app", "*"],
    methods: ["GET", "POST"],
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
  origin: ["https://frontend-nine-orcin-70.vercel.app", "https://frontend-6sa6005p4-aakarsh12xs-projects.vercel.app", "https://frontend-1bb4xlg0f-aakarsh12xs-projects.vercel.app", "https://frontend-phq7cizpc-aakarsh12xs-projects.vercel.app", "*"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sparks', sparksRoutes);
app.use('/api/discover', discoverRoutes);

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
});

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