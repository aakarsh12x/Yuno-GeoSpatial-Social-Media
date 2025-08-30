const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Test routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/sparks/nearby', (req, res) => {
  res.json({
    success: true,
    message: 'Sparks nearby endpoint working',
    data: []
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📖 Test endpoint: http://localhost:${PORT}/api`);
  console.log(`⚡ Sparks endpoint: http://localhost:${PORT}/api/sparks/nearby`);
});
