# 🚀 Frontend-Backend Connection Guide

## ✅ Backend Successfully Deployed!

**Backend URL**: https://yuno-geospatial-social-media-1.onrender.com
**Frontend URL**: https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app

## 🔗 Connect Frontend to Backend

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project: `frontend`
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```
NEXT_PUBLIC_API_URL=https://yuno-geospatial-social-media-1.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://yuno-geospatial-social-media-1.onrender.com
```

### Step 2: Redeploy Frontend

After updating environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or trigger a new deployment

### Step 3: Test Integration

1. **Open Frontend**: https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app
2. **Test Registration**: Try creating a new account
3. **Test Login**: Try logging in
4. **Check Console**: Look for any CORS or connection errors

## 🧪 Backend Testing

Your backend endpoints are working:

- ✅ **Health Check**: https://yuno-geospatial-social-media-1.onrender.com/health
- ✅ **API Base**: https://yuno-geospatial-social-media-1.onrender.com/api
- ✅ **CORS**: Properly configured for your frontend

## 📋 Next Steps

1. **Update Vercel Environment Variables** (as shown above)
2. **Redeploy Frontend**
3. **Test Full Integration**
4. **Set up Database** (if needed for full functionality)

## 🎯 Expected Result

After updating environment variables:
- Frontend will connect to your new backend
- User registration/login will work
- Real-time features will function
- No CORS errors in browser console

Your full-stack application will be fully integrated! 🚀



