// Test script to verify dashboard functionality
// Run this in the browser console on the dashboard page

console.log('🧪 Testing Dashboard Functionality...');

// Test 1: Check if session is available
async function testSession() {
  try {
    const response = await fetch('/api/test-session');
    const data = await response.json();
    
    console.log('✅ Session Test Results:', {
      hasSession: data.hasSession,
      userEmail: data.session?.user?.email,
      userRole: data.session?.user?.role,
      environment: data.environment
    });
    
    return data.hasSession;
  } catch (error) {
    console.error('❌ Session Test Failed:', error);
    return false;
  }
}

// Test 2: Check if tasks can be fetched
async function testTaskFetch() {
  try {
    const response = await fetch('/api/tasks');
    const data = await response.json();
    
    console.log('✅ Task Fetch Test Results:', {
      success: response.ok,
      taskCount: Array.isArray(data) ? data.length : 0,
      firstTask: Array.isArray(data) && data.length > 0 ? data[0].title : 'No tasks'
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Task Fetch Test Failed:', error);
    return false;
  }
}

// Test 3: Check if file upload works
async function testFileUpload() {
  try {
    // Create a test file
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('files', testFile, 'test.txt');
    formData.append('folder', 'hope-bridge/tasks');
    
    const response = await fetch('/api/upload-enhanced', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    console.log('✅ File Upload Test Results:', {
      success: data.success,
      message: data.message,
      fileCount: data.uploadedFiles?.length || 0
    });
    
    return data.success;
  } catch (error) {
    console.error('❌ File Upload Test Failed:', error);
    return false;
  }
}

// Test 4: Check if task creation works
async function testTaskCreation() {
  try {
    const testTask = {
      title: 'Test Task from Console',
      description: 'This is a test task created from browser console',
      status: 'pending',
      priority: 'medium',
      createdBy: 'console-test@example.com'
    };
    
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTask)
    });
    
    const data = await response.json();
    
    console.log('✅ Task Creation Test Results:', {
      success: response.ok,
      taskId: data._id,
      taskTitle: data.title,
      message: data.message || 'Task created successfully'
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Task Creation Test Failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Dashboard Functionality Tests...\n');
  
  const results = {
    session: await testSession(),
    taskFetch: await testTaskFetch(),
    fileUpload: await testFileUpload(),
    taskCreation: await testTaskCreation()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Session:', results.session ? '✅ PASS' : '❌ FAIL');
  console.log('Task Fetch:', results.taskFetch ? '✅ PASS' : '❌ FAIL');
  console.log('File Upload:', results.fileUpload ? '✅ PASS' : '❌ FAIL');
  console.log('Task Creation:', results.taskCreation ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Status:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return results;
}

// Auto-run tests when this script is loaded
runAllTests();

// Also expose functions for manual testing
window.testDashboard = {
  testSession,
  testTaskFetch,
  testFileUpload,
  testTaskCreation,
  runAllTests
};

console.log('🔧 Test functions available in window.testDashboard');
console.log('💡 Run window.testDashboard.runAllTests() to re-run tests');
