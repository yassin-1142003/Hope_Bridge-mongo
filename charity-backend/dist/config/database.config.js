"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/charity';
    return {
        uri: mongodbUri,
        options: {
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '5000'),
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
            connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
            retryWrites: true,
            retryReads: true,
            compressors: ['zstd', 'snappy', 'zlib'],
            readPreference: 'primaryPreferred',
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority', j: true },
            bufferMaxEntries: 0,
            bufferCommands: false,
            monitorCommands: process.env.NODE_ENV === 'development',
            authSource: process.env.DB_AUTH_SOURCE || 'admin',
            ssl: process.env.DB_SSL === 'true',
            sslValidate: process.env.DB_SSL_VALIDATE !== 'false',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
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
            connectTimeout: 10000,
            commandTimeout: 5000,
            retryDelayOnClusterDown: 300,
            maxmemoryPolicy: process.env.REDIS_MAX_MEMORY_POLICY || 'allkeys-lru',
            maxmemory: process.env.REDIS_MAX_MEMORY || '256mb',
        },
        performance: {
            slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '100'),
            enableProfiling: process.env.NODE_ENV === 'development',
            logSlowQueries: process.env.LOG_SLOW_QUERIES === 'true',
            maxQueryTime: parseInt(process.env.MAX_QUERY_TIME || '1000'),
        },
        indexes: {
            autoCreate: process.env.AUTO_CREATE_INDEXES !== 'false',
            background: true,
            unique: true,
            sparse: false,
            expireAfterSeconds: process.env.INDEX_EXPIRE_AFTER ? parseInt(process.env.INDEX_EXPIRE_AFTER) : undefined,
        },
        backup: {
            enabled: process.env.DB_BACKUP_ENABLED === 'true',
            interval: process.env.DB_BACKUP_INTERVAL || 'daily',
            retention: parseInt(process.env.DB_BACKUP_RETENTION || '7'),
            compression: true,
            encryption: process.env.DB_BACKUP_ENCRYPTION === 'true',
        },
    };
});
//# sourceMappingURL=database.config.js.map