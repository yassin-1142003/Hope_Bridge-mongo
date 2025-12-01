#!/usr/bin/env node

/**
 * Comprehensive API Testing Script for HopeBridge
 * Tests all major API endpoints and provides detailed feedback
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

// Test configuration
const tests = [
  {
    name: 'Database Connection',
    url: '/api/test-db',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Projects API',
    url: '/api/projects',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Tasks API',
    url: '/api/tasks',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Analytics API',
    url: '/api/analytics',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Auth Status',
    url: '/api/auth/status',
    method: 'GET',
    expectedStatus: 200
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

async function testEndpoint(test) {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${test.url}`, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.status === test.expectedStatus) {
      success(`${test.name} - ${response.status} (${responseTime}ms)`);
      
      // Try to parse response for additional info
      try {
        const data = await response.json();
        if (data.data) {
          info(`   └─ Found ${Array.isArray(data.data) ? data.data.length : 1} item(s)`);
        }
        if (data.message) {
          info(`   └─ ${data.message}`);
        }
      } catch (e) {
        // Response might not be JSON, that's okay
      }
      
      return { success: true, responseTime, data: null };
    } else {
      error(`${test.name} - Expected ${test.expectedStatus}, got ${response.status}`);
      try {
        const errorData = await response.text();
        warning(`   └─ Error: ${errorData.substring(0, 100)}...`);
      } catch (e) {
        // Could not read error response
      }
      return { success: false, responseTime, error: `HTTP ${response.status}` };
    }
  } catch (err) {
    error(`${test.name} - Connection failed`);
    warning(`   └─ ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function runAllTests() {
  log('🚀 Starting HopeBridge API Tests...\n', colors.cyan);
  log(`📡 Testing against: ${BASE_URL}\n`, colors.blue);
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push({ ...test, ...result });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  log('\n📊 Test Results Summary:', colors.cyan);
  log('─'.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  success(`Passed: ${passed}/${total}`);
  if (failed > 0) {
    error(`Failed: ${failed}/${total}`);
  }
  
  // Performance summary
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length;
  
  info(`Average response time: ${avgResponseTime.toFixed(0)}ms`);
  
  // Failed tests details
  if (failed > 0) {
    log('\n❌ Failed Tests:', colors.red);
    results.filter(r => !r.success).forEach(test => {
      error(`   ${test.name}: ${test.error || 'Unknown error'}`);
    });
  }
  
  // Overall status
  log('\n🎯 Overall Status:', colors.cyan);
  if (failed === 0) {
    success('All APIs are working correctly! 🎉');
  } else {
    warning(`${failed} API(s) need attention. Check the errors above.`);
  }
  
  // Recommendations
  log('\n💡 Recommendations:', colors.cyan);
  if (failed > 0) {
    info('1. Check if the development server is running');
    info('2. Verify database connection in .env.local');
    info('3. Ensure all API routes are properly implemented');
  } else {
    success('1. System is ready for development');
    success('2. All integrations are working');
    success('3. Database connection is stable');
  }
  
  return failed === 0;
}

// Additional feature testing
async function testFeatures() {
  log('\n🔧 Feature Testing:', colors.cyan);
  
  // Test projects page integration
  try {
    const projectsResponse = await fetch(`${BASE_URL}/en/projects`);
    if (projectsResponse.ok) {
      success('Projects page loads correctly');
    } else {
      warning('Projects page may have issues');
    }
  } catch (e) {
    warning('Projects page not accessible');
  }
  
  // Test dashboard
  try {
    const dashboardResponse = await fetch(`${BASE_URL}/en/dashboard`);
    if (dashboardResponse.ok) {
      success('Dashboard page loads correctly');
    } else {
      warning('Dashboard page may have issues');
    }
  } catch (e) {
    warning('Dashboard page not accessible');
  }
  
  // Test tasks page
  try {
    const tasksResponse = await fetch(`${BASE_URL}/en/dashboard/tasks`);
    if (tasksResponse.ok) {
      success('Tasks page loads correctly');
    } else {
      warning('Tasks page may have issues');
    }
  } catch (e) {
    warning('Tasks page not accessible');
  }
}

// Main execution
async function main() {
  const apiTestsPassed = await runAllTests();
  await testFeatures();
  
  log('\n🏁 Testing Complete!\n', colors.cyan);
  
  if (apiTestsPassed) {
    success('HopeBridge is ready for development! 🚀');
    process.exit(0);
  } else {
    error('Some issues need to be resolved before proceeding.');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

export { runAllTests, testFeatures };
