#!/bin/bash

echo "🚀 Starting Yuno Full-Stack Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
cd Frontend && npm install --legacy-peer-deps && cd ..

# Build frontend locally to check for errors
echo "🔨 Building frontend..."
cd Frontend
npm run build
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --force

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: https://yuno-geospatial-social-media.vercel.app"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure your database (Neon recommended)"
echo "3. Test the API endpoints"
echo "4. Verify the frontend is working"
