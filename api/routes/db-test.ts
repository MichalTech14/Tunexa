/**
 * Database Test Routes
 * Testing endpoints to generate database activity for performance monitoring
 */

import { Router, type Request, type Response } from 'express';
import { DatabaseService } from '../../database/DatabaseService.js';
import { asyncHandler, createApiError } from '../middleware/error-handler.js';

export function createDatabaseTestRoutes(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/db-test/users:
   *   get:
   *     summary: Test database with user queries
   *     tags: [Database Test]
   *     responses:
   *       200:
   *         description: User data from database
   */
  router.get('/users', asyncHandler(async (req: Request, res: Response) => {
    const db = DatabaseService.getInstance();
    
    // Generate multiple database queries for testing
    const users = await db.getUserRepository().find({
      take: 10,
      order: { createdAt: 'DESC' }
    });
    
    // Additional queries to test performance
    const activeUsers = await db.getUserRepository().find({
      where: { status: 'active' },
      take: 5
    });
    
    const userCount = await db.getUserRepository().count();
    
    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
          role: user.role,
          createdAt: user.createdAt
        })),
        activeUsers: activeUsers.length,
        totalUsers: userCount
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/db-test/vehicles:
   *   get:
   *     summary: Test database with vehicle queries
   *     tags: [Database Test]
   *     responses:
   *       200:
   *         description: Vehicle data from database
   */
  router.get('/vehicles', asyncHandler(async (req: Request, res: Response) => {
    const db = DatabaseService.getInstance();
    
    // Multiple vehicle queries
    const allVehicles = await db.getVehicleRepository().find({
      take: 20,
      order: { createdAt: 'DESC' }
    });
    
    // Test brand filtering (should use index)
    const bmwVehicles = await db.getVehicleRepository().find({
      where: { brand: 'BMW' },
      take: 5
    });
    
    // Test brand+model filtering (should use composite index)
    const bmw3Series = await db.getVehicleRepository().find({
      where: { 
        brand: 'BMW',
        model: '3 Series'
      }
    });
    
    const vehicleCount = await db.getVehicleRepository().count();
    
    res.json({
      success: true,
      data: {
        totalVehicles: vehicleCount,
        recentVehicles: allVehicles.slice(0, 5).map(v => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          audioSystemBrand: v.audioSystemBrand,
          speakerCount: v.speakerCount
        })),
        bmwCount: bmwVehicles.length,
        bmw3SeriesCount: bmw3Series.length
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/db-test/measurements:
   *   get:
   *     summary: Test database with measurement queries
   *     tags: [Database Test]
   *     responses:
   *       200:
   *         description: Measurement data from database
   */
  router.get('/measurements', asyncHandler(async (req: Request, res: Response) => {
    const db = DatabaseService.getInstance();
    
    // Complex queries to test performance
    const recentMeasurements = await db.getMeasurementRepository().find({
      relations: ['vehicle', 'user'],
      take: 10,
      order: { createdAt: 'DESC' }
    });
    
    // Test status filtering (should use index)
    const completedMeasurements = await db.getMeasurementRepository().find({
      where: { status: 'completed' },
      take: 5
    });
    
    // Test certification filtering (should use index)
    const passedCertifications = await db.getMeasurementRepository().find({
      where: { certificationStatus: 'passed' },
      take: 5
    });
    
    const measurementCount = await db.getMeasurementRepository().count();
    
    res.json({
      success: true,
      data: {
        totalMeasurements: measurementCount,
        recentMeasurements: recentMeasurements.map(m => ({
          id: m.id,
          type: m.measurementType,
          status: m.status,
          certificationStatus: m.certificationStatus,
          vehicleBrand: m.vehicle?.brand,
          vehicleModel: m.vehicle?.model,
          createdAt: m.createdAt
        })),
        completedCount: completedMeasurements.length,
        passedCertificationCount: passedCertifications.length
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/db-test/create-sample-data:
   *   post:
   *     summary: Create sample data for testing
   *     tags: [Database Test]
   *     responses:
   *       200:
   *         description: Sample data created successfully
   */
  router.post('/create-sample-data', asyncHandler(async (req: Request, res: Response) => {
    const db = DatabaseService.getInstance();
    
    try {
      // Create sample vehicles if they don't exist
      const existingVehicleCount = await db.getVehicleRepository().count();
      
      if (existingVehicleCount === 0) {
        const sampleVehicles = [
          {
            brand: 'BMW',
            model: '3 Series',
            year: '2023',
            slug: 'bmw-3-series-2023',
            audioSystemBrand: 'Harman Kardon',
            speakerCount: 16,
            amplifierPower: 600,
            hasSubwoofer: true,
            hasDSP: true,
            isActive: true
          },
          {
            brand: 'Mercedes-Benz',
            model: 'E-Class',
            year: '2023',
            slug: 'mercedes-e-class-2023',
            audioSystemBrand: 'Burmester',
            speakerCount: 23,
            amplifierPower: 1200,
            hasSubwoofer: true,
            hasDSP: true,
            isActive: true
          },
          {
            brand: 'Tesla',
            model: 'Model 3',
            year: '2023',
            slug: 'tesla-model-3-2023',
            audioSystemBrand: 'Tesla Premium',
            speakerCount: 14,
            amplifierPower: 560,
            hasSubwoofer: true,
            hasDSP: true,
            isActive: true
          }
        ];
        
        for (const vehicleData of sampleVehicles) {
          const vehicle = db.getVehicleRepository().create(vehicleData);
          await db.getVehicleRepository().save(vehicle);
        }
      }
      
      // Create sample user if doesn't exist
      const existingUserCount = await db.getUserRepository().count();
      
      if (existingUserCount === 0) {
        const testUser = db.getUserRepository().create({
          username: 'testuser',
          email: 'test@tunexa.com',
          passwordHash: 'hashed_password_here',
          firstName: 'Test',
          lastName: 'User',
          status: 'active',
          role: 'user',
          emailVerified: true
        });
        await db.getUserRepository().save(testUser);
      }
      
      res.json({
        success: true,
        message: 'Sample data created successfully',
        data: {
          vehiclesCreated: existingVehicleCount === 0 ? 3 : 0,
          usersCreated: existingUserCount === 0 ? 1 : 0
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      throw createApiError('Failed to create sample data', 500, 'SAMPLE_DATA_ERROR');
    }
  }));

  return router;
}