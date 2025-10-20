/**
 * Database Migration API Routes
 * REST endpoints for managing database migrations and schema changes
 */

import { Router, type Request, type Response } from 'express';
import { asyncHandler, createApiError } from '../middleware/error-handler.js';

export function createMigrationRoutes(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/migrations/status:
   *   get:
   *     summary: Get migration system status
   *     tags: [Migrations]
   *     responses:
   *       200:
   *         description: Migration status report
   */
  router.get('/status', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    
    const statusReport = await databaseService.migrationManager.getStatusReport();
    
    res.json({
      success: true,
      data: {
        status: statusReport,
        summary: {
          upToDate: statusReport.pendingMigrations === 0,
          requiresAction: statusReport.pendingMigrations > 0,
          lastExecuted: statusReport.lastExecuted?.name || 'None',
          nextPending: statusReport.pendingList[0]?.name || 'None'
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/pending:
   *   get:
   *     summary: Get list of pending migrations
   *     tags: [Migrations]
   *     responses:
   *       200:
   *         description: List of pending migrations
   */
  router.get('/pending', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    
    const pendingMigrations = await databaseService.migrationManager.getPendingMigrations();
    
    res.json({
      success: true,
      data: {
        pendingMigrations: pendingMigrations.map(m => ({
          id: m.id,
          name: m.name,
          version: m.version,
          description: m.description,
          dependencies: m.dependencies || []
        })),
        count: pendingMigrations.length
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/executed:
   *   get:
   *     summary: Get list of executed migrations
   *     tags: [Migrations]
   *     responses:
   *       200:
   *         description: List of executed migrations
   */
  router.get('/executed', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    
    const executedMigrations = await databaseService.migrationManager.getExecutedMigrations();
    
    res.json({
      success: true,
      data: {
        executedMigrations: executedMigrations.map(m => ({
          id: m.id,
          name: m.name,
          version: m.version,
          executedAt: m.executedAt,
          executionTime: m.executionTime,
          rollbackAvailable: m.rollbackAvailable
        })),
        count: executedMigrations.length
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/run:
   *   post:
   *     summary: Execute pending migrations
   *     tags: [Migrations]
   *     responses:
   *       200:
   *         description: Migration execution results
   */
  router.post('/run', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    
    const results = await databaseService.migrationManager.runMigrations();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      success: failed === 0,
      data: {
        results: results.map(r => ({
          migrationName: r.migration.name,
          success: r.success,
          executionTime: r.executionTime,
          error: r.error
        })),
        summary: {
          total: results.length,
          successful,
          failed,
          totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0)
        }
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/rollback:
   *   post:
   *     summary: Rollback the last migration
   *     tags: [Migrations]
   *     responses:
   *       200:
   *         description: Rollback result
   */
  router.post('/rollback', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    
    try {
      const result = await databaseService.migrationManager.rollbackLastMigration();
      
      res.json({
        success: result.success,
        data: {
          migrationName: result.migration.name,
          executionTime: result.executionTime,
          rollbackPerformed: result.rollbackPerformed,
          error: result.error
        },
        message: result.success ? 
          `Successfully rolled back migration: ${result.migration.name}` :
          `Failed to rollback migration: ${result.error}`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      throw createApiError(
        error instanceof Error ? error.message : 'Rollback failed',
        400,
        'ROLLBACK_ERROR'
      );
    }
  }));

  /**
   * @swagger
   * /api/migrations/validate:
   *   get:
   *     summary: Validate migration integrity
   *     tags: [Migrations]
   *     responses:
   *       200:
   *         description: Migration validation result
   */
  router.get('/validate', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    
    const validation = await databaseService.migrationManager.validateMigrations();
    
    res.json({
      success: validation.valid,
      data: {
        valid: validation.valid,
        issues: validation.issues,
        issueCount: validation.issues.length
      },
      message: validation.valid ? 
        'All migrations are valid' : 
        `Found ${validation.issues.length} migration issues`,
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/create:
   *   post:
   *     summary: Create a new migration template
   *     tags: [Migrations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Add User Settings"
   *               description:
   *                 type: string
   *                 example: "Add settings column to users table"
   *     responses:
   *       200:
   *         description: Migration template created
   */
  router.post('/create', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { name, description } = req.body;
    
    if (!name || !description) {
      throw createApiError('Name and description are required', 400, 'VALIDATION_ERROR');
    }
    
    const filePath = await databaseService.migrationManager.createMigration(name, description);
    
    res.json({
      success: true,
      data: {
        name,
        description,
        filePath,
        fileName: filePath.split('/').pop()
      },
      message: `Migration template created: ${name}`,
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/reset:
   *   post:
   *     summary: Reset migration system (DANGEROUS - clears all records)
   *     tags: [Migrations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - confirm
   *             properties:
   *               confirm:
   *                 type: string
   *                 example: "RESET_MIGRATIONS"
   *     responses:
   *       200:
   *         description: Migration system reset
   */
  router.post('/reset', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { confirm } = req.body;
    
    if (confirm !== 'RESET_MIGRATIONS') {
      throw createApiError('Invalid confirmation token', 400, 'INVALID_CONFIRMATION');
    }
    
    await databaseService.migrationManager.resetMigrations();
    
    res.json({
      success: true,
      message: 'Migration system has been reset - all migration records cleared',
      warning: 'This action cannot be undone',
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/migrations/report:
   *   get:
   *     summary: Get comprehensive migration report
   *     tags: [Migrations]
   *     parameters:
   *       - in: query
   *         name: format
   *         schema:
   *           type: string
   *           enum: [json, text]
   *         description: Report format
   *     responses:
   *       200:
   *         description: Migration report
   */
  router.get('/report', asyncHandler(async (req: Request, res: Response) => {
    const { databaseService } = await import('../../database/DatabaseService.js');
    const { format = 'json' } = req.query;
    
    const statusReport = await databaseService.migrationManager.getStatusReport();
    const validation = await databaseService.migrationManager.validateMigrations();
    
    if (format === 'text') {
      const textReport = `
🗄️ TUNEXA DATABASE MIGRATION REPORT
===================================
Generated: ${new Date().toISOString()}

📊 MIGRATION STATISTICS:
• Total Migrations: ${statusReport.totalMigrations}
• Executed: ${statusReport.executedMigrations}
• Pending: ${statusReport.pendingMigrations}
• Last Executed: ${statusReport.lastExecuted?.name || 'None'}

📋 PENDING MIGRATIONS:
${statusReport.pendingList.length > 0 ? 
  statusReport.pendingList.map(m => `• ${m.name} (${m.version})`).join('\n') : 
  '• No pending migrations'}

🔍 VALIDATION STATUS:
• Status: ${validation.valid ? '✅ Valid' : '❌ Issues Found'}
${validation.issues.length > 0 ? 
  '• Issues:\n' + validation.issues.map(issue => `  - ${issue}`).join('\n') : 
  '• No issues detected'}

💡 RECOMMENDATIONS:
${statusReport.pendingMigrations > 0 ? 
  '• Run pending migrations to update database schema' : 
  '• Database schema is up to date'}
${!validation.valid ? 
  '• Resolve validation issues before proceeding' : 
  '• Migration integrity verified'}
`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(textReport);
    } else {
      res.json({
        success: true,
        data: {
          status: statusReport,
          validation,
          recommendations: [
            statusReport.pendingMigrations > 0 ? 
              'Run pending migrations to update database schema' : 
              'Database schema is up to date',
            !validation.valid ? 
              'Resolve validation issues before proceeding' : 
              'Migration integrity verified'
          ]
        },
        timestamp: new Date().toISOString()
      });
    }
  }));

  return router;
}