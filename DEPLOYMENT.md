# Yuno Deployment Guide - Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Connect your GitHub repository
3. **Database**: Set up a PostgreSQL database (Neon recommended)

## Step 1: Database Setup

### Option A: Neon Database (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Enable PostGIS extension in the SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### Option B: Other PostgreSQL Providers

- **Supabase**: [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)
- **PlanetScale**: [planetscale.com](https://planetscale.com)

## Step 2: Environment Variables

Set these environment variables in Vercel:

### Required Variables:
```
DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-app-name.vercel.app
```

### Optional Variables:
```
PORT=5000
CORS_ORIGIN=https://your-app-name.vercel.app
```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Method 2: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Push to main branch
3. Vercel will auto-deploy

## Step 4: Database Migration

After deployment, run the database setup:

1. Go to your Vercel dashboard
2. Navigate to Functions
3. Run the setup function or use the database scripts

## Step 5: Verify Deployment

1. Check your app URL: `https://your-app-name.vercel.app`
2. Test the health endpoint: `https://your-app-name.vercel.app/health`
3. Test API endpoints: `https://your-app-name.vercel.app/api/auth/register`

## Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure DATABASE_URL is correct
2. **CORS Errors**: Check FRONTEND_URL setting
3. **Build Errors**: Check Node.js version compatibility
4. **API 404**: Verify API routes are properly configured

### Debug Commands:
```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --function api/index.js

# Redeploy
vercel --prod --force
```

## Production Checklist

- [ ] Database is set up and connected
- [ ] Environment variables are configured
- [ ] SSL certificates are valid
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Error handling is in place
- [ ] Monitoring is set up

## Support

For issues:
1. Check Vercel logs
2. Verify environment variables
3. Test database connection
4. Check API endpoints
