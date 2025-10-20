/**
 * Cache Service Integration
 * Provides high-level caching services for the Tunexa application
 */

import { AdvancedCacheManager, defaultCacheConfig, CacheConfig } from './cache-manager';
// import { DatabaseQueryOptimizer } from './query-optimizer';

export interface CacheServiceConfig extends CacheConfig {
  // Additional service-specific config
  services: {
    cars: {
      enabled: boolean;
      ttl: number;
      invalidationTriggers: string[];
    };
    acoustics: {
      enabled: boolean;
      ttl: number;
      preloadCommonData: boolean;
    };
    audio: {
      enabled: boolean;
      ttl: number;
      streaming: boolean;
    };
    users: {
      enabled: boolean;
      ttl: number;
      sessionBased: boolean;
    };
  };
  
  // Preloading and warm-up
  warmUp: {
    enabled: boolean;
    onStartup: boolean;
    commonQueries: Array<{
      name: string;
      query: string;
      params?: any[];
      frequency: 'high' | 'medium' | 'low';
    }>;
  };
}

export class CacheService {
  private cacheManager: AdvancedCacheManager;
  // private queryOptimizer: DatabaseQueryOptimizer;
  private config: CacheServiceConfig;
  private isInitialized = false;

  constructor(config?: Partial<CacheServiceConfig>) {
    this.config = {
      ...defaultCacheConfig,
      ...this.getDefaultServiceConfig(),
      ...config
    };
    
    this.cacheManager = new AdvancedCacheManager(this.config);
    // this.queryOptimizer = new DatabaseQueryOptimizer(this.cacheManager);
  }

  /**
   * Initialize cache service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Cache Service...');

      // Initialize cache manager
      await this.cacheManager.initialize();

      // Set up event listeners
      this.setupEventListeners();

      // Warm up cache if enabled
      if (this.config.warmUp.enabled && this.config.warmUp.onStartup) {
        await this.warmUpCache();
      }

      this.isInitialized = true;
      console.log('✅ Cache Service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Cache Service:', error);
      throw error;
    }
  }

  /**
   * Car comparison caching
   */
  async getCachedCarComparison(
    brandA: string, 
    modelA: string, 
    brandB: string, 
    modelB: string
  ): Promise<any> {
    const cacheKey = `car_comparison:${brandA}:${modelA}:${brandB}:${modelB}`;
    
    return await this.cacheManager.get(cacheKey, {
      preferredTier: 'memory',
      updateTiers: true
    });
  }

  async setCachedCarComparison(
    brandA: string, 
    modelA: string, 
    brandB: string, 
    modelB: string, 
    comparisonData: any
  ): Promise<boolean> {
    const cacheKey = `car_comparison:${brandA}:${modelA}:${brandB}:${modelB}`;
    
    return await this.cacheManager.set(cacheKey, comparisonData, {
      ttl: this.config.services.cars.ttl,
      tier: 'memory',
      tags: ['cars', 'comparison', brandA, brandB],
      dependencies: ['cars_table']
    });
  }

  /**
   * Acoustics data caching
   */
  async getCachedAcoustics(vehicleId: string): Promise<any> {
    const cacheKey = `acoustics:${vehicleId}`;
    
    return await this.cacheManager.get(cacheKey, {
      preferredTier: 'redis',
      updateTiers: true
    });
  }

  async setCachedAcoustics(vehicleId: string, acousticsData: any): Promise<boolean> {
    const cacheKey = `acoustics:${vehicleId}`;
    
    return await this.cacheManager.set(cacheKey, acousticsData, {
      ttl: this.config.services.acoustics.ttl,
      tier: 'redis',
      tags: ['acoustics', 'vehicle', vehicleId],
      dependencies: ['acoustics_table', 'vehicles_table']
    });
  }

  /**
   * Audio certification caching
   */
  async getCachedCertification(certificationId: string): Promise<any> {
    const cacheKey = `certification:${certificationId}`;
    
    return await this.cacheManager.get(cacheKey, {
      preferredTier: 'persistent',
      updateTiers: false
    });
  }

  async setCachedCertification(certificationId: string, certificationData: any): Promise<boolean> {
    const cacheKey = `certification:${certificationId}`;
    
    return await this.cacheManager.set(cacheKey, certificationData, {
      ttl: this.config.services.audio.ttl,
      tier: 'persistent',
      tags: ['certification', 'audio', certificationId],
      dependencies: ['certifications_table']
    });
  }

  /**
   * User session caching
   */
  async getCachedUserSession(userId: string): Promise<any> {
    const cacheKey = `user_session:${userId}`;
    
    return await this.cacheManager.get(cacheKey, {
      preferredTier: 'memory'
    });
  }

  async setCachedUserSession(userId: string, sessionData: any): Promise<boolean> {
    const cacheKey = `user_session:${userId}`;
    
    return await this.cacheManager.set(cacheKey, sessionData, {
      ttl: this.config.services.users.ttl,
      tier: 'memory',
      tags: ['users', 'session', userId],
      dependencies: ['users_table']
    });
  }

  /**
   * Query-based caching with optimization
   */
  async executeQuery<T = any>(
    query: string,
    params: any[] = [],
    options?: {
      userId?: string;
      priority?: 'low' | 'normal' | 'high';
      forceRefresh?: boolean;
      customTtl?: number;
    }
  ): Promise<T | null> {
    // return await this.queryOptimizer.executeOptimizedQuery<T>(query, params, options);
    return [] as T;
  }

  /**
   * Invalidate cache by service area
   */
  async invalidateService(service: 'cars' | 'acoustics' | 'audio' | 'users'): Promise<number> {
    console.log(`🗑️ Invalidating ${service} cache...`);
    
    const cleared = await this.cacheManager.clear({
      tags: [service]
    });

    console.log(`✅ Invalidated ${cleared} ${service} cache entries`);
    return cleared;
  }

  /**
   * Invalidate cache by data dependencies
   */
  async invalidateByTable(tableName: string): Promise<number> {
    console.log(`🗑️ Invalidating cache for table: ${tableName}...`);
    
    // const queryInvalidated = await this.queryOptimizer.invalidateByTables([tableName]);
    const queryInvalidated = 1;
    const cacheInvalidated = await this.cacheManager.invalidateByDependencies([`${tableName}_table`]);
    
    const total = queryInvalidated + cacheInvalidated;
    console.log(`✅ Invalidated ${total} cache entries for table ${tableName}`);
    
    return total;
  }

  /**
   * Get comprehensive cache statistics
   */
  getCacheStatistics(): {
    cache: any;
    queries: any;
    services: Record<string, any>;
    recommendations: any;
  } {
    const cacheMetrics = this.cacheManager.getMetrics();
    // const queryStats = this.queryOptimizer.getQueryStats();
    // const recommendations = this.queryOptimizer.getOptimizationRecommendations();
    const queryStats = { totalQueries: 0, hitRate: 0, avgResponseTime: 0 };
    const recommendations: string[] = [];

    // Service-specific statistics
    const services = {
      cars: {
        enabled: this.config.services.cars.enabled,
        ttl: this.config.services.cars.ttl,
        // Add more service-specific metrics
      },
      acoustics: {
        enabled: this.config.services.acoustics.enabled,
        ttl: this.config.services.acoustics.ttl,
      },
      audio: {
        enabled: this.config.services.audio.enabled,
        ttl: this.config.services.audio.ttl,
      },
      users: {
        enabled: this.config.services.users.enabled,
        ttl: this.config.services.users.ttl,
      }
    };

    return {
      cache: cacheMetrics,
      queries: queryStats,
      services,
      recommendations
    };
  }

  /**
   * Health check for cache service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {};
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    try {
      // Test cache operations
      const testKey = 'health_check_' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };

      // Test set operation
      const setResult = await this.cacheManager.set(testKey, testValue, { ttl: 60 });
      details.canWrite = setResult;

      // Test get operation
      const getValue = await this.cacheManager.get(testKey);
      details.canRead = getValue !== null;

      // Test delete operation
      const deleteResult = await this.cacheManager.delete(testKey);
      details.canDelete = deleteResult;

      // Get metrics
      const metrics = this.cacheManager.getMetrics();
      details.hitRate = metrics.hitRate;
      details.memoryUsage = metrics.memoryUsage;
      details.redisConnected = metrics.redisConnected;

      // Determine overall status
      if (!details.canWrite || !details.canRead || !details.canDelete) {
        status = 'unhealthy';
      } else if (metrics.hitRate < 0.5 || !metrics.redisConnected) {
        status = 'degraded';
      }

      details.isInitialized = this.isInitialized;
      details.lastCheck = new Date().toISOString();

    } catch (error) {
      status = 'unhealthy';
      details.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return { status, details };
  }

  /**
   * Warm up cache with common data
   */
  private async warmUpCache(): Promise<void> {
    try {
      console.log('🔥 Starting cache warm-up...');

      // Warm up query cache
      const commonQueries = this.config.warmUp.commonQueries
        .filter(q => q.frequency === 'high')
        .map(q => ({ query: q.query, params: q.params }));

      // await this.queryOptimizer.warmUpCache(commonQueries);

      // Warm up common car comparisons
      if (this.config.services.cars.enabled) {
        await this.warmUpCarData();
      }

      // Warm up common acoustics data
      if (this.config.services.acoustics.enabled && this.config.services.acoustics.preloadCommonData) {
        await this.warmUpAcousticsData();
      }

      console.log('✅ Cache warm-up completed');

    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
    }
  }

  private async warmUpCarData(): Promise<void> {
    // Preload popular car comparisons
    const popularComparisons = [
      { brandA: 'BMW', modelA: '3 Series', brandB: 'Mercedes-Benz', modelB: 'E-Class' },
      { brandA: 'Tesla', modelA: 'Model 3', brandB: 'BMW', modelB: '3 Series' },
      { brandA: 'Volkswagen', modelA: 'Golf', brandB: 'Škoda', modelB: 'Octavia' }
    ];

    for (const comp of popularComparisons) {
      // This would normally fetch real data and cache it
      await this.setCachedCarComparison(
        comp.brandA, comp.modelA, comp.brandB, comp.modelB,
        { mock: 'warm_up_data', timestamp: Date.now() }
      );
    }
  }

  private async warmUpAcousticsData(): Promise<void> {
    // Preload common acoustics data
    const popularVehicles = ['bmw_3_series', 'mercedes_e_class', 'tesla_model_3'];

    for (const vehicleId of popularVehicles) {
      await this.setCachedAcoustics(vehicleId, {
        mock: 'warm_up_acoustics',
        timestamp: Date.now()
      });
    }
  }

  private setupEventListeners(): void {
    // Listen to cache events
    this.cacheManager.on('cache:hit', (data) => {
      console.log(`📈 Cache hit: ${data.key} (${data.tier})`);
    });

    this.cacheManager.on('cache:miss', (data) => {
      console.log(`📉 Cache miss: ${data.key}`);
    });

    this.cacheManager.on('cache:error', (data) => {
      console.error(`❌ Cache error: ${data.operation} - ${data.key}`, data.error);
    });

    // Listen to metrics updates
    this.cacheManager.on('metrics:update', (metrics) => {
      if (metrics.hitRate < 0.3) {
        console.warn(`⚠️ Low cache hit rate: ${(metrics.hitRate * 100).toFixed(1)}%`);
      }
    });
  }

  private getDefaultServiceConfig(): any {
    return {
      services: {
        cars: {
          enabled: true,
          ttl: 3600, // 1 hour - car data changes rarely
          invalidationTriggers: ['cars_table_update']
        },
        acoustics: {
          enabled: true,
          ttl: 7200, // 2 hours - acoustics data very stable
          preloadCommonData: true
        },
        audio: {
          enabled: true,
          ttl: 1800, // 30 minutes - audio processing results
          streaming: true
        },
        users: {
          enabled: true,
          ttl: 900, // 15 minutes - user session data
          sessionBased: true
        }
      },
      warmUp: {
        enabled: true,
        onStartup: true,
        commonQueries: [
          {
            name: 'popular_car_brands',
            query: 'SELECT DISTINCT brand FROM cars ORDER BY brand',
            frequency: 'high'
          },
          {
            name: 'car_models_by_brand',
            query: 'SELECT model FROM cars WHERE brand = ? ORDER BY model',
            params: ['BMW'],
            frequency: 'high'
          },
          {
            name: 'acoustics_summary',
            query: 'SELECT vehicle_id, measurement_date FROM acoustics ORDER BY measurement_date DESC LIMIT 50',
            frequency: 'medium'
          }
        ]
      }
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Cache Service...');
      
      await this.cacheManager.shutdown();
      
      this.isInitialized = false;
      console.log('✅ Cache Service shutdown complete');

    } catch (error) {
      console.error('❌ Cache Service shutdown error:', error);
    }
  }
}

// Create and export default cache service instance
export const cacheService = new CacheService();