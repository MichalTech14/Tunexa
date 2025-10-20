/**
 * Redis Configuration Environment Variables
 * Provides environment-specific Redis configurations for different deployment scenarios
 */

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'testing';
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  REDIS_DATABASE?: string;
  REDIS_CLUSTER_ENABLED?: string;
  REDIS_CLUSTER_NODES?: string;
  REDIS_KEY_PREFIX?: string;
  REDIS_TTL_DEFAULT?: string;
  REDIS_MAX_MEMORY?: string;
  REDIS_EVICTION_POLICY?: string;
}

/**
 * Parse Redis cluster nodes from environment variable
 * Format: "host1:port1,host2:port2,host3:port3"
 */
export function parseClusterNodes(nodesString: string): Array<{ host: string; port: number }> {
  return nodesString.split(',').map(node => {
    const [host, port] = node.trim().split(':');
    return {
      host: host || 'localhost',
      port: parseInt(port) || 6379
    };
  });
}

/**
 * Create Redis configuration from environment variables
 */
export function createRedisConfigFromEnv(): any {
  const env = process.env as unknown as EnvironmentConfig;
  
  const config = {
    host: env.REDIS_HOST || 'localhost',
    port: parseInt(env.REDIS_PORT || '6379'),
    password: env.REDIS_PASSWORD,
    database: parseInt(env.REDIS_DATABASE || '0'),
    
    // Performance settings
    performance: {
      keyPrefix: env.REDIS_KEY_PREFIX || 'tunexa',
      compression: env.NODE_ENV === 'production',
      serialization: 'json' as const,
      maxMemoryPolicy: env.REDIS_EVICTION_POLICY || 'allkeys-lru'
    },
    
    // Connection settings
    retry: {
      attempts: env.NODE_ENV === 'production' ? 5 : 3,
      delay: 1000,
      factor: 2,
      maxDelay: env.NODE_ENV === 'production' ? 30000 : 5000
    },
    
    // Health monitoring
    health: {
      checkInterval: env.NODE_ENV === 'production' ? 15000 : 30000,
      timeout: 5000,
      failureThreshold: env.NODE_ENV === 'production' ? 5 : 3,
      successThreshold: env.NODE_ENV === 'production' ? 3 : 2
    }
  };

  // Add cluster configuration if enabled
  if (env.REDIS_CLUSTER_ENABLED === 'true' && env.REDIS_CLUSTER_NODES) {
    return {
      ...config,
      cluster: {
        enabled: true,
        nodes: parseClusterNodes(env.REDIS_CLUSTER_NODES),
        options: {
          enableReadyCheck: true,
          redisOptions: {
            password: env.REDIS_PASSWORD,
            connectTimeout: 10000,
            commandTimeout: 5000,
            maxRetriesPerRequest: config.retry.attempts
          },
          clusterRetryDelayOnFailover: 100,
          clusterRetryDelayOnClusterDown: 1000,
          clusterMaxRedirections: 16
        }
      }
    };
  }

  return config;
}

/**
 * Environment-specific Docker Compose configurations
 */
export const DockerComposeConfigs = {
  development: `
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: tunexa-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  redis-data:
`,

  production: `
version: '3.8'
services:
  redis-cluster-1:
    image: redis:7-alpine
    container_name: tunexa-redis-cluster-1
    ports:
      - "7001:6379"
      - "17001:16379"
    volumes:
      - redis-cluster-1-data:/data
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes-6379.conf --cluster-node-timeout 5000 --appendonly yes --port 6379 --cluster-announce-port 6379 --cluster-announce-bus-port 16379
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6379", "ping"]
      interval: 15s
      timeout: 5s
      retries: 5

  redis-cluster-2:
    image: redis:7-alpine
    container_name: tunexa-redis-cluster-2
    ports:
      - "7002:6379"
      - "17002:16379"
    volumes:
      - redis-cluster-2-data:/data
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes-6379.conf --cluster-node-timeout 5000 --appendonly yes --port 6379 --cluster-announce-port 6379 --cluster-announce-bus-port 16379
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6379", "ping"]
      interval: 15s
      timeout: 5s
      retries: 5

  redis-cluster-3:
    image: redis:7-alpine
    container_name: tunexa-redis-cluster-3
    ports:
      - "7003:6379"
      - "17003:16379"
    volumes:
      - redis-cluster-3-data:/data
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes-6379.conf --cluster-node-timeout 5000 --appendonly yes --port 6379 --cluster-announce-port 6379 --cluster-announce-bus-port 16379
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6379", "ping"]
      interval: 15s
      timeout: 5s
      retries: 5

  redis-sentinel-1:
    image: redis:7-alpine
    container_name: tunexa-redis-sentinel-1
    ports:
      - "26379:26379"
    volumes:
      - ./redis-sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis-cluster-1
      - redis-cluster-2
      - redis-cluster-3

volumes:
  redis-cluster-1-data:
  redis-cluster-2-data:
  redis-cluster-3-data:
`,

  testing: `
version: '3.8'
services:
  redis-test:
    image: redis:7-alpine
    container_name: tunexa-redis-test
    ports:
      - "6380:6379"
    volumes:
      - redis-test-data:/data
    command: redis-server --appendonly yes --maxmemory 128mb --maxmemory-policy volatile-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 2

volumes:
  redis-test-data:
`
};

/**
 * Redis configuration files for different environments
 */
export const RedisConfFiles = {
  production: `
# Redis production configuration
bind 0.0.0.0
port 6379
protected-mode yes
requirepass \${REDIS_PASSWORD}

# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Append Only File
appendonly yes
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Cluster configuration
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip \${CLUSTER_ANNOUNCE_IP}
cluster-announce-port \${CLUSTER_ANNOUNCE_PORT}
cluster-announce-bus-port \${CLUSTER_ANNOUNCE_BUS_PORT}

# Logging
loglevel notice
logfile /var/log/redis/redis.log

# Security
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command EVAL ""

# Performance
tcp-keepalive 300
timeout 300
tcp-backlog 511
databases 16
`,

  sentinel: `
# Redis Sentinel configuration
bind 0.0.0.0
port 26379
sentinel announce-ip \${SENTINEL_ANNOUNCE_IP}
sentinel announce-port 26379

# Monitor master
sentinel monitor tunexa-master \${REDIS_MASTER_IP} 6379 2
sentinel auth-pass tunexa-master \${REDIS_PASSWORD}
sentinel down-after-milliseconds tunexa-master 5000
sentinel parallel-syncs tunexa-master 1
sentinel failover-timeout tunexa-master 10000

# Logging
loglevel notice
logfile /var/log/redis/sentinel.log
`
};

/**
 * Kubernetes deployment configurations
 */
export const KubernetesConfigs = {
  redis: `
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: tunexa-redis
  namespace: tunexa
spec:
  serviceName: tunexa-redis
  replicas: 3
  selector:
    matchLabels:
      app: tunexa-redis
  template:
    metadata:
      labels:
        app: tunexa-redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
          name: redis
        - containerPort: 16379
          name: cluster
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
        volumeMounts:
        - name: redis-data
          mountPath: /data
        - name: redis-config
          mountPath: /usr/local/etc/redis/redis.conf
          subPath: redis.conf
        livenessProbe:
          tcpSocket:
            port: 6379
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: redis-config
        configMap:
          name: redis-config
  volumeClaimTemplates:
  - metadata:
      name: redis-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "fast-ssd"
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: tunexa-redis
  namespace: tunexa
spec:
  clusterIP: None
  selector:
    app: tunexa-redis
  ports:
  - name: redis
    port: 6379
    targetPort: 6379
  - name: cluster
    port: 16379
    targetPort: 16379
`
};

/**
 * Health check and monitoring utilities
 */
export class RedisHealthMonitor {
  private connectionManager: any;
  private metrics: any = {};
  private alertThresholds = {
    memoryUsage: 0.9, // 90%
    responseTime: 1000, // 1 second
    errorRate: 0.05, // 5%
    connectionFailures: 5
  };

  constructor(connectionManager: any) {
    this.connectionManager = connectionManager;
  }

  /**
   * Comprehensive health check with alerting
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    metrics: any;
    alerts: string[];
  }> {
    const alerts: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    try {
      const healthStatus = await this.connectionManager.performHealthCheck();
      
      // Check memory usage
      if (healthStatus.memory.fragmentation > this.alertThresholds.memoryUsage) {
        alerts.push(`High memory fragmentation: ${(healthStatus.memory.fragmentation * 100).toFixed(1)}%`);
        status = 'degraded';
      }

      // Check response time
      if (healthStatus.latency.average > this.alertThresholds.responseTime) {
        alerts.push(`High response time: ${healthStatus.latency.average}ms`);
        status = 'degraded';
      }

      // Check error rate
      if (healthStatus.errors.length > 0) {
        alerts.push(`Errors detected: ${healthStatus.errors.length}`);
        status = 'critical';
      }

      // Check cluster status
      if (healthStatus.clusterSize && healthStatus.clusterSize < 3) {
        alerts.push(`Cluster size below minimum: ${healthStatus.clusterSize}/3`);
        status = 'critical';
      }

      return {
        status,
        metrics: healthStatus,
        alerts
      };

    } catch (error) {
      return {
        status: 'critical',
        metrics: {},
        alerts: [`Health check failed: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Generate monitoring dashboard data
   */
  generateDashboardData(): any {
    return {
      uptime: process.uptime(),
      connections: this.metrics.totalConnections || 0,
      hitRate: this.metrics.hitRate || 0,
      memoryUsage: this.metrics.memory?.used || 0,
      commandsPerSecond: this.metrics.commandsPerSecond || 0,
      clusterNodes: this.metrics.clusterSize || 1,
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Deployment helper functions
 */
export const DeploymentHelpers = {
  /**
   * Generate environment file for deployment
   */
  generateEnvFile(environment: 'development' | 'production' | 'testing'): string {
    const baseEnv = `
NODE_ENV=${environment}
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DATABASE=0
REDIS_KEY_PREFIX=tunexa:${environment}
REDIS_TTL_DEFAULT=3600
`;

    switch (environment) {
      case 'production':
        return baseEnv + `
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=redis-cluster-1:6379,redis-cluster-2:6379,redis-cluster-3:6379
REDIS_PASSWORD=\${REDIS_PRODUCTION_PASSWORD}
REDIS_MAX_MEMORY=2gb
REDIS_EVICTION_POLICY=allkeys-lru
`;

      case 'testing':
        return baseEnv + `
REDIS_PORT=6380
REDIS_DATABASE=15
REDIS_MAX_MEMORY=128mb
REDIS_EVICTION_POLICY=volatile-lru
`;

      default:
        return baseEnv + `
REDIS_MAX_MEMORY=256mb
REDIS_EVICTION_POLICY=allkeys-lru
`;
    }
  },

  /**
   * Generate Redis CLI connection commands
   */
  generateConnectionCommands(environment: 'development' | 'production' | 'testing'): string[] {
    switch (environment) {
      case 'production':
        return [
          'redis-cli -c -h redis-cluster-1 -p 6379 -a $REDIS_PASSWORD',
          'redis-cli -c -h redis-cluster-2 -p 6379 -a $REDIS_PASSWORD',
          'redis-cli -c -h redis-cluster-3 -p 6379 -a $REDIS_PASSWORD'
        ];

      case 'testing':
        return ['redis-cli -h localhost -p 6380'];

      default:
        return ['redis-cli -h localhost -p 6379'];
    }
  },

  /**
   * Generate monitoring setup commands
   */
  generateMonitoringCommands(): string[] {
    return [
      'redis-cli INFO memory',
      'redis-cli INFO stats',
      'redis-cli INFO replication',
      'redis-cli CLUSTER NODES',
      'redis-cli CLIENT LIST',
      'redis-cli SLOWLOG GET 10'
    ];
  }
};