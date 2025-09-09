# 🚀 Yuno-FullStack - Complete Deployment Guide

## 📋 Overview

Yuno-FullStack is a complete social media platform built with Next.js 14, featuring user authentication, geospatial discovery, real-time messaging, and friend connections (sparks).

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL with PostGIS (Geospatial)
- **Authentication**: JWT with refresh tokens
- **Deployment**: Vercel (Serverless)
- **Real-time**: Socket.IO (limited on Vercel serverless)

## 🔧 Prerequisites

1. **PostgreSQL Database** with PostGIS extension
2. **Vercel Account** for deployment
3. **Node.js 18+** for development

## 📦 Installation

### 1. Clone and Setup

```bash
# Navigate to the Yuno-FullStack directory
cd Yuno-FullStack

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Database Setup

You need a PostgreSQL database with PostGIS. You can use:

- **Neon** (Serverless PostgreSQL)
- **Supabase** (PostgreSQL with extensions)
- **AWS RDS** (PostgreSQL)
- **Local PostgreSQL** (with PostGIS)

#### Database Connection

Update your database connection string in the environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

#### Initialize Database Schema

Run the database setup script:

```bash
node scripts/setup-database.js
```

This will:
- Create all necessary tables
- Set up indexes for performance
- Create 5 test users for development

## ⚙️ Environment Variables

Create environment variables in your Vercel project dashboard:

### Required Variables

```env
# Database
DATABASE_URL=your-postgresql-connection-string

# JWT Secrets (Generate strong, random keys)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-different

# Optional (with defaults)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.vercel.app
NODE_ENV=production
```

### Vercel Environment Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all the required variables listed above

## 🚀 Deployment

### Option 1: Deploy from Repository

```bash
# If deploying from the root directory
vercel --prod

# If deploying from Yuno-FullStack directory
cd Yuno-FullStack
vercel --prod
```

### Option 2: Deploy from Vercel Dashboard

1. Connect your GitHub repository to Vercel
2. Set the root directory to `Yuno-FullStack` (if deploying from repo root)
3. Add environment variables in Vercel dashboard
4. Deploy

## 🧪 Testing

### Test API Endpoints

Use the built-in test script:

```bash
npm run test:api
```

Or test individual endpoints:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Register a user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Users (Created by Setup Script)

| Name | Email | Password |
|------|-------|----------|
| Alice Johnson | alice@example.com | password123 |
| Bob Smith | bob@example.com | password123 |
| Charlie Brown | charlie@example.com | password123 |
| Diana Prince | diana@example.com | password123 |
| Eve Wilson | eve@example.com | password123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/[id]` - Get user by ID

### Discovery
- `GET /api/discover` - Discover nearby users
- `GET /api/discover/stats` - Get platform statistics
- `GET /api/discover/popular-interests` - Get popular interests

### Sparks (Friend Requests)
- `GET /api/sparks/pending` - Get pending sparks
- `POST /api/sparks/pending` - Send a spark
- `PUT /api/sparks/[id]` - Accept/reject a spark

### Chat
- `GET /api/chat/chats` - Get user's chats
- `GET /api/chat/[id]` - Get messages for a chat
- `POST /api/chat/[id]` - Send message to chat

### System
- `GET /api/health` - Health check
- `GET /api` - API information

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt
- **CORS Protection** with proper headers
- **Input Validation** on all endpoints
- **SQL Injection Prevention** using parameterized queries
- **Rate Limiting** ready (can be added)
- **Security Headers** configured

## 🌍 Geospatial Features

- **PostGIS Integration** for accurate location queries
- **Distance Calculations** in kilometers
- **Geospatial Indexing** for performance
- **Location-based Discovery** with radius filtering
- **Automatic Location Updates** when user profile changes

## 💬 Real-time Features

⚠️ **Note**: Due to Vercel's serverless limitations, real-time features are limited:

- Socket.IO connections work but may disconnect
- Consider using external services like Pusher or Ably for production real-time features
- The API includes Socket.IO setup for local development

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Ensure PostGIS extension is enabled
   - Verify SSL settings

2. **JWT Token Errors**
   - Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
   - Make sure secrets are long and random
   - Check token expiration settings

3. **CORS Errors**
   - Verify CORS_ORIGIN is set correctly
   - Check if API calls include proper headers

4. **Build Failures**
   - Ensure all dependencies are installed
   - Check Node.js version (18+ required)
   - Verify environment variables are set

### Vercel Deployment Issues

1. **Function Timeouts**
   - Database queries might be slow
   - Consider optimizing queries
   - Use connection pooling properly

2. **Cold Start Issues**
   - Serverless functions may have cold starts
   - First requests might be slower
   - Implement proper error handling

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in your project dashboard
- Monitor function execution times
- Track error rates and performance

### Database Monitoring
- Monitor connection pool usage
- Track query performance
- Set up alerts for slow queries

## 🔄 Updates and Maintenance

### Database Migrations
When updating the database schema:

1. Update the schema file: `Backend/database/schema.sql`
2. Run migrations on your database
3. Update the setup script if needed
4. Test thoroughly before deploying

### Environment Updates
When updating environment variables:

1. Update in Vercel dashboard
2. Redeploy the application
3. Test all functionality
4. Update documentation

## 🎯 Production Checklist

- [ ] Database connection tested
- [ ] All environment variables set
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] SSL/HTTPS enabled
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Error handling implemented
- [ ] Rate limiting configured (if needed)

## 📞 Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Test API endpoints individually
3. Verify database connectivity
4. Check environment variables
5. Review error messages in application logs

## 🎉 Success!

Once deployed, your Yuno-FullStack application will be fully functional with:

✅ Complete user authentication system
✅ Geospatial user discovery
✅ Friend request system (sparks)
✅ Real-time messaging (with limitations)
✅ Responsive frontend
✅ Production-ready security
✅ Scalable serverless architecture

Your users can now register, login, discover nearby users, send sparks, and chat in real-time!



