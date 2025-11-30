// Test script for the notification system
// Run this in the browser console to test the alert button and notification system

console.log('🧪 Testing Alert Button & Notification System...');

// Test 1: Check if AlertButton component is loaded
function testAlertButton() {
  const alertButton = document.querySelector('[data-testid="alert-button"]') ||
                      document.querySelector('button[class*="from-blue-600"]') ||
                      document.querySelector('button[class*="bg-gradient-to-br"]');
  
  const hasAlertButton = !!alertButton;
  
  console.log('✅ Alert Button Test Results:', {
    hasAlertButton,
    buttonFound: !!alertButton,
    hasGradient: alertButton ? alertButton.className.includes('gradient') : false
  });
  
  return hasAlertButton;
}

// Test 2: Test new projects count API
async function testNewProjectsAPI() {
  try {
    const response = await fetch('/api/projects/new/count');
    const data = await response.json();
    
    console.log('✅ New Projects API Test Results:', {
      status: response.status,
      success: data.success,
      count: data.count,
      timeframe: data.timeframe
    });
    
    return response.ok && data.success;
  } catch (error) {
    console.error('❌ New Projects API Test Failed:', error);
    return false;
  }
}

// Test 3: Test send notification API
async function testSendNotificationAPI() {
  try {
    const testMessage = `Test notification from browser console at ${new Date().toLocaleTimeString()}`;
    
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        type: 'test_notification',
        targetUsers: 'all'
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Send Notification API Test Results:', {
      status: response.status,
      success: data.success,
      recipients: data.recipients,
      message: data.message
    });
    
    return response.ok && data.success;
  } catch (error) {
    console.error('❌ Send Notification API Test Failed:', error);
    return false;
  }
}

// Test 4: Check for visual effects
function testVisualEffects() {
  const alertButton = document.querySelector('button[class*="bg-gradient-to-br"]');
  
  if (!alertButton) {
    console.log('❌ Visual Effects Test: Alert button not found');
    return false;
  }
  
  // Check for gradient classes
  const hasGradient = alertButton.className.includes('bg-gradient-to-br');
  const hasShadow = alertButton.className.includes('shadow');
  const hasTransition = alertButton.className.includes('transition');
  
  // Check for hover effects by simulating hover
  const originalClass = alertButton.className;
  alertButton.dispatchEvent(new Event('mouseenter'));
  const hasHoverEffect = alertButton.className !== originalClass;
  
  console.log('✅ Visual Effects Test Results:', {
    hasGradient,
    hasShadow,
    hasTransition,
    hasHoverEffect,
    buttonClasses: alertButton.className
  });
  
  return hasGradient && hasShadow && hasTransition;
}

// Test 5: Test notification badge
function testNotificationBadge() {
  const alertButton = document.querySelector('button[class*="bg-gradient-to-br"]');
  
  if (!alertButton) {
    console.log('❌ Notification Badge Test: Alert button not found');
    return false;
  }
  
  // Look for notification badge
  const badge = alertButton.querySelector('[class*="bg-red-500"]') ||
               alertButton.querySelector('[class*="rounded-full"]') ||
               alertButton.querySelector('.absolute');
  
  const hasBadge = !!badge;
  const hasBadgeText = badge ? badge.textContent : 'No badge';
  
  console.log('✅ Notification Badge Test Results:', {
    hasBadge,
    badgeText: hasBadgeText,
    badgeClasses: badge ? badge.className : 'No badge'
  });
  
  return hasBadge;
}

// Test 6: Test panel expansion
function testPanelExpansion() {
  const alertButton = document.querySelector('button[class*="bg-gradient-to-br"]');
  
  if (!alertButton) {
    console.log('❌ Panel Expansion Test: Alert button not found');
    return false;
  }
  
  // Check if there's an expanded panel
  const panel = document.querySelector('[class*="backdrop-blur"]') ||
              document.querySelector('[class*="bg-white/95"]') ||
              document.querySelector('.fixed.bottom-8');
  
  const hasPanel = !!panel;
  
  // Try to click the button to expand panel
  alertButton.click();
  
  // Check if panel appears after click
  setTimeout(() => {
    const panelAfterClick = document.querySelector('[class*="backdrop-blur"]') ||
                           document.querySelector('[class*="bg-white/95"]') ||
                           document.querySelector('.fixed.bottom-8');
    
    const panelExpanded = !!panelAfterClick;
    
    console.log('✅ Panel Expansion Test Results:', {
      hasPanel,
      panelExpanded,
      clickable: alertButton.onclick !== null
    });
  }, 100);
  
  return hasPanel;
}

// Run all tests
async function runAllNotificationTests() {
  console.log('🚀 Starting Notification System Tests...\n');
  
  const results = {
    alertButton: testAlertButton(),
    newProjectsAPI: await testNewProjectsAPI(),
    sendNotificationAPI: await testSendNotificationAPI(),
    visualEffects: testVisualEffects(),
    notificationBadge: testNotificationBadge(),
    panelExpansion: testPanelExpansion()
  };
  
  console.log('\n📊 Notification System Test Results:');
  console.log('Alert Button:', results.alertButton ? '✅ PASS' : '❌ FAIL');
  console.log('New Projects API:', results.newProjectsAPI ? '✅ PASS' : '❌ FAIL');
  console.log('Send Notification API:', results.sendNotificationAPI ? '✅ PASS' : '❌ FAIL');
  console.log('Visual Effects:', results.visualEffects ? '✅ PASS' : '❌ FAIL');
  console.log('Notification Badge:', results.notificationBadge ? '✅ PASS' : '❌ FAIL');
  console.log('Panel Expansion:', results.panelExpansion ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Status:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (!allPassed) {
    console.log('\n🔧 Troubleshooting Tips:');
    if (!results.alertButton) console.log('- Check if AlertButton component is properly imported');
    if (!results.newProjectsAPI) console.log('- Verify API endpoints are working');
    if (!results.sendNotificationAPI) console.log('- Check notification sending permissions');
    if (!results.visualEffects) console.log('- Verify CSS classes are applied correctly');
    if (!results.notificationBadge) console.log('- Badge might appear when there are new projects');
    if (!results.panelExpansion) console.log('- Panel might need new projects to appear');
  }
  
  return results;
}

// Auto-run tests when this script is loaded
runAllNotificationTests();

// Also expose functions for manual testing
window.testNotifications = {
  testAlertButton,
  testNewProjectsAPI,
  testSendNotificationAPI,
  testVisualEffects,
  testNotificationBadge,
  testPanelExpansion,
  runAllNotificationTests
};

console.log('🔧 Notification test functions available in window.testNotifications');
console.log('💡 Run window.testNotifications.runAllNotificationTests() to re-run tests');
