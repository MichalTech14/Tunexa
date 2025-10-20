/**
 * Database Setup Script
 * Initialize database and create tables
 */

import { initializeDatabase, closeDatabase } from './config.js';

async function setupDatabase() {
  console.log('🚀 Setting up Tunexa database...');
  
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    
    console.log('✅ Database setup completed successfully');
    console.log(`📍 Database location: ${dataSource.options.database}`);
    
    // Close connection
    await closeDatabase();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };