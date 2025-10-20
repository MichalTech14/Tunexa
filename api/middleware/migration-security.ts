/**
 * Migration API Security Middleware
 * Authentication and authorization for database migration operations
 */

import { type Request, type Response, type NextFunction } from 'express';
import { createApiError } from '../middleware/error-handler.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Migration permissions configuration
 */
export const MIGRATION_PERMISSIONS = {
  VIEW: 'migrations:view',
  EXECUTE: 'migrations:execute',
  ROLLBACK: 'migrations:rollback',
  CREATE: 'migrations:create',
  RESET: 'migrations:reset',
  ADMIN: 'migrations:admin'
} as const;

/**
 * Required permissions for each migration operation
 */
const OPERATION_PERMISSIONS: Record<string, string[]> = {
  'GET:/status': [MIGRATION_PERMISSIONS.VIEW],
  'GET:/pending': [MIGRATION_PERMISSIONS.VIEW],
  'GET:/executed': [MIGRATION_PERMISSIONS.VIEW],
  'GET:/validate': [MIGRATION_PERMISSIONS.VIEW],
  'GET:/report': [MIGRATION_PERMISSIONS.VIEW],
  'POST:/run': [MIGRATION_PERMISSIONS.EXECUTE],
  'POST:/rollback': [MIGRATION_PERMISSIONS.ROLLBACK],
  'POST:/create': [MIGRATION_PERMISSIONS.CREATE],
  'POST:/reset': [MIGRATION_PERMISSIONS.RESET, MIGRATION_PERMISSIONS.ADMIN]
};

/**
 * Environment-based authentication bypass
 */
export function bypassAuthInDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.MIGRATION_AUTH_BYPASS === 'true';
}

/**
 * Simple API key authentication middleware
 */
export function apiKeyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Bypass in development if configured
  if (bypassAuthInDevelopment()) {
    req.user = {
      id: 'dev-user',
      role: 'admin',
      permissions: Object.values(MIGRATION_PERMISSIONS)
    };
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;
  const validApiKeys = process.env.MIGRATION_API_KEYS?.split(',') || [];
  
  if (!apiKey) {
    throw createApiError('API key required', 401, 'MISSING_API_KEY');
  }

  if (!validApiKeys.includes(apiKey)) {
    throw createApiError('Invalid API key', 401, 'INVALID_API_KEY');
  }

  // Mock user for API key authentication
  req.user = {
    id: 'api-user',
    role: 'admin',
    permissions: Object.values(MIGRATION_PERMISSIONS)
  };

  next();
}

/**
 * JWT authentication middleware (placeholder for future implementation)
 */
export function jwtAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Bypass in development if configured
  if (bypassAuthInDevelopment()) {
    req.user = {
      id: 'dev-user',
      role: 'admin',
      permissions: Object.values(MIGRATION_PERMISSIONS)
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw createApiError('Authentication token required', 401, 'MISSING_TOKEN');
  }

  try {
    // TODO: Implement actual JWT verification
    // const payload = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = getUserFromPayload(payload);
    
    // Mock implementation for now
    req.user = {
      id: 'jwt-user',
      role: 'admin',
      permissions: Object.values(MIGRATION_PERMISSIONS)
    };
    
    next();
  } catch (error) {
    throw createApiError('Invalid authentication token', 401, 'INVALID_TOKEN');
  }
}

/**
 * Permission-based authorization middleware
 */
export function requirePermissions(requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const userPermissions = req.user.permissions || [];
    const hasRequiredPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      throw createApiError(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}

/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw createApiError(
        `Insufficient role. Required: ${allowedRoles.join(' or ')}`,
        403,
        'INSUFFICIENT_ROLE'
      );
    }

    next();
  };
}

/**
 * Migration-specific authorization middleware
 * Automatically determines required permissions based on HTTP method and path
 */
export function migrationAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const method = req.method;
  const path = req.route?.path || req.path;
  const operationKey = `${method}:${path}`;
  
  const requiredPermissions = OPERATION_PERMISSIONS[operationKey];
  
  if (requiredPermissions) {
    return requirePermissions(requiredPermissions)(req, res, next);
  }

  // Default to view permission for unknown operations
  return requirePermissions([MIGRATION_PERMISSIONS.VIEW])(req, res, next);
}

/**
 * IP whitelist middleware for additional security
 */
export function ipWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (bypassAuthInDevelopment()) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!allowedIPs.includes(clientIP) && !allowedIPs.includes('0.0.0.0')) {
      throw createApiError(
        `IP address not allowed: ${clientIP}`,
        403,
        'IP_NOT_ALLOWED'
      );
    }

    next();
  };
}

/**
 * Rate limiting middleware for migration operations
 */
export function migrationRateLimit() {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 50; // Max requests per window

  return (req: Request, res: Response, next: NextFunction): void => {
    if (bypassAuthInDevelopment()) {
      return next();
    }

    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      throw createApiError(
        'Too many requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    record.count++;
    next();
  };
}

/**
 * Audit logging middleware for migration operations
 */
export function auditLog(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const originalSend = res.send;

  // Log request
  console.log(`[MIGRATION_AUDIT] ${new Date().toISOString()} - ${req.method} ${req.path}`, {
    user: req.user?.id || 'anonymous',
    role: req.user?.role || 'none',
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });

  // Override response to log result
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    console.log(`[MIGRATION_AUDIT] ${new Date().toISOString()} - Response ${res.statusCode}`, {
      user: req.user?.id || 'anonymous',
      duration,
      success: res.statusCode < 400
    });

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Complete migration security middleware stack
 */
export function createMigrationSecurity(options: {
  auth?: 'api-key' | 'jwt' | 'none';
  allowedIPs?: string[];
  rateLimit?: boolean;
  audit?: boolean;
} = {}) {
  const middlewares = [];

  // IP whitelist
  if (options.allowedIPs && options.allowedIPs.length > 0) {
    middlewares.push(ipWhitelist(options.allowedIPs));
  }

  // Rate limiting
  if (options.rateLimit !== false) {
    middlewares.push(migrationRateLimit());
  }

  // Authentication
  switch (options.auth) {
    case 'api-key':
      middlewares.push(apiKeyAuth);
      break;
    case 'jwt':
      middlewares.push(jwtAuth);
      break;
    case 'none':
      // No authentication
      break;
    default:
      // Default to API key in production, none in development
      if (!bypassAuthInDevelopment()) {
        middlewares.push(apiKeyAuth);
      }
  }

  // Authorization
  middlewares.push(migrationAuth);

  // Audit logging
  if (options.audit !== false) {
    middlewares.push(auditLog);
  }

  return middlewares;
}