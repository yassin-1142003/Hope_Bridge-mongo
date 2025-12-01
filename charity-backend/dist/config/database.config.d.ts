declare const _default: (() => {
    uri: string;
    options: {
        maxPoolSize: number;
        serverSelectionTimeoutMS: number;
        socketTimeoutMS: number;
        connectTimeoutMS: number;
        retryWrites: boolean;
        retryReads: boolean;
        compressors: string[];
        readPreference: string;
        readConcern: {
            level: string;
        };
        writeConcern: {
            w: string;
            j: boolean;
        };
        bufferMaxEntries: number;
        bufferCommands: boolean;
        monitorCommands: boolean;
        authSource: string;
        ssl: boolean;
        sslValidate: boolean;
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        keyPrefix: string;
        retryDelayOnFailover: number;
        enableReadyCheck: boolean;
        maxRetriesPerRequest: null;
        lazyConnect: boolean;
        keepAlive: number;
        family: number;
        connectTimeout: number;
        commandTimeout: number;
        retryDelayOnClusterDown: number;
        maxmemoryPolicy: string;
        maxmemory: string;
    };
    performance: {
        slowQueryThreshold: number;
        enableProfiling: boolean;
        logSlowQueries: boolean;
        maxQueryTime: number;
    };
    indexes: {
        autoCreate: boolean;
        background: boolean;
        unique: boolean;
        sparse: boolean;
        expireAfterSeconds: number | undefined;
    };
    backup: {
        enabled: boolean;
        interval: string;
        retention: number;
        compression: boolean;
        encryption: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    uri: string;
    options: {
        maxPoolSize: number;
        serverSelectionTimeoutMS: number;
        socketTimeoutMS: number;
        connectTimeoutMS: number;
        retryWrites: boolean;
        retryReads: boolean;
        compressors: string[];
        readPreference: string;
        readConcern: {
            level: string;
        };
        writeConcern: {
            w: string;
            j: boolean;
        };
        bufferMaxEntries: number;
        bufferCommands: boolean;
        monitorCommands: boolean;
        authSource: string;
        ssl: boolean;
        sslValidate: boolean;
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        keyPrefix: string;
        retryDelayOnFailover: number;
        enableReadyCheck: boolean;
        maxRetriesPerRequest: null;
        lazyConnect: boolean;
        keepAlive: number;
        family: number;
        connectTimeout: number;
        commandTimeout: number;
        retryDelayOnClusterDown: number;
        maxmemoryPolicy: string;
        maxmemory: string;
    };
    performance: {
        slowQueryThreshold: number;
        enableProfiling: boolean;
        logSlowQueries: boolean;
        maxQueryTime: number;
    };
    indexes: {
        autoCreate: boolean;
        background: boolean;
        unique: boolean;
        sparse: boolean;
        expireAfterSeconds: number | undefined;
    };
    backup: {
        enabled: boolean;
        interval: string;
        retention: number;
        compression: boolean;
        encryption: boolean;
    };
}>;
export default _default;
