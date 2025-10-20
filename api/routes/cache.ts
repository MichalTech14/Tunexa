/**
 * Cache Management API Routes
 * Provides endpoints for cache monitoring, management, and optimization
 */

import { Router, Request, Response } from 'express';
import { cacheService } from '../../cache/index.js';

export function createCacheRoutes(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/cache/status:
   *   get:
   *     summary: Get cache system status and metrics
   *     tags: [Cache Management]
   *     responses:
   *       200:
   *         description: Cache system status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     health:
   *                       type: object
   *                     statistics:
   *                       type: object
   *                     uptime:
   *                       type: number
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const health = await cacheService.healthCheck();
      const statistics = cacheService.getCacheStatistics();
      
      res.json({
        success: true,
        data: {
          health,
          statistics,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get cache status',
        code: 'CACHE_STATUS_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/metrics:
   *   get:
   *     summary: Get detailed cache performance metrics
   *     tags: [Cache Management]
   *     responses:
   *       200:
   *         description: Cache performance metrics
   */
  router.get('/metrics', async (req: Request, res: Response) => {
    try {
      const statistics = cacheService.getCacheStatistics();
      
      res.json({
        success: true,
        data: {
          cache: statistics.cache,
          queries: statistics.queries,
          recommendations: statistics.recommendations,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get cache metrics',
        code: 'CACHE_METRICS_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/clear:
   *   post:
   *     summary: Clear cache by service or pattern
   *     tags: [Cache Management]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               service:
   *                 type: string
   *                 enum: [cars, acoustics, audio, users]
   *                 description: Service area to clear
   *               pattern:
   *                 type: string
   *                 description: Key pattern to match
   *               tier:
   *                 type: string
   *                 enum: [memory, redis, persistent, all]
   *     responses:
   *       200:
   *         description: Cache cleared successfully
   */
  router.post('/clear', async (req: Request, res: Response) => {
    try {
      const { service, pattern, tier = 'all' } = req.body;
      let cleared = 0;

      if (service) {
        cleared = await cacheService.invalidateService(service);
      } else {
        // Use the raw cache manager for pattern-based clearing
        // This would need to be exposed from the cache service
        cleared = 0; // Placeholder
      }

      res.json({
        success: true,
        data: {
          cleared,
          service,
          pattern,
          tier,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache clear error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        code: 'CACHE_CLEAR_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/invalidate:
   *   post:
   *     summary: Invalidate cache by table dependencies
   *     tags: [Cache Management]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               table:
   *                 type: string
   *                 description: Database table name
   *               tables:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Multiple table names
   *     responses:
   *       200:
   *         description: Cache invalidated successfully
   */
  router.post('/invalidate', async (req: Request, res: Response) => {
    try {
      const { table, tables } = req.body;
      let invalidated = 0;

      if (table) {
        invalidated = await cacheService.invalidateByTable(table);
      } else if (tables && Array.isArray(tables)) {
        for (const tableName of tables) {
          invalidated += await cacheService.invalidateByTable(tableName);
        }
      }

      res.json({
        success: true,
        data: {
          invalidated,
          table,
          tables,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache invalidation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to invalidate cache',
        code: 'CACHE_INVALIDATE_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/optimize:
   *   get:
   *     summary: Get cache optimization recommendations
   *     tags: [Cache Management]
   *     responses:
   *       200:
   *         description: Optimization recommendations
   */
  router.get('/optimize', async (req: Request, res: Response) => {
    try {
      const statistics = cacheService.getCacheStatistics();
      const recommendations = statistics.recommendations;

      res.json({
        success: true,
        data: {
          recommendations,
          slowQueries: recommendations.slowQueries,
          lowCacheHitRate: recommendations.lowCacheHitRate,
          highErrorRate: recommendations.highErrorRate,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache optimization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get optimization recommendations',
        code: 'CACHE_OPTIMIZE_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/health:
   *   get:
   *     summary: Get cache system health check
   *     tags: [Cache Management]
   *     responses:
   *       200:
   *         description: Cache health status
   *       503:
   *         description: Cache system unhealthy
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const health = await cacheService.healthCheck();
      
      if (health.status === 'healthy') {
        res.json({
          success: true,
          data: health
        });
      } else {
        res.status(503).json({
          success: false,
          data: health,
          error: 'Cache system is not healthy'
        });
      }

    } catch (error) {
      console.error('Cache health check error:', error);
      res.status(503).json({
        success: false,
        error: 'Failed to check cache health',
        code: 'CACHE_HEALTH_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/query:
   *   post:
   *     summary: Execute optimized database query with caching
   *     tags: [Cache Management]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 description: SQL query to execute
   *               params:
   *                 type: array
   *                 description: Query parameters
   *               priority:
   *                 type: string
   *                 enum: [low, normal, high]
   *               forceRefresh:
   *                 type: boolean
   *                 description: Force cache refresh
   *     responses:
   *       200:
   *         description: Query results
   */
  router.post('/query', async (req: Request, res: Response) => {
    try {
      const { query, params = [], priority = 'normal', forceRefresh = false } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query is required',
          code: 'MISSING_QUERY'
        });
      }

      const result = await cacheService.executeQuery(query, params, {
        priority,
        forceRefresh,
        userId: req.headers['x-user-id'] as string
      });

      res.json({
        success: true,
        data: {
          result,
          query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
          cached: !forceRefresh,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache query execution error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute query',
        code: 'CACHE_QUERY_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/warmup:
   *   post:
   *     summary: Warm up cache with common data
   *     tags: [Cache Management]
   *     responses:
   *       200:
   *         description: Cache warm-up completed
   */
  router.post('/warmup', async (req: Request, res: Response) => {
    try {
      // Trigger cache warm-up
      // This would need to be implemented in the cache service
      
      res.json({
        success: true,
        data: {
          message: 'Cache warm-up initiated',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache warm-up error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to warm up cache',
        code: 'CACHE_WARMUP_ERROR'
      });
    }
  });

  /**
   * @swagger
   * /api/cache/services:
   *   get:
   *     summary: Get service-specific cache information
   *     tags: [Cache Management]
   *     responses:
   *       200:
   *         description: Service cache information
   */
  router.get('/services', async (req: Request, res: Response) => {
    try {
      const statistics = cacheService.getCacheStatistics();
      
      res.json({
        success: true,
        data: {
          services: statistics.services,
          enabled: Object.entries(statistics.services)
            .filter(([_, config]: [string, any]) => config.enabled)
            .map(([name]) => name),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Cache services error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service cache information',
        code: 'CACHE_SERVICES_ERROR'
      });
    }
  });

  return router;
}