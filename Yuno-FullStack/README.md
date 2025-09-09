# Yuno FullStack - Social Media Platform

A modern, full-stack social media platform built with Next.js 14, TypeScript, and Tailwind CSS, deployed on Vercel.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS and Framer Motion
- **Real-time Chat**: Socket.io powered chat system
- **Location-based Discovery**: Find users and sparks near you
- **Authentication**: JWT-based authentication with refresh tokens
- **Profile Management**: Complete user profile system
- **Responsive Design**: Works perfectly on all devices
- **Serverless API**: Built with Next.js App Router API routes

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Leaflet**: Interactive maps
- **Socket.io Client**: Real-time communication

### Backend
- **Next.js API Routes**: Serverless functions
- **JWT Authentication**: Secure token-based auth
- **PostgreSQL**: Database (optional, can use mock data)
- **Socket.io**: Real-time features

### Deployment
- **Vercel**: Serverless deployment platform
- **Environment Variables**: Secure configuration management

## 📁 Project Structure

```
Yuno-FullStack/
├── src/
│   ├── app/
│   │   ├── api/                    # Next.js App Router API routes
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   ├── users/              # User management
│   │   │   ├── discover/           # User discovery
│   │   │   ├── chat/               # Chat functionality
│   │   │   ├── sparks/             # Sparks/matches
│   │   │   └── health/             # Health check
│   │   ├── (authenticated)/        # Protected routes
│   │   │   ├── home/               # Dashboard
│   │   │   ├── discover/           # User discovery
│   │   │   ├── chat/               # Chat interface
│   │   │   ├── sparks/             # Sparks management
│   │   │   ├── profile/            # User profile
│   │   │   ├── settings/           # App settings
│   │   │   └── map/                # Map view
│   │   ├── login/                  # Login page
│   │   └── layout.tsx              # Root layout
│   ├── components/                 # Reusable components
│   ├── context/                    # React context providers
│   └── lib/                        # Utility functions
├── public/                         # Static assets
├── vercel.json                     # Vercel configuration
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies
└── env.example                     # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Yuno-FullStack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing API Endpoints

Run the comprehensive API test suite:

```bash
# Test local development
npm run test:api

# Test production deployment
BASE_URL=https://your-app.vercel.app npm run test:api
```

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add all variables from `env.example`

### Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-app.vercel.app

# Environment
NODE_ENV=production
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/[id]` - Get user by ID

### Discovery
- `GET /api/discover` - Discover nearby users
- `GET /api/discover/stats` - Get discovery statistics
- `GET /api/discover/popular-interests` - Get popular interests

### Chat
- `GET /api/chat/chats` - Get chat list

### Sparks
- `GET /api/sparks/nearby` - Get nearby sparks
- `GET /api/sparks/pending` - Get pending sparks

### Health
- `GET /api/health` - Health check endpoint

## 🔧 Configuration

### Next.js Configuration

The project uses Next.js 14 with App Router. Key configurations:

- **Image Optimization**: Configured for remote images
- **TypeScript**: Strict type checking enabled
- **Tailwind CSS**: Utility-first styling
- **API Routes**: Serverless functions using App Router

### Vercel Configuration

The `vercel.json` includes:

- **CORS Headers**: Proper cross-origin configuration
- **API Routing**: Correct routing for Next.js App Router
- **Build Configuration**: Optimized for Vercel deployment

## 🐛 Troubleshooting

### Common Issues

1. **404 Errors on API Routes**
   - Ensure all API routes are in `/src/app/api/`
   - Use Next.js App Router format with `route.js` files
   - Check route structure matches frontend calls

2. **CORS Errors**
   - Verify `vercel.json` CORS configuration
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure frontend calls correct API endpoints

3. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies in `package.json`
   - Check for TypeScript errors

4. **Environment Variables**
   - Add all required variables in Vercel dashboard
   - Use `NEXT_PUBLIC_` prefix for client-side variables
   - Redeploy after adding new variables

### Debugging Steps

1. **Check Vercel Logs**: Review function execution logs
2. **Test Locally**: Ensure everything works locally first
3. **Verify Environment**: Check all environment variables
4. **API Testing**: Use the provided test script

## 📈 Performance

### Optimization Features

- **Serverless Functions**: Automatic scaling
- **Edge Network**: Global CDN for static assets
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Appropriate caching headers

### Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Real-time serverless function monitoring
- **Error Tracking**: Automatic error detection and reporting

## 🔐 Security

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Proper cross-origin configuration
- **Input Validation**: Server-side validation for all inputs
- **HTTPS Only**: Enforced in production
- **Environment Variables**: Secure secret management

### Best Practices

- Never commit secrets to Git
- Use strong JWT secrets
- Implement rate limiting
- Validate all user inputs
- Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Vercel deployment logs
3. Test API endpoints locally
4. Check the Vercel documentation
5. Open an issue with detailed information

---

**Note**: This project has been updated to use Next.js App Router API routes for optimal Vercel deployment. All legacy API routes have been removed to prevent conflicts.

**Happy coding! 🚀**
