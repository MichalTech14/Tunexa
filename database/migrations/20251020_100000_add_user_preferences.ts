/**
 * Migration: Add User Preferences
 * Description: Add preferences column to users table for storing user-specific settings
 * Created: 2025-10-20T10:00:00.000Z
 */

import { QueryRunner } from 'typeorm';
import { Migration } from '../migration-manager.js';

const migration: Migration = {
  id: '20251020_100000_add_user_preferences',
  name: 'Add User Preferences',
  version: '20251020_100000',
  description: 'Add preferences column to users table for storing user-specific settings',
  
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add preferences column to users table
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'
    `);
    
    // Add index for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_preferences ON users(preferences)
    `);
    
    console.log('  ✅ Added preferences column to users table');
  },
  
  async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_preferences
    `);
    
    // Remove preferences column
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN preferences
    `);
    
    console.log('  ✅ Removed preferences column from users table');
  },
  
  async validate(queryRunner: QueryRunner): Promise<boolean> {
    // Check if users table exists
    const tables = await queryRunner.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='users'
    `);
    
    return tables.length > 0;
  }
};

export default migration;