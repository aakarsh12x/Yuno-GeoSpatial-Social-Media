# 🔧 Update Vercel Environment Variables

## 🚨 **URGENT: Update Vercel Environment Variables**

The backend CORS has been updated, but you need to update your Vercel environment variables to match.

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your project: `frontend`

### Step 2: Update Environment Variables
1. Go to **Settings** → **Environment Variables**
2. **Delete** the old variables (if they exist)
3. **Add** these new variables:

```
NEXT_PUBLIC_API_URL=https://yuno-geospatial-social-media-1.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://yuno-geospatial-social-media-1.onrender.com
```

### Step 3: Redeploy Frontend
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or trigger a new deployment

## 🔍 **Current Issues Fixed**

- ✅ **CORS Error**: Backend now allows new frontend URL
- ✅ **Backend Redeployment**: Triggered by git push
- ⏳ **Frontend Environment Variables**: Need manual update

## 🎯 **Expected Result**

After updating environment variables:
- ✅ No more CORS errors
- ✅ Login/Registration will work
- ✅ Real-time features will function
- ✅ Manifest.json should load properly

## 📋 **Next Steps**

1. **Update Vercel Environment Variables** (as shown above)
2. **Redeploy Frontend**
3. **Test Login/Registration**
4. **Check browser console for errors**

Your backend is ready and waiting for the frontend to connect! 🚀



