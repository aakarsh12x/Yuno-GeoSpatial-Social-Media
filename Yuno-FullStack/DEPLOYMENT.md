# Yuno FullStack - Vercel Deployment Guide

This guide will walk you through deploying the Yuno FullStack application to Vercel with the corrected API structure.

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, Bitbucket)
3. **Node.js**: Ensure you have Node.js 18+ installed locally for testing

## 📋 Pre-Deployment Checklist

- [x] All code is committed to your Git repository
- [x] Environment variables are documented in `env.example`
- [x] `vercel.json` is properly configured for Next.js App Router
- [x] `package.json` has correct scripts and dependencies
- [x] API endpoints are using Next.js App Router structure (`/src/app/api/`)
- [x] Legacy API routes have been removed (`/api/` directory)

## 🔧 Step-by-Step Deployment

### 1. Connect to Vercel

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Initialize Project

```bash
# Navigate to your project directory
cd Yuno-FullStack

# Initialize Vercel project
vercel
```

Follow the prompts:
- Set up and deploy? → `Y`
- Which scope? → Select your account
- Link to existing project? → `N`
- Project name? → `yuno-fullstack` (or your preferred name)
- Directory? → `./` (current directory)
- Override settings? → `N`

### 3. Configure Environment Variables

In the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database (if using)
DATABASE_URL=your-database-connection-string

# Security
BCRYPT_ROUNDS=12

# API Configuration
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app

# CORS Origins
CORS_ORIGIN=https://your-app.vercel.app

# Environment
NODE_ENV=production
```

### 4. Deploy to Production

```bash
# Deploy to production
vercel --prod
```

### 5. Verify Deployment

After deployment, verify:

1. **Frontend**: Visit your Vercel URL
2. **API Health Check**: `https://your-app.vercel.app/api/health`
3. **Authentication**: Test login/register endpoints
4. **Features**: Test all major functionality

## 🔄 Continuous Deployment

Once connected to Vercel, every push to your main branch will automatically trigger a deployment.

### Automatic Deployments

- **Main Branch**: Automatically deploys to production
- **Feature Branches**: Create preview deployments

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. 404 Errors on API Routes

**Problem**: API routes returning 404 errors

**Solution**: 
- Ensure all API routes are in `/src/app/api/` directory
- Use Next.js App Router format with `route.js` files
- Check that the route structure matches the frontend API calls

#### 2. CORS Errors

**Problem**: Cross-origin request errors

**Solution**:
- The `vercel.json` includes CORS headers
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Check that the frontend is calling the correct API endpoints

#### 3. Environment Variables Not Working

**Problem**: Environment variables not accessible

**Solution**:
- Add all required variables in Vercel dashboard
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding new environment variables

#### 4. Build Failures

**Problem**: Build process failing

**Solution**:
- Check Node.js version (requires 18+)
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors
- Verify import paths are correct

## 📊 API Endpoints Structure

The application uses Next.js App Router API routes located in `/src/app/api/`:

```
/src/app/api/
├── auth/
│   ├── login/route.js
│   ├── register/route.js
│   ├── refresh/route.js
│   └── logout/route.js
├── users/
│   ├── profile/route.js
│   └── [id]/route.js
├── discover/
│   ├── route.js
│   ├── stats/route.js
│   └── popular-interests/route.js
├── chat/
│   └── chats/route.js
├── sparks/
│   ├── nearby/route.js
│   └── pending/route.js
├── health/route.js
└── route.js
```

## 🔍 Testing API Endpoints

Test these endpoints after deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Discover users
curl https://your-app.vercel.app/api/discover

# User profile
curl https://your-app.vercel.app/api/users/profile
```

## 🚀 Performance Optimization

1. **Enable Edge Functions**: Consider using Edge Runtime for faster API responses
2. **Caching**: Implement appropriate caching headers
3. **Image Optimization**: Use Next.js Image component for optimized images
4. **Bundle Analysis**: Monitor bundle size and optimize imports

## 📈 Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Monitor function logs in Vercel dashboard
3. **Performance**: Use Vercel Speed Insights
4. **Uptime**: Monitor API endpoint availability

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Configure appropriate origins
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Always use HTTPS in production

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints locally first
4. Check the Vercel documentation
5. Review this troubleshooting guide

---

**Note**: This deployment guide has been updated to reflect the corrected API structure using Next.js App Router. All legacy API routes have been removed to prevent conflicts.
