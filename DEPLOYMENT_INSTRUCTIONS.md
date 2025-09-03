# Yuno Full-Stack Deployment Guide

This guide will help you deploy the Yuno application (Frontend + Backend) to production.

## 🚀 Deployment Overview

1. **Frontend**: Deploy to Vercel from `Frontend/` folder
2. **Backend**: Deploy to Render from `Backend/` folder
3. **Database**: Set up PostgreSQL database (Neon, Supabase, or Render PostgreSQL)
4. **Configuration**: Update environment variables and CORS settings

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account
- Render account
- PostgreSQL database (Neon recommended for free tier)

---

## 1. Frontend Deployment (Vercel)

### Option A: Using Vercel CLI (Recommended)

```bash
# Navigate to Frontend directory
cd Frontend

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option B: Manual Deployment via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub repository: `aakarsh12x/Yuno-GeoSpatial-Social-Media`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.onrender.com
   ```
6. Click "Deploy"

### After Frontend Deployment

- Note down your Vercel URL (e.g., `https://yuno-frontend.vercel.app`)
- This URL will be used in the backend CORS configuration

---

## 2. Database Setup

### Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Run the database setup scripts:

```bash
cd Backend
node setup-neon-db.js
```

### Using Render PostgreSQL

1. In Render dashboard, create a new PostgreSQL database
2. Copy the connection string
3. Run setup with: `node setup-with-connection-string.js "your-connection-string"`

---

## 3. Backend Deployment (Render)

### Option A: Using Render Dashboard (Recommended)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `aakarsh12x/Yuno-GeoSpatial-Social-Media`
4. Configure the service:
   - **Name**: `yuno-backend`
   - **Environment**: `Node`
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
6. Click "Create Web Service"

### Option B: Using Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login to Render
render login

# Deploy
render deploy --service yuno-backend
```

---

## 4. Post-Deployment Configuration

### Update Frontend Environment Variables

After backend deployment, update the frontend environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Update:
   ```
   NEXT_PUBLIC_API_URL=https://yuno-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://yuno-backend.onrender.com
   ```
4. Redeploy the frontend

### Update Backend CORS (if needed)

If your frontend URL changed, update the backend environment variables in Render:

```
FRONTEND_URL=https://your-new-frontend-url.vercel.app
CORS_ORIGIN=https://your-new-frontend-url.vercel.app
```

---

## 5. Testing the Deployment

### Health Check

Test your backend health endpoint:
```bash
curl https://yuno-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "version": "1.0.0",
  "message": "Backend is running!"
}
```

### API Endpoints Testing

Test the main API endpoints:

```bash
# Test registration
curl -X POST https://yuno-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "latitude": 19.0760,
    "longitude": 72.8777
  }'

# Test login
curl -X POST https://yuno-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Frontend-Backend Integration

1. Open your frontend URL in a browser
2. Try registering a new user
3. Try logging in
4. Check browser console for any CORS errors
5. Test the discover and sparks features

---

## 6. Troubleshooting

### Common Issues

#### CORS Errors
- Ensure `FRONTEND_URL` and `CORS_ORIGIN` in backend match your frontend URL exactly
- Include `https://` protocol
- Redeploy backend after updating environment variables

#### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure database is accessible from Render (whitelist IP if needed)
- Check database credentials

#### Build Failures
- Check build logs in Vercel/Render dashboards
- Ensure all dependencies are properly listed in `package.json`
- Verify Node.js version compatibility

#### Socket.IO Issues
- Ensure `NEXT_PUBLIC_SOCKET_URL` points to your backend
- Check browser network tab for WebSocket connection errors

### Logs and Monitoring

- **Frontend**: Check Vercel function logs
- **Backend**: Check Render service logs
- **Database**: Monitor connection pool and query performance

---

## 7. Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Database connected and configured
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Health check endpoint working
- [ ] User registration/login working
- [ ] Frontend can communicate with backend
- [ ] Socket.IO real-time features working
- [ ] No console errors in browser
- [ ] All features tested and working

## 📞 Support

If you encounter any issues:

1. Check the logs in Vercel/Render dashboards
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check browser developer tools for errors
5. Ensure database is properly configured and accessible

---

**Note**: Remember to never commit sensitive information like API keys, database passwords, or JWT secrets to your repository. Always use environment variables for sensitive data.
