/**
 * Optimized Repository Base Class
 * Extends standard TypeORM repositories with advanced optimization features
 */

import { Repository, SelectQueryBuilder, ObjectLiteral, FindManyOptions, FindOneOptions } from 'typeorm';
import { queryOptimizer, QueryOptimizationOptions, OptimizedQueryResult } from './query-optimizer.js';

export abstract class OptimizedRepository<Entity extends ObjectLiteral> {
  protected repository: Repository<Entity>;
  protected entityName: string;

  constructor(repository: Repository<Entity>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  /**
   * Find entities with intelligent optimization
   */
  public async findOptimized(
    options: FindManyOptions<Entity> = {},
    optimizationOptions: QueryOptimizationOptions = {}
  ): Promise<OptimizedQueryResult<Entity>> {
    return queryOptimizer.executeOptimized(
      this.repository,
      (qb: SelectQueryBuilder<Entity>) => {
        // Apply find options to query builder
        if (options.where) {
          qb = qb.where(options.where);
        }
        
        if (options.order) {
          Object.entries(options.order).forEach(([field, direction]) => {
            qb = qb.addOrderBy(`entity.${field}`, direction as 'ASC' | 'DESC');
          });
        }
        
        if (options.take) {
          qb = qb.take(options.take);
        }
        
        if (options.skip) {
          qb = qb.skip(options.skip);
        }

        return qb;
      },
      {
        useCache: true,
        cacheDuration: 300000, // 5 minutes
        ...optimizationOptions
      }
    );
  }

  /**
   * Find one entity with optimization
   */
  public async findOneOptimized(
    options: FindOneOptions<Entity>,
    optimizationOptions: QueryOptimizationOptions = {}
  ): Promise<Entity | null> {
    const result = await this.findOptimized(
      { ...options, take: 1 },
      optimizationOptions
    );
    
    return result.data[0] || null;
  }

  /**
   * Complex query with custom query builder
   */
  public async executeComplexQuery(
    queryBuilderFn: (qb: SelectQueryBuilder<Entity>) => SelectQueryBuilder<Entity>,
    optimizationOptions: QueryOptimizationOptions = {}
  ): Promise<OptimizedQueryResult<Entity>> {
    return queryOptimizer.executeOptimized(
      this.repository,
      queryBuilderFn,
      {
        useCache: true,
        maxResults: 1000,
        ...optimizationOptions
      }
    );
  }

  /**
   * Aggregation queries with optimization
   */
  public async executeAggregation(
    aggregationFn: (qb: SelectQueryBuilder<Entity>) => SelectQueryBuilder<Entity>,
    optimizationOptions: QueryOptimizationOptions = {}
  ): Promise<OptimizedQueryResult<any>> {
    return queryOptimizer.executeAggregation(
      this.repository,
      aggregationFn,
      {
        useCache: true,
        cacheDuration: 600000, // 10 minutes for aggregations
        ...optimizationOptions
      }
    );
  }

  /**
   * Batch operations
   */
  public async batchInsert(entities: Partial<Entity>[], batchSize: number = 100): Promise<{
    affected: number;
    executionTime: number;
    batches: number;
  }> {
    return queryOptimizer.executeBatch(
      this.repository,
      'insert',
      entities,
      batchSize
    );
  }

  /**
   * Batch update
   */
  public async batchUpdate(conditions: any, updates: Partial<Entity>): Promise<{
    affected: number;
    executionTime: number;
    batches: number;
  }> {
    return queryOptimizer.executeBatch(
      this.repository,
      'update',
      { conditions, updates }
    );
  }

  /**
   * Batch delete
   */
  public async batchDelete(conditions: any): Promise<{
    affected: number;
    executionTime: number;
    batches: number;
  }> {
    return queryOptimizer.executeBatch(
      this.repository,
      'delete',
      { conditions }
    );
  }

  /**
   * Get standard repository for direct access
   */
  public getRepository(): Repository<Entity> {
    return this.repository;
  }

  /**
   * Performance analytics for this repository
   */
  public getPerformanceAnalytics(): {
    entityName: string;
    totalQueries: number;
    avgExecutionTime: number;
    cacheHitRate: number;
    suggestions: string[];
  } {
    // This would typically track metrics per repository
    return {
      entityName: this.entityName,
      totalQueries: 0,
      avgExecutionTime: 0,
      cacheHitRate: 0,
      suggestions: [
        'Consider adding indexes for frequently queried fields',
        'Use batch operations for bulk data manipulation'
      ]
    };
  }
}

/**
 * Optimized User Repository
 */
import { User } from './entities/User.js';

export class OptimizedUserRepository extends OptimizedRepository<User> {
  /**
   * Find active users with optimization
   */
  public async findActiveUsers(limit: number = 100): Promise<OptimizedQueryResult<User>> {
    return this.executeComplexQuery(
      (qb) => qb
        .where('entity.status = :status', { status: 'active' })
        .orderBy('entity.createdAt', 'DESC')
        .take(limit),
      {
        useCache: true,
        cacheDuration: 600000, // 10 minutes
        eagerLoad: ['profile']
      }
    );
  }

  /**
   * User statistics with caching
   */
  public async getUserStatistics(): Promise<OptimizedQueryResult<any>> {
    return this.executeAggregation(
      (qb) => qb
        .select([
          'COUNT(*) as totalUsers',
          'COUNT(CASE WHEN entity.status = "active" THEN 1 END) as activeUsers',
          'COUNT(CASE WHEN entity.createdAt > datetime("now", "-30 days") THEN 1 END) as recentUsers'
        ]),
      {
        useCache: true,
        cacheDuration: 900000 // 15 minutes for stats
      }
    );
  }

  /**
   * Find users by email domain (optimized)
   */
  public async findByEmailDomain(domain: string): Promise<OptimizedQueryResult<User>> {
    return this.executeComplexQuery(
      (qb) => qb
        .where('entity.email LIKE :domain', { domain: `%@${domain}` })
        .orderBy('entity.createdAt', 'DESC'),
      {
        useCache: true,
        cacheDuration: 1800000 // 30 minutes
      }
    );
  }
}

/**
 * Optimized Vehicle Repository
 */
import { Vehicle } from './entities/Vehicle.js';

export class OptimizedVehicleRepository extends OptimizedRepository<Vehicle> {
  /**
   * Find vehicles by brand with optimization
   */
  public async findByBrand(brand: string, limit: number = 50): Promise<OptimizedQueryResult<Vehicle>> {
    return this.executeComplexQuery(
      (qb) => qb
        .where('entity.brand = :brand', { brand })
        .orderBy('entity.model', 'ASC')
        .take(limit),
      {
        useCache: true,
        cacheDuration: 1800000, // 30 minutes - vehicle data changes rarely
        eagerLoad: ['measurements']
      }
    );
  }

  /**
   * Vehicle statistics by brand
   */
  public async getVehicleStatsByBrand(): Promise<OptimizedQueryResult<any>> {
    return this.executeAggregation(
      (qb) => qb
        .select([
          'entity.brand',
          'COUNT(*) as count',
          'AVG(entity.year) as avgYear'
        ])
        .groupBy('entity.brand')
        .orderBy('count', 'DESC'),
      {
        useCache: true,
        cacheDuration: 3600000 // 1 hour for brand stats
      }
    );
  }
}

/**
 * Optimized Measurement Repository
 */
import { MeasurementRecord } from './entities/MeasurementRecord.js';

export class OptimizedMeasurementRepository extends OptimizedRepository<MeasurementRecord> {
  /**
   * Find recent measurements with optimization
   */
  public async findRecentMeasurements(days: number = 7): Promise<OptimizedQueryResult<MeasurementRecord>> {
    return this.executeComplexQuery(
      (qb) => qb
        .where('entity.createdAt > datetime("now", :days)', { days: `-${days} days` })
        .orderBy('entity.createdAt', 'DESC')
        .take(1000),
      {
        useCache: true,
        cacheDuration: 300000, // 5 minutes for recent data
        eagerLoad: ['vehicle', 'user']
      }
    );
  }

  /**
   * Measurement analytics with aggregation
   */
  public async getMeasurementAnalytics(vehicleId?: number): Promise<OptimizedQueryResult<any>> {
    return this.executeAggregation(
      (qb) => {
        let query = qb.select([
          'COUNT(*) as totalMeasurements',
          'AVG(CAST(entity.data as REAL)) as avgValue',
          'MAX(CAST(entity.data as REAL)) as maxValue',
          'MIN(CAST(entity.data as REAL)) as minValue'
        ]);

        if (vehicleId) {
          query = query.where('entity.vehicleId = :vehicleId', { vehicleId });
        }

        return query;
      },
      {
        useCache: true,
        cacheDuration: 600000 // 10 minutes for analytics
      }
    );
  }
}