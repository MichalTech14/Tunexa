/**
 * Advanced Multi-Tier Cache Manager
 * Supports in-memory, Redis, and persistent caching strategies
 */

import { EventEmitter } from 'events';
import { RedisConnectionManager, RedisConfig } from './redis-config.js';

export interface CacheConfig {
  // Memory cache settings
  memory: {
    enabled: boolean;
    maxSize: number; // in MB
    ttl: number; // in seconds
    maxItems: number;
  };

  // Redis cache settings
  redis: {
    enabled: boolean;
    connectionManager?: RedisConnectionManager;
    config?: RedisConfig;
    ttl: number; // in seconds
    keyPrefix: string;
    maxRetries: number;
    retryDelayOnFailover: number;
    compression: boolean;
    clustering: boolean;
  };

  // Persistent cache settings
  persistent: {
    enabled: boolean;
    path: string;
    maxSize: number; // in MB
    compression: boolean;
    encryption: boolean;
  };

  // Cache strategies
  strategies: {
    defaultTier: 'memory' | 'redis' | 'persistent';
    evictionPolicy: 'lru' | 'lfu' | 'ttl';
    writeThrough: boolean;
    writeBack: boolean;
    readThrough: boolean;
  };

  // Performance monitoring
  monitoring: {
    enabled: boolean;
    metricsInterval: number; // in seconds
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  createdAt: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  lastAccessed: number;
  size: number; // in bytes
  tier: 'memory' | 'redis' | 'persistent';
  tags?: string[];
  dependencies?: string[];
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number; // in bytes
  redisConnected: boolean;
  entriesCount: {
    memory: number;
    redis: number;
    persistent: number;
    total: number;
  };
  performance: {
    avgResponseTime: number;
    maxResponseTime: number;
    operationsPerSecond: number;
  };
  evictions: {
    total: number;
    byPolicy: Record<string, number>;
  };
}

export interface CacheQuery {
  pattern?: string;
  tags?: string[];
  tier?: 'memory' | 'redis' | 'persistent';
  minAccess?: number;
  maxAge?: number;
  limit?: number;
}

export class AdvancedCacheManager extends EventEmitter {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry>;
  private redisClient: any = null;
  private metrics: CacheMetrics;
  private isInitialized = false;
  private operationTimes: number[] = [];

  constructor(config: CacheConfig) {
    super();
    this.config = config;
    this.memoryCache = new Map();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize cache manager
   */
  async initialize(): Promise<void> {
    try {
      console.log('🗄️ Initializing Advanced Cache Manager...');

      // Initialize Redis if enabled
      if (this.config.redis.enabled) {
        await this.initializeRedis();
      }

      // Initialize persistent cache if enabled
      if (this.config.persistent.enabled) {
        await this.initializePersistentCache();
      }

      // Start monitoring if enabled
      if (this.config.monitoring.enabled) {
        this.startMetricsCollection();
      }

      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Advanced Cache Manager initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize cache manager:', error);
      throw error;
    }
  }

  /**
   * Get value from cache with multi-tier lookup
   */
  async get<T = any>(key: string, options?: {
    preferredTier?: 'memory' | 'redis' | 'persistent';
    updateTiers?: boolean;
  }): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      let entry: CacheEntry<T> | null = null;
      let foundTier: string | null = null;

      // Check preferred tier first
      const preferredTier = options?.preferredTier || this.config.strategies.defaultTier;
      
      if (preferredTier === 'memory' && this.config.memory.enabled) {
        entry = this.getFromMemory<T>(key);
        if (entry) foundTier = 'memory';
      } else if (preferredTier === 'redis' && this.config.redis.enabled) {
        entry = await this.getFromRedis<T>(key);
        if (entry) foundTier = 'redis';
      } else if (preferredTier === 'persistent' && this.config.persistent.enabled) {
        entry = await this.getFromPersistent<T>(key);
        if (entry) foundTier = 'persistent';
      }

      // Fallback to other tiers if not found
      if (!entry) {
        // Try memory
        if (foundTier !== 'memory' && this.config.memory.enabled) {
          entry = this.getFromMemory<T>(key);
          if (entry) foundTier = 'memory';
        }
        
        // Try Redis
        if (!entry && foundTier !== 'redis' && this.config.redis.enabled) {
          entry = await this.getFromRedis<T>(key);
          if (entry) foundTier = 'redis';
        }
        
        // Try persistent
        if (!entry && foundTier !== 'persistent' && this.config.persistent.enabled) {
          entry = await this.getFromPersistent<T>(key);
          if (entry) foundTier = 'persistent';
        }
      }

      // Update metrics and tiers
      if (entry) {
        this.metrics.hits++;
        entry.accessCount++;
        entry.lastAccess = Date.now();

        // Update other tiers if requested and read-through is enabled
        if (options?.updateTiers && this.config.strategies.readThrough) {
          await this.updateTiers(key, entry, foundTier!);
        }

        this.recordOperationTime(Date.now() - startTime);
        this.emit('cache:hit', { key, tier: foundTier, value: entry.value });
        
        return entry.value;
      } else {
        this.metrics.misses++;
        this.recordOperationTime(Date.now() - startTime);
        this.emit('cache:miss', { key });
        
        return null;
      }

    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.emit('cache:error', { operation: 'get', key, error });
      return null;
    }
  }

  /**
   * Set value in cache with multi-tier strategy
   */
  async set<T = any>(
    key: string, 
    value: T, 
    options?: {
      ttl?: number;
      tier?: 'memory' | 'redis' | 'persistent' | 'all';
      tags?: string[];
      dependencies?: string[];
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const ttl = options?.ttl || this.config.memory.ttl;
      const tier = options?.tier || 'all';
      const tags = options?.tags || [];
      const dependencies = options?.dependencies || [];

      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        createdAt: Date.now(),
        ttl,
        accessCount: 0,
        lastAccess: Date.now(),
        lastAccessed: Date.now(),
        size: this.estimateSize(value),
        tier: tier as any,
        tags,
        dependencies
      };

      let success = false;

      // Set in specified tier(s)
      if (tier === 'all' || tier === 'memory') {
        if (this.config.memory.enabled) {
          success = this.setInMemory(key, entry) || success;
        }
      }

      if (tier === 'all' || tier === 'redis') {
        if (this.config.redis.enabled) {
          success = await this.setInRedis(key, entry) || success;
        }
      }

      if (tier === 'all' || tier === 'persistent') {
        if (this.config.persistent.enabled) {
          success = await this.setInPersistent(key, entry) || success;
        }
      }

      this.recordOperationTime(Date.now() - startTime);
      
      if (success) {
        this.emit('cache:set', { key, tier, value, ttl });
      }

      return success;

    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      this.emit('cache:error', { operation: 'set', key, error });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options?: {
    tier?: 'memory' | 'redis' | 'persistent' | 'all';
  }): Promise<boolean> {
    try {
      const tier = options?.tier || 'all';
      let success = false;

      if (tier === 'all' || tier === 'memory') {
        if (this.config.memory.enabled) {
          success = this.memoryCache.delete(key) || success;
        }
      }

      if (tier === 'all' || tier === 'redis') {
        if (this.config.redis.enabled && this.redisClient) {
          const deleted = await this.redisClient.del(this.formatRedisKey(key));
          success = deleted > 0 || success;
        }
      }

      if (tier === 'all' || tier === 'persistent') {
        if (this.config.persistent.enabled) {
          success = await this.deleteFromPersistent(key) || success;
        }
      }

      if (success) {
        this.emit('cache:delete', { key, tier });
      }

      return success;

    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      this.emit('cache:error', { operation: 'delete', key, error });
      return false;
    }
  }

  /**
   * Clear cache by criteria
   */
  async clear(options?: {
    tier?: 'memory' | 'redis' | 'persistent' | 'all';
    pattern?: string;
    tags?: string[];
  }): Promise<number> {
    try {
      const tier = options?.tier || 'all';
      let cleared = 0;

      if (tier === 'all' || tier === 'memory') {
        if (this.config.memory.enabled) {
          if (options?.pattern || options?.tags) {
            cleared += this.clearMemoryByPattern(options.pattern, options.tags);
          } else {
            cleared += this.memoryCache.size;
            this.memoryCache.clear();
          }
        }
      }

      if (tier === 'all' || tier === 'redis') {
        if (this.config.redis.enabled && this.redisClient) {
          cleared += await this.clearRedis(options?.pattern);
        }
      }

      if (tier === 'all' || tier === 'persistent') {
        if (this.config.persistent.enabled) {
          cleared += await this.clearPersistent(options?.pattern, options?.tags);
        }
      }

      this.emit('cache:clear', { tier, cleared, pattern: options?.pattern, tags: options?.tags });
      return cleared;

    } catch (error) {
      console.error('Cache clear error:', error);
      this.emit('cache:error', { operation: 'clear', error });
      return 0;
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  /**
   * Query cache entries
   */
  async query(query: CacheQuery): Promise<CacheEntry[]> {
    const results: CacheEntry[] = [];

    try {
      // Query memory cache
      if (this.config.memory.enabled) {
        for (const [key, entry] of this.memoryCache) {
          if (this.matchesQuery(key, entry, query)) {
            results.push(entry);
          }
        }
      }

      // Query Redis cache
      if (this.config.redis.enabled && this.redisClient) {
        const redisResults = await this.queryRedis(query);
        results.push(...redisResults);
      }

      // Query persistent cache
      if (this.config.persistent.enabled) {
        const persistentResults = await this.queryPersistent(query);
        results.push(...persistentResults);
      }

      // Apply limit
      if (query.limit) {
        return results.slice(0, query.limit);
      }

      return results;

    } catch (error) {
      console.error('Cache query error:', error);
      return [];
    }
  }

  /**
   * Invalidate cache by dependencies
   */
  async invalidateByDependencies(dependencies: string[]): Promise<number> {
    let invalidated = 0;

    try {
      // Check all tiers for entries with matching dependencies
      const query: CacheQuery = {
        // Custom query to find entries with specific dependencies
      };

      const entries = await this.query(query);
      
      for (const entry of entries) {
        if (entry.dependencies?.some(dep => dependencies.includes(dep))) {
          await this.delete(entry.key);
          invalidated++;
        }
      }

      this.emit('cache:invalidate', { dependencies, invalidated });
      return invalidated;

    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Warm up cache with predefined data
   */
  async warmUp(data: Array<{ key: string; value: any; ttl?: number; tags?: string[] }>): Promise<number> {
    let loaded = 0;

    try {
      console.log(`🔥 Warming up cache with ${data.length} entries...`);

      for (const item of data) {
        const success = await this.set(item.key, item.value, {
          ttl: item.ttl,
          tags: item.tags,
          tier: 'all'
        });

        if (success) loaded++;
      }

      console.log(`✅ Cache warm-up completed: ${loaded}/${data.length} entries loaded`);
      this.emit('cache:warmup', { total: data.length, loaded });
      
      return loaded;

    } catch (error) {
      console.error('Cache warm-up error:', error);
      return loaded;
    }
  }

  // Private helper methods...

  private initializeMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      memoryUsage: 0,
      redisConnected: false,
      entriesCount: {
        memory: 0,
        redis: 0,
        persistent: 0,
        total: 0
      },
      performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        operationsPerSecond: 0
      },
      evictions: {
        total: 0,
        byPolicy: {}
      }
    };
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Use provided connection manager or create new one
      if (this.config.redis.connectionManager) {
        this.redisClient = this.config.redis.connectionManager.getClient();
        console.log('🔗 Using provided Redis connection manager');
      } else if (this.config.redis.config) {
        // Create new connection manager with provided config
        const { RedisConnectionManager } = await import('./redis-config.js');
        const connectionManager = new RedisConnectionManager(this.config.redis.config);
        await connectionManager.connect();
        this.redisClient = connectionManager.getClient();
        console.log('🔗 Redis cache connection established with custom config');
      } else {
        // Fallback to simple Redis connection
        const Redis = await import('ioredis');
        this.redisClient = new Redis.default({
          host: 'localhost',
          port: 6379,
          maxRetriesPerRequest: this.config.redis.maxRetries,
          keyPrefix: this.config.redis.keyPrefix + ':'
        });
        console.log('🔗 Redis cache connection established with default config');
      }
      
      // Test connection
      await this.redisClient.ping();
      this.metrics.redisConnected = true;
      
    } catch (error) {
      console.error('❌ Redis initialization failed:', error);
      this.metrics.redisConnected = false;
      throw error;
    }
  }

  private async initializePersistentCache(): Promise<void> {
    // Persistent cache initialization would go here
    console.log('💾 Persistent cache initialized');
  }

  private getFromMemory<T>(key: string): CacheEntry<T> | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  private async getFromRedis<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.redisClient || !this.metrics.redisConnected) {
      return null;
    }

    try {
      const fullKey = `${this.config.redis.keyPrefix}:${key}`;
      const data = await this.redisClient.get(fullKey);
      
      if (!data) return null;
      
      // Parse stored entry
      const entry = JSON.parse(data) as CacheEntry<T>;
      
      // Check TTL
      if (Date.now() - entry.createdAt > entry.ttl * 1000) {
        await this.redisClient.del(fullKey);
        return null;
      }

      // Update access stats
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      // Update entry in Redis with new access stats
      await this.redisClient.setex(
        fullKey, 
        Math.floor((entry.ttl * 1000 - (Date.now() - entry.createdAt)) / 1000),
        JSON.stringify(entry)
      );

      return entry;
      
    } catch (error) {
      console.error('❌ Redis get error:', error);
      return null;
    }
  }

  private async getFromPersistent<T>(key: string): Promise<CacheEntry<T> | null> {
    // Persistent cache get implementation would go here
    return null;
  }

  private setInMemory<T>(key: string, entry: CacheEntry<T>): boolean {
    // Check memory limits before setting
    if (this.memoryCache.size >= this.config.memory.maxItems) {
      this.evictFromMemory();
    }

    this.memoryCache.set(key, entry);
    return true;
  }

  private async setInRedis<T>(key: string, entry: CacheEntry<T>): Promise<boolean> {
    if (!this.redisClient || !this.metrics.redisConnected) {
      return false;
    }

    try {
      const fullKey = `${this.config.redis.keyPrefix}:${key}`;
      const ttlSeconds = Math.floor((entry.ttl * 1000 - (Date.now() - entry.createdAt)) / 1000);
      
      if (ttlSeconds <= 0) {
        return false; // Entry already expired
      }

      // Serialize entry data
      let data: string;
      if (this.config.redis.compression) {
        // Implement compression if enabled
        data = JSON.stringify(entry);
      } else {
        data = JSON.stringify(entry);
      }

      // Set with TTL
      await this.redisClient.setex(fullKey, ttlSeconds, data);
      return true;
      
    } catch (error) {
      console.error('❌ Redis set error:', error);
      return false;
    }
  }

  private async setInPersistent<T>(key: string, entry: CacheEntry<T>): Promise<boolean> {
    // Persistent cache set implementation would go here
    return true;
  }

  private evictFromMemory(): void {
    const policy = this.config.strategies.evictionPolicy;
    
    if (policy === 'lru') {
      // Remove least recently used
      let oldestKey = '';
      let oldestTime = Date.now();
      
      for (const [key, entry] of this.memoryCache) {
        if (entry.lastAccess < oldestTime) {
          oldestTime = entry.lastAccess;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        this.metrics.evictions.total++;
        this.metrics.evictions.byPolicy.lru = (this.metrics.evictions.byPolicy.lru || 0) + 1;
      }
    }
    // Other eviction policies...
  }

  private estimateSize(value: any): number {
    // Simple size estimation
    return JSON.stringify(value).length * 2; // rough estimate in bytes
  }

  private formatRedisKey(key: string): string {
    return `${this.config.redis.keyPrefix}:${key}`;
  }

  private recordOperationTime(time: number): void {
    this.operationTimes.push(time);
    if (this.operationTimes.length > 1000) {
      this.operationTimes = this.operationTimes.slice(-500);
    }

    this.metrics.performance.maxResponseTime = Math.max(this.metrics.performance.maxResponseTime, time);
    this.metrics.performance.avgResponseTime = 
      this.operationTimes.reduce((a, b) => a + b, 0) / this.operationTimes.length;
  }

  private updateMemoryMetrics(): void {
    this.metrics.entriesCount.memory = this.memoryCache.size;
    this.metrics.memoryUsage = Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMemoryMetrics();
      this.emit('metrics:update', this.metrics);
    }, this.config.monitoring.metricsInterval * 1000);
  }

  private matchesQuery(key: string, entry: CacheEntry, query: CacheQuery): boolean {
    if (query.pattern && !key.includes(query.pattern)) return false;
    if (query.tags && !query.tags.every(tag => entry.tags?.includes(tag))) return false;
    if (query.tier && entry.tier !== query.tier) return false;
    if (query.minAccess && entry.accessCount < query.minAccess) return false;
    if (query.maxAge && (Date.now() - entry.timestamp) > query.maxAge * 1000) return false;
    
    return true;
  }

  private clearMemoryByPattern(pattern?: string, tags?: string[]): number {
    let cleared = 0;
    
    for (const [key, entry] of this.memoryCache) {
      let shouldClear = true;
      
      if (pattern && !key.includes(pattern)) shouldClear = false;
      if (tags && !tags.every(tag => entry.tags?.includes(tag))) shouldClear = false;
      
      if (shouldClear) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  private async clearRedis(pattern?: string): Promise<number> {
    // Redis clear implementation
    return 0;
  }

  private async clearPersistent(pattern?: string, tags?: string[]): Promise<number> {
    // Persistent cache clear implementation
    return 0;
  }

  private async queryRedis(query: CacheQuery): Promise<CacheEntry[]> {
    // Redis query implementation
    return [];
  }

  private async queryPersistent(query: CacheQuery): Promise<CacheEntry[]> {
    // Persistent cache query implementation
    return [];
  }

  private async updateTiers(key: string, entry: CacheEntry, sourceTier: string): Promise<void> {
    // Update other tiers with the found entry
    if (sourceTier !== 'memory' && this.config.memory.enabled) {
      this.setInMemory(key, entry);
    }
    
    if (sourceTier !== 'redis' && this.config.redis.enabled) {
      await this.setInRedis(key, entry);
    }
    
    if (sourceTier !== 'persistent' && this.config.persistent.enabled) {
      await this.setInPersistent(key, entry);
    }
  }

  private async deleteFromPersistent(key: string): Promise<boolean> {
    // Persistent cache delete implementation
    return true;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Advanced Cache Manager...');

      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
        this.metrics.redisConnected = false;
      }

      // Clear memory cache
      this.memoryCache.clear();

      this.isInitialized = false;
      this.emit('shutdown');
      console.log('✅ Advanced Cache Manager shutdown complete');

    } catch (error) {
      console.error('❌ Cache manager shutdown error:', error);
    }
  }
}

// Export default config
export const defaultCacheConfig: CacheConfig = {
  memory: {
    enabled: true,
    maxSize: 100, // 100MB
    ttl: 3600, // 1 hour
    maxItems: 10000
  },
  redis: {
    enabled: false,
    config: {
      host: 'localhost',
      port: 6379,
      database: 0
    },
    ttl: 7200, // 2 hours
    keyPrefix: 'tunexa',
    maxRetries: 3,
    retryDelayOnFailover: 100,
    compression: false,
    clustering: false
  },
  persistent: {
    enabled: false,
    path: './cache/persistent',
    maxSize: 500, // 500MB
    compression: true,
    encryption: false
  },
  strategies: {
    defaultTier: 'memory',
    evictionPolicy: 'lru',
    writeThrough: true,
    writeBack: false,
    readThrough: true
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60, // 1 minute
    logLevel: 'info'
  }
};