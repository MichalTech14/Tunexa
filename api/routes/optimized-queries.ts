/**
 * Optimized Query Test Routes
 * API endpoints for testing advanced query optimization features
 */

import { Router, type Request, type Response } from 'express';
import { asyncHandler, createApiError } from '../middleware/error-handler.js';

export function createOptimizedQueryRoutes(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/optimized/users/active:
   *   get:
   *     summary: Get active users with query optimization
   *     tags: [Optimized Queries]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of users to return
   *     responses:
   *       200:
   *         description: Active users with performance metrics
   */
  router.get('/users/active', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { limit = 50 } = req.query;

    const result = await databaseService.optimizedUserRepo.findActiveUsers(Number(limit));

    res.json({
      success: true,
      data: {
        users: result.data,
        performance: {
          executionTime: result.executionTime,
          fromCache: result.fromCache,
          totalRows: result.totalRows
        },
        queryPlan: {
          recommendations: result.queryPlan.recommendations,
          estimatedRows: result.queryPlan.estimatedRows
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/users/statistics:
   *   get:
   *     summary: Get user statistics with caching
   *     tags: [Optimized Queries]
   *     responses:
   *       200:
   *         description: User statistics with performance metrics
   */
  router.get('/users/statistics', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');

    const result = await databaseService.optimizedUserRepo.getUserStatistics();

    res.json({
      success: true,
      data: {
        statistics: result.data[0],
        performance: {
          executionTime: result.executionTime,
          fromCache: result.fromCache,
          cacheKey: 'user_statistics'
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/vehicles/by-brand/{brand}:
   *   get:
   *     summary: Get vehicles by brand with optimization
   *     tags: [Optimized Queries]
   *     parameters:
   *       - in: path
   *         name: brand
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Vehicles by brand with performance metrics
   */
  router.get('/vehicles/by-brand/:brand', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { brand } = req.params;
    const { limit = 50 } = req.query;

    const result = await databaseService.optimizedVehicleRepo.findByBrand(brand, Number(limit));

    res.json({
      success: true,
      data: {
        vehicles: result.data,
        brand: brand,
        count: result.data.length,
        performance: {
          executionTime: result.executionTime,
          fromCache: result.fromCache,
          queryOptimizations: result.queryPlan.recommendations
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/vehicles/statistics:
   *   get:
   *     summary: Get vehicle statistics by brand
   *     tags: [Optimized Queries]
   *     responses:
   *       200:
   *         description: Vehicle brand statistics
   */
  router.get('/vehicles/statistics', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');

    const result = await databaseService.optimizedVehicleRepo.getVehicleStatsByBrand();

    res.json({
      success: true,
      data: {
        brandStatistics: result.data,
        performance: {
          executionTime: result.executionTime,
          fromCache: result.fromCache,
          aggregationType: 'GROUP BY brand'
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/measurements/recent:
   *   get:
   *     summary: Get recent measurements with optimization
   *     tags: [Optimized Queries]
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *         description: Number of days to look back
   *     responses:
   *       200:
   *         description: Recent measurements with performance metrics
   */
  router.get('/measurements/recent', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { days = 7 } = req.query;

    const result = await databaseService.optimizedMeasurementRepo.findRecentMeasurements(Number(days));

    res.json({
      success: true,
      data: {
        measurements: result.data,
        timeRange: `${days} days`,
        count: result.data.length,
        performance: {
          executionTime: result.executionTime,
          fromCache: result.fromCache,
          eagerLoading: ['vehicle', 'user']
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/measurements/analytics:
   *   get:
   *     summary: Get measurement analytics
   *     tags: [Optimized Queries]
   *     parameters:
   *       - in: query
   *         name: vehicleId
   *         schema:
   *           type: integer
   *         description: Filter by specific vehicle ID
   *     responses:
   *       200:
   *         description: Measurement analytics with aggregations
   */
  router.get('/measurements/analytics', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { vehicleId } = req.query;

    const result = await databaseService.optimizedMeasurementRepo.getMeasurementAnalytics(
      vehicleId ? Number(vehicleId) : undefined
    );

    res.json({
      success: true,
      data: {
        analytics: result.data[0],
        filter: vehicleId ? { vehicleId: Number(vehicleId) } : 'all',
        performance: {
          executionTime: result.executionTime,
          fromCache: result.fromCache,
          aggregationFunctions: ['COUNT', 'AVG', 'MAX', 'MIN']
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/batch/users:
   *   post:
   *     summary: Batch insert users (demo)
   *     tags: [Optimized Queries]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               users:
   *                 type: array
   *                 items:
   *                   type: object
   *               batchSize:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Batch operation result
   */
  router.post('/batch/users', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { users, batchSize = 100 } = req.body;

    if (!users || !Array.isArray(users)) {
      throw createApiError('Users array is required', 400, 'VALIDATION_ERROR');
    }

    // Generate demo users if none provided
    const userData = users.length > 0 ? users : Array.from({ length: 10 }, (_, i) => ({
      email: `demo${i}@tunexa.com`,
      name: `Demo User ${i}`,
      status: 'active'
    }));

    const result = await databaseService.optimizedUserRepo.batchInsert(userData, Number(batchSize));

    res.json({
      success: true,
      data: {
        operation: 'batch_insert',
        affected: result.affected,
        executionTime: result.executionTime,
        batches: result.batches,
        avgTimePerBatch: result.executionTime / result.batches
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/performance/suggestions:
   *   get:
   *     summary: Get query optimization suggestions
   *     tags: [Optimized Queries]
   *     responses:
   *       200:
   *         description: Performance optimization suggestions
   */
  router.get('/performance/suggestions', asyncHandler(async (req: Request, res: Response) => {
    const { queryOptimizer } = await import('../../database/query-optimizer.js');

    const suggestions = queryOptimizer.generateOptimizationSuggestions();
    const cacheStats = queryOptimizer.getCacheStats();

    res.json({
      success: true,
      data: {
        suggestions,
        cacheStatistics: cacheStats,
        recommendations: [
          'Enable query result caching for frequently accessed data',
          'Use batch operations for bulk data manipulation',
          'Add indexes for columns used in WHERE clauses',
          'Consider eager loading for related entities'
        ]
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/optimized/cache/clear:
   *   post:
   *     summary: Clear query optimizer cache
   *     tags: [Optimized Queries]
   *     responses:
   *       200:
   *         description: Cache cleared successfully
   */
  router.post('/cache/clear', asyncHandler(async (req: Request, res: Response) => {
    const { queryOptimizer } = await import('../../database/query-optimizer.js');

    queryOptimizer.clearCache();

    res.json({
      success: true,
      message: 'Query optimizer cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  }));

  return router;
}