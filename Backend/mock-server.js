const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Mock middleware for auth (just for testing)
const mockAuth = (req, res, next) => {
  req.user = { id: 1, name: 'Test User', email: 'test@example.com' };
  next();
};

// Mock data
const mockUsers = [
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    age: 24,
    city: 'Mumbai',
    school: 'St. Xavier\'s College',
    college: 'Mumbai University',
    workplace: 'Tech Solutions',
    interests: ['music', 'travel', 'tech', 'reading'],
    commonalities: {
      school: 'St. Xavier\'s College',
      interests: ['music', 'tech']
    }
  },
  {
    id: 3,
    name: 'Arjun Singh',
    email: 'arjun@example.com',
    age: 26,
    city: 'Delhi',
    school: 'Delhi Public School',
    college: 'Delhi University',
    workplace: 'StartupXYZ',
    interests: ['sports', 'tech', 'cooking', 'gaming'],
    commonalities: {
      school: 'Delhi Public School',
      interests: ['tech', 'sports']
    }
  },
  {
    id: 4,
    name: 'Ananya Patel',
    email: 'ananya@example.com',
    age: 22,
    city: 'Bangalore',
    school: 'Christ University',
    college: 'Christ University',
    workplace: 'Innovation Labs',
    interests: ['gaming', 'tech', 'travel', 'movies'],
    commonalities: {
      school: 'Christ University',
      interests: ['tech', 'gaming']
    }
  }
];

const mockSparks = [
  {
    id: 1,
    sender_id: 3,
    receiver_id: 1,
    status: 'pending',
    message: 'Hey! I noticed we both love tech. Want to connect?',
    created_at: new Date().toISOString(),
    sender_name: 'Arjun Singh',
    sender_email: 'arjun@example.com',
    sender_city: 'Delhi',
    sender_age: 26
  }
];

// Mock users for auth
const mockAuthUsers = [
  {
    id: 1,
    name: 'Aakarsh',
    email: 'user123@example.com',
    password: 'user', // In real app, this would be hashed
    age: 25,
    city: 'Mumbai',
    school: 'St. Xavier\'s College',
    college: 'Mumbai University',
    workplace: 'Tech Solutions',
    interests: ['music', 'travel', 'tech', 'reading'],
    latitude: 19.0760,
    longitude: 72.8777
  }
];

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  console.log(`📝 Registering user: ${name} (${email})`);
  
  // Check if user already exists
  const existingUser = mockAuthUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create new user
  const newUser = {
    id: mockAuthUsers.length + 1,
    name,
    email,
    password,
    age: 25,
    city: 'Mumbai',
    school: 'St. Xavier\'s College',
    college: 'Mumbai University',
    workplace: 'Tech Solutions',
    interests: ['music', 'travel', 'tech'],
    latitude: 19.0760,
    longitude: 72.8777
  };
  
  mockAuthUsers.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        city: newUser.city,
        school: newUser.school,
        college: newUser.college,
        workplace: newUser.workplace,
        interests: newUser.interests,
        latitude: newUser.latitude,
        longitude: newUser.longitude
      },
      tokens: {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt: ${email}`);
  
  // Find user
  const user = mockAuthUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        city: user.city,
        school: user.school,
        college: user.college,
        workplace: user.workplace,
        interests: user.interests,
        latitude: user.latitude,
        longitude: user.longitude
      },
      tokens: {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    }
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Yuno Mock Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      sparks: {
        nearby: 'GET /api/sparks/nearby',
        pending: 'GET /api/sparks/pending',
        send: 'POST /api/sparks/send'
      }
    }
  });
});

app.get('/api/sparks/nearby', mockAuth, (req, res) => {
  const { radius = 10 } = req.query;
  console.log(`📍 Getting nearby users within ${radius}km`);
  
  res.json({
    success: true,
    data: mockUsers
  });
});

app.get('/api/sparks/pending', mockAuth, (req, res) => {
  console.log('📨 Getting pending sparks');
  
  res.json({
    success: true,
    data: mockSparks
  });
});

app.post('/api/sparks/send', mockAuth, (req, res) => {
  const { receiverId, message } = req.body;
  console.log(`⚡ Sending spark to user ${receiverId}: ${message}`);
  
  res.json({
    success: true,
    message: 'Spark sent successfully',
    data: {
      id: Date.now(),
      sender_id: req.user.id,
      receiver_id: receiverId,
      message: message,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  });
});

app.post('/api/sparks/:sparkId/accept', mockAuth, (req, res) => {
  const { sparkId } = req.params;
  console.log(`✅ Accepting spark ${sparkId}`);
  
  res.json({
    success: true,
    message: 'Spark accepted successfully',
    data: {
      spark: { id: sparkId, status: 'accepted' },
      chatId: Date.now()
    }
  });
});

app.post('/api/sparks/:sparkId/reject', mockAuth, (req, res) => {
  const { sparkId } = req.params;
  console.log(`❌ Rejecting spark ${sparkId}`);
  
  res.json({
    success: true,
    message: 'Spark rejected successfully',
    data: { id: sparkId, status: 'rejected' }
  });
});

// Chat endpoints
app.get('/api/chat/user/chats', mockAuth, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        chat_type: 'direct',
        participants: [
          { id: 1, name: 'Test User', email: 'test@example.com' },
          { id: 2, name: 'Alice Johnson', email: 'alice@example.com' }
        ]
      }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO placeholder
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`👥 User ${socket.id} joined chat: ${chatId}`);
    socket.emit('chat_history', []);
  });
  
  socket.on('send_message', (data) => {
    const { chatId, message } = data;
    const messageObj = {
      id: Date.now().toString(),
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
      chatId: chatId,
      isOwn: false
    };
    
    socket.to(chatId).emit('message', messageObj);
    console.log(`💬 Message sent in chat ${chatId}:`, message.text);
  });
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log('🚀 Yuno Mock Backend Server Started!');
  console.log(`📊 Environment: development (mock mode)`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API info: http://localhost:${PORT}/api`);
  console.log(`⚡ Sparks endpoint: http://localhost:${PORT}/api/sparks/nearby`);
  console.log(`💬 Socket.IO: ✅ Enabled with mock chat support`);
});
