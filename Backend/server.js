require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

// Import database connection
const { testConnection } = require('./database/connection');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const discoverRoutes = require('./routes/discover');
const chatRoutes = require('./routes/chat');
const sparkRoutes = require('./routes/sparks');

// Import Socket.IO service
const socketService = require('./services/socketService');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ]
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 auth requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO stats endpoint
app.get('/socket-stats', (req, res) => {
  res.json({
    success: true,
    message: 'Socket.IO Statistics',
    stats: socketService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - prevents 404 errors
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Yuno Backend API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      api_info: 'GET /api',
      discover: 'GET /api/discover?radius=10'
    },
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Yuno Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        logoutAll: 'POST /api/auth/logout-all'
      },
      user: {
        profile: 'GET /api/user/profile/me',
        updateProfile: 'PUT /api/user/profile',
        getUser: 'GET /api/user/:id',
        search: 'GET /api/user/search',
        deleteAccount: 'DELETE /api/user/profile'
      },
      discovery: {
        discover: 'GET /api/discover',
        stats: 'GET /api/discover/stats',
        popularInterests: 'GET /api/discover/popular-interests'
      },
      chat: {
        stats: 'GET /api/chat/stats',
        rooms: 'GET /api/chat/rooms',
        roomMessages: 'GET /api/chat/rooms/:roomId/messages',
        users: 'GET /api/chat/users',
        broadcast: 'POST /api/chat/broadcast',
        roomMessage: 'POST /api/chat/rooms/:roomId/message'
      },
      sparks: {
        send: 'POST /api/sparks/send',
        accept: 'POST /api/sparks/:sparkId/accept',
        reject: 'POST /api/sparks/:sparkId/reject',
        getAll: 'GET /api/sparks',
        getPending: 'GET /api/sparks/pending',
        getStats: 'GET /api/sparks/stats',
        getNearby: 'GET /api/sparks/nearby'
      }
    },
    documentation: 'https://github.com/your-org/yuno-backend/blob/main/README.md'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sparks', sparkRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const startServer = async () => {
  try {
    // Test database connection - required for proper functionality
    console.log('🔍 Testing database connection...');
    try {
      await testConnection();
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      console.error('');
      console.error('Please set up a proper database connection:');
      console.error('1. Create a PostgreSQL database with PostGIS extension');
      console.error('2. Set the DATABASE_URL in your .env file');
      console.error('3. Run npm run setup or npm run setup:conn with your connection string');
      console.error('');
      console.error('See SETUP_DATABASE.md for detailed instructions');
      process.exit(1);
    }
    
    // Initialize Socket.IO service
    console.log('🔌 Initializing Socket.IO service...');
    socketService.initialize(server);
    
    // Start the server
    server.listen(PORT, () => {
      console.log('🚀 Yuno Backend Server Started!');
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API info: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO stats: http://localhost:${PORT}/socket-stats`);
      
      if (NODE_ENV === 'development') {
        console.log('\n📝 Development Mode - Additional Info:');
        console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
        console.log(`🗄️  Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
        console.log(`💬 Socket.IO: ✅ Enabled with real-time chat support`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
