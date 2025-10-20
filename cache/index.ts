/**
 * Cache Integration with Server
 * Integrates advanced caching into the main Tunexa server
 */

import { cacheService } from './cache-service';
import { RedisConnectionManager, createRedisConnection, RedisConfigurations } from './redis-config.js';
import { createRedisConfigFromEnv, RedisHealthMonitor } from './redis-deployment.js';

// Global Redis connection manager
let redisConnectionManager: RedisConnectionManager | null = null;
let healthMonitor: RedisHealthMonitor | null = null;

// Initialize cache service on import
let cacheInitialized = false;

/**
 * Initialize Redis connection based on environment
 */
async function initializeRedisConnection(): Promise<void> {
  const environment = (process.env.NODE_ENV as 'development' | 'production' | 'testing') || 'development';
  
  try {
    // Check if Redis is enabled via environment
    const redisEnabled = process.env.REDIS_ENABLED !== 'false';
    
    if (!redisEnabled) {
      console.log('🔧 Redis disabled via environment configuration');
      return;
    }

    // Create Redis connection based on environment
    if (process.env.REDIS_CLUSTER_ENABLED === 'true') {
      // Use cluster configuration from environment
      const config = createRedisConfigFromEnv();
      redisConnectionManager = new RedisConnectionManager(config);
    } else {
      // Use predefined configuration for environment
      redisConnectionManager = createRedisConnection(environment);
    }

    // Initialize connection
    await redisConnectionManager.connect();
    
    // Setup health monitoring
    healthMonitor = new RedisHealthMonitor(redisConnectionManager);
    
    console.log(`🔗 Redis connection established for ${environment} environment`);
    
  } catch (error) {
    console.warn('⚠️ Redis connection failed, continuing with memory-only cache:', error);
    redisConnectionManager = null;
    healthMonitor = null;
  }
}

export async function initializeCacheSystem(): Promise<void> {
  if (cacheInitialized) {
    console.log('🗄️ Cache system already initialized');
    return;
  }

  try {
    console.log('🗄️ Initializing Advanced Caching System...');
    
    // Initialize Redis connection if enabled
    await initializeRedisConnection();
    
    // Initialize cache service
    await cacheService.initialize();
    
    cacheInitialized = true;
    setupGlobalCacheHelpers();
    
    console.log('✅ Advanced Caching System initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize cache system:', error);
    throw error;
  }
}

export function setupGlobalCacheHelpers(): void {
  // Add cache helpers to global scope for easy access
  (global as any).cache = {
    // Car comparison helpers
    getCarComparison: async (brandA: string, modelA: string, brandB: string, modelB: string) => {
      return await cacheService.getCachedCarComparison(brandA, modelA, brandB, modelB);
    },
    
    setCarComparison: async (brandA: string, modelA: string, brandB: string, modelB: string, data: any) => {
      return await cacheService.setCachedCarComparison(brandA, modelA, brandB, modelB, data);
    },

    // Acoustics helpers
    getAcoustics: async (vehicleId: string) => {
      return await cacheService.getCachedAcoustics(vehicleId);
    },
    
    setAcoustics: async (vehicleId: string, data: any) => {
      return await cacheService.setCachedAcoustics(vehicleId, data);
    },

    // Query execution helper
    executeQuery: async (query: string, params: any[] = [], options?: any) => {
      return await cacheService.executeQuery(query, params, options);
    },

    // Invalidation helpers
    invalidateService: async (service: 'cars' | 'acoustics' | 'audio' | 'users') => {
      return await cacheService.invalidateService(service);
    },

    invalidateTable: async (tableName: string) => {
      return await cacheService.invalidateByTable(tableName);
    },

    // Statistics helper
    getStats: () => {
      return cacheService.getCacheStatistics();
    },

    // Health check helper
    healthCheck: async () => {
      return await cacheService.healthCheck();
    },

    // Redis health monitoring
    redisHealth: async () => {
      if (!healthMonitor) {
        return { status: 'disabled', message: 'Redis not initialized' };
      }
      return await healthMonitor.performHealthCheck();
    },

    // Get Redis connection manager
    getRedisManager: () => {
      return redisConnectionManager;
    }
  };

  console.log('🔧 Global cache helpers configured');
}

export async function shutdownCacheSystem(): Promise<void> {
  if (!cacheInitialized) {
    return;
  }

  try {
    console.log('🔄 Shutting down caching system...');
    
    // Shutdown cache service
    await cacheService.shutdown();
    
    // Shutdown Redis connection
    if (redisConnectionManager) {
      await redisConnectionManager.disconnect();
      redisConnectionManager = null;
    }
    
    // Cleanup health monitor
    healthMonitor = null;
    
    // Remove global helpers
    delete (global as any).cache;
    
    cacheInitialized = false;
    console.log('✅ Caching system shutdown complete');

  } catch (error) {
    console.error('❌ Caching system shutdown error:', error);
  }
}

// Export cache service and Redis utilities
export { 
  cacheService,
  redisConnectionManager,
  healthMonitor,
  RedisConnectionManager,
  createRedisConnection,
  RedisConfigurations,
  createRedisConfigFromEnv,
  RedisHealthMonitor
};

// Export types for external use
export type { CacheServiceConfig } from './cache-service';
export type { CacheConfig, CacheEntry, CacheMetrics } from './cache-manager';
// export type { QueryOptimization, QueryStats } from './query-optimizer';