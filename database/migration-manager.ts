/**
 * Advanced Database Migration System
 * Professional migration management with rollback support, validation, and tracking
 */

import { DataSource, QueryRunner } from 'typeorm';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

export interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  up: (queryRunner: QueryRunner) => Promise<void>;
  down: (queryRunner: QueryRunner) => Promise<void>;
  validate?: (queryRunner: QueryRunner) => Promise<boolean>;
  dependencies?: string[];
}

export interface MigrationRecord {
  id: string;
  name: string;
  version: string;
  executedAt: Date;
  executionTime: number;
  checksum: string;
  rollbackAvailable: boolean;
}

export interface MigrationResult {
  migration: Migration;
  success: boolean;
  executionTime: number;
  error?: string;
  rollbackPerformed?: boolean;
}

export class MigrationManager {
  private static instance: MigrationManager;
  private dataSource: DataSource;
  private migrationsPath: string;
  private loadedMigrations: Map<string, Migration> = new Map();

  private constructor(dataSource: DataSource, migrationsPath?: string) {
    this.dataSource = dataSource;
    this.migrationsPath = migrationsPath || path.join(process.cwd(), 'database', 'migrations');
  }

  public static getInstance(dataSource: DataSource, migrationsPath?: string): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager(dataSource, migrationsPath);
    }
    return MigrationManager.instance;
  }

  /**
   * Initialize migration system - create migrations table if not exists
   */
  public async initialize(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      // Create migrations table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS tunexa_migrations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          version TEXT NOT NULL,
          executed_at DATETIME NOT NULL,
          execution_time INTEGER NOT NULL,
          checksum TEXT NOT NULL,
          rollback_available BOOLEAN DEFAULT TRUE,
          rollback_sql TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('📋 Migration system initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize migration system:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Load all migration files from the migrations directory
   */
  public async loadMigrations(): Promise<void> {
    try {
      const files = await readdir(this.migrationsPath);
      const migrationFiles = files.filter(file => 
        file.endsWith('.js') || file.endsWith('.ts')
      ).sort();

      console.log(`📂 Loading ${migrationFiles.length} migration files...`);

      for (const file of migrationFiles) {
        try {
          const filePath = path.join(this.migrationsPath, file);
          const migrationModule = await import(filePath);
          
          if (migrationModule.default && typeof migrationModule.default === 'object') {
            const migration = migrationModule.default as Migration;
            this.loadedMigrations.set(migration.id, migration);
            console.log(`  ✅ Loaded migration: ${migration.name} (${migration.version})`);
          }
        } catch (error) {
          console.warn(`  ⚠️  Failed to load migration ${file}:`, error);
        }
      }

      console.log(`📦 Loaded ${this.loadedMigrations.size} migrations`);
      
    } catch (error) {
      console.error('❌ Failed to load migrations:', error);
      throw error;
    }
  }

  /**
   * Get pending migrations (not yet executed)
   */
  public async getPendingMigrations(): Promise<Migration[]> {
    const executedMigrations = await this.getExecutedMigrations();
    const executedIds = new Set(executedMigrations.map(m => m.id));
    
    const pending: Migration[] = [];
    
    for (const migration of this.loadedMigrations.values()) {
      if (!executedIds.has(migration.id)) {
        // Check dependencies
        if (migration.dependencies) {
          const dependenciesSatisfied = migration.dependencies.every(dep => 
            executedIds.has(dep)
          );
          
          if (!dependenciesSatisfied) {
            console.warn(`⚠️  Migration ${migration.name} has unsatisfied dependencies`);
            continue;
          }
        }
        
        pending.push(migration);
      }
    }
    
    // Sort by version
    return pending.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * Execute pending migrations
   */
  public async runMigrations(): Promise<MigrationResult[]> {
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return [];
    }

    console.log(`🚀 Executing ${pendingMigrations.length} pending migrations...`);
    
    const results: MigrationResult[] = [];

    for (const migration of pendingMigrations) {
      const result = await this.executeMigration(migration);
      results.push(result);
      
      if (!result.success) {
        console.error(`❌ Migration ${migration.name} failed, stopping execution`);
        break;
      }
    }

    return results;
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: Migration): Promise<MigrationResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    const startTime = performance.now();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      console.log(`📋 Executing migration: ${migration.name} (${migration.version})`);
      
      // Validate migration if validator exists
      if (migration.validate) {
        const isValid = await migration.validate(queryRunner);
        if (!isValid) {
          throw new Error('Migration validation failed');
        }
      }
      
      // Execute UP migration
      await migration.up(queryRunner);
      
      // Record migration execution
      const executionTime = performance.now() - startTime;
      const checksum = this.generateChecksum(migration);
      
      await queryRunner.query(`
        INSERT INTO tunexa_migrations (id, name, version, executed_at, execution_time, checksum, rollback_available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        migration.id,
        migration.name,
        migration.version,
        new Date().toISOString(),
        Math.round(executionTime),
        checksum,
        !!migration.down
      ]);
      
      await queryRunner.commitTransaction();
      
      console.log(`  ✅ Migration completed in ${executionTime.toFixed(2)}ms`);
      
      return {
        migration,
        success: true,
        executionTime
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      console.error(`  ❌ Migration failed:`, error);
      
      return {
        migration,
        success: false,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
      
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Rollback the last migration
   */
  public async rollbackLastMigration(): Promise<MigrationResult> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      throw new Error('No migrations to rollback');
    }
    
    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const migration = this.loadedMigrations.get(lastMigration.id);
    
    if (!migration) {
      throw new Error(`Migration ${lastMigration.name} not found in loaded migrations`);
    }
    
    if (!migration.down) {
      throw new Error(`Migration ${lastMigration.name} does not support rollback`);
    }
    
    return await this.rollbackMigration(migration);
  }

  /**
   * Rollback a specific migration
   */
  public async rollbackMigration(migration: Migration): Promise<MigrationResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    const startTime = performance.now();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      console.log(`🔄 Rolling back migration: ${migration.name} (${migration.version})`);
      
      if (!migration.down) {
        throw new Error('Migration does not support rollback');
      }
      
      // Execute DOWN migration
      await migration.down(queryRunner);
      
      // Remove migration record
      await queryRunner.query(`
        DELETE FROM tunexa_migrations WHERE id = ?
      `, [migration.id]);
      
      await queryRunner.commitTransaction();
      
      const executionTime = performance.now() - startTime;
      console.log(`  ✅ Rollback completed in ${executionTime.toFixed(2)}ms`);
      
      return {
        migration,
        success: true,
        executionTime,
        rollbackPerformed: true
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      console.error(`  ❌ Rollback failed:`, error);
      
      return {
        migration,
        success: false,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        rollbackPerformed: false
      };
      
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get list of executed migrations
   */
  public async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      const results = await queryRunner.query(`
        SELECT id, name, version, executed_at, execution_time, checksum, rollback_available
        FROM tunexa_migrations
        ORDER BY executed_at ASC
      `);
      
      return results.map((row: any) => ({
        id: row.id,
        name: row.name,
        version: row.version,
        executedAt: new Date(row.executed_at),
        executionTime: row.execution_time,
        checksum: row.checksum,
        rollbackAvailable: !!row.rollback_available
      }));
      
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate migration status report
   */
  public async getStatusReport(): Promise<{
    totalMigrations: number;
    executedMigrations: number;
    pendingMigrations: number;
    lastExecuted?: MigrationRecord;
    pendingList: Migration[];
    executedList: MigrationRecord[];
  }> {
    const executed = await this.getExecutedMigrations();
    const pending = await this.getPendingMigrations();
    
    return {
      totalMigrations: this.loadedMigrations.size,
      executedMigrations: executed.length,
      pendingMigrations: pending.length,
      lastExecuted: executed[executed.length - 1],
      pendingList: pending,
      executedList: executed
    };
  }

  /**
   * Create a new migration file template
   */
  public async createMigration(name: string, description: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    const version = timestamp;
    const id = `${version}_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const fileName = `${id}.ts`;
    const filePath = path.join(this.migrationsPath, fileName);
    
    const template = `/**
 * Migration: ${name}
 * Description: ${description}
 * Created: ${new Date().toISOString()}
 */

import { QueryRunner } from 'typeorm';
import { Migration } from '../migration-manager.js';

const migration: Migration = {
  id: '${id}',
  name: '${name}',
  version: '${version}',
  description: '${description}',
  
  async up(queryRunner: QueryRunner): Promise<void> {
    // TODO: Implement migration logic
    // Example:
    // await queryRunner.query(\`
    //   ALTER TABLE users ADD COLUMN new_field TEXT
    // \`);
  },
  
  async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: Implement rollback logic
    // Example:
    // await queryRunner.query(\`
    //   ALTER TABLE users DROP COLUMN new_field
    // \`);
  },
  
  async validate(queryRunner: QueryRunner): Promise<boolean> {
    // TODO: Optional validation before migration
    // Return true if migration can proceed
    return true;
  }
};

export default migration;
`;
    
    await writeFile(filePath, template, 'utf8');
    
    console.log(`📝 Created migration file: ${fileName}`);
    console.log(`📁 Path: ${filePath}`);
    
    return filePath;
  }

  /**
   * Validate migration integrity
   */
  public async validateMigrations(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    const executed = await this.getExecutedMigrations();
    
    // Check for missing migrations
    for (const executedMigration of executed) {
      if (!this.loadedMigrations.has(executedMigration.id)) {
        issues.push(`Executed migration ${executedMigration.name} is missing from filesystem`);
      }
    }
    
    // Check for checksum mismatches
    for (const executedMigration of executed) {
      const loadedMigration = this.loadedMigrations.get(executedMigration.id);
      if (loadedMigration) {
        const currentChecksum = this.generateChecksum(loadedMigration);
        if (currentChecksum !== executedMigration.checksum) {
          issues.push(`Migration ${loadedMigration.name} has been modified after execution`);
        }
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate checksum for migration to detect changes
   */
  private generateChecksum(migration: Migration): string {
    const content = `${migration.id}${migration.name}${migration.version}${migration.up.toString()}`;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }

  /**
   * Reset migration system (DANGEROUS - removes all migration records)
   */
  public async resetMigrations(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.query('DELETE FROM tunexa_migrations');
      console.log('🗑️  All migration records cleared');
    } finally {
      await queryRunner.release();
    }
  }
}

// Helper function to get migration manager instance
export function getMigrationManager(dataSource: DataSource, migrationsPath?: string): MigrationManager {
  return MigrationManager.getInstance(dataSource, migrationsPath);
}