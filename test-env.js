#!/usr/bin/env node

/**
 * Environment Variables Test Script
 * 
 * This script verifies that environment variables are loaded correctly
 */

import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
config({ path: '.env' });

console.log('🔍 Testing Environment Variables...\n');

// Test critical environment variables
const criticalVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'LOGIN_SECRET'
];

let allGood = true;

criticalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}... (length: ${value.length})`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

console.log('\n📊 Environment Variables Status:');
if (allGood) {
  console.log('🎉 All critical environment variables are set!');
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test authentication: Login and check dashboard');
  console.log('3. Verify JWT tokens are working correctly');
} else {
  console.log('⚠️ Some environment variables are missing!');
  console.log('\n🛠️ Troubleshooting:');
  console.log('1. Check that .env file exists in the root directory');
  console.log('2. Verify .env file contains the required variables');
  console.log('3. Make sure there are no typos in variable names');
  console.log('4. Check that dotenv is properly configured');
}

// Test JWT functionality
if (process.env.JWT_SECRET) {
  console.log('\n🔐 Testing JWT Functionality...');
  try {
    // Test token generation
    const testPayload = { email: 'test@example.com', role: 'USER' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ Token generation: SUCCESS (${token.substring(0, 20)}...)`);
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verification: SUCCESS');
    console.log(`📋 Decoded payload: ${JSON.stringify(decoded)}`);
    
  } catch (error) {
    console.log(`❌ JWT functionality failed: ${error.message}`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
console.log(allGood ? '🎉 Environment setup is READY!' : '⚠️ Environment setup needs FIXES!');
console.log('='.repeat(50));

process.exit(allGood ? 0 : 1);
