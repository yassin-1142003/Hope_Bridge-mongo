import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/charity';
  
  return {
    uri: mongodbUri,
    options: {
      // Connection settings
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '5000'),
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Compression
      compressors: ['zstd', 'snappy', 'zlib'],
      
      // Read preferences
      readPreference: 'primaryPreferred',
      readConcern: { level: 'majority' },
      
      // Write concerns
      writeConcern: { w: 'majority', j: true },
      
      // Buffering
      bufferMaxEntries: 0,
      bufferCommands: false,
      
      // Monitoring
      monitorCommands: process.env.NODE_ENV === 'development',
      
      // Authentication (if needed)
      authSource: process.env.DB_AUTH_SOURCE || 'admin',
      
      // SSL/TLS
      ssl: process.env.DB_SSL === 'true',
      sslValidate: process.env.DB_SSL_VALIDATE !== 'false',
      
      // Connection string options
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    
    // Redis configuration (for caching)
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'charity:',
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      
      // Connection pool
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryDelayOnClusterDown: 300,
      
      // Memory optimization
      maxmemoryPolicy: process.env.REDIS_MAX_MEMORY_POLICY || 'allkeys-lru',
      maxmemory: process.env.REDIS_MAX_MEMORY || '256mb',
    },
    
    // Performance monitoring
    performance: {
      slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '100'),
      enableProfiling: process.env.NODE_ENV === 'development',
      logSlowQueries: process.env.LOG_SLOW_QUERIES === 'true',
      maxQueryTime: parseInt(process.env.MAX_QUERY_TIME || '1000'),
    },
    
    // Index management
    indexes: {
      autoCreate: process.env.AUTO_CREATE_INDEXES !== 'false',
      background: true,
      unique: true,
      sparse: false,
      expireAfterSeconds: process.env.INDEX_EXPIRE_AFTER ? parseInt(process.env.INDEX_EXPIRE_AFTER) : undefined,
    },
    
    // Backup configuration
    backup: {
      enabled: process.env.DB_BACKUP_ENABLED === 'true',
      interval: process.env.DB_BACKUP_INTERVAL || 'daily',
      retention: parseInt(process.env.DB_BACKUP_RETENTION || '7'),
      compression: true,
      encryption: process.env.DB_BACKUP_ENCRYPTION === 'true',
    },
  };
});
