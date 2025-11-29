#!/usr/bin/env node

// Beautiful Terminal Response System
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

const beautifulConsole = {
  header: (text) => {
    console.log(`
${colors.cyan}${colors.bright}╔══════════════════════════════════════════════════════════════╗
║ ${text.padEnd(58)} ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
    `);
  },

  success: (message, data) => {
    console.log(`
${colors.bgGreen}${colors.white} ✅ SUCCESS ${colors.reset} ${colors.green}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}📄${colors.reset} ${message}
${data ? `${colors.dim}📊 ${JSON.stringify(data, null, 2)}${colors.reset}` : ''}
    `);
  },

  error: (message, error) => {
    console.log(`
${colors.bgRed}${colors.white} ❌ ERROR ${colors.reset} ${colors.red}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}📄${colors.reset} ${message}
${colors.dim}🔍 Details: ${error?.message || error}${colors.reset}
    `);
  },

  warning: (message) => {
    console.log(`
${colors.bgYellow}${colors.white} ⚠️  WARNING ${colors.reset} ${colors.yellow}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}📄${colors.reset} ${message}
    `);
  },

  info: (message) => {
    console.log(`
${colors.bgBlue}${colors.white} ℹ️  INFO ${colors.reset} ${colors.blue}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}📄${colors.reset} ${message}
    `);
  },

  api: (method, endpoint, status, duration) => {
    const statusColor = status >= 200 && status < 300 ? colors.green :
                        status >= 400 ? colors.red : colors.yellow;
    const emoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
    const timeInfo = duration ? ` ${colors.dim}(${duration}ms)${colors.reset}` : '';
    
    console.log(`
${colors.cyan}${colors.bright} 🌐 API REQUEST${colors.reset} ${colors.dim}${new Date().toLocaleTimeString()}${colors.reset}
${statusColor}${emoji} ${method} ${endpoint} [${status}]${colors.reset}${timeInfo}
    `);
  },

  database: (operation, collection, count) => {
    const countInfo = count ? ` ${colors.dim}(${count} documents)${colors.reset}` : '';
    console.log(`
${colors.magenta}${colors.bright} 🗄️  DATABASE${colors.reset} ${colors.dim}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}📊${colors.reset} ${operation} on ${collection}${countInfo}
    `);
  },

  media: (operation, filename) => {
    console.log(`
${colors.yellow}${colors.bright} 📁 MEDIA${colors.reset} ${colors.dim}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}🖼️${colors.reset}  ${operation}: ${filename}
    `);
  },

  server: (port, env) => {
    console.log(`
${colors.bgCyan}${colors.white} 🚀 SERVER STARTED${colors.reset} ${colors.cyan}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}🌐${colors.reset} Development server running on ${colors.green}http://localhost:${port}${colors.reset}
${colors.bright}🔧${colors.reset} Environment: ${colors.yellow}${env}${colors.reset}
${colors.bright}⚡${colors.reset} Turbopack enabled
    `);
  },

  compilation: (file, duration, status = 'success') => {
    const statusColor = status === 'success' ? colors.green : colors.red;
    const emoji = status === 'success' ? '✅' : '❌';
    
    console.log(`
${colors.cyan}${emoji} Compilation${colors.reset} ${colors.dim}${new Date().toLocaleTimeString()}${colors.reset}
${colors.bright}📄${colors.reset} ${file}
${statusColor}⚡ ${duration}ms${colors.reset}
    `);
  },

  separator: () => {
    console.log(`${colors.dim}─────────────────────────────────────────────────────────────${colors.reset}`);
  },

  welcome: () => {
    console.log(`
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  🌟 HOPE BRIDGE - BEAUTIFUL TERMINAL RESPONSE SYSTEM        ║
║                                                              ║
║  ✅ Clean & Organized Output                                 ║
║  🎨 Beautiful Colors & Formatting                            ║
║  📊 Real-time Performance Metrics                            ║
║  🔍 Enhanced Error Reporting                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
    `);
  }
};

// Override console methods with beautiful versions
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

// Enhanced console methods
console.log = (...args) => {
  const message = args.join(' ');
  
  // Filter out unwanted messages
  if (message.includes('upstream image response failed')) {
    beautifulConsole.warning('External image unavailable, using local fallback');
    return;
  }
  
  if (message.includes('ECONNREFUSED')) {
    beautifulConsole.error('Connection refused - server may be starting up', new Error(message));
    return;
  }
  
  if (message.includes('Compiled') && message.includes('ms')) {
    // Parse compilation message
    const match = message.match(/Compiled (\S+) in (\d+)ms/);
    if (match) {
      const [, file, duration] = match;
      beautifulConsole.compilation(file, parseInt(duration));
      return;
    }
  }
  
  if (message.includes('GET') && message.includes('200')) {
    // Parse API request message
    const match = message.match(/GET (\S+) 200 in (\d+)ms/);
    if (match) {
      const [, endpoint, duration] = match;
      beautifulConsole.api('GET', endpoint, 200, parseInt(duration));
      return;
    }
  }
  
  // Default to original console for other messages
  originalConsole.log(...args);
};

console.error = (...args) => {
  const message = args.join(' ');
  beautifulConsole.error(message, new Error(message));
};

console.warn = (...args) => {
  const message = args.join(' ');
  beautifulConsole.warning(message);
};

console.info = (...args) => {
  const message = args.join(' ');
  beautifulConsole.info(message);
};

// Export beautiful console for use in other files
export default beautifulConsole;

// Show welcome message
beautifulConsole.welcome();
