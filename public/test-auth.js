// Test script to verify authentication fixes
// Run this in the browser console

console.log('🧪 Testing Authentication Fixes...');

// Test 1: Check if /auth/me works
async function testAuthMe() {
  try {
    console.log('Testing /auth/me endpoint...');
    
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    console.log('✅ Auth Me Test Results:', {
      status: response.status,
      success: data.success,
      hasUser: !!data.user,
      userEmail: data.user?.email,
      error: data.error
    });
    
    return response.ok && data.success;
  } catch (error) {
    console.error('❌ Auth Me Test Failed:', error);
    return false;
  }
}

// Test 2: Check if useAuth is working
function testUseAuth() {
  try {
    // Check if AuthProvider is available
    const authButton = document.querySelector('[data-auth="logout"]') || 
                      document.querySelector('button[onclick*="logout"]') ||
                      document.querySelector('button:contains("Logout")');
    
    const hasAuthButton = !!authButton;
    const hasUserData = window.localStorage.getItem('user') !== null;
    const hasToken = window.localStorage.getItem('token') !== null;
    
    console.log('✅ UseAuth Test Results:', {
      hasAuthButton,
      hasUserData,
      hasToken,
      userData: hasUserData ? JSON.parse(window.localStorage.getItem('user') || '{}') : null
    });
    
    return hasUserData && hasToken;
  } catch (error) {
    console.error('❌ UseAuth Test Failed:', error);
    return false;
  }
}

// Test 3: Simulate server error to check auto-logout behavior
async function testServerErrorHandling() {
  try {
    console.log('Testing server error handling (should NOT logout)...');
    
    // Make a request to a non-existent endpoint to simulate server error
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': 'Bearer invalid-token-to-test-error-handling'
      }
    });
    
    // Check if user is still logged in after error
    const stillLoggedIn = window.localStorage.getItem('token') !== null;
    
    console.log('✅ Server Error Test Results:', {
      status: response.status,
      stillLoggedIn,
      shouldNotLogout: response.status !== 401
    });
    
    return stillLoggedIn || response.status === 401;
  } catch (error) {
    console.error('❌ Server Error Test Failed:', error);
    return false;
  }
}

// Test 4: Check cookies
function testCookies() {
  try {
    // Check if auth-token cookie exists
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('auth-token=')
    );
    
    const hasAuthCookie = !!authCookie;
    const cookieValue = authCookie ? authCookie.split('=')[1] : null;
    
    console.log('✅ Cookie Test Results:', {
      hasAuthCookie,
      cookieValue: cookieValue ? `${cookieValue.substring(0, 20)}...` : null
    });
    
    return hasAuthCookie;
  } catch (error) {
    console.error('❌ Cookie Test Failed:', error);
    return false;
  }
}

// Run all tests
async function runAllAuthTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  const results = {
    authMe: await testAuthMe(),
    useAuth: testUseAuth(),
    errorHandling: await testServerErrorHandling(),
    cookies: testCookies()
  };
  
  console.log('\n📊 Authentication Test Results:');
  console.log('/auth/me Endpoint:', results.authMe ? '✅ PASS' : '❌ FAIL');
  console.log('UseAuth Hook:', results.useAuth ? '✅ PASS' : '❌ FAIL');
  console.log('Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL');
  console.log('Cookie Storage:', results.cookies ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Status:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (!allPassed) {
    console.log('\n🔧 Troubleshooting Tips:');
    if (!results.authMe) console.log('- Check if user is logged in');
    if (!results.useAuth) console.log('- Check localStorage for user data');
    if (!results.errorHandling) console.log('- Automatic logout may still be happening');
    if (!results.cookies) console.log('- Cookies may not be set properly');
  }
  
  return results;
}

// Auto-run tests when this script is loaded
runAllAuthTests();

// Also expose functions for manual testing
window.testAuth = {
  testAuthMe,
  testUseAuth,
  testServerErrorHandling,
  testCookies,
  runAllAuthTests
};

console.log('🔧 Auth test functions available in window.testAuth');
console.log('💡 Run window.testAuth.runAllAuthTests() to re-run tests');
