# Yuno - GeoSpatial Social Media Platform

A modern social media platform that connects people based on their location and shared interests. Built with Next.js, React, TypeScript, and Node.js.

## 🌟 Features

### Core Features
- **Location-Based Discovery**: Find people near you using geospatial queries
- **Real-Time Chat**: Instant messaging with Socket.IO integration
- **Spark System**: Send friend requests to nearby people
- **Profile Management**: Comprehensive user profiles with interests and details
- **Interactive Map**: Visual discovery with radius-based search
- **Authentication**: Secure login and registration system

### Technical Features
- **GeoSpatial Queries**: PostgreSQL with PostGIS for location-based searches
- **Real-Time Communication**: Socket.IO for live chat and notifications
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety across frontend and backend
- **Modern UI**: Beautiful components with Framer Motion animations

## 🚀 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL**: Primary database
- **PostGIS**: Geospatial extensions
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

## 📁 Project Structure

```
Yuno/
├── Frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── lib/             # Utility functions
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   └── package.json
├── Backend/                 # Node.js backend application
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── models/              # Database models
│   ├── scripts/             # Database scripts
│   └── package.json
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+ with PostGIS extension
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aakarsh12x/Yuno-GeoSpatial-Social-Media.git
   cd Yuno-GeoSpatial-Social-Media/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database with PostGIS
   createdb yuno_db
   psql yuno_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

4. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run Database Migrations**
   ```bash
   npm run migrate
   npm run seed
   ```

6. **Start Backend Server**
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

## 🎯 Key Features Implementation

### Location-Based Discovery
- Uses PostGIS for efficient geospatial queries
- Radius-based search (5km, 10km, 20km)
- Real-time location updates
- Distance calculations

### Real-Time Chat
- Socket.IO for instant messaging
- Message persistence in database
- Typing indicators
- Online status tracking

### Spark System
- Send friend requests to nearby people
- Accept/reject spark requests
- Commonality scoring based on interests
- Location-based matching

### User Profiles
- Comprehensive profile information
- Interest matching algorithm
- Privacy settings
- Location preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Discovery
- `GET /api/discover` - Find nearby users
- `GET /api/discover/stats` - Discovery statistics
- `GET /api/discover/popular-interests` - Popular interests

### Sparks
- `GET /api/sparks/nearby` - Nearby users for sparks
- `POST /api/sparks/send` - Send a spark
- `POST /api/sparks/accept` - Accept spark
- `POST /api/sparks/reject` - Reject spark

### Chat
- `GET /api/chat/chats` - User's chats
- `GET /api/chat/chats/:id` - Chat messages
- `POST /api/chat/send` - Send message

## 🌐 Socket.IO Events

### Client to Server
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `typing` - Typing indicator
- `update_location` - Update user location

### Server to Client
- `message` - New message received
- `chat_history` - Load chat history
- `typing` - User typing indicator
- `user_online` - User online status

## 🎨 UI Components

### Design System
- **Color Palette**: Primary, accent, and neutral colors
- **Typography**: Consistent font hierarchy
- **Spacing**: Tailwind CSS spacing system
- **Animations**: Framer Motion transitions

### Key Components
- **User Cards**: Profile display with commonalities
- **Chat Interface**: Real-time messaging
- **Map View**: Interactive location discovery
- **Settings Panel**: User preferences
- **Navigation**: Responsive sidebar and navbar

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Request data validation
- **Rate Limiting**: API request throttling

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts
- **Desktop Experience**: Full-featured desktop interface
- **Touch Interactions**: Mobile-friendly interactions

## 🚀 Deployment

### Backend Deployment
```bash
# Production build
npm run build
npm start
```

### Frontend Deployment
```bash
# Production build
npm run build
npm start
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/yuno_db
JWT_SECRET=your_jwt_secret
PORT=5000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aakarsh** - [aakarsh12x](https://github.com/aakarsh12x)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations
- Socket.IO for real-time communication
- PostGIS for geospatial capabilities

---

**Yuno** - Connecting people through location and shared interests 🌍✨
