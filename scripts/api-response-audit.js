const fs = require('fs');
const path = require('path');

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

// Patterns to look for in API responses
const responsePatterns = [
  {
    name: 'Missing Status Code',
    pattern: /NextResponse\.json\(([^)]+)\)(?!\s*,\s*{\s*status:\s*\d+\s*})/,
    severity: 'error',
    fix: 'Add explicit status code to NextResponse.json()'
  },
  {
    name: 'Always Returns 200',
    pattern: /status:\s*200(?!\s*})/,
    severity: 'warning',
    fix: 'Consider using appropriate status codes (201 for creation, etc.)'
  },
  {
    name: 'Generic Error Response',
    pattern: /status:\s*500(?!\s*})/,
    severity: 'info',
    fix: 'Consider more specific error codes (400, 401, 403, 404, 409)'
  },
  {
    name: 'Success Response Missing Status',
    pattern: /success:\s*true(?![^}]*status:\s*\d+)/,
    severity: 'error',
    fix: 'Add status code (200 for GET, 201 for POST/PUT)'
  }
];

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

function analyzeApiFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Extract HTTP method handlers
  const methodHandlers = content.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g) || [];
  
  responsePatterns.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      issues.push({
        type: pattern.name,
        severity: pattern.severity,
        fix: pattern.fix,
        matches: matches.length,
        examples: matches.slice(0, 2) // Show first 2 examples
      });
    }
  });
  
  // Check for proper status code usage
  const statusCodes = content.match(/status:\s*(\d+)/g) || [];
  const successResponses = content.match(/success:\s*true/g) || [];
  const errorResponses = content.match(/success:\s*false/g) || [];
  
  return {
    file: filePath,
    methodHandlers: methodHandlers.length,
    statusCodes: statusCodes.map(s => s.split(':')[1].trim()),
    successResponses: successResponses.length,
    errorResponses: errorResponses.length,
    issues
  };
}

function main() {
  log('\n🔍 API Response Status Code Audit', 'cyan');
  log('=====================================\n', 'cyan');
  
  const apiDir = path.join(__dirname, 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    log('❌ API directory not found', 'red');
    return;
  }
  
  const apiFiles = findApiFiles(apiDir);
  
  if (apiFiles.length === 0) {
    log('❌ No API route files found', 'red');
    return;
  }
  
  log(`📁 Found ${apiFiles.length} API route files\n`, 'blue');
  
  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  
  apiFiles.forEach(file => {
    const analysis = analyzeApiFile(file);
    
    if (analysis.issues.length > 0) {
      const relativePath = path.relative(process.cwd(), file);
      log(`\n📄 ${relativePath}`, 'yellow');
      log(`   Methods: ${analysis.methodHandlers} | Status codes: ${analysis.statusCodes.join(', ')}`);
      log(`   Success responses: ${analysis.successResponses} | Error responses: ${analysis.errorResponses}\n`, 'blue');
      
      analysis.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        log(`   ${icon} ${issue.type} (${issue.matches} occurrences)`, issue.severity);
        log(`      Fix: ${issue.fix}`, 'gray');
        
        if (issue.severity === 'error') errorCount++;
        else if (issue.severity === 'warning') warningCount++;
        else infoCount++;
        
        totalIssues += issue.matches;
      });
    }
  });
  
  log('\n📊 Audit Summary', 'cyan');
  log('================', 'cyan');
  log(`📁 Files analyzed: ${apiFiles.length}`, 'blue');
  log(`❌ Errors: ${errorCount}`, 'red');
  log(`⚠️  Warnings: ${warningCount}`, 'yellow');
  log(`ℹ️  Info: ${infoCount}`, 'blue');
  log(`🔍 Total issues: ${totalIssues}`, totalIssues > 0 ? 'yellow' : 'green');
  
  if (totalIssues === 0) {
    log('\n✅ All API endpoints have proper status codes!', 'green');
  } else {
    log('\n🔧 Recommended Actions:', 'yellow');
    log('1. Fix all error-level issues (missing status codes)', 'yellow');
    log('2. Review warnings (always returning 200)', 'yellow');
    log('3. Consider info suggestions (more specific error codes)', 'yellow');
    log('\n📋 Best Practices:', 'cyan');
    log('• 200: Successful GET requests', 'cyan');
    log('• 201: Successful POST/PUT (resource created)', 'cyan');
    log('• 204: Successful DELETE (no content)', 'cyan');
    log('• 400: Bad request (validation errors)', 'cyan');
    log('• 401: Unauthorized (authentication required)', 'cyan');
    log('• 403: Forbidden (authorization required)', 'cyan');
    log('• 404: Not found', 'cyan');
    log('• 409: Conflict (resource already exists)', 'cyan');
    log('• 500: Internal server error', 'cyan');
  }
}

// Run the audit
if (require.main === module) {
  main();
}

module.exports = { main, analyzeApiFile };
