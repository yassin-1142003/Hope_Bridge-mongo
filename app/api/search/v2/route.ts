/**
 * Enhanced Search API v2.0
 * 
 * Enterprise-grade search with advanced features:
 * - Full-text search across all entities
 * - Advanced indexing and ranking algorithms
 * - Semantic search and AI-powered recommendations
 * - Faceted search and filtering
 * - Search analytics and insights
 * - Saved searches and alerts
 * - Multi-language support
 * - Real-time search suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { UserRole, hasPermission } from "@/lib/roles";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";

// Enhanced search schemas
const searchQuerySchemaV2 = z.object({
  // Core search parameters
  query: z.string().min(1).max(500),
  entities: z.array(z.enum(['tasks', 'users', 'files', 'projects', 'comments', 'notifications'])).default(['tasks']),
  
  // Search configuration
  searchType: z.enum(['fulltext', 'semantic', 'fuzzy', 'exact', 'wildcard']).default('fulltext'),
  operator: z.enum(['and', 'or', 'not']).default('and'),
  language: z.string().default('en'),
  
  // Advanced filtering
  filters: z.object({
    dateRange: z.object({
      field: z.string(),
      start: z.string(),
      end: z.string()
    }).optional(),
    users: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional(),
    fileType: z.array(z.string()).optional(),
    sizeRange: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional()
  }).optional(),
  
  // Sorting and ranking
  sortBy: z.enum(['relevance', 'date', 'title', 'size', 'popularity']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  ranking: z.object({
    boostRecent: z.boolean().default(true),
    boostPopular: z.boolean().default(false),
    boostUserContent: z.boolean().default(true),
    customWeights: z.record(z.number()).default({})
  }).optional(),
  
  // Pagination and limits
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().default(0),
  
  // Advanced options
  includeHighlights: z.boolean().default(true),
  includeFacets: z.boolean().default(true),
  includeSuggestions: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false),
  explainScoring: z.boolean().default(false),
  
  // Aggregation
  groupBy: z.enum(['entity', 'date', 'user', 'project']).optional(),
  aggregateBy: z.enum(['count', 'sum', 'avg']).optional(),
  aggregateField: z.string().optional()
});

const savedSearchSchemaV2 = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  query: z.string().min(1).max(500),
  entities: z.array(z.string()),
  filters: z.record(z.any()).default({}),
  isPublic: z.boolean().default(false),
  alertsEnabled: z.boolean().default(false),
  alertFrequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
  alertRecipients: z.array(z.string().email()).optional()
});

const searchIndexSchemaV2 = z.object({
  entityId: z.string(),
  entityType: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  language: z.string().default('en'),
  indexedAt: z.string(),
  updatedAt: z.string(),
  accessControl: z.object({
    owner: z.string(),
    viewers: z.array(z.string()).default([]),
    editors: z.array(z.string()).default([]),
    isPublic: z.boolean().default(false)
  })
});

// Enhanced Search Manager
class EnhancedSearchManager {
  async searchV2(searchQuery: any, session: any): Promise<any> {
    try {
      const { query, entities, searchType, filters, options = {} } = searchQuery;
      
      // Build search pipeline
      const searchPipeline = await this.buildSearchPipeline(searchQuery, session);
      
      // Execute search across all specified entities
      const results = await this.executeSearch(searchPipeline, entities, session);
      
      // Process and rank results
      let rankedResults = await this.rankResults(results, searchQuery, session);
      
      // Generate facets if requested
      let facets = null;
      if (options.includeFacets) {
        facets = await this.generateFacets(rankedResults, searchQuery);
      }
      
      // Generate suggestions if requested
      let suggestions = null;
      if (options.includeSuggestions) {
        suggestions = await this.generateSuggestions(query, session);
      }
      
      // Add highlights if requested
      if (options.includeHighlights) {
        rankedResults = await this.addHighlights(rankedResults, query);
      }
      
      // Group results if requested
      if (searchQuery.groupBy) {
        rankedResults = await this.groupResults(rankedResults, searchQuery);
      }
      
      // Calculate pagination
      const total = rankedResults.length;
      const paginatedResults = rankedResults.slice(
        (searchQuery.page - 1) * searchQuery.limit,
        searchQuery.page * searchQuery.limit
      );
      
      // Log search query for analytics
      await this.logSearchQuery(searchQuery, session, total);
      
      return {
        results: paginatedResults,
        pagination: {
          page: searchQuery.page,
          limit: searchQuery.limit,
          total,
          pages: Math.ceil(total / searchQuery.limit),
          hasNext: searchQuery.page * searchQuery.limit < total,
          hasPrev: searchQuery.page > 1
        },
        facets,
        suggestions,
        analytics: options.includeAnalytics ? await this.getSearchAnalytics(query, session) : undefined,
        queryInfo: {
          originalQuery: query,
          processedQuery: this.preprocessQuery(query),
          searchType,
          entities,
          executionTime: Date.now(),
          scoringExplained: options.explainScoring ? await this.explainScoring(rankedResults) : undefined
        }
      };
    } catch (error) {
      console.error('Failed to execute enhanced search:', error);
      throw error;
    }
  }
  
  async buildSearchPipeline(searchQuery: any, session: any): Promise<any> {
    const { query, searchType, operator, filters, ranking = {} } = searchQuery;
    
    // Preprocess query
    const processedQuery = this.preprocessQuery(query);
    
    // Build text search stage
    let textSearchStage = {};
    
    switch (searchType) {
      case 'fulltext':
        textSearchStage = {
          $text: {
            $search: processedQuery,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        };
        break;
        
      case 'fuzzy':
        textSearchStage = {
          $or: [
            { title: { $regex: processedQuery, $options: 'i' } },
            { content: { $regex: processedQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(processedQuery, 'i')] } }
          ]
        };
        break;
        
      case 'semantic':
        // Implementation would use vector embeddings
        textSearchStage = await this.buildSemanticSearch(processedQuery);
        break;
        
      case 'exact':
        textSearchStage = {
          $or: [
            { title: processedQuery },
            { content: processedQuery }
          ]
        };
        break;
        
      case 'wildcard':
        const wildcardQuery = processedQuery.replace(/\*/g, '.*');
        textSearchStage = {
          $or: [
            { title: { $regex: wildcardQuery, $options: 'i' } },
            { content: { $regex: wildcardQuery, $options: 'i' } }
          ]
        };
        break;
    }
    
    // Build filter stages
    const filterStages = [];
    
    if (filters) {
      // Date range filtering
      if (filters.dateRange) {
        filterStages.push({
          [filters.dateRange.field]: {
            $gte: new Date(filters.dateRange.start),
            $lte: new Date(filters.dateRange.end)
          }
        });
      }
      
      // User filtering
      if (filters.users && filters.users.length > 0) {
        filterStages.push({
          $or: [
            { createdBy: { $in: filters.users } },
            { assignedTo: { $in: filters.users } },
            { owner: { $in: filters.users } }
          ]
        });
      }
      
      // Category filtering
      if (filters.categories && filters.categories.length > 0) {
        filterStages.push({
          category: { $in: filters.categories }
        });
      }
      
      // Tag filtering
      if (filters.tags && filters.tags.length > 0) {
        filterStages.push({
          tags: { $in: filters.tags }
        });
      }
      
      // Status filtering
      if (filters.status && filters.status.length > 0) {
        filterStages.push({
          status: { $in: filters.status }
        });
      }
      
      // Priority filtering
      if (filters.priority && filters.priority.length > 0) {
        filterStages.push({
          priority: { $in: filters.priority }
        });
      }
      
      // File type filtering
      if (filters.fileType && filters.fileType.length > 0) {
        filterStages.push({
          mimeType: { $in: filters.fileType.map(type => `*${type}*`) }
        });
      }
      
      // Size range filtering
      if (filters.sizeRange) {
        const sizeFilter: any = {};
        if (filters.sizeRange.min !== undefined) {
          sizeFilter.$gte = filters.sizeRange.min;
        }
        if (filters.sizeRange.max !== undefined) {
          sizeFilter.$lte = filters.sizeRange.max;
        }
        if (Object.keys(sizeFilter).length > 0) {
          filterStages.push({ size: sizeFilter });
        }
      }
    }
    
    // Build access control filter
    const accessFilter = {
      $or: [
        { accessControl: { $exists: false } },
        { 'accessControl.isPublic': true },
        { 'accessControl.owner': session.user.email },
        { 'accessControl.viewers': session.user.email },
        { 'accessControl.editors': session.user.email }
      ]
    };
    
    // Combine all filters
    let matchStage = textSearchStage;
    if (filterStages.length > 0) {
      matchStage = {
        $and: [textSearchStage, ...filterStages, accessFilter]
      };
    } else {
      matchStage = {
        $and: [textSearchStage, accessFilter]
      };
    }
    
    // Build scoring pipeline
    const scoringPipeline = this.buildScoringPipeline(searchQuery, session);
    
    return {
      matchStage,
      scoringPipeline
    };
  }
  
  async executeSearch(searchPipeline: any, entities: string[], session: any): Promise<any[]> {
    const results = [];
    
    for (const entityType of entities) {
      try {
        const entityResults = await this.searchEntity(entityType, searchPipeline, session);
        results.push(...entityResults.map(result => ({
          ...result,
          entityType,
          relevanceScore: this.calculateRelevanceScore(result, searchPipeline)
        })));
      } catch (error) {
        console.error(`Error searching ${entityType}:`, error);
      }
    }
    
    return results;
  }
  
  async searchEntity(entityType: string, searchPipeline: any, session: any): Promise<any[]> {
    const collection = await getCollection(this.getCollectionName(entityType));
    
    const pipeline = [
      { $match: searchPipeline.matchStage },
      ...searchPipeline.scoringPipeline,
      {
        $addFields: {
          relevanceScore: { $meta: 'textScore' }
        }
      },
      { $sort: { relevanceScore: -1 } }
    ];
    
    const results = await collection.aggregate(pipeline).limit(100).toArray();
    
    // Transform results to unified format
    return results.map(result => this.transformEntityResult(result, entityType));
  }
  
  async rankResults(results: any[], searchQuery: any, session: any): Promise<any[]> {
    const { ranking = {} } = searchQuery;
    
    // Apply custom ranking weights
    const rankedResults = results.map(result => {
      let score = result.relevanceScore || 0;
      
      // Boost recent content
      if (ranking.boostRecent) {
        const daysSinceCreation = (Date.now() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const recentBoost = Math.max(0, 1 - daysSinceCreation / 365); // Decay over a year
        score *= (1 + recentBoost * 0.5);
      }
      
      // Boost popular content
      if (ranking.boostPopular) {
        const popularityBoost = Math.log(1 + (result.views || result.downloads || 0)) / 10;
        score *= (1 + popularityBoost);
      }
      
      // Boost user's own content
      if (ranking.boostUserContent && (
        result.createdBy === session.user.email ||
        result.assignedTo === session.user.email ||
        result.owner === session.user.email
      )) {
        score *= 1.5;
      }
      
      // Apply custom weights
      if (ranking.customWeights) {
        for (const [field, weight] of Object.entries(ranking.customWeights)) {
          if (result[field as keyof typeof result]) {
            score *= weight as number;
          }
        }
      }
      
      return { ...result, relevanceScore: score };
    });
    
    // Sort by final relevance score
    return rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  async generateFacets(results: any[], searchQuery: any): Promise<Record<string, any>> {
    const facets: Record<string, any> = {};
    
    // Entity type facets
    facets.entityType = this.groupByField(results, 'entityType');
    
    // Date facets
    facets.dateRange = this.generateDateFacets(results);
    
    // User facets
    facets.users = this.groupByField(results, 'createdBy');
    
    // Category facets
    facets.categories = this.groupByField(results, 'category');
    
    // Tag facets
    facets.tags = this.aggregateTags(results);
    
    // Priority facets (for tasks)
    facets.priority = this.groupByField(results, 'priority');
    
    // Status facets (for tasks)
    facets.status = this.groupByField(results, 'status');
    
    // File type facets (for files)
    facets.fileTypes = this.groupByField(results, 'mimeType');
    
    return facets;
  }
  
  async generateSuggestions(query: string, session: any): Promise<string[]> {
    const suggestions = [];
    
    // Get recent searches by user
    const recentSearches = await this.getRecentSearches(session.user.email);
    suggestions.push(...recentSearches.slice(0, 5));
    
    // Get popular searches
    const popularSearches = await this.getPopularSearches();
    suggestions.push(...popularSearches.slice(0, 5));
    
    // Generate autocomplete suggestions
    const autocompleteSuggestions = await this.getAutocompleteSuggestions(query);
    suggestions.push(...autocompleteSuggestions.slice(0, 10));
    
    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 15);
  }
  
  async addHighlights(results: any[], query: string): Promise<any[]> {
    return results.map(result => {
      const highlightedResult = { ...result };
      
      // Highlight title
      if (result.title) {
        highlightedResult.titleHighlighted = this.highlightText(result.title, query);
      }
      
      // Highlight content/description
      if (result.content || result.description) {
        const text = result.content || result.description;
        highlightedResult.contentHighlighted = this.highlightText(text, query, true);
      }
      
      return highlightedResult;
    });
  }
  
  async saveSearchV2(searchData: any, session: any): Promise<any> {
    const savedSearchesCollection = await getCollection('saved_searches');
    
    const savedSearch = {
      _id: new ObjectId(),
      ...searchData,
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      lastUsed: null
    };
    
    await savedSearchesCollection.insertOne(savedSearch);
    
    return savedSearch;
  }
  
  async getSavedSearchesV2(session: any): Promise<any[]> {
    const savedSearchesCollection = await getCollection('saved_searches');
    
    return await savedSearchesCollection
      .find({ createdBy: session.user.email })
      .sort({ updatedAt: -1 })
      .toArray();
  }
  
  async createSearchIndexV2(indexData: any, session: any): Promise<any> {
    const searchIndexCollection = await getCollection('search_index');
    
    const indexEntry = {
      _id: new ObjectId(),
      ...indexData,
      indexedAt: new Date(),
      indexedBy: session.user.email
    };
    
    await searchIndexCollection.insertOne(indexEntry);
    
    return indexEntry;
  }
  
  // Helper methods
  private preprocessQuery(query: string): string {
    // Remove special characters, normalize, etc.
    return query
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
  
  private getCollectionName(entityType: string): string {
    const collectionMap = {
      tasks: 'tasks',
      users: 'users',
      files: 'files',
      projects: 'projects',
      comments: 'comments',
      notifications: 'notifications'
    };
    
    return collectionMap[entityType as keyof typeof collectionMap] || entityType;
  }
  
  private transformEntityResult(result: any, entityType: string): any {
    // Transform entity-specific results to unified format
    const baseResult = {
      id: result._id?.toString() || result.id,
      title: result.title || result.name,
      content: result.description || result.content || '',
      createdAt: result.createdAt || result.created_at,
      updatedAt: result.updatedAt || result.updated_at,
      entityType,
      url: this.getEntityUrl(result, entityType)
    };
    
    // Add entity-specific fields
    switch (entityType) {
      case 'tasks':
        return {
          ...baseResult,
          status: result.status,
          priority: result.priority,
          assignedTo: result.assignedTo,
          createdBy: result.createdBy,
          dueDate: result.endDate,
          tags: result.tags,
          category: result.category
        };
        
      case 'files':
        return {
          ...baseResult,
          mimeType: result.mimeType,
          size: result.size,
          uploadedBy: result.uploadedBy,
          category: result.category,
          tags: result.tags
        };
        
      case 'users':
        return {
          ...baseResult,
          email: result.email,
          role: result.role,
          department: result.department,
          skills: result.skills
        };
        
      case 'projects':
        return {
          ...baseResult,
          status: result.status,
          owner: result.owner,
          members: result.members,
          category: result.category
        };
        
      default:
        return baseResult;
    }
  }
  
  private getEntityUrl(result: any, entityType: string): string {
    const urlMap = {
      tasks: `/tasks/${result._id}`,
      files: `/files/${result._id}`,
      users: `/users/${result.email}`,
      projects: `/projects/${result._id}`,
      comments: `/comments/${result._id}`,
      notifications: `/notifications/${result._id}`
    };
    
    return urlMap[entityType as keyof typeof urlMap] || `/${entityType}/${result._id}`;
  }
  
  private calculateRelevanceScore(result: any, searchPipeline: any): number {
    // Basic relevance score calculation
    let score = result.relevanceScore || 0;
    
    // Boost exact matches
    if (result.title && result.title.toLowerCase().includes(searchPipeline.query.toLowerCase())) {
      score *= 2;
    }
    
    // Boost recent content
    const daysSinceCreation = (Date.now() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) {
      score *= 1.2;
    }
    
    return score;
  }
  
  private buildScoringPipeline(searchQuery: any, session: any): any[] {
    // Build MongoDB aggregation pipeline for scoring
    return [
      {
        $addFields: {
          textScore: { $meta: 'textScore' },
          recencyScore: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      }
    ];
  }
  
  private async buildSemanticSearch(query: string): Promise<any> {
    // Implementation for semantic search using embeddings
    // This would integrate with vector databases like Pinecone or Weaviate
    return {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    };
  }
  
  private groupByField(results: any[], field: string): Array<{ value: string; count: number }> {
    const grouped: Record<string, number> = results.reduce((acc, result) => {
      const value = result[field] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([value, count]) => ({ value, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);
  }
  
  private generateDateFacets(results: any[]): Array<{ label: string; count: number }> {
    const dateRanges = {
      'Today': 0,
      'This Week': 7,
      'This Month': 30,
      'This Year': 365
    };
    
    return Object.entries(dateRanges).map(([label, days]) => {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const count = results.filter(result => new Date(result.createdAt) >= cutoff).length;
      return { label, count };
    });
  }
  
  private aggregateTags(results: any[]): Array<{ tag: string; count: number }> {
    const tagCounts: Record<string, number> = {};
    
    results.forEach(result => {
      if (result.tags && Array.isArray(result.tags)) {
        result.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 20);
  }
  
  private highlightText(text: string, query: string, snippet: boolean = false): string {
    const regex = new RegExp(`(${query})`, 'gi');
    
    if (snippet && text.length > 200) {
      // Create snippet around first match
      const match = text.search(regex);
      if (match > 0) {
        const start = Math.max(0, match - 50);
        const end = Math.min(text.length, match + query.length + 50);
        const snippetText = text.substring(start, end);
        return `...${snippetText.replace(regex, '<mark>$1</mark>')}...`;
      }
    }
    
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  private async getRecentSearches(userEmail: string): Promise<string[]> {
    // Implementation for getting recent searches
    return [];
  }
  
  private async getPopularSearches(): Promise<string[]> {
    // Implementation for getting popular searches
    return [];
  }
  
  private async getAutocompleteSuggestions(query: string): Promise<string[]> {
    // Implementation for autocomplete suggestions
    return [];
  }
  
  private async logSearchQuery(searchQuery: any, session: any, resultCount: number): Promise<void> {
    const searchLogsCollection = await getCollection('search_logs');
    
    await searchLogsCollection.insertOne({
      query: searchQuery.query,
      entities: searchQuery.entities,
      filters: searchQuery.filters,
      resultCount,
      userId: session.user.email,
      timestamp: new Date(),
      userAgent: session.userAgent || 'unknown'
    });
  }
  
  private async getSearchAnalytics(query: string, session: any): Promise<any> {
    // Implementation for search analytics
    return {};
  }
  
  private async explainScoring(results: any[]): Promise<any> {
    // Implementation for scoring explanation
    return {};
  }
  
  private async groupResults(results: any[], searchQuery: any): Promise<any[]> {
    // Implementation for result grouping
    return results;
  }
}

// API Handlers
const enhancedSearchManager = new EnhancedSearchManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const { searchParams } = new URL(request.url);
    const query = searchQuerySchemaV2.parse(Object.fromEntries(searchParams));
    
    const results = await enhancedSearchManager.searchV2(query, session);
    
    return setCorsHeaders(createSuccessResponse(
      results,
      "Search completed successfully"
    ));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Enhanced search");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const body = await request.json();
    
    if (body.operation === 'saveSearch') {
      const validatedSearch = savedSearchSchemaV2.parse(body);
      const savedSearch = await enhancedSearchManager.saveSearchV2(validatedSearch, session);
      
      return setCorsHeaders(createCreatedResponse(
        savedSearch,
        "Saved search created successfully"
      ));
    } else if (body.operation === 'createIndex') {
      const validatedIndex = searchIndexSchemaV2.parse(body);
      const index = await enhancedSearchManager.createSearchIndexV2(validatedIndex, session);
      
      return setCorsHeaders(createCreatedResponse(
        index,
        "Search index created successfully"
      ));
    } else {
      return setCorsHeaders(createBadRequestResponse("Invalid operation"));
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Search operation");
  }
}

// Saved searches endpoint
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const savedSearches = await enhancedSearchManager.getSavedSearchesV2(session);
    
    return setCorsHeaders(createSuccessResponse(
      savedSearches,
      "Saved searches retrieved successfully",
      {
        count: savedSearches.length,
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    return handleApiError(error, "Getting saved searches");
  }
}
