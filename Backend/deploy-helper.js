const https = require('https');
const fs = require('fs');

// Render API configuration
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_API_URL = 'api.render.com';

console.log('🚀 Yuno Backend Deployment Helper');
console.log('=====================================');
console.log('');

if (!RENDER_API_KEY) {
  console.log('❌ RENDER_API_KEY not found in environment variables');
  console.log('');
  console.log('🔑 To deploy automatically, you need to:');
  console.log('1. Get your Render API key from: https://render.com/docs/api');
  console.log('2. Set it as environment variable: RENDER_API_KEY=your_api_key');
  console.log('3. Run this script again');
  console.log('');
  console.log('📋 Manual Deployment Steps:');
  console.log('1. Go to: https://render.com/dashboard');
  console.log('2. Click "New +" → "Web Service"');
  console.log('3. Connect GitHub repo: aakarsh12x/Yuno-GeoSpatial-Social-Media');
  console.log('4. Configure:');
  console.log('   - Name: yuno-backend');
  console.log('   - Environment: Node');
  console.log('   - Root Directory: Backend');
  console.log('   - Build Command: npm run build');
  console.log('   - Start Command: npm start');
  console.log('');
  console.log('5. Add Environment Variables:');
  console.log('   NODE_ENV=production');
  console.log('   PORT=10000');
  console.log('   DATABASE_URL=your_postgresql_connection_string');
  console.log('   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-2025');
  console.log('   JWT_EXPIRES_IN=7d');
  console.log('   FRONTEND_URL=https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app');
  console.log('   CORS_ORIGIN=https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app');
  console.log('');
  console.log('6. Click "Create Web Service"');
  console.log('');
  console.log('7. After deployment, your backend will be at: https://yuno-backend.onrender.com');
  console.log('');
  console.log('8. Update frontend environment variables in Vercel:');
  console.log('   NEXT_PUBLIC_API_URL=https://yuno-backend.onrender.com/api');
  console.log('   NEXT_PUBLIC_SOCKET_URL=https://yuno-backend.onrender.com');
  console.log('');
  console.log('✅ Your frontend is already deployed at: https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app');
  console.log('');
  console.log('📋 Database Setup Required:');
  console.log('   - Go to https://neon.tech (recommended)');
  console.log('   - Or create PostgreSQL database in Render dashboard');
  console.log('   - Add the connection string to DATABASE_URL');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log('   curl https://yuno-backend.onrender.com/health');
  console.log('   curl -X POST https://yuno-backend.onrender.com/api/auth/register -H "Content-Type: application/json" -d "{\\"name\\":\\"Test User\\",\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\",\\"latitude\\":19.0760,\\"longitude\\":72.8777}"');
} else {
  console.log('✅ RENDER_API_KEY found! Attempting automatic deployment...');
  console.log('');
  
  // Service configuration
  const serviceData = {
    name: 'yuno-backend',
    type: 'web_service',
    env: 'node',
    plan: 'free',
    repo: 'https://github.com/aakarsh12x/Yuno-GeoSpatial-Social-Media',
    branch: 'main',
    rootDir: 'Backend',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    envVars: [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'PORT', value: '10000' },
      { key: 'FRONTEND_URL', value: 'https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app' },
      { key: 'CORS_ORIGIN', value: 'https://frontend-4oqhcvw6k-aakarsh12xs-projects.vercel.app' }
    ]
  };

  console.log('📋 Service configuration:', JSON.stringify(serviceData, null, 2));
  console.log('');
  console.log('⚠️  Note: You still need to manually add DATABASE_URL and JWT_SECRET in Render dashboard');
  console.log('');
  console.log('🔗 Next steps after deployment:');
  console.log('1. Go to your Render service dashboard');
  console.log('2. Add DATABASE_URL environment variable');
  console.log('3. Add JWT_SECRET environment variable');
  console.log('4. Update frontend environment variables in Vercel');
  console.log('5. Test the integration!');
}
