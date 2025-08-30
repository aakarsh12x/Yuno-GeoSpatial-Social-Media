const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://frontend-nine-orcin-70.vercel.app', 'https://frontend-4m7felg4s-aakarsh12xs-projects.vercel.app', 'https://frontend-9ir8zrqjw-aakarsh12xs-projects.vercel.app', 'https://frontend-gmppctvni-aakarsh12xs-projects.vercel.app', 'https://frontend-ioh1tukxq-aakarsh12xs-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Test auth endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working',
    data: {
      token: 'test-token-123',
      user: {
        id: 1,
        name: 'Test User',
        email: req.body.email || 'test@example.com'
      }
    }
  });
});

// Test auth register endpoint
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Register endpoint working',
    data: {
      token: 'test-token-456',
      user: {
        id: 2,
        name: req.body.name || 'New User',
        email: req.body.email || 'new@example.com'
      }
    }
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

module.exports = app;
