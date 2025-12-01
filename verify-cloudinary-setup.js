#!/usr/bin/env node

/**
 * Cloudinary + Multer Setup Verification Script
 * 
 * This script checks if all Cloudinary settings are properly configured
 * and tests the integration with your Hope Bridge project.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Cloudinary + Multer Setup Verification\n');
console.log('==========================================\n');

// Check environment variables
console.log('📋 1. Checking Environment Variables');
console.log('-----------------------------------');

const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  const requiredVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    const status = value ? '✅' : '❌';
    const display = value ? `Set (${value.length} chars)` : 'Not set';
    console.log(`${status} ${varName}: ${display}`);
    if (!value) allPresent = false;
  });
  
  if (allPresent) {
    console.log('✅ All required environment variables are set\n');
  } else {
    console.log('❌ Some environment variables are missing\n');
  }
} else {
  console.log('❌ .env.local file not found\n');
}

// Check installed packages
console.log('📦 2. Checking Installed Packages');
console.log('---------------------------------');

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = ['cloudinary', 'multer', '@types/multer'];
  requiredPackages.forEach(pkg => {
    const version = dependencies[pkg];
    const status = version ? '✅' : '❌';
    const display = version ? `v${version}` : 'Not installed';
    console.log(`${status} ${pkg}: ${display}`);
  });
  console.log('');
} else {
  console.log('❌ package.json not found\n');
}

// Check API routes
console.log('🛣️  3. Checking API Routes');
console.log('--------------------------');

const apiRoutes = [
  'app/api/upload/route.ts',
  'app/api/upload-enhanced/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(process.cwd(), route);
  const status = fs.existsSync(routePath) ? '✅' : '❌';
  console.log(`${status} ${route}`);
});
console.log('');

// Check services
console.log('⚙️  4. Checking Services');
console.log('----------------------');

const services = [
  'lib/services/CloudinaryService.ts',
  'lib/services/TaskService.ts'
];

services.forEach(service => {
  const servicePath = path.join(process.cwd(), service);
  const status = fs.existsSync(servicePath) ? '✅' : '❌';
  console.log(`${status} ${service}`);
});
console.log('');

// Check test pages
console.log('🧪 5. Test Pages Available');
console.log('------------------------');

const testPages = [
  'app/[locale]/cloudinary-test/page.tsx',
  'app/[locale]/cloudinary-verification/page.tsx'
];

testPages.forEach(page => {
  const pagePath = path.join(process.cwd(), page);
  const status = fs.existsSync(pagePath) ? '✅' : '❌';
  console.log(`${status} ${page}`);
});
console.log('');

// Check Next.js config for Cloudinary
console.log('⚙️  6. Next.js Configuration');
console.log('-------------------------');

const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  const hasCloudinary = nextConfig.includes('res.cloudinary.com');
  const status = hasCloudinary ? '✅' : '❌';
  console.log(`${status} Cloudinary hostname in Next.js config: ${hasCloudinary ? 'Configured' : 'Not configured'}`);
} else {
  console.log('❌ next.config.ts not found');
}
console.log('');

// Generate setup instructions
console.log('📝 Setup Instructions');
console.log('====================');

if (!envVars['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME']) {
  console.log('❌ Missing Cloudinary configuration. Please:');
  console.log('1. Sign up at https://cloudinary.com');
  console.log('2. Get your credentials from the dashboard');
  console.log('3. Update your .env.local file with the credentials');
  console.log('');
}

console.log('🧪 To test the integration:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Visit: http://localhost:3000/en/cloudinary-verification');
console.log('3. Run the verification tests');
console.log('4. Try uploading some test files');
console.log('');

console.log('📋 To use in your task form:');
console.log('1. Go to: http://localhost:3000/en/dashboard/tasks');
console.log('2. Click "Add New Task"');
console.log('3. Fill in the task details including start/end dates');
console.log('4. Drag and drop files (images, videos, documents)');
console.log('5. Submit the task');
console.log('');

console.log('✨ Verification complete! ✨');
