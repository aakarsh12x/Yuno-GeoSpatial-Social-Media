// Simple server starter for development
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-development';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('🔧 Starting Yuno Backend Server...');
console.log('Environment variables set:');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);

require('./server.js');
