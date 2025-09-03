# Yuno - GeoSpatial Social Media Platform

A modern social media platform that connects people based on their location and shared interests. Built with Next.js, Node.js, PostgreSQL, and Socket.IO.
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/8593fec5-b255-482b-bbc3-b657316a15f6" />

<img width="1902" height="910" alt="Screenshot 2025-08-31 123155" src="https://github.com/user-attachments/assets/e78e43d9-01fc-4a7c-bfc2-86666fdabccd" />


## 🌟 Features

### Core Features
- **Location-Based Discovery**: Find people within 5km, 10km, or 20km radius
- **Real-Time Chat**: Instant messaging with Socket.IO
- **Spark System**: Send friend requests to nearby people
- **Profile Management**: Comprehensive user profiles with interests
- **Interactive Map**: Visual representation of nearby users
- **Commonality Matching**: Find people with shared interests and attributes

### Technical Features
- **Real-Time Communication**: WebSocket-based chat system
- **Geospatial Queries**: PostgreSQL with PostGIS for location-based searches
- **Authentication**: JWT-based secure authentication
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful interface with Framer Motion animations

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database
- **PostGIS** - Geospatial extension
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

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
├── Backend/                  # Node.js backend application
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── models/              # Database models
│   ├── scripts/             # Database scripts
│   ├── middleware/          # Express middleware
│   └── server.js            # Entry point
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+ with PostGIS extension
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aakarsh12x/Yuno-GeoSpatial-Social-Media.git
   cd Yuno-GeoSpatial-Social-Media
   ```

2. **Install backend dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb yuno_db
   
   # Enable PostGIS extension
   psql yuno_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file in Backend directory
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=yuno_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed initial data**
   ```bash
   npm run seed
   ```

7. **Start the backend server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yuno_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/nearby` - Find nearby users

### Discovery
- `GET /api/discover` - Discover nearby users
- `GET /api/discover/stats` - Get discovery statistics

### Chat
- `GET /api/chat/chats` - Get user chats
- `GET /api/chat/chats/:id` - Get chat messages
- `POST /api/chat/messages` - Send message

### Sparks
- `POST /api/sparks/send` - Send spark
- `GET /api/sparks/pending` - Get pending sparks
- `POST /api/sparks/:id/accept` - Accept spark
- `POST /api/sparks/:id/reject` - Reject spark

## 🗺️ Geospatial Features

### Location-Based Discovery
- Users can set their location manually or use GPS
- Search radius: 5km, 10km, 20km, 50km
- Real-time distance calculations using PostGIS
- Commonality scoring based on shared interests

### Map Integration
- Interactive map showing nearby users
- Real-time location updates
- Visual representation of discovery radius

## 💬 Real-Time Features

### Chat System
- Real-time messaging using Socket.IO
- Message persistence in PostgreSQL
- Typing indicators
- Online/offline status
- Message history

### Spark System
- Send friend requests to nearby people
- Accept/reject sparks
- Real-time notifications
- Spark status tracking

## 🎨 UI/UX Features

### Design System
- Consistent color scheme and typography
- Responsive design for all devices
- Smooth animations with Framer Motion
- Modern card-based layouts

### User Experience
- Intuitive navigation
- Loading states and error handling
- Search and filtering capabilities
- Real-time updates

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL with PostGIS on your server
2. Configure environment variables
3. Run database migrations
4. Start the Node.js server

### Frontend Deployment
1. Build the Next.js application
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aakarsh** - [aakarsh12x](https://github.com/aakarsh12x)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- PostgreSQL and PostGIS for geospatial capabilities
- Socket.IO for real-time communication
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations

---

**Yuno** - Connecting people through location and shared interests 🌍✨
