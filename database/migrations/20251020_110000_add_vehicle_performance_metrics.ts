/**
 * Migration: Add Vehicle Performance Metrics
 * Description: Create table for storing vehicle performance metrics and test results
 * Created: 2025-10-20T11:00:00.000Z
 */

import { QueryRunner } from 'typeorm';
import { Migration } from '../migration-manager.js';

const migration: Migration = {
  id: '20251020_110000_add_vehicle_performance_metrics',
  name: 'Add Vehicle Performance Metrics',
  version: '20251020_110000',
  description: 'Create table for storing vehicle performance metrics and test results',
  dependencies: ['20251020_100000_add_user_preferences'],
  
  async up(queryRunner: QueryRunner): Promise<void> {
    // Create vehicle_performance_metrics table
    await queryRunner.query(`
      CREATE TABLE vehicle_performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        metric_type VARCHAR(50) NOT NULL,
        metric_value REAL NOT NULL,
        unit VARCHAR(20) NOT NULL,
        test_conditions TEXT,
        measured_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);
    
    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX idx_vpm_vehicle_id ON vehicle_performance_metrics(vehicle_id)
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_vpm_metric_type ON vehicle_performance_metrics(metric_type)
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_vpm_measured_at ON vehicle_performance_metrics(measured_at)
    `);
    
    // Add trigger to update updated_at timestamp
    await queryRunner.query(`
      CREATE TRIGGER update_vpm_timestamp 
      AFTER UPDATE ON vehicle_performance_metrics
      BEGIN
        UPDATE vehicle_performance_metrics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    
    console.log('  ✅ Created vehicle_performance_metrics table with indexes and triggers');
  },
  
  async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_vpm_timestamp
    `);
    
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vpm_measured_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vpm_metric_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vpm_vehicle_id`);
    
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS vehicle_performance_metrics`);
    
    console.log('  ✅ Removed vehicle_performance_metrics table');
  },
  
  async validate(queryRunner: QueryRunner): Promise<boolean> {
    // Check if vehicles table exists (dependency)
    const vehiclesTable = await queryRunner.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='vehicles'
    `);
    
    // Check if users table has preferences column (from previous migration)
    const usersColumns = await queryRunner.query(`
      PRAGMA table_info(users)
    `);
    
    const hasPreferences = usersColumns.some((col: any) => col.name === 'preferences');
    
    return vehiclesTable.length > 0 && hasPreferences;
  }
};

export default migration;