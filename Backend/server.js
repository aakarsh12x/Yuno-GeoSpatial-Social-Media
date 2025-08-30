require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://frontend-nine-orcin-70.vercel.app', 'https://frontend-4m7felg4s-aakarsh12xs-projects.vercel.app', 'https://frontend-9ir8zrqjw-aakarsh12xs-projects.vercel.app', 'https://frontend-gmppctvni-aakarsh12xs-projects.vercel.app', 'https://frontend-ioh1tukxq-aakarsh12xs-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Backend is running on Render!'
  });
});

// Test auth login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'render-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Test User',
        email: req.body.email || 'test@example.com',
        latitude: 19.0760,
        longitude: 72.8777
      }
    }
  });
});

// Test auth register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      token: 'render-token-' + Date.now(),
      user: {
        id: 2,
        name: req.body.name || 'New User',
        email: req.body.email || 'new@example.com',
        latitude: 19.0760,
        longitude: 72.8777
      }
    }
  });
});

// Test discover endpoint
app.get('/api/discover', (req, res) => {
  console.log('Discover request:', req.query);
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Priya Sharma',
        email: 'priya@example.com',
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Design', 'Music', 'Travel'],
        common_interests: ['Design', 'Music']
      },
      {
        id: 2,
        name: 'Aisha Khan',
        email: 'aisha@example.com',
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Technology', 'Reading', 'Cooking'],
        common_interests: ['Technology']
      },
      {
        id: 3,
        name: 'Meera Patel',
        email: 'meera@example.com',
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Art', 'Photography', 'Travel'],
        common_interests: ['Art', 'Travel']
      }
    ]
  });
});

// Test sparks endpoint
app.get('/api/sparks/nearby', (req, res) => {
  console.log('Sparks nearby request:', req.query);
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Priya Sharma',
        email: 'priya@example.com',
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Design', 'Music', 'Travel'],
        common_interests: ['Design', 'Music']
      },
      {
        id: 2,
        name: 'Aisha Khan',
        email: 'aisha@example.com',
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Technology', 'Reading', 'Cooking'],
        common_interests: ['Technology']
      }
    ]
  });
});

// Test chat endpoint
app.get('/api/chat/chats', (req, res) => {
  console.log('Chat request');
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Priya Sharma',
        lastMessage: 'Hey! How are you?',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Aisha Khan',
        lastMessage: 'Nice to meet you!',
        timestamp: new Date().toISOString()
      }
    ]
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
