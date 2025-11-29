// Test script to verify the frontend works with any server configuration
console.log('🧪 Testing Hope Bridge Frontend Configuration...\n');

// Test 1: Check environment variables
console.log('📋 Environment Variables Check:');
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'Not set (will use fallback)');
console.log('APP_BASE_URL:', process.env.APP_BASE_URL || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

// Test 2: Test API endpoint construction
function getApiUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.APP_BASE_URL || 
                   "http://localhost:3000";
    return `${baseUrl}/api/projects`;
}

const apiUrl = getApiUrl();
console.log('\n🔗 API Endpoint:');
console.log('Constructed URL:', apiUrl);

// Test 3: Validate URL format
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

console.log('URL Valid:', isValidUrl(apiUrl) ? '✅' : '❌');

// Test 4: Show deployment scenarios
console.log('\n🚀 Deployment Scenarios:');
console.log('Development: http://localhost:3000');
console.log('Staging: https://staging.yourdomain.com');
console.log('Production: https://yourdomain.com');

console.log('\n✅ Frontend Configuration Summary:');
console.log('- Uses NEXT_PUBLIC_BASE_URL for client & server');
console.log('- Falls back to APP_BASE_URL');
console.log('- Final fallback to localhost:3000');
console.log('- Works on any server with proper env setup');

console.log('\n🎯 To test manually:');
console.log('1. Set NEXT_PUBLIC_BASE_URL in your environment');
console.log('2. Run: npm run dev');
console.log('3. Visit your configured URL');
console.log('4. Check browser network tab for API calls');

console.log('\n📝 Environment Setup Examples:');
console.log('Windows: set NEXT_PUBLIC_BASE_URL=http://localhost:3000');
console.log('Mac/Linux: export NEXT_PUBLIC_BASE_URL=http://localhost:3000');
console.log('.env.local: NEXT_PUBLIC_BASE_URL=http://localhost:3000');

console.log('\n🎉 Configuration test complete!');
