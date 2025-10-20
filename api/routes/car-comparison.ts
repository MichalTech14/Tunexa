/**
 * Car Comparison API Routes - Fixed Version
 * REST endpoints for vehicle comparison functionality
 */

import { Router, type Request, type Response } from 'express';
import Joi from 'joi';
import type { SimpleTunexaEngine } from '../simple-tunexa-engine.js';
import { asyncHandler, createApiError } from '../middleware/error-handler.js';
import { apiCache, CacheTTL } from '../../caching/api-cache.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     CarModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "3 Series"
 *         types:
 *           type: array
 *           items:
 *             type: string
 *           example: ["sedan", "touring"]
 *         audio:
 *           type: object
 *           properties:
 *             speakers:
 *               type: number
 *               example: 12
 *             system:
 *               type: string
 *               example: "Harman Kardon"
 *             locations:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["front", "rear", "subwoofer"]
 *     
 *     CarBrand:
 *       type: object
 *       properties:
 *         brand:
 *           type: string
 *           example: "BMW"
 *         models:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CarModel'
 */

const comparisonRequestSchema = Joi.object({
  carA: Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required()
  }).required(),
  carB: Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required()
  }).required()
});

export function createCarComparisonRoutes(tunexaEngine: SimpleTunexaEngine): Router {
  const router = Router();

  /**
   * @swagger
   * /api/cars:
   *   get:
   *     summary: Get all available car brands and models
   *     tags: [Car Comparison]
   *     responses:
   *       200:
   *         description: List of all car brands with their models
   */
  router.get('/', 
    apiCache.middleware({ ttl: CacheTTL.LONG }),
    asyncHandler(async (req: Request, res: Response) => {
      const cars = tunexaEngine.carsDatabase;
      
      res.json({
        success: true,
        data: cars,
        count: cars.length,
        timestamp: new Date().toISOString()
      });
    })
  );

  /**
   * @swagger
   * /api/cars/compare:
   *   get:
   *     summary: Test compare endpoint (should return 400)
   *     tags: [Car Comparison]
   *     responses:
   *       400:
   *         description: Missing parameters
   */
  router.get('/compare', asyncHandler(async (req: Request, res: Response) => {
    throw createApiError('Compare requires POST with carA and carB parameters', 400, 'METHOD_NOT_ALLOWED');
  }));

  /**
   * @swagger
   * /api/cars/compare:
   *   post:
   *     summary: Compare two car models
   *     tags: [Car Comparison]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - carA
   *               - carB
   *             properties:
   *               carA:
   *                 type: object
   *                 properties:
   *                   brand:
   *                     type: string
   *                   model:
   *                     type: string
   *               carB:
   *                 type: object
   *                 properties:
   *                   brand:
   *                     type: string
   *                   model:
   *                     type: string
   *     responses:
   *       200:
   *         description: Comparison result
   */
  router.post('/compare', asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = comparisonRequestSchema.validate(req.body);
    if (error) {
      throw createApiError(`Validation error: ${error.details[0].message}`, 400, 'VALIDATION_ERROR');
    }

    const { carA, carB } = value;

    // Find cars in database  
    const findCar = (brand: string, model: string) => {
      const normalizedBrand = brand.toLowerCase().replace(/[_-]/g, ' ');
      const normalizedModel = model.toLowerCase().replace(/[_-]/g, ' ');
      
      const carBrand = tunexaEngine.carsDatabase.find(
        car => car.brand.toLowerCase() === normalizedBrand
      );

      if (!carBrand) {
        throw createApiError(`Brand '${brand}' not found`, 404, 'BRAND_NOT_FOUND');
      }

      const carModel = carBrand.models.find(
        (m: any) => m.name.toLowerCase() === normalizedModel
      );

      if (!carModel) {
        throw createApiError(`Model '${model}' not found for brand '${brand}'`, 404, 'MODEL_NOT_FOUND');
      }

      return { brand: carBrand.brand, ...carModel };
    };

    const foundCarA = findCar(carA.brand, carA.model);
    const foundCarB = findCar(carB.brand, carB.model);

    // Simple comparison logic
    const comparison = {
      winner: foundCarA.audio?.speakers >= foundCarB.audio?.speakers ? 'carA' : 'carB',
      scores: {
        carA: foundCarA.audio?.speakers || 0,
        carB: foundCarB.audio?.speakers || 0
      },
      differences: ['audio_system', 'speaker_count']
    };

    res.json({
      success: true,
      data: {
        carA: foundCarA,
        carB: foundCarB,
        comparison
      },
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/cars/search:
   *   get:
   *     summary: Search cars by query
   *     tags: [Car Comparison]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query
   *     responses:
   *       200:
   *         description: Search results
   */
  router.get('/search', 
    apiCache.middleware({ ttl: CacheTTL.MEDIUM }),
    asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw createApiError('Query parameter "q" is required', 400, 'MISSING_QUERY');
    }

    const query = q.toLowerCase();
    const maxLimit = Math.min(Number(limit), 50);
    const results: any[] = [];

    for (const carBrand of tunexaEngine.carsDatabase) {
      if (results.length >= maxLimit) break;
      
      for (const model of carBrand.models) {
        if (results.length >= maxLimit) break;
        
        const brandMatch = carBrand.brand.toLowerCase().includes(query);
        const modelMatch = model.name.toLowerCase().includes(query);
        
        if (brandMatch || modelMatch) {
          results.push({
            brand: carBrand.brand,
            model: model.name,
            audio: model.audio,
            types: model.types
          });
        }
      }
    }

    res.json({
      success: true,
      data: results,
      query: q,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/cars/{brand}:
   *   get:
   *     summary: Get models for a specific brand
   *     tags: [Car Comparison]
   *     parameters:
   *       - in: path
   *         name: brand
   *         required: true
   *         schema:
   *           type: string
   *         description: Car brand name
   *     responses:
   *       200:
   *         description: Models for the specified brand
   *       404:
   *         description: Brand not found
   */
  router.get('/:brand', 
    apiCache.middleware({ ttl: CacheTTL.LONG }),
    asyncHandler(async (req: Request, res: Response) => {
    const { brand } = req.params;
    
    // Skip if this is actually a special endpoint
    if (brand === 'compare' || brand === 'search') {
      throw createApiError(`Route '${brand}' should be handled by specific endpoint`, 404, 'INVALID_ROUTE');
    }
    
    const normalizedBrand = brand.toLowerCase().replace(/[_-]/g, ' ');
    
    const carBrand = tunexaEngine.carsDatabase.find(
      car => car.brand.toLowerCase() === normalizedBrand
    );

    if (!carBrand) {
      throw createApiError(`Brand '${brand}' not found`, 404, 'BRAND_NOT_FOUND');
    }

    res.json({
      success: true,
      data: carBrand,
      timestamp: new Date().toISOString()
    });
  }));

  /**
   * @swagger
   * /api/cars/{brand}/{model}:
   *   get:
   *     summary: Get specific car model details
   *     tags: [Car Comparison]
   *     parameters:
   *       - in: path
   *         name: brand
   *         required: true
   *         schema:
   *           type: string
   *         description: Car brand name
   *       - in: path
   *         name: model
   *         required: true
   *         schema:
   *           type: string
   *         description: Car model name
   *     responses:
   *       200:
   *         description: Car model details
   *       404:
   *         description: Brand or model not found
   */
  router.get('/:brand/:model', 
    apiCache.middleware({ ttl: CacheTTL.LONG }),
    asyncHandler(async (req: Request, res: Response) => {
    const { brand, model } = req.params;
    const normalizedBrand = brand.toLowerCase().replace(/[_-]/g, ' ');
    const normalizedModel = model.toLowerCase().replace(/[_-]/g, ' ');
    
    const carBrand = tunexaEngine.carsDatabase.find(
      car => car.brand.toLowerCase() === normalizedBrand
    );

    if (!carBrand) {
      throw createApiError(`Brand '${brand}' not found`, 404, 'BRAND_NOT_FOUND');
    }

    const carModel = carBrand.models.find(
      (m: any) => m.name.toLowerCase() === normalizedModel
    );

    if (!carModel) {
      throw createApiError(`Model '${model}' not found for brand '${brand}'`, 404, 'MODEL_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        brand: carBrand.brand,
        ...carModel
      },
      timestamp: new Date().toISOString()
    });
  }));

  return router;
}