import { MongoClient, Db, Collection, Document } from 'mongodb';
import { beautifulLog } from './beautifulResponse';

// Professional Database Response System
export class ProfessionalDatabase {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor(private uri: string, private dbName?: string) {}

  async connect(): Promise<Db> {
    if (this.isConnected && this.db) {
      beautifulLog.info('Database already connected, returning existing connection');
      return this.db;
    }

    try {
      beautifulLog.info('🔗 Establishing database connection...');
      const startTime = Date.now();

      this.client = new MongoClient(this.uri);
      await this.client.connect();
      
      this.db = this.client.db(this.dbName);
      this.isConnected = true;

      const connectionTime = Date.now() - startTime;
      beautifulLog.success(`Database connected successfully in ${connectionTime}ms`);
      
      // Test the connection
      await this.db.admin().ping();
      beautifulLog.success('Database connection verified with ping test');
      
      return this.db;
    } catch (error: any) {
      beautifulLog.error('Database connection failed', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.close();
        this.isConnected = false;
        this.db = null;
        beautifulLog.success('Database disconnected gracefully');
      } catch (error: any) {
        beautifulLog.error('Error during database disconnection', error);
        throw error;
      }
    }
  }

  getCollection<T extends Document = any>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    beautifulLog.database('ACCESS', name);
    return this.db.collection<T>(name);
  }

  // Professional CRUD operations with beautiful logging
  async create(collectionName: string, document: any): Promise<any> {
    const startTime = Date.now();
    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.insertOne({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const duration = Date.now() - startTime;
      beautifulLog.database('CREATE', collectionName, 1);
      beautifulLog.api('POST', `/api/${collectionName}`, 201, duration);

      return {
        success: true,
        data: {
          _id: result.insertedId,
          ...document
        },
        operation: 'create',
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error: any) {
      beautifulLog.error(`Create operation failed for ${collectionName}`, error);
      throw new Error(`Create operation failed: ${error.message}`);
    }
  }

  async findMany(collectionName: string, query: any = {}, options: any = {}): Promise<any> {
    const startTime = Date.now();
    const collection = this.getCollection(collectionName);

    try {
      const cursor = collection.find(query, options);
      const documents = await cursor.toArray();
      const count = documents.length;

      const duration = Date.now() - startTime;
      beautifulLog.database('FIND_MANY', collectionName, count);
      beautifulLog.api('GET', `/api/${collectionName}`, 200, duration);

      return {
        success: true,
        data: documents,
        count,
        operation: 'findMany',
        query,
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error: any) {
      beautifulLog.error(`Find operation failed for ${collectionName}`, error);
      throw new Error(`Find operation failed: ${error.message}`);
    }
  }

  async findOne(collectionName: string, query: any): Promise<any> {
    const startTime = Date.now();
    const collection = this.getCollection(collectionName);

    try {
      const document = await collection.findOne(query);

      const duration = Date.now() - startTime;
      beautifulLog.database('FIND_ONE', collectionName, document ? 1 : 0);
      beautifulLog.api('GET', `/api/${collectionName}/id`, document ? 200 : 404, duration);

      return {
        success: !!document,
        data: document,
        operation: 'findOne',
        query,
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error: any) {
      beautifulLog.error(`FindOne operation failed for ${collectionName}`, error);
      throw new Error(`FindOne operation failed: ${error.message}`);
    }
  }

  async updateOne(collectionName: string, query: any, update: any): Promise<any> {
    const startTime = Date.now();
    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.updateOne(query, {
        ...update,
        $set: {
          ...update.$set,
          updatedAt: new Date()
        }
      });

      const duration = Date.now() - startTime;
      beautifulLog.database('UPDATE_ONE', collectionName, result.modifiedCount);
      beautifulLog.api('PUT', `/api/${collectionName}`, 200, duration);

      return {
        success: result.modifiedCount > 0,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        operation: 'updateOne',
        query,
        update,
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error: any) {
      beautifulLog.error(`Update operation failed for ${collectionName}`, error);
      throw new Error(`Update operation failed: ${error.message}`);
    }
  }

  async deleteOne(collectionName: string, query: any): Promise<any> {
    const startTime = Date.now();
    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.deleteOne(query);

      const duration = Date.now() - startTime;
      beautifulLog.database('DELETE_ONE', collectionName, result.deletedCount);
      beautifulLog.api('DELETE', `/api/${collectionName}`, result.deletedCount > 0 ? 200 : 404, duration);

      return {
        success: result.deletedCount > 0,
        deletedCount: result.deletedCount,
        operation: 'deleteOne',
        query,
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error: any) {
      beautifulLog.error(`Delete operation failed for ${collectionName}`, error);
      throw new Error(`Delete operation failed: ${error.message}`);
    }
  }

  async aggregate(collectionName: string, pipeline: any[]): Promise<any> {
    const startTime = Date.now();
    const collection = this.getCollection(collectionName);

    try {
      const cursor = collection.aggregate(pipeline);
      const documents = await cursor.toArray();
      const count = documents.length;

      const duration = Date.now() - startTime;
      beautifulLog.database('AGGREGATE', collectionName, count);
      beautifulLog.api('GET', `/api/${collectionName}/aggregate`, 200, duration);

      return {
        success: true,
        data: documents,
        count,
        pipeline,
        operation: 'aggregate',
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error: any) {
      beautifulLog.error(`Aggregate operation failed for ${collectionName}`, error);
      throw new Error(`Aggregate operation failed: ${error.message}`);
    }
  }

  // Professional database health check
  async healthCheck(): Promise<any> {
    try {
      if (!this.db) {
        throw new Error('Database not connected');
      }

      const startTime = Date.now();
      
      // Test database connection
      await this.db.admin().ping();
      
      // Get database stats
      const stats = await this.db.stats();
      const collections = await this.db.listCollections().toArray();
      
      const duration = Date.now() - startTime;
      
      beautifulLog.success('Database health check completed');

      return {
        status: 'healthy',
        connection: 'connected',
        database: this.db.databaseName,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects,
        responseTime: duration,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      beautifulLog.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get collection statistics
  async getCollectionStats(collectionName: string): Promise<any> {
    try {
      const collection = this.getCollection(collectionName);
      // Use aggregate to get stats since stats() might not be available
      const stats = await this.db!.command({ collStats: collectionName });
      
      beautifulLog.database('STATS', collectionName, stats.count || 0);

      return {
        collection: collectionName,
        count: stats.count || 0,
        size: stats.size || 0,
        avgObjSize: stats.avgObjSize || 0,
        indexes: stats.nindexes || 0,
        indexSizes: stats.indexSizes || {},
        capped: stats.capped || false,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      beautifulLog.error(`Failed to get stats for ${collectionName}`, error);
      throw error;
    }
  }
}

// Singleton instance for global use
let professionalDbInstance: ProfessionalDatabase | null = null;

export function getProfessionalDatabase(uri?: string, dbName?: string): ProfessionalDatabase {
  if (!professionalDbInstance) {
    const databaseUri = uri || process.env.MONGODB_URI;
    if (!databaseUri) {
      throw new Error('MongoDB URI not provided');
    }
    professionalDbInstance = new ProfessionalDatabase(databaseUri, dbName);
  }
  return professionalDbInstance;
}

// Helper function to get collection with professional logging
export async function getCollection(collectionName: string) {
  const db = getProfessionalDatabase();
  await db.connect();
  return db.getCollection(collectionName);
}
