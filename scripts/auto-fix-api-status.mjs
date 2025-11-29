import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Function to fix missing status codes in a file
function fixMissingStatusCodes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let newContent = content;

  // Pattern to find NextResponse.json calls without status codes
  const pattern = /NextResponse\.json\((\{[^}]+\})\)(?!\s*,\s*{\s*status:\s*\d+\s*})/g;
  
  // Replace with status codes based on context
  newContent = newContent.replace(pattern, (match, responseContent) => {
    modified = true;
    
    // Determine if it's a success or error response
    if (responseContent.includes('success: true')) {
      // Check if it's a creation operation
      if (responseContent.includes('created') || responseContent.includes('registered') || responseContent.includes('uploaded')) {
        return `NextResponse.json(${responseContent}, { status: 201 })`;
      } else {
        return `NextResponse.json(${responseContent}, { status: 200 })`;
      }
    } else {
      // Error response - default to 500 if no specific error is indicated
      if (responseContent.includes('not found') || responseContent.includes('not exist')) {
        return `NextResponse.json(${responseContent}, { status: 404 })`;
      } else if (responseContent.includes('unauthorized') || responseContent.includes('authentication')) {
        return `NextResponse.json(${responseContent}, { status: 401 })`;
      } else if (responseContent.includes('forbidden') || responseContent.includes('access required')) {
        return `NextResponse.json(${responseContent}, { status: 403 })`;
      } else if (responseContent.includes('invalid') || responseContent.includes('validation') || responseContent.includes('required')) {
        return `NextResponse.json(${responseContent}, { status: 400 })`;
      } else if (responseContent.includes('already exists') || responseContent.includes('conflict')) {
        return `NextResponse.json(${responseContent}, { status: 409 })`;
      } else {
        return `NextResponse.json(${responseContent}, { status: 500 })`;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  
  return false;
}

// Function to find all API route files
function findApiFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findApiFiles(fullPath, files);
    } else if (item === 'route.ts' || item === 'route.js') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  log('\n🔧 AUTO-FIXING API RESPONSE STATUS CODES', 'cyan');
  log('=========================================\n', 'cyan');
  
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    log('❌ API directory not found', 'red');
    return;
  }
  
  const apiFiles = findApiFiles(apiDir);
  
  if (apiFiles.length === 0) {
    log('❌ No API route files found', 'red');
    return;
  }
  
  log(`📁 Processing ${apiFiles.length} API route files\n`, 'blue');
  
  let fixedCount = 0;
  let totalFixes = 0;
  
  apiFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const fixes = fixMissingStatusCodes(file);
    
    if (fixes) {
      fixedCount++;
      totalFixes++;
      log(`✅ Fixed: ${relativePath}`, 'green');
    }
  });
  
  log('\n📊 Auto-Fix Summary', 'cyan');
  log('====================', 'cyan');
  log(`📁 Files processed: ${apiFiles.length}`, 'blue');
  log(`✅ Files fixed: ${fixedCount}`, 'green');
  log(`🔧 Total fixes applied: ${totalFixes}`, 'green');
  
  if (fixedCount > 0) {
    log('\n🎯 Applied Fixes:', 'yellow');
    log('• Added status: 200 for successful GET requests', 'yellow');
    log('• Added status: 201 for resource creation', 'yellow');
    log('• Added status: 400 for validation errors', 'yellow');
    log('• Added status: 401 for authentication errors', 'yellow');
    log('• Added status: 403 for authorization errors', 'yellow');
    log('• Added status: 404 for not found errors', 'yellow');
    log('• Added status: 409 for conflict errors', 'yellow');
    log('• Added status: 500 for server errors', 'yellow');
    
    log('\n🔄 Next Steps:', 'cyan');
    log('1. Run the audit again to verify fixes', 'cyan');
    log('2. Test the APIs to ensure they work correctly', 'cyan');
    log('3. Review any remaining edge cases manually', 'cyan');
  } else {
    log('\n✅ No fixes needed - all APIs already have proper status codes!', 'green');
  }
}

// Run the auto-fix
main();
