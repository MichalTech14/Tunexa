/**
 * Advanced Query Optimizer
 * Intelligent query optimization and caching for complex database operations
 */

import { Repository, SelectQueryBuilder, EntityManager, ObjectLiteral } from 'typeorm';
import { performance } from 'perf_hooks';

export interface QueryOptimizationOptions {
  useCache?: boolean;
  cacheDuration?: number;
  eagerLoad?: string[];
  maxResults?: number;
  timeout?: number;
  explain?: boolean;
}

export interface QueryPlan {
  originalQuery: string;
  optimizedQuery?: string;
  estimatedRows?: number;
  indexUsage?: string[];
  recommendations?: string[];
  executionTime?: number;
}

export interface OptimizedQueryResult<T> {
  data: T[];
  queryPlan: QueryPlan;
  executionTime: number;
  fromCache: boolean;
  totalRows?: number;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryPlans = new Map<string, QueryPlan>();
  private readonly defaultCacheTTL = 300000; // 5 minutes

  private constructor() {}

  public static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * Execute optimized query with intelligent caching and optimization
   */
  public async executeOptimized<T extends ObjectLiteral>(
    repository: Repository<T>,
    queryBuilder: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
    options: QueryOptimizationOptions = {}
  ): Promise<OptimizedQueryResult<T>> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(queryBuilder.toString(), options);

    // Check cache first
    if (options.useCache !== false) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return {
          data: cached,
          queryPlan: this.queryPlans.get(cacheKey) || { originalQuery: 'cached' },
          executionTime: performance.now() - startTime,
          fromCache: true
        };
      }
    }

    // Build query with optimizations
    let qb = repository.createQueryBuilder('entity');
    qb = queryBuilder(qb);

    // Apply eager loading
    if (options.eagerLoad && options.eagerLoad.length > 0) {
      options.eagerLoad.forEach(relation => {
        qb = qb.leftJoinAndSelect(`entity.${relation}`, relation);
      });
    }

    // Apply limits
    if (options.maxResults) {
      qb = qb.take(options.maxResults);
    }

    // Generate query plan
    const queryPlan = await this.generateQueryPlan(qb);
    this.queryPlans.set(cacheKey, queryPlan);

    // Execute optimized query
    const queryStartTime = performance.now();
    let result: T[];
    
    try {
      result = await qb.getMany();
      queryPlan.executionTime = performance.now() - queryStartTime;
    } catch (error) {
      console.error('❌ Query execution failed:', error);
      throw error;
    }

    // Cache result if enabled
    if (options.useCache !== false && result.length > 0) {
      this.setCache(cacheKey, result, options.cacheDuration || this.defaultCacheTTL);
    }

    return {
      data: result,
      queryPlan,
      executionTime: performance.now() - startTime,
      fromCache: false,
      totalRows: result.length
    };
  }

  /**
   * Execute complex aggregation query with optimization
   */
  public async executeAggregation<T extends ObjectLiteral>(
    repository: Repository<T>,
    aggregationBuilder: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
    options: QueryOptimizationOptions = {}
  ): Promise<OptimizedQueryResult<any>> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(`agg_${aggregationBuilder.toString()}`, options);

    // Check cache
    if (options.useCache !== false) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          data: cached,
          queryPlan: { originalQuery: 'cached aggregation' },
          executionTime: performance.now() - startTime,
          fromCache: true
        };
      }
    }

    // Build aggregation query
    let qb = repository.createQueryBuilder('entity');
    qb = aggregationBuilder(qb);

    const queryPlan = await this.generateQueryPlan(qb);
    
    try {
      const result = await qb.getRawMany();
      
      if (options.useCache !== false) {
        this.setCache(cacheKey, result, options.cacheDuration || this.defaultCacheTTL);
      }

      return {
        data: result,
        queryPlan,
        executionTime: performance.now() - startTime,
        fromCache: false,
        totalRows: result.length
      };
    } catch (error) {
      console.error('❌ Aggregation query failed:', error);
      throw error;
    }
  }

  /**
   * Execute batch operations with optimization
   */
  public async executeBatch<T extends ObjectLiteral>(
    repository: Repository<T>,
    operation: 'insert' | 'update' | 'delete',
    data: Partial<T>[] | any,
    batchSize: number = 100
  ): Promise<{
    affected: number;
    executionTime: number;
    batches: number;
  }> {
    const startTime = performance.now();
    let totalAffected = 0;
    let batchCount = 0;

    if (operation === 'insert' && Array.isArray(data)) {
      // Batch inserts
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await repository.save(batch);
        totalAffected += batch.length;
        batchCount++;
        
        console.log(`✅ Batch ${batchCount} inserted: ${batch.length} records`);
      }
    } else if (operation === 'update' && data.conditions && data.updates) {
      // Batch updates
      const result = await repository.update(data.conditions, data.updates);
      totalAffected = result.affected || 0;
      batchCount = 1;
    } else if (operation === 'delete' && data.conditions) {
      // Batch deletes
      const result = await repository.delete(data.conditions);
      totalAffected = result.affected || 0;
      batchCount = 1;
    }

    return {
      affected: totalAffected,
      executionTime: performance.now() - startTime,
      batches: batchCount
    };
  }

  /**
   * Generate query execution plan
   */
  private async generateQueryPlan(queryBuilder: SelectQueryBuilder<any>): Promise<QueryPlan> {
    const sql = queryBuilder.getSql();
    const parameters = queryBuilder.getParameters();
    
    const plan: QueryPlan = {
      originalQuery: sql,
      recommendations: []
    };

    // Analyze query for optimization opportunities
    if (sql.includes('SELECT *')) {
      plan.recommendations?.push('Avoid SELECT * - specify only needed columns');
    }

    if (!sql.includes('LIMIT') && sql.includes('WHERE')) {
      plan.recommendations?.push('Consider adding LIMIT to prevent large result sets');
    }

    if (sql.match(/JOIN.*JOIN/g)) {
      plan.recommendations?.push('Multiple JOINs detected - ensure proper indexing');
    }

    // For SQLite, we can use EXPLAIN QUERY PLAN
    try {
      const explainQuery = `EXPLAIN QUERY PLAN ${sql}`;
      // Note: In a real implementation, you'd execute this against the database
      plan.estimatedRows = 100; // Placeholder
      plan.indexUsage = ['PRIMARY', 'idx_created_at']; // Placeholder
    } catch (error) {
      console.warn('Could not generate query plan:', error);
    }

    return plan;
  }

  /**
   * Intelligent query suggestions based on usage patterns
   */
  public generateOptimizationSuggestions(): {
    slowQueries: string[];
    indexSuggestions: string[];
    cachingOpportunities: string[];
  } {
    const suggestions = {
      slowQueries: [] as string[],
      indexSuggestions: [] as string[],
      cachingOpportunities: [] as string[]
    };

    // Analyze cached query plans for patterns
    for (const [key, plan] of this.queryPlans) {
      if (plan.executionTime && plan.executionTime > 1000) {
        suggestions.slowQueries.push(
          `Query taking ${plan.executionTime.toFixed(2)}ms: ${plan.originalQuery.substring(0, 100)}...`
        );
      }

      if (plan.originalQuery.includes('WHERE') && !plan.indexUsage?.length) {
        suggestions.indexSuggestions.push(
          `Add index for WHERE clause in: ${plan.originalQuery.substring(0, 100)}...`
        );
      }

      // Check cache hit rate for caching opportunities
      const cacheEntry = this.queryCache.get(key);
      if (!cacheEntry && plan.originalQuery.includes('SELECT')) {
        suggestions.cachingOpportunities.push(
          `Consider caching: ${plan.originalQuery.substring(0, 100)}...`
        );
      }
    }

    return suggestions;
  }

  /**
   * Cache management
   */
  private generateCacheKey(query: string, options: QueryOptimizationOptions): string {
    const optionsStr = JSON.stringify(options);
    return Buffer.from(query + optionsStr).toString('base64').substring(0, 50);
  }

  private getFromCache<T>(key: string): T[] | null {
    const entry = this.queryCache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }
    
    if (entry) {
      this.queryCache.delete(key); // Remove expired entry
    }
    
    return null;
  }

  private setCache<T>(key: string, data: T[], ttl: number): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Cleanup old entries (simple LRU-like behavior)
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value;
      if (firstKey) {
        this.queryCache.delete(firstKey);
      }
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    totalEntries: number;
    totalMemoryUsage: number;
    hitRate: number;
    oldestEntry: Date | null;
  } {
    let totalSize = 0;
    let oldestTimestamp = Date.now();

    for (const entry of this.queryCache.values()) {
      totalSize += JSON.stringify(entry.data).length;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      totalEntries: this.queryCache.size,
      totalMemoryUsage: totalSize,
      hitRate: 0, // Would need to track hits/misses to calculate
      oldestEntry: this.queryCache.size > 0 ? new Date(oldestTimestamp) : null
    };
  }

  /**
   * Clear query cache
   */
  public clearCache(): void {
    this.queryCache.clear();
    console.log('🗑️ Query optimizer cache cleared');
  }
}

// Export singleton instance
export const queryOptimizer = QueryOptimizer.getInstance();