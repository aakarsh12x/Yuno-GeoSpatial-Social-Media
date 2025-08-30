# 🚀 Deploy Backend to Render.com

## Quick Deployment Steps

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `aakarsh12x/Yuno-GeoSpatial-Social-Media`
3. Configure:
   - **Name**: `yuno-backend`
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`

### 3. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://frontend-nine-orcin-70.vercel.app
CORS_ORIGIN=https://frontend-nine-orcin-70.vercel.app
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- Your backend URL will be: `https://yuno-backend.onrender.com`

### 5. Update Frontend
Update `Frontend/next.config.js`:
```javascript
NEXT_PUBLIC_API_URL: 'https://yuno-backend.onrender.com/api'
NEXT_PUBLIC_SOCKET_URL: 'https://yuno-backend.onrender.com'
```

### 6. Test
- Health check: `https://yuno-backend.onrender.com/health`
- Login: `https://yuno-backend.onrender.com/api/auth/login`
- Register: `https://yuno-backend.onrender.com/api/auth/register`

## Features Included
- ✅ CORS configured for frontend
- ✅ Health check endpoint
- ✅ Login/Register endpoints
- ✅ Discover endpoint with Indian names
- ✅ Sparks endpoint
- ✅ Chat endpoint
- ✅ Rate limiting
- ✅ Security headers

## Free Tier Limits
- 750 hours/month
- Sleeps after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
