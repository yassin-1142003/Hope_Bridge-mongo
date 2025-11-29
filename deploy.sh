#!/bin/bash

# Hope Bridge Deployment Helper
# This script helps configure the application for different environments

echo "🚀 Hope Bridge Deployment Helper"
echo "=================================="

# Function to set environment
set_environment() {
    local env=$1
    local domain=$2
    
    echo "📍 Setting up $env environment..."
    
    case $env in
        "dev")
            echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" > .env.local
            echo "APP_BASE_URL=http://localhost:3000" >> .env.local
            echo "MONGODB_URI=mongodb://localhost:27017/hope-bridge" >> .env.local
            echo "JWT_SECRET=dev-secret-key-change-in-production" >> .env.local
            ;;
        "staging")
            echo "NEXT_PUBLIC_BASE_URL=https://staging.$domain" > .env.local
            echo "APP_BASE_URL=https://staging.$domain" >> .env.local
            echo "MONGODB_URI=mongodb://localhost:27017/hope-bridge-staging" >> .env.local
            echo "JWT_SECRET=staging-secret-key" >> .env.local
            ;;
        "prod")
            echo "NEXT_PUBLIC_BASE_URL=https://$domain" > .env.local
            echo "APP_BASE_URL=https://$domain" >> .env.local
            echo "MONGODB_URI=mongodb://localhost:27017/hope-bridge" >> .env.local
            echo "JWT_SECRET=production-secret-key-change-this" >> .env.local
            ;;
        *)
            echo "❌ Invalid environment. Use: dev, staging, or prod"
            exit 1
            ;;
    esac
    
    echo "✅ Environment configured for $env"
    echo "📁 .env.local file created/updated"
}

# Function to test configuration
test_config() {
    echo "🧪 Testing configuration..."
    
    # Check if .env.local exists
    if [ ! -f .env.local ]; then
        echo "❌ .env.local file not found. Run setup first."
        exit 1
    fi
    
    # Load environment variables
    export $(grep -v '^#' .env.local | xargs)
    
    echo "🔗 Base URL: $NEXT_PUBLIC_BASE_URL"
    echo "🗄️ MongoDB: $MONGODB_URI"
    
    # Test if base URL is accessible
    if curl -s --head "$NEXT_PUBLIC_BASE_URL" > /dev/null; then
        echo "✅ Base URL is accessible"
    else
        echo "⚠️ Base URL not accessible (server might not be running)"
    fi
    
    echo "✅ Configuration test complete"
}

# Function to start application
start_app() {
    echo "🚀 Starting Hope Bridge application..."
    
    # Load environment variables
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
        echo "📝 Environment loaded from .env.local"
    fi
    
    echo "🔗 Using base URL: $NEXT_PUBLIC_BASE_URL"
    echo "🌐 Starting development server..."
    
    npm run dev
}

# Main menu
case "$1" in
    "setup")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: $0 setup <environment> <domain>"
            echo "Example: $0 setup dev localhost"
            echo "Example: $0 setup prod yourdomain.com"
            exit 1
        fi
        set_environment "$2" "$3"
        ;;
    "test")
        test_config
        ;;
    "start")
        start_app
        ;;
    *)
        echo "Hope Bridge Deployment Helper"
        echo "Usage:"
        echo "  $0 setup <env> <domain>  - Setup environment (dev/staging/prod)"
        echo "  $0 test                  - Test current configuration"
        echo "  $0 start                 - Start the application"
        echo ""
        echo "Examples:"
        echo "  $0 setup dev localhost"
        echo "  $0 setup prod yourdomain.com"
        echo "  $0 test"
        echo "  $0 start"
        exit 1
        ;;
esac
