# 🚀 Quick Render Deployment

## Step 1: Deploy Backend
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `aakarsh12x/Yuno-GeoSpatial-Social-Media`
4. Configure:
   - **Name**: `yuno-backend`
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`

## Step 2: Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://frontend-nine-orcin-70.vercel.app
CORS_ORIGIN=https://frontend-nine-orcin-70.vercel.app
```

## Step 3: Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Your backend URL: `https://yuno-backend.onrender.com`

## Step 4: Test Backend
- Health: https://yuno-backend.onrender.com/health
- Login: https://yuno-backend.onrender.com/api/auth/login
- Register: https://yuno-backend.onrender.com/api/auth/register

## Step 5: Connect Frontend
After backend is deployed, I'll update the frontend to connect to it!

## Step 1: Deploy Backend
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `aakarsh12x/Yuno-GeoSpatial-Social-Media`
4. Configure:
   - **Name**: `yuno-backend`
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`

## Step 2: Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://frontend-nine-orcin-70.vercel.app
CORS_ORIGIN=https://frontend-nine-orcin-70.vercel.app
```

## Step 3: Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Your backend URL: `https://yuno-backend.onrender.com`

## Step 4: Test Backend
- Health: https://yuno-backend.onrender.com/health
- Login: https://yuno-backend.onrender.com/api/auth/login
- Register: https://yuno-backend.onrender.com/api/auth/register

## Step 5: Connect Frontend
After backend is deployed, I'll update the frontend to connect to it!
