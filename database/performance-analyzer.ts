/**
 * Database Performance Analyzer
 * Monitors and analyzes database query performance for optimization
 */

import { DataSource, QueryRunner } from 'typeorm';
import { performance } from 'perf_hooks';

export interface QueryMetric {
  id: string;
  query: string;
  parameters?: any[];
  executionTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  rowCount?: number;
  tableName?: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
}

export interface QueryAnalysis {
  totalQueries: number;
  avgExecutionTime: number;
  slowestQueries: QueryMetric[];
  mostFrequentQueries: Array<{
    pattern: string;
    count: number;
    avgTime: number;
    totalTime: number;
  }>;
  operationBreakdown: Record<string, {
    count: number;
    avgTime: number;
    totalTime: number;
  }>;
  tableUsage: Record<string, {
    reads: number;
    writes: number;
    avgReadTime: number;
    avgWriteTime: number;
  }>;
}

class DatabasePerformanceAnalyzer {
  private metrics: QueryMetric[] = [];
  private readonly MAX_METRICS = 5000;
  private readonly SLOW_QUERY_THRESHOLD = 100; // milliseconds

  /**
   * Create a monitoring wrapper for TypeORM DataSource
   */
  public wrapDataSource(dataSource: DataSource): DataSource {
    const originalQuery = dataSource.query.bind(dataSource);
    
    dataSource.query = async (query: string, parameters?: any[]): Promise<any> => {
      const startTime = performance.now();
      const queryId = this.generateQueryId();
      
      try {
        const result = await originalQuery(query, parameters);
        const executionTime = performance.now() - startTime;
        
        const metric: QueryMetric = {
          id: queryId,
          query: this.normalizeQuery(query),
          parameters,
          executionTime,
          timestamp: new Date(),
          success: true,
          rowCount: Array.isArray(result) ? result.length : (result?.affectedRows || 0),
          tableName: this.extractTableName(query),
          operation: this.detectOperation(query),
        };
        
        this.addMetric(metric);
        
        // Log slow queries
        if (executionTime > this.SLOW_QUERY_THRESHOLD) {
          console.warn(`🐌 Slow query detected (${executionTime.toFixed(2)}ms):`, {
            query: query.substring(0, 100) + '...',
            parameters,
            executionTime,
          });
        }
        
        return result;
      } catch (error) {
        const executionTime = performance.now() - startTime;
        
        const metric: QueryMetric = {
          id: queryId,
          query: this.normalizeQuery(query),
          parameters,
          executionTime,
          timestamp: new Date(),
          success: false,
          error: error instanceof Error ? error.message : String(error),
          tableName: this.extractTableName(query),
          operation: this.detectOperation(query),
        };
        
        this.addMetric(metric);
        throw error;
      }
    };

    return dataSource;
  }

  /**
   * Add query metric to collection
   */
  private addMetric(metric: QueryMetric): void {
    this.metrics.push(metric);
    
    // Cleanup old metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Normalize query for pattern matching
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\$\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .replace(/\d+/g, '?')
      .trim();
  }

  /**
   * Extract table name from query
   */
  private extractTableName(query: string): string | undefined {
    const normalized = query.toLowerCase().trim();
    
    // SELECT queries
    let match = normalized.match(/from\s+`?(\w+)`?/);
    if (match) return match[1];
    
    // INSERT queries
    match = normalized.match(/insert\s+into\s+`?(\w+)`?/);
    if (match) return match[1];
    
    // UPDATE queries
    match = normalized.match(/update\s+`?(\w+)`?/);
    if (match) return match[1];
    
    // DELETE queries
    match = normalized.match(/delete\s+from\s+`?(\w+)`?/);
    if (match) return match[1];
    
    return undefined;
  }

  /**
   * Detect query operation type
   */
  private detectOperation(query: string): QueryMetric['operation'] {
    const normalized = query.toLowerCase().trim();
    
    if (normalized.startsWith('select')) return 'SELECT';
    if (normalized.startsWith('insert')) return 'INSERT';
    if (normalized.startsWith('update')) return 'UPDATE';
    if (normalized.startsWith('delete')) return 'DELETE';
    
    return 'OTHER';
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Analyze query performance
   */
  public analyzePerformance(timeRange?: { start: Date; end: Date }): QueryAnalysis {
    let filteredMetrics = this.metrics;
    
    if (timeRange) {
      filteredMetrics = this.metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    if (filteredMetrics.length === 0) {
      return {
        totalQueries: 0,
        avgExecutionTime: 0,
        slowestQueries: [],
        mostFrequentQueries: [],
        operationBreakdown: {},
        tableUsage: {},
      };
    }

    // Basic statistics
    const totalQueries = filteredMetrics.length;
    const successfulQueries = filteredMetrics.filter(m => m.success);
    const avgExecutionTime = successfulQueries.reduce((sum, m) => sum + m.executionTime, 0) / successfulQueries.length;

    // Slowest queries
    const slowestQueries = [...filteredMetrics]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // Query pattern analysis
    const queryPatterns = new Map<string, { queries: QueryMetric[]; count: number }>();
    
    filteredMetrics.forEach(metric => {
      const pattern = metric.query;
      if (!queryPatterns.has(pattern)) {
        queryPatterns.set(pattern, { queries: [], count: 0 });
      }
      queryPatterns.get(pattern)!.queries.push(metric);
      queryPatterns.get(pattern)!.count++;
    });

    const mostFrequentQueries = Array.from(queryPatterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        avgTime: data.queries.reduce((sum, q) => sum + q.executionTime, 0) / data.queries.length,
        totalTime: data.queries.reduce((sum, q) => sum + q.executionTime, 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Operation breakdown
    const operationBreakdown: Record<string, { count: number; avgTime: number; totalTime: number }> = {};
    
    ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'OTHER'].forEach(op => {
      const operationQueries = filteredMetrics.filter(m => m.operation === op);
      if (operationQueries.length > 0) {
        const totalTime = operationQueries.reduce((sum, q) => sum + q.executionTime, 0);
        operationBreakdown[op] = {
          count: operationQueries.length,
          avgTime: totalTime / operationQueries.length,
          totalTime,
        };
      }
    });

    // Table usage analysis
    const tableUsage: Record<string, { reads: number; writes: number; avgReadTime: number; avgWriteTime: number }> = {};
    
    filteredMetrics.forEach(metric => {
      if (!metric.tableName) return;
      
      if (!tableUsage[metric.tableName]) {
        tableUsage[metric.tableName] = { reads: 0, writes: 0, avgReadTime: 0, avgWriteTime: 0 };
      }
      
      const isRead = metric.operation === 'SELECT';
      const table = tableUsage[metric.tableName];
      
      if (isRead) {
        table.reads++;
        table.avgReadTime = (table.avgReadTime * (table.reads - 1) + metric.executionTime) / table.reads;
      } else {
        table.writes++;
        table.avgWriteTime = (table.avgWriteTime * (table.writes - 1) + metric.executionTime) / table.writes;
      }
    });

    return {
      totalQueries,
      avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
      slowestQueries,
      mostFrequentQueries,
      operationBreakdown,
      tableUsage,
    };
  }

  /**
   * Get slow queries (above threshold)
   */
  public getSlowQueries(threshold: number = this.SLOW_QUERY_THRESHOLD): QueryMetric[] {
    return this.metrics
      .filter(m => m.executionTime > threshold)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * Generate optimization recommendations
   */
  public generateRecommendations(): Array<{
    type: 'index' | 'query' | 'schema' | 'caching';
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    implementation: string;
  }> {
    const analysis = this.analyzePerformance();
    const recommendations: Array<{
      type: 'index' | 'query' | 'schema' | 'caching';
      priority: 'high' | 'medium' | 'low';
      description: string;
      impact: string;
      implementation: string;
    }> = [];

    // Slow query recommendations
    if (analysis.slowestQueries.length > 0 && analysis.slowestQueries[0].executionTime > 500) {
      recommendations.push({
        type: 'query',
        priority: 'high',
        description: `Optimize slowest query taking ${analysis.slowestQueries[0].executionTime.toFixed(2)}ms`,
        impact: 'Significant performance improvement for critical operations',
        implementation: 'Review query execution plan, add appropriate indexes, consider query rewrite',
      });
    }

    // Frequent query optimization
    const frequentSlowQueries = analysis.mostFrequentQueries.filter(q => q.avgTime > 50 && q.count > 10);
    if (frequentSlowQueries.length > 0) {
      recommendations.push({
        type: 'caching',
        priority: 'high',
        description: `Cache results for frequently executed queries (${frequentSlowQueries.length} patterns identified)`,
        impact: 'Reduce database load and improve response times',
        implementation: 'Implement Redis cache layer for query results with appropriate TTL',
      });
    }

    // Index recommendations based on table usage
    Object.entries(analysis.tableUsage).forEach(([tableName, usage]) => {
      if (usage.reads > 50 && usage.avgReadTime > 20) {
        recommendations.push({
          type: 'index',
          priority: 'medium',
          description: `Add indexes for table '${tableName}' (${usage.reads} reads, ${usage.avgReadTime.toFixed(2)}ms avg)`,
          impact: 'Faster SELECT queries on frequently accessed table',
          implementation: `Analyze WHERE clauses and add indexes on commonly filtered columns in ${tableName}`,
        });
      }
    });

    // N+1 query detection
    const selectQueries = analysis.operationBreakdown.SELECT;
    if (selectQueries && selectQueries.count > analysis.totalQueries * 0.8) {
      recommendations.push({
        type: 'query',
        priority: 'medium',
        description: 'High ratio of SELECT queries suggests possible N+1 query problems',
        impact: 'Reduce database round trips and improve performance',
        implementation: 'Use eager loading, joins, or batch queries instead of individual lookups',
      });
    }

    // Connection pooling recommendation
    if (analysis.totalQueries > 100) {
      recommendations.push({
        type: 'schema',
        priority: 'medium',
        description: 'High query volume detected - implement connection pooling',
        impact: 'Better resource utilization and reduced connection overhead',
        implementation: 'Configure TypeORM with appropriate connection pool settings',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate performance report
   */
  public generateReport(): string {
    const analysis = this.analyzePerformance();
    const slowQueries = this.getSlowQueries();
    const recommendations = this.generateRecommendations();

    return `
🗄️ DATABASE PERFORMANCE REPORT
==============================
Generated: ${new Date().toISOString()}

📊 QUERY STATISTICS:
• Total Queries: ${analysis.totalQueries}
• Average Execution Time: ${analysis.avgExecutionTime}ms
• Slow Queries (>${this.SLOW_QUERY_THRESHOLD}ms): ${slowQueries.length}

🔥 SLOWEST QUERIES:
${analysis.slowestQueries.slice(0, 5).map((query, i) => 
  `${i+1}. ${query.executionTime.toFixed(2)}ms - ${query.query.substring(0, 80)}...`
).join('\n')}

📈 OPERATION BREAKDOWN:
${Object.entries(analysis.operationBreakdown).map(([op, stats]) => 
  `• ${op}: ${stats.count} queries (${stats.avgTime.toFixed(2)}ms avg)`
).join('\n')}

🏪 TABLE USAGE:
${Object.entries(analysis.tableUsage).slice(0, 5).map(([table, usage]) => 
  `• ${table}: ${usage.reads} reads (${usage.avgReadTime.toFixed(2)}ms), ${usage.writes} writes (${usage.avgWriteTime.toFixed(2)}ms)`
).join('\n')}

🎯 OPTIMIZATION RECOMMENDATIONS:
${recommendations.slice(0, 5).map((rec, i) => 
  `${i+1}. [${rec.priority.toUpperCase()}] ${rec.description}`
).join('\n')}

💡 IMPLEMENTATION PRIORITIES:
${recommendations.filter(r => r.priority === 'high').map(r => 
  `• ${r.implementation}`
).join('\n')}
`;
  }

  /**
   * Reset metrics (useful for testing)
   */
  public reset(): void {
    this.metrics = [];
  }

  /**
   * Get raw metrics for external analysis
   */
  public getMetrics(): QueryMetric[] {
    return [...this.metrics];
  }
}

// Singleton instance
export const dbPerformanceAnalyzer = new DatabasePerformanceAnalyzer();