/**
 * Authentication Routes
 * Handles user authentication, registration, and session management
 */

import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { TunexaEngine } from '../../index.js';
import { createApiError, createApiResponse } from '../middleware/error-handler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tunexa-dev-secret-key';
const JWT_EXPIRES_IN = '24h';

// Demo users for testing
const DEMO_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@tunexa.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2', 
    name: 'Demo User',
    email: 'demo@tunexa.com',
    password: 'demo123',
    role: 'user'
  }
];

export function createAuthRoutes(tunexaEngine: TunexaEngine) {
  const router = express.Router();

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: "password123"
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Invalid input data
   *       409:
   *         description: User already exists
   */
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      
      // Basic validation
      if (!name || !email || !password) {
        throw createApiError('Name, email and password are required', 400, 'VALIDATION_ERROR');
      }

      if (password.length < 6) {
        throw createApiError('Password must be at least 6 characters', 400, 'VALIDATION_ERROR');
      }
      
      // Check if user already exists (in demo users)
      const existingUser = DEMO_USERS.find(u => u.email === email);
      if (existingUser) {
        throw createApiError('User with this email already exists', 409, 'USER_EXISTS');
      }

      // Generate JWT token for new user
      const newUserId = (DEMO_USERS.length + 1).toString();
      const token = jwt.sign(
        { userId: newUserId, email: email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const response = createApiResponse({
        user: {
          id: newUserId,
          name: name,
          email: email,
          username: email.split('@')[0]
        },
        token
      }, 'User registered successfully');

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "admin@tunexa.com"
   *               password:
   *                 type: string
   *                 example: "admin123"
   *     responses:
   *       200:
   *         description: Login successful
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Invalid credentials
   */
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        throw createApiError('Email and password are required', 400, 'VALIDATION_ERROR');
      }

      // Find user in demo users
      const user = DEMO_USERS.find(u => u.email === email);
      if (!user || user.password !== password) {
        throw createApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const response = createApiResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.email.split('@')[0],
          role: user.role
        },
        token
      }, 'Login successful');

      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Logout user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *       401:
   *         description: Unauthorized
   */
  router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real app, we would invalidate the token in the database
      // For demo purposes, we just return success
      const response = createApiResponse(null, 'Logout successful');
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/auth/profile:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Get current user profile
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved
   *       401:
   *         description: Unauthorized
   */
  router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw createApiError('Authentication token required', 401, 'UNAUTHORIZED');
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Find user in demo users
      const user = DEMO_USERS.find(u => u.id === decoded.userId);
      if (!user) {
        throw createApiError('User not found', 401, 'UNAUTHORIZED');
      }

      const response = createApiResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0],
        role: user.role,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }, 'Profile retrieved successfully');

      res.json(response);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(createApiError('Invalid authentication token', 401, 'UNAUTHORIZED'));
      } else {
        next(error);
      }
    }
  });

  return router;
}