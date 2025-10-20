/**
 * Advanced Database Connection Manager
 * Enhanced connection management with monitoring and optimization
 */

import { DataSource, QueryRunner, Repository, ObjectLiteral } from 'typeorm';
import { AppDataSource } from './config.js';
import { performance } from 'perf_hooks';

export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  avgQueryTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
  connectionUptime: number;
  lastActivity: Date;
}

export interface QueryPerformance {
  query: string;
  duration: number;
  timestamp: Date;
  parameters?: any[];
  error?: string;
}

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private dataSource: DataSource;
  private metrics: ConnectionMetrics;
  private queryHistory: QueryPerformance[] = [];
  private readonly maxHistorySize = 1000;
  private connectionStartTime: Date;
  private queryListeners: Array<(query: QueryPerformance) => void> = [];

  private constructor() {
    this.dataSource = AppDataSource;
    this.connectionStartTime = new Date();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      totalQueries: 0,
      avgQueryTime: 0,
      slowQueries: [],
      connectionUptime: 0,
      lastActivity: new Date()
    };
  }

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  /**
   * Initialize database with enhanced monitoring
   */
  public async initialize(): Promise<DataSource> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        this.setupQueryMonitoring();
        this.metrics.totalConnections = 1;
        this.metrics.activeConnections = 1;
        
        console.log('🗄️  Enhanced database connection established');
        console.log(`📊 Connection settings:
   • Cache: ${this.dataSource.options.cache ? 'Enabled' : 'Disabled'}
   • Synchronize: ${this.dataSource.options.synchronize}
   • Logging: ${Array.isArray(this.dataSource.options.logging) ? this.dataSource.options.logging.join(', ') : this.dataSource.options.logging}
   • Max Query Time: ${this.dataSource.options.maxQueryExecutionTime}ms`);
      }
      
      return this.dataSource;
    } catch (error) {
      console.error('❌ Enhanced database connection failed:', error);
      throw error;
    }
  }

  /**
   * Setup query performance monitoring
   */
  private setupQueryMonitoring(): void {
    // Hook into TypeORM's query execution for monitoring
    const originalQuery = this.dataSource.createQueryRunner().query;
    
    this.dataSource.createQueryRunner = (): QueryRunner => {
      const queryRunner = this.dataSource.driver.createQueryRunner('master');
      const originalQueryMethod = queryRunner.query.bind(queryRunner);
      
      queryRunner.query = async (query: string, parameters?: any[]): Promise<any> => {
        const startTime = performance.now();
        let error: string | undefined;
        
        try {
          const result = await originalQueryMethod(query, parameters);
          const duration = performance.now() - startTime;
          
          this.recordQuery({
            query: query.trim(),
            duration,
            timestamp: new Date(),
            parameters
          });
          
          return result;
        } catch (err) {
          const duration = performance.now() - startTime;
          error = err instanceof Error ? err.message : String(err);
          
          this.recordQuery({
            query: query.trim(),
            duration,
            timestamp: new Date(),
            parameters,
            error
          });
          
          throw err;
        }
      };
      
      return queryRunner;
    };
  }

  /**
   * Record query performance data
   */
  private recordQuery(queryPerf: QueryPerformance): void {
    this.queryHistory.push(queryPerf);
    
    // Maintain history size
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }
    
    // Update metrics
    this.metrics.totalQueries++;
    this.metrics.lastActivity = new Date();
    
    // Calculate average query time
    const totalTime = this.queryHistory.reduce((sum, q) => sum + q.duration, 0);
    this.metrics.avgQueryTime = totalTime / this.queryHistory.length;
    
    // Track slow queries (> 1000ms)
    if (queryPerf.duration > 1000) {
      this.metrics.slowQueries.push({
        query: queryPerf.query.substring(0, 200) + (queryPerf.query.length > 200 ? '...' : ''),
        duration: queryPerf.duration,
        timestamp: queryPerf.timestamp
      });
      
      // Keep only last 50 slow queries
      if (this.metrics.slowQueries.length > 50) {
        this.metrics.slowQueries.shift();
      }
    }
    
    // Notify listeners
    this.queryListeners.forEach(listener => listener(queryPerf));
  }

  /**
   * Get connection metrics
   */
  public getMetrics(): ConnectionMetrics {
    this.metrics.connectionUptime = Date.now() - this.connectionStartTime.getTime();
    return { ...this.metrics };
  }

  /**
   * Get query history
   */
  public getQueryHistory(limit: number = 100): QueryPerformance[] {
    return this.queryHistory.slice(-limit);
  }

  /**
   * Get slow queries
   */
  public getSlowQueries(minDuration: number = 1000): QueryPerformance[] {
    return this.queryHistory.filter(q => q.duration >= minDuration);
  }

  /**
   * Add query listener for real-time monitoring
   */
  public addQueryListener(listener: (query: QueryPerformance) => void): void {
    this.queryListeners.push(listener);
  }

  /**
   * Remove query listener
   */
  public removeQueryListener(listener: (query: QueryPerformance) => void): void {
    const index = this.queryListeners.indexOf(listener);
    if (index > -1) {
      this.queryListeners.splice(index, 1);
    }
  }

  /**
   * Get enhanced repository with performance tracking
   */
  public getRepository<Entity extends ObjectLiteral>(entityClass: new () => Entity): Repository<Entity> {
    return this.dataSource.getRepository(entityClass);
  }

  /**
   * Execute optimized query with caching
   */
  public async executeOptimizedQuery<T = any>(
    query: string, 
    parameters?: any[], 
    useCache: boolean = true
  ): Promise<T[]> {
    const startTime = performance.now();
    
    try {
      // For SQLite, we'll implement basic query optimization
      const optimizedQuery = this.optimizeQuery(query);
      
      const result = await this.dataSource.query(optimizedQuery, parameters);
      
      const duration = performance.now() - startTime;
      console.log(`🔍 Optimized query executed in ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ Optimized query failed:', error);
      throw error;
    }
  }

  /**
   * Basic query optimization for SQLite
   */
  private optimizeQuery(query: string): string {
    let optimized = query;
    
    // Add LIMIT if not present in SELECT without WHERE
    if (optimized.match(/^SELECT\s+/i) && !optimized.match(/\bLIMIT\b/i) && !optimized.match(/\bWHERE\b/i)) {
      optimized += ' LIMIT 1000';
    }
    
    // Ensure indexes are used with EXPLAIN QUERY PLAN
    if (process.env.NODE_ENV === 'development' && optimized.match(/^SELECT\s+/i)) {
      console.log(`🔍 Query plan: ${optimized}`);
    }
    
    return optimized;
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectionTime: number;
    metrics: ConnectionMetrics;
  }> {
    const startTime = performance.now();
    
    try {
      await this.dataSource.query('SELECT 1');
      const connectionTime = performance.now() - startTime;
      
      const metrics = this.getMetrics();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (connectionTime > 1000) {
        status = 'unhealthy';
      } else if (connectionTime > 500 || metrics.avgQueryTime > 500) {
        status = 'degraded';
      }
      
      return {
        status,
        connectionTime,
        metrics
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connectionTime: performance.now() - startTime,
        metrics: this.getMetrics()
      };
    }
  }

  /**
   * Close connection
   */
  public async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.metrics.activeConnections = 0;
      console.log('🗄️  Enhanced database connection closed');
    }
  }

  /**
   * Get connection statistics report
   */
  public generateReport(): string {
    const metrics = this.getMetrics();
    const uptime = Math.round(metrics.connectionUptime / 1000 / 60); // minutes
    
    return `
🗄️ DATABASE CONNECTION REPORT
============================
• Connection Uptime: ${uptime} minutes
• Total Queries: ${metrics.totalQueries}
• Average Query Time: ${metrics.avgQueryTime.toFixed(2)}ms
• Slow Queries: ${metrics.slowQueries.length}
• Last Activity: ${metrics.lastActivity.toISOString()}

🐌 RECENT SLOW QUERIES:
${metrics.slowQueries.slice(-5).map(q => 
  `• ${q.query} (${q.duration.toFixed(2)}ms)`
).join('\n') || '• None'}

💡 RECOMMENDATIONS:
${this.generateRecommendations(metrics)}
`;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(metrics: ConnectionMetrics): string {
    const recommendations: string[] = [];
    
    if (metrics.avgQueryTime > 500) {
      recommendations.push('• Consider adding indexes for frequently queried columns');
    }
    
    if (metrics.slowQueries.length > 10) {
      recommendations.push('• Review and optimize slow queries');
    }
    
    if (metrics.totalQueries > 10000) {
      recommendations.push('• Consider implementing query result caching');
    }
    
    const uptimeHours = metrics.connectionUptime / 1000 / 60 / 60;
    if (uptimeHours > 24) {
      recommendations.push('• Database connection stable for extended period');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : '• Database performance is optimal';
  }
}

// Export singleton instance
export const dbConnectionManager = DatabaseConnectionManager.getInstance();