/**
 * API Response Cache System
 * In-memory cache with TTL support for API responses
 */

import { performance } from 'perf_hooks';

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  hits: number;
  lastAccessed: Date;
  size: number; // Approximate size in bytes
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: {
    used: number;
    limit: number;
    percentage: number;
  };
  topKeys: Array<{
    key: string;
    hits: number;
    size: number;
    lastAccessed: Date;
  }>;
}

class ApiResponseCache {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  };
  
  private readonly maxMemory: number; // Maximum memory in bytes
  private readonly cleanupInterval: number = 300000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  constructor(maxMemoryMB: number = 100) {
    this.maxMemory = maxMemoryMB * 1024 * 1024; // Convert MB to bytes
    this.startCleanupTimer();
    
    console.log(`🗄️ API Response Cache initialized with ${maxMemoryMB}MB limit`);
  }

  /**
   * Get value from cache
   */
  public get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    entry.hits++;
    entry.lastAccessed = new Date();
    this.stats.hits++;
    
    return entry.value;
  }

  /**
   * Set value in cache with TTL
   */
  public set(key: string, value: any, ttlMs: number = 300000): void {
    // Calculate size (approximate)
    const size = this.calculateSize(value);
    
    // Check memory limit before adding
    if (this.shouldEvict(size)) {
      this.evictLeastRecentlyUsed();
    }
    
    const entry: CacheEntry = {
      key,
      value,
      timestamp: new Date(),
      ttl: ttlMs,
      hits: 0,
      lastAccessed: new Date(),
      size,
    };
    
    this.cache.set(key, entry);
    this.stats.sets++;
    
    // If still over limit after eviction, reject this entry
    if (this.getCurrentMemoryUsage() > this.maxMemory) {
      this.cache.delete(key);
      console.warn(`⚠️ Cache entry rejected: ${key} (size: ${size} bytes) - exceeds memory limit`);
    }
  }

  /**
   * Delete specific key from cache
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.stats.deletes += count;
    console.log(`🗑️ Cache cleared: ${count} entries removed`);
  }

  /**
   * Check if key exists and is not expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    const sortedEntries = Array.from(this.cache.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.getCurrentMemoryUsage(),
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage: {
        used: this.getCurrentMemoryUsage(),
        limit: this.maxMemory,
        percentage: Math.round((this.getCurrentMemoryUsage() / this.maxMemory) * 10000) / 100,
      },
      topKeys: sortedEntries.map(entry => ({
        key: entry.key,
        hits: entry.hits,
        size: entry.size,
        lastAccessed: entry.lastAccessed,
      })),
    };
  }

  /**
   * Calculate approximate size of value in bytes
   */
  private calculateSize(value: any): number {
    const jsonString = JSON.stringify(value);
    return Buffer.byteLength(jsonString, 'utf8');
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Check if we should evict entries before adding new one
   */
  private shouldEvict(newEntrySize: number): boolean {
    const currentUsage = this.getCurrentMemoryUsage();
    return (currentUsage + newEntrySize) > this.maxMemory;
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => 
      a.lastAccessed.getTime() - b.lastAccessed.getTime()
    );
    
    // Evict oldest 25% of entries or until under 75% capacity
    const targetUsage = this.maxMemory * 0.75;
    let currentUsage = this.getCurrentMemoryUsage();
    let evicted = 0;
    
    for (const [key, entry] of entries) {
      if (currentUsage <= targetUsage) break;
      
      this.cache.delete(key);
      currentUsage -= entry.size;
      evicted++;
      this.stats.evictions++;
    }
    
    if (evicted > 0) {
      console.log(`🧹 Cache eviction: ${evicted} entries removed (freed ${Math.round((this.getCurrentMemoryUsage() - currentUsage) / 1024)}KB)`);
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cleanupInterval);
  }

  /**
   * Remove expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let expired = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key);
        expired++;
      }
    }
    
    if (expired > 0) {
      console.log(`🧹 Cache cleanup: ${expired} expired entries removed`);
    }
  }

  /**
   * Generate cache key from request
   */
  public generateKey(req: any): string {
    const method = req.method || 'GET';
    const path = req.path || req.url;
    const query = req.query ? JSON.stringify(req.query) : '';
    const user = req.user?.id || 'anonymous';
    
    return `${method}:${path}:${query}:${user}`;
  }

  /**
   * Middleware factory for Express
   */
  public middleware(options: {
    ttl?: number;
    keyGenerator?: (req: any) => string;
    shouldCache?: (req: any, res: any) => boolean;
  } = {}) {
    const {
      ttl = 300000, // 5 minutes default
      keyGenerator = this.generateKey.bind(this),
      shouldCache = () => true,
    } = options;

    return (req: any, res: any, next: any) => {
      // Only cache GET requests by default
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = keyGenerator(req);
      
      // Check if response is cached
      const cachedResponse = this.get(cacheKey);
      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Check if we should cache this response
        if (shouldCache(req, res) && res.statusCode === 200) {
          this.set(cacheKey, data, ttl);
        }
        
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Invalidate cache entries by pattern
   */
  public invalidatePattern(pattern: string): number {
    let invalidated = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      console.log(`🗑️ Cache invalidation: ${invalidated} entries matching pattern '${pattern}'`);
    }
    
    return invalidated;
  }

  /**
   * Warm up cache with predefined data
   */
  public warmUp(data: Array<{ key: string; value: any; ttl?: number }>): void {
    console.log(`🔥 Cache warm-up: Loading ${data.length} entries...`);
    
    for (const entry of data) {
      this.set(entry.key, entry.value, entry.ttl);
    }
    
    console.log(`✅ Cache warm-up completed`);
  }

  /**
   * Shutdown cache and cleanup
   */
  public shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    console.log('🔄 API Response Cache shutdown completed');
  }
}

// Singleton instance
export const apiCache = new ApiResponseCache(50); // 50MB cache limit

// Default TTL constants
export const CacheTTL = {
  SHORT: 60000,      // 1 minute
  MEDIUM: 300000,    // 5 minutes  
  LONG: 900000,      // 15 minutes
  VERY_LONG: 3600000, // 1 hour
} as const;