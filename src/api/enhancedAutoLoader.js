const fs = require('fs');
const path = require('path');
const express = require('express');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');

/**
 * Enhanced Auto-Loading API System
 * Features: Dynamic route loading, middleware injection, API versioning
 */
class EnhancedAutoLoader {
  constructor(app, options = {}) {
    this.app = app;
    this.routesPath = options.routesPath || path.join(__dirname, 'routes');
    this.middlewarePath = options.middlewarePath || path.join(__dirname, 'middleware');
    this.apiVersion = options.apiVersion || 'v1';
    this.basePath = options.basePath || `/api/${this.apiVersion}`;
    this.loadedRoutes = new Map();
    this.globalMiddleware = [];
  }

  /**
   * Initialize the auto-loading system
   */
  async initialize() {
    try {
      logger.info('🔄 Initializing Enhanced Auto-Loading API System...');
      
      // Load global middleware
      await this.loadGlobalMiddleware();
      
      // Load all routes
      await this.loadAllRoutes();
      
      // Setup health check endpoint
      this.setupHealthCheck();
      
      // Setup API documentation endpoint
      this.setupApiDocs();
      
      logger.info(`✅ Auto-Loader initialized. Loaded ${this.loadedRoutes.size} routes.`);
      
    } catch (error) {
      logger.error('❌ Failed to initialize Auto-Loader:', error);
      throw error;
    }
  }

  /**
   * Load global middleware
   */
  async loadGlobalMiddleware() {
    try {
      // Express built-in middleware
      this.app.use(express.json({ limit: '10mb' }));
      this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      
      // Custom middleware
      const middlewareFiles = fs.readdirSync(this.middlewarePath)
        .filter(file => file.endsWith('.js'));

      for (const file of middlewareFiles) {
        const middleware = require(path.join(this.middlewarePath, file));
        if (typeof middleware === 'function') {
          this.app.use(middleware);
          this.globalMiddleware.push(file);
          logger.debug(`🔧 Loaded global middleware: ${file}`);
        }
      }
      
      logger.info(`✅ Loaded ${this.globalMiddleware.length} global middleware`);
    } catch (error) {
      logger.error('❌ Failed to load global middleware:', error);
    }
  }

  /**
   * Load all routes from the routes directory
   */
  async loadAllRoutes() {
    try {
      const routeDirs = fs.readdirSync(this.routesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const dir of routeDirs) {
        await this.loadRouteDirectory(dir);
      }
      
      // Load root-level routes
      await this.loadRootRoutes();
      
    } catch (error) {
      logger.error('❌ Failed to load routes:', error);
    }
  }

  /**
   * Load routes from a specific directory
   */
  async loadRouteDirectory(routeDir) {
    try {
      const dirPath = path.join(this.routesPath, routeDir);
      const routeFiles = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.js') && !file.startsWith('index'));

      // Create router for this directory
      const router = express.Router();
      
      // Load index file if exists (for route-specific middleware)
      const indexPath = path.join(dirPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        const indexModule = require(indexPath);
        if (indexModule.middleware && Array.isArray(indexModule.middleware)) {
          indexModule.middleware.forEach(middleware => {
            router.use(middleware);
          });
        }
      }

      // Load all route files
      for (const file of routeFiles) {
        const routePath = path.join(dirPath, file);
        const routeModule = require(routePath);
        
        if (this.isValidRouteModule(routeModule)) {
          this.registerRoute(router, routeModule, file);
          this.loadedRoutes.set(`${routeDir}/${file}`, {
            path: `${this.basePath}/${routeDir}`,
            methods: Object.keys(routeModule).filter(key => ['get', 'post', 'put', 'delete', 'patch'].includes(key))
          });
        }
      }

      // Mount the router
      this.app.use(`${this.basePath}/${routeDir}`, router);
      logger.info(`📂 Loaded route directory: ${routeDir}`);
      
    } catch (error) {
      logger.error(`❌ Failed to load route directory ${routeDir}:`, error);
    }
  }

  /**
   * Load root-level routes
   */
  async loadRootRoutes() {
    try {
      const rootFiles = fs.readdirSync(this.routesPath)
        .filter(file => file.endsWith('.js') && !file.startsWith('index'));

      const router = express.Router();

      for (const file of rootFiles) {
        const routePath = path.join(this.routesPath, file);
        const routeModule = require(routePath);
        
        if (this.isValidRouteModule(routeModule)) {
          this.registerRoute(router, routeModule, file);
          this.loadedRoutes.set(`root/${file}`, {
            path: this.basePath,
            methods: Object.keys(routeModule).filter(key => ['get', 'post', 'put', 'delete', 'patch'].includes(key))
          });
        }
      }

      this.app.use(this.basePath, router);
      logger.info('📂 Loaded root-level routes');
      
    } catch (error) {
      logger.error('❌ Failed to load root routes:', error);
    }
  }

  /**
   * Validate route module
   */
  isValidRouteModule(module) {
    const validMethods = ['get', 'post', 'put', 'delete', 'patch'];
    return Object.keys(module).some(key => validMethods.includes(key));
  }

  /**
   * Register route methods
   */
  registerRoute(router, routeModule, filename) {
    const validMethods = ['get', 'post', 'put', 'delete', 'patch'];
    
    validMethods.forEach(method => {
      if (typeof routeModule[method] === 'function') {
        // Extract route name from filename
        const routeName = path.basename(filename, '.js');
        
        // Use custom path if specified, otherwise use filename
        const routePath = routeModule.path || `/${routeName}`;
        
        // Wrap with catchAsync for error handling
        router[method](routePath, catchAsync(routeModule[method]));
        
        logger.debug(`🛣️  Registered ${method.toUpperCase()} ${routePath}`);
      }
    });
  }

  /**
   * Setup health check endpoint
   */
  setupHealthCheck() {
    this.app.get('/health', catchAsync(async (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        routes: this.loadedRoutes.size,
        middleware: this.globalMiddleware.length,
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      };

      res.status(200).json({
        success: true,
        data: health
      });
    }));
  }

  /**
   * Setup API documentation endpoint
   */
  setupApiDocs() {
    this.app.get('/api-docs', catchAsync(async (req, res) => {
      const docs = {
        title: 'API Documentation',
        version: this.apiVersion,
        baseUrl: this.basePath,
        routes: Array.from(this.loadedRoutes.entries()).map(([name, info]) => ({
          name,
          path: info.path,
          methods: info.methods
        })),
        middleware: this.globalMiddleware,
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: docs
      });
    }));
  }

  /**
   * Reload routes (for development)
   */
  async reloadRoutes() {
    logger.info('🔄 Reloading routes...');
    
    // Clear loaded routes cache
    this.loadedRoutes.clear();
    
    // Clear require cache
    Object.keys(require.cache).forEach(key => {
      if (key.includes('/src/api/routes/')) {
        delete require.cache[key];
      }
    });
    
    // Reload all routes
    await this.loadAllRoutes();
    
    logger.info('✅ Routes reloaded successfully');
  }

  /**
   * Get route statistics
   */
  getRouteStats() {
    return {
      totalRoutes: this.loadedRoutes.size,
      routes: Array.from(this.loadedRoutes.entries()),
      middleware: this.globalMiddleware,
      basePath: this.basePath,
      apiVersion: this.apiVersion
    };
  }
}

module.exports = EnhancedAutoLoader;
