/**
 * Redis Configuration and Connection Management
 * 
 * Provides Redis connection configuration, clustering support,
 * failover mechanisms, and health monitoring for production deployment.
 */

import { EventEmitter } from 'events';

export interface RedisClusterNode {
  host: string;
  port: number;
  password?: string;
}

export interface RedisConfig {
  // Single Redis instance configuration
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  
  // Cluster configuration
  cluster?: {
    enabled: boolean;
    nodes: RedisClusterNode[];
    options?: {
      enableReadyCheck?: boolean;
      redisOptions?: {
        password?: string;
        connectTimeout?: number;
        commandTimeout?: number;
        retryDelayOnFailover?: number;
        maxRetriesPerRequest?: number;
      };
      clusterRetryDelayOnFailover?: number;
      clusterRetryDelayOnClusterDown?: number;
      clusterMaxRedirections?: number;
    };
  };
  
  // Connection pooling
  pool?: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
  };
  
  // Retry and timeout configuration
  retry?: {
    attempts: number;
    delay: number;
    factor: number;
    maxDelay: number;
  };
  
  // Health monitoring
  health?: {
    checkInterval: number;
    timeout: number;
    failureThreshold: number;
    successThreshold: number;
  };
  
  // Performance settings
  performance?: {
    keyPrefix?: string;
    compression?: boolean;
    serialization?: 'json' | 'msgpack' | 'custom';
    maxMemoryPolicy?: 'noeviction' | 'allkeys-lru' | 'volatile-lru' | 'allkeys-random' | 'volatile-random' | 'volatile-ttl';
  };
}

export interface RedisHealthStatus {
  connected: boolean;
  clusterSize?: number;
  memory: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  stats: {
    totalConnections: number;
    commandsProcessed: number;
    hitRate: number;
    missRate: number;
  };
  latency: {
    average: number;
    p95: number;
    p99: number;
  };
  lastCheck: Date;
  errors: string[];
}

export class RedisConnectionManager extends EventEmitter {
  private config: RedisConfig;
  private client: any = null;
  private cluster: any = null;
  private healthStatus: RedisHealthStatus;
  private healthCheckInterval?: NodeJS.Timeout;
  private reconnectAttempts = 0;
  private isConnected = false;

  constructor(config: RedisConfig) {
    super();
    this.config = config;
    this.healthStatus = {
      connected: false,
      memory: { used: 0, peak: 0, fragmentation: 0 },
      stats: { totalConnections: 0, commandsProcessed: 0, hitRate: 0, missRate: 0 },
      latency: { average: 0, p95: 0, p99: 0 },
      lastCheck: new Date(),
      errors: []
    };
  }

  /**
   * Initialize Redis connection (single instance or cluster)
   */
  async connect(): Promise<void> {
    try {
      if (this.config.cluster?.enabled) {
        await this.connectCluster();
      } else {
        await this.connectSingle();
      }
      
      this.setupEventHandlers();
      this.startHealthMonitoring();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.emit('connected');
      console.log('🔗 Redis connection established successfully');
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.emit('error', error);
      await this.handleReconnect();
      throw error;
    }
  }

  /**
   * Connect to single Redis instance
   */
  private async connectSingle(): Promise<void> {
    const Redis = await import('ioredis');
    
    const options = {
      host: this.config.host || 'localhost',
      port: this.config.port || 6379,
      password: this.config.password,
      db: this.config.database || 0,
      connectTimeout: this.config.retry?.delay || 10000,
      commandTimeout: 5000,
      retryDelayOnFailover: this.config.retry?.delay || 100,
      maxRetriesPerRequest: this.config.retry?.attempts || 3,
      keyPrefix: this.config.performance?.keyPrefix || 'tunexa:',
      compression: this.config.performance?.compression ? 'gzip' : undefined
    };

    this.client = new Redis.default(options);
    await this.client.ping();
  }

  /**
   * Connect to Redis cluster
   */
  private async connectCluster(): Promise<void> {
    const Redis = await import('ioredis');
    
    const clusterOptions = {
      enableReadyCheck: true,
      redisOptions: {
        password: this.config.cluster?.options?.redisOptions?.password,
        connectTimeout: this.config.cluster?.options?.redisOptions?.connectTimeout || 10000,
        commandTimeout: this.config.cluster?.options?.redisOptions?.commandTimeout || 5000,
        retryDelayOnFailover: this.config.cluster?.options?.redisOptions?.retryDelayOnFailover || 100,
        maxRetriesPerRequest: this.config.cluster?.options?.redisOptions?.maxRetriesPerRequest || 3,
        keyPrefix: this.config.performance?.keyPrefix || 'tunexa:'
      },
      clusterRetryDelayOnFailover: this.config.cluster?.options?.clusterRetryDelayOnFailover || 100,
      clusterRetryDelayOnClusterDown: this.config.cluster?.options?.clusterRetryDelayOnClusterDown || 1000,
      clusterMaxRedirections: this.config.cluster?.options?.clusterMaxRedirections || 16
    };

    this.cluster = new Redis.Cluster(this.config.cluster!.nodes, clusterOptions);
    await this.cluster.ping();
    this.client = this.cluster;
  }

  /**
   * Setup event handlers for connection monitoring
   */
  private setupEventHandlers(): void {
    const redis = this.client;

    redis.on('connect', () => {
      console.log('🔗 Redis connected');
      this.isConnected = true;
      this.emit('connect');
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready');
      this.emit('ready');
    });

    redis.on('error', (error: Error) => {
      console.error('❌ Redis error:', error.message);
      this.healthStatus.errors.push(error.message);
      this.isConnected = false;
      this.emit('error', error);
    });

    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
      this.isConnected = false;
      this.emit('close');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
      this.emit('reconnecting');
    });

    if (this.cluster) {
      this.cluster.on('node error', (error: Error, node: any) => {
        console.error(`❌ Redis cluster node error (${node.options.host}:${node.options.port}):`, error.message);
        this.emit('nodeError', error, node);
      });
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    const interval = this.config.health?.checkInterval || 30000;
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, interval);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<RedisHealthStatus> {
    const startTime = Date.now();
    
    try {
      // Basic connectivity check
      await this.client.ping();
      
      // Get Redis info
      const info = await this.client.info();
      const memory = await this.client.info('memory');
      const stats = await this.client.info('stats');
      
      // Parse info responses
      const memoryInfo = this.parseRedisInfo(memory);
      const statsInfo = this.parseRedisInfo(stats);
      const serverInfo = this.parseRedisInfo(info);
      
      // Calculate latency
      const latency = Date.now() - startTime;
      
      // Update health status
      this.healthStatus = {
        connected: true,
        clusterSize: this.cluster ? await this.getClusterSize() : undefined,
        memory: {
          used: parseInt(memoryInfo.used_memory || '0'),
          peak: parseInt(memoryInfo.used_memory_peak || '0'),
          fragmentation: parseFloat(memoryInfo.mem_fragmentation_ratio || '1')
        },
        stats: {
          totalConnections: parseInt(statsInfo.total_connections_received || '0'),
          commandsProcessed: parseInt(statsInfo.total_commands_processed || '0'),
          hitRate: this.calculateHitRate(statsInfo),
          missRate: this.calculateMissRate(statsInfo)
        },
        latency: {
          average: latency,
          p95: latency * 1.2,
          p99: latency * 1.5
        },
        lastCheck: new Date(),
        errors: []
      };
      
      this.emit('healthCheck', this.healthStatus);
      return this.healthStatus;
      
    } catch (error) {
      this.healthStatus.connected = false;
      this.healthStatus.errors.push((error as Error).message);
      this.healthStatus.lastCheck = new Date();
      
      this.emit('healthCheckFailed', error);
      throw error;
    }
  }

  /**
   * Get cluster size for cluster deployments
   */
  private async getClusterSize(): Promise<number> {
    if (!this.cluster) return 1;
    
    try {
      const nodes = await this.cluster.cluster('nodes');
      return nodes.split('\n').filter((line: string) => line.includes('master')).length;
    } catch {
      return 1;
    }
  }

  /**
   * Parse Redis INFO command response
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Calculate cache hit rate from Redis stats
   */
  private calculateHitRate(stats: Record<string, string>): number {
    const hits = parseInt(stats.keyspace_hits || '0');
    const misses = parseInt(stats.keyspace_misses || '0');
    const total = hits + misses;
    
    return total > 0 ? hits / total : 0;
  }

  /**
   * Calculate cache miss rate from Redis stats
   */
  private calculateMissRate(stats: Record<string, string>): number {
    return 1 - this.calculateHitRate(stats);
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnect(): Promise<void> {
    if (!this.config.retry) return;
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > this.config.retry.attempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }
    
    const delay = Math.min(
      this.config.retry.delay * Math.pow(this.config.retry.factor || 2, this.reconnectAttempts - 1),
      this.config.retry.maxDelay || 30000
    );
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.retry.attempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Get Redis client instance
   */
  getClient(): any {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }

  /**
   * Get current health status
   */
  getHealthStatus(): RedisHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if Redis is connected and healthy
   */
  isHealthy(): boolean {
    return this.isConnected && this.healthStatus.connected;
  }

  /**
   * Gracefully disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      if (this.client) {
        await this.client.quit();
        this.client = null;
      }
      
      if (this.cluster) {
        await this.cluster.quit();
        this.cluster = null;
      }
      
      this.isConnected = false;
      this.emit('disconnected');
      console.log('👋 Redis disconnected gracefully');
      
    } catch (error) {
      console.error('❌ Error during Redis disconnect:', error);
      throw error;
    }
  }

  /**
   * Force disconnect (for emergency situations)
   */
  forceDisconnect(): void {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      if (this.client) {
        this.client.disconnect();
        this.client = null;
      }
      
      if (this.cluster) {
        this.cluster.disconnect();
        this.cluster = null;
      }
      
      this.isConnected = false;
      this.emit('forcedDisconnected');
      console.log('🚨 Redis force disconnected');
      
    } catch (error) {
      console.error('❌ Error during Redis force disconnect:', error);
    }
  }
}

/**
 * Default Redis configurations for different environments
 */
export const RedisConfigurations = {
  development: {
    host: 'localhost',
    port: 6379,
    database: 0,
    retry: {
      attempts: 3,
      delay: 1000,
      factor: 2,
      maxDelay: 5000
    },
    health: {
      checkInterval: 30000,
      timeout: 5000,
      failureThreshold: 3,
      successThreshold: 2
    },
    performance: {
      keyPrefix: 'tunexa:dev:',
      compression: false,
      serialization: 'json' as const
    }
  },

  production: {
    cluster: {
      enabled: true,
      nodes: [
        { host: 'redis-cluster-1', port: 6379 },
        { host: 'redis-cluster-2', port: 6379 },
        { host: 'redis-cluster-3', port: 6379 }
      ],
      options: {
        enableReadyCheck: true,
        redisOptions: {
          connectTimeout: 10000,
          commandTimeout: 5000,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3
        },
        clusterRetryDelayOnFailover: 100,
        clusterRetryDelayOnClusterDown: 1000,
        clusterMaxRedirections: 16
      }
    },
    pool: {
      min: 5,
      max: 20,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
    },
    retry: {
      attempts: 5,
      delay: 1000,
      factor: 2,
      maxDelay: 30000
    },
    health: {
      checkInterval: 15000,
      timeout: 5000,
      failureThreshold: 5,
      successThreshold: 3
    },
    performance: {
      keyPrefix: 'tunexa:prod:',
      compression: true,
      serialization: 'msgpack' as const,
      maxMemoryPolicy: 'allkeys-lru' as const
    }
  },

  testing: {
    host: 'localhost',
    port: 6379,
    database: 15, // Use separate database for tests
    retry: {
      attempts: 1,
      delay: 100,
      factor: 1,
      maxDelay: 1000
    },
    health: {
      checkInterval: 60000,
      timeout: 1000,
      failureThreshold: 1,
      successThreshold: 1
    },
    performance: {
      keyPrefix: 'tunexa:test:',
      compression: false,
      serialization: 'json' as const
    }
  }
};

/**
 * Create Redis connection manager with environment-specific configuration
 */
export function createRedisConnection(environment: 'development' | 'production' | 'testing' = 'development'): RedisConnectionManager {
  const config = RedisConfigurations[environment];
  return new RedisConnectionManager(config);
}

/**
 * Redis connection factory with custom configuration
 */
export function createCustomRedisConnection(config: RedisConfig): RedisConnectionManager {
  return new RedisConnectionManager(config);
}