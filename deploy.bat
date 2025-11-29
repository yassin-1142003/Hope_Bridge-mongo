@echo off
REM Hope Bridge Deployment Helper for Windows
REM This script helps configure the application for different environments

echo 🚀 Hope Bridge Deployment Helper
echo ==================================

if "%1"=="setup" goto setup
if "%1"=="test" goto test
if "%1"=="start" goto start
if "%1"=="help" goto help
goto menu

:setup
if "%2"=="" (
    echo ❌ Environment parameter required
    echo Usage: deploy.bat setup ^<environment^> ^<domain^>
    echo Example: deploy.bat setup dev localhost
    echo Example: deploy.bat setup prod yourdomain.com
    goto end
)
if "%3"=="" (
    echo ❌ Domain parameter required
    echo Usage: deploy.bat setup ^<environment^> ^<domain^>
    echo Example: deploy.bat setup dev localhost
    echo Example: deploy.bat setup prod yourdomain.com
    goto end
)

echo 📍 Setting up %2 environment...

if "%2"=="dev" (
    echo NEXT_PUBLIC_BASE_URL=http://localhost:3000 > .env.local
    echo APP_BASE_URL=http://localhost:3000 >> .env.local
    echo MONGODB_URI=mongodb://localhost:27017/hope-bridge >> .env.local
    echo JWT_SECRET=dev-secret-key-change-in-production >> .env.local
    echo ✅ Environment configured for development
    goto end
)

if "%2"=="staging" (
    echo NEXT_PUBLIC_BASE_URL=https://staging.%3 > .env.local
    echo APP_BASE_URL=https://staging.%3 >> .env.local
    echo MONGODB_URI=mongodb://localhost:27017/hope-bridge-staging >> .env.local
    echo JWT_SECRET=staging-secret-key >> .env.local
    echo ✅ Environment configured for staging
    goto end
)

if "%2"=="prod" (
    echo NEXT_PUBLIC_BASE_URL=https://%3 > .env.local
    echo APP_BASE_URL=https://%3 >> .env.local
    echo MONGODB_URI=mongodb://localhost:27017/hope-bridge >> .env.local
    echo JWT_SECRET=production-secret-key-change-this >> .env.local
    echo ✅ Environment configured for production
    goto end
)

echo ❌ Invalid environment. Use: dev, staging, or prod
goto end

:test
echo 🧪 Testing configuration...

if not exist .env.local (
    echo ❌ .env.local file not found. Run setup first.
    goto end
)

echo 📁 Found .env.local file
echo 🔗 Base URL: 
findstr "NEXT_PUBLIC_BASE_URL" .env.local
echo ✅ Configuration test complete
goto end

:start
echo 🚀 Starting Hope Bridge application...

if exist .env.local (
    echo 📝 Environment loaded from .env.local
    findstr "NEXT_PUBLIC_BASE_URL" .env.local
)

echo 🌐 Starting development server...
npm run dev
goto end

:help
echo Hope Bridge Deployment Helper
echo.
echo Usage:
echo   deploy.bat setup ^<env^> ^<domain^>  - Setup environment ^(dev/staging/prod^)
echo   deploy.bat test                  - Test current configuration
echo   deploy.bat start                 - Start the application
echo.
echo Examples:
echo   deploy.bat setup dev localhost
echo   deploy.bat setup prod yourdomain.com
echo   deploy.bat test
echo   deploy.bat start
goto end

:menu
echo Hope Bridge Deployment Helper
echo.
echo 1. Setup environment
echo 2. Test configuration
echo 3. Start application
echo 4. Help
echo.
set /p choice="Select option (1-4): "

if "%choice%"=="1" (
    set /p env="Enter environment (dev/staging/prod): "
    set /p domain="Enter domain (e.g., localhost or yourdomain.com): "
    call :setup %env% %domain%
)
if "%choice%"=="2" call :test
if "%choice%"=="3" call :start
if "%choice%"=="4" call :help

:end
pause
