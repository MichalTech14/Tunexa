/**
 * Database Configuration
 * TypeORM DataSource configuration for SQLite
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPerformanceAnalyzer } from './performance-analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Entity imports
import { User } from './entities/User.js';
import { UserProfile } from './entities/UserProfile.js';
import { Device } from './entities/Device.js';
import { UserSession } from './entities/UserSession.js';
import { MeasurementRecord } from './entities/MeasurementRecord.js';
import { Vehicle } from './entities/Vehicle.js';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, 'tunexa.db'),
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync schema in development
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  
  // Entities configuration
  entities: [
    User,
    UserProfile,
    Device,
    UserSession,
    MeasurementRecord,
    Vehicle
  ],
  
  // Migrations and subscribers (empty for now, managed by MigrationManager)
  migrations: [],
  subscribers: [
    path.join(__dirname, 'subscribers', '*.ts')
  ],
  
  // SQLite specific optimizations
  extra: {
    // SQLite pragma settings for performance
    pragma: [
      'journal_mode = WAL',        // Write-Ahead Logging for better concurrency
      'synchronous = NORMAL',      // Balance between safety and performance
      'cache_size = 64000',        // 64MB cache size
      'foreign_keys = ON',         // Enable foreign key constraints
      'temp_store = MEMORY',       // Store temporary data in memory
      'mmap_size = 268435456',     // 256MB memory-mapped I/O
      'optimize',                  // Run optimization
    ],
    // Connection pool settings (for future PostgreSQL/MySQL migration)
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    // SQLite WAL mode settings
    busyTimeout: 30000,
  },
  
  // Query result caching
  cache: {
    duration: 30000, // 30 seconds default cache
    type: 'database', // Use database-level caching
    options: {
      max: 100, // Maximum number of cached queries
      ttl: 30000, // TTL in milliseconds
    }
  },
  
  // Performance monitoring
  maxQueryExecutionTime: 10000, // 10 seconds max query time
  
  // Enable query result transformation
  relationLoadStrategy: 'query', // Use JOIN queries instead of separate queries
});

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      
      // Wrap DataSource with performance monitoring
      dbPerformanceAnalyzer.wrapDataSource(AppDataSource);
      
      console.log('🗄️  Database connection established successfully');
      
      // Run migrations if needed
      if (process.env.NODE_ENV === 'production') {
        await AppDataSource.runMigrations();
        console.log('📋 Database migrations completed');
      }
    }
    
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('🗄️  Database connection closed');
  }
}

/**
 * Get repository for entity
 */
export function getRepository<T>(entity: new () => T) {
  return AppDataSource.getRepository(entity);
}

export default AppDataSource;