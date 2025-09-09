@echo off
echo 🚀 Yuno FullStack Setup
echo ========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create environment file
if not exist .env.local (
    echo 🔧 Creating environment file...
    copy env.example .env.local
    echo ✅ Environment file created. Please edit .env.local with your configuration.
) else (
    echo ✅ Environment file already exists.
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI is already installed.
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your configuration
echo 2. Run 'npm run dev' to start development server
echo 3. Run 'vercel' to deploy to Vercel
echo.
echo Happy coding! 🚀
pause

