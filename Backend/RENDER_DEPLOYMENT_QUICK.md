# 🚀 Render Deployment Guide

## Quick Deployment Steps

### 1. Go to Render Dashboard
Visit: https://render.com/dashboard

### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository: `aakarsh12x/Yuno-GeoSpatial-Social-Media`

### 3. Configure Service Settings
- **Name**: `yuno-backend`
- **Environment**: `Node`
- **Root Directory**: `Backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 4. Add Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-2025
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app
CORS_ORIGIN=https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app
```

### 5. Create Service
Click "Create Web Service"

### 6. After Deployment
Your backend will be available at: `https://yuno-backend.onrender.com`

### 7. Update Frontend Environment Variables
In your Vercel dashboard, update:
```
NEXT_PUBLIC_API_URL=https://yuno-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://yuno-backend.onrender.com
```

### 8. Test Integration
- Health check: https://yuno-backend.onrender.com/health
- Frontend: https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app

---

## Database Setup (Required)

### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to DATABASE_URL in Render

### Option B: Render PostgreSQL
1. Create PostgreSQL database in Render dashboard
2. Copy connection string
3. Add to DATABASE_URL in Render

---

## Testing Commands

```bash
# Health check
curl https://yuno-backend.onrender.com/health

# Test registration
curl -X POST https://yuno-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","latitude":19.0760,"longitude":72.8777}'

# Test login
curl -X POST https://yuno-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
