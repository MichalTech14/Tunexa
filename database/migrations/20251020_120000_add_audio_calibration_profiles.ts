/**
 * Migration: Add Audio Calibration Profiles
 * Description: Create table for storing audio calibration profiles per user and vehicle
 * Created: 2025-10-20T12:00:00.000Z
 */

import { QueryRunner } from 'typeorm';
import { Migration } from '../migration-manager.js';

const migration: Migration = {
  id: '20251020_120000_add_audio_calibration_profiles',
  name: 'Add Audio Calibration Profiles',
  version: '20251020_120000',
  description: 'Create table for storing audio calibration profiles per user and vehicle',
  dependencies: ['20251020_110000_add_vehicle_performance_metrics'],
  
  async up(queryRunner: QueryRunner): Promise<void> {
    // Create audio_calibration_profiles table
    await queryRunner.query(`
      CREATE TABLE audio_calibration_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        profile_name VARCHAR(100) NOT NULL,
        calibration_data TEXT NOT NULL,
        frequency_response TEXT,
        eq_settings TEXT,
        is_active BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        UNIQUE(user_id, vehicle_id, profile_name)
      )
    `);
    
    // Add indexes
    await queryRunner.query(`
      CREATE INDEX idx_acp_user_vehicle ON audio_calibration_profiles(user_id, vehicle_id)
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_acp_active ON audio_calibration_profiles(is_active)
    `);
    
    // Add trigger for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_acp_timestamp 
      AFTER UPDATE ON audio_calibration_profiles
      BEGIN
        UPDATE audio_calibration_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    
    // Create view for active profiles
    await queryRunner.query(`
      CREATE VIEW active_calibration_profiles AS
      SELECT 
        acp.*,
        u.name as user_name,
        u.email as user_email,
        v.brand as vehicle_brand,
        v.model as vehicle_model
      FROM audio_calibration_profiles acp
      JOIN users u ON acp.user_id = u.id
      JOIN vehicles v ON acp.vehicle_id = v.id
      WHERE acp.is_active = TRUE
    `);
    
    console.log('  ✅ Created audio_calibration_profiles table with view and indexes');
  },
  
  async down(queryRunner: QueryRunner): Promise<void> {
    // Drop view
    await queryRunner.query(`DROP VIEW IF EXISTS active_calibration_profiles`);
    
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_acp_timestamp`);
    
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_acp_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_acp_user_vehicle`);
    
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS audio_calibration_profiles`);
    
    console.log('  ✅ Removed audio_calibration_profiles table and related objects');
  },
  
  async validate(queryRunner: QueryRunner): Promise<boolean> {
    // Check dependencies
    const vehicleMetricsTable = await queryRunner.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='vehicle_performance_metrics'
    `);
    
    return vehicleMetricsTable.length > 0;
  }
};

export default migration;