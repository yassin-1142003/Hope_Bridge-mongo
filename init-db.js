#!/usr/bin/env node

/**
 * Run Database Initialization
 * 
 * Simple script to run the MongoDB database initialization
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting database initialization...\n');

// Run the init script
const initProcess = spawn('npx', ['tsx', 'init-database.ts'], {
  cwd: path.join(__dirname, 'scripts'),
  stdio: 'inherit',
  shell: true
});

initProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Navigate to /en/dashboard/tasks');
    console.log('3. The dashboard should now work with real MongoDB data\n');
  } else {
    console.error(`\n❌ Database initialization failed with code ${code}`);
    console.log('\n🛠️ Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your .env file for MONGODB_URI');
    console.log('3. Ensure you have tsx installed: npm install -g tsx\n');
  }
});
