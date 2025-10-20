#!/usr/bin/env node

/**
 * Tunexa Migration CLI
 * Command-line interface for database migration management
 * 
 * Usage:
 *   npm run migrate status
 *   npm run migrate run
 *   npm run migrate rollback
 *   npm run migrate create "Add user settings"
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

// Initialize commander program
const program = new Command();

program
  .name('tunexa-migrate')
  .description('Tunexa Database Migration Management CLI')
  .version('1.0.0');

/**
 * Utility functions for CLI output
 */
function log(message: string): void {
  console.log(message);
}

function success(message: string): void {
  console.log(chalk.green('✅ ' + message));
}

function error(message: string): void {
  console.error(chalk.red('❌ ' + message));
}

function warning(message: string): void {
  console.log(chalk.yellow('⚠️  ' + message));
}

function info(message: string): void {
  console.log(chalk.blue('ℹ️  ' + message));
}

function section(title: string): void {
  console.log('\n' + chalk.bold.cyan('📋 ' + title.toUpperCase()));
  console.log(chalk.cyan('='.repeat(title.length + 4)));
}

/**
 * Initialize database service
 */
async function initializeDatabaseService() {
  try {
    const { databaseService } = await import('../database/DatabaseService.js');
    
    // Always try to initialize (it will skip if already initialized)
    info('Initializing database service...');
    await databaseService.initialize();
    success('Database service initialized');
    
    return databaseService;
  } catch (err) {
    error(`Failed to initialize database service: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

/**
 * Format execution time
 */
function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Status command - Show migration status
 */
program
  .command('status')
  .description('Show current migration status')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    try {
      const db = await initializeDatabaseService();
      const startTime = performance.now();
      
      section('Migration Status Report');
      
      const statusReport = await db.migrationManager.getStatusReport();
      const validation = await db.migrationManager.validateMigrations();
      
      // Basic status
      log(`📊 Total Migrations: ${chalk.bold(statusReport.totalMigrations)}`);
      log(`✅ Executed: ${chalk.green(statusReport.executedMigrations)}`);
      log(`⏳ Pending: ${chalk.yellow(statusReport.pendingMigrations)}`);
      log(`🕐 Last Executed: ${statusReport.lastExecuted?.name || chalk.gray('None')}`);
      
      // Validation status
      log(`\n🔍 Validation: ${validation.valid ? chalk.green('Valid') : chalk.red('Issues Found')}`);
      
      if (validation.issues.length > 0) {
        warning('Validation Issues:');
        validation.issues.forEach(issue => log(`  • ${issue}`));
      }
      
      // Pending migrations
      if (statusReport.pendingList.length > 0) {
        section('Pending Migrations');
        statusReport.pendingList.forEach((migration, index) => {
          log(`${index + 1}. ${chalk.yellow(migration.name)} (${migration.version})`);
          if (options.verbose && migration.description) {
            log(`   ${chalk.gray(migration.description)}`);
          }
        });
      }
      
      // Executed migrations (verbose mode)
      if (options.verbose && statusReport.executedList.length > 0) {
        section('Recent Executed Migrations');
        statusReport.executedList.slice(-5).forEach(migration => {
          const executedAt = migration.executedAt ? new Date(migration.executedAt).toLocaleString() : 'Unknown';
          log(`• ${chalk.green(migration.name)} - ${chalk.gray(executedAt)}`);
        });
      }
      
      const duration = performance.now() - startTime;
      log(`\n⏱️  Report generated in ${formatTime(duration)}`);
      
      // Exit with appropriate code
      if (!validation.valid || statusReport.pendingMigrations > 0) {
        process.exit(1);
      }
      
    } catch (err) {
      error(`Status check failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

/**
 * Run command - Execute pending migrations
 */
program
  .command('run')
  .description('Execute all pending migrations')
  .option('-y, --yes', 'Skip confirmation prompt')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    try {
      const db = await initializeDatabaseService();
      
      // Check for pending migrations
      const pendingMigrations = await db.migrationManager.getPendingMigrations();
      
      if (pendingMigrations.length === 0) {
        success('No pending migrations to execute');
        return;
      }
      
      section('Pending Migrations');
      pendingMigrations.forEach((migration, index) => {
        log(`${index + 1}. ${migration.name} (${migration.version})`);
        if (options.verbose && migration.description) {
          log(`   ${chalk.gray(migration.description)}`);
        }
      });
      
      // Confirmation prompt (skip if --yes flag)
      if (!options.yes) {
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise<string>((resolve) => {
          rl.question(chalk.yellow(`\nExecute ${pendingMigrations.length} migration(s)? (y/N): `), resolve);
        });
        
        rl.close();
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          info('Migration cancelled by user');
          return;
        }
      }
      
      // Execute migrations
      section('Executing Migrations');
      const startTime = performance.now();
      
      const results = await db.migrationManager.runMigrations();
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      // Show results
      results.forEach(result => {
        const status = result.success ? chalk.green('✅') : chalk.red('❌');
        const time = formatTime(result.executionTime);
        log(`${status} ${result.migration.name} (${time})`);
        
        if (!result.success && result.error) {
          error(`   Error: ${result.error}`);
        }
      });
      
      const totalTime = performance.now() - startTime;
      
      // Summary
      section('Execution Summary');
      log(`✅ Successful: ${chalk.green(successful)}`);
      log(`❌ Failed: ${chalk.red(failed)}`);
      log(`⏱️  Total Time: ${formatTime(totalTime)}`);
      
      if (failed > 0) {
        error('Some migrations failed');
        process.exit(1);
      } else {
        success('All migrations executed successfully');
      }
      
    } catch (err) {
      error(`Migration execution failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

/**
 * Rollback command - Rollback last migration
 */
program
  .command('rollback')
  .description('Rollback the last executed migration')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async (options) => {
    try {
      const db = await initializeDatabaseService();
      
      const executedMigrations = await db.migrationManager.getExecutedMigrations();
      const lastExecuted = executedMigrations[executedMigrations.length - 1];
      
      if (!lastExecuted) {
        warning('No migrations to rollback');
        return;
      }
      
      log(`🔄 Last executed migration: ${chalk.yellow(lastExecuted.name)}`);
      log(`📅 Executed at: ${lastExecuted.executedAt ? new Date(lastExecuted.executedAt).toLocaleString() : 'Unknown'}`);
      
      // Confirmation prompt (skip if --yes flag)
      if (!options.yes) {
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise<string>((resolve) => {
          rl.question(chalk.yellow(`\nRollback migration "${lastExecuted.name}"? (y/N): `), resolve);
        });
        
        rl.close();
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          info('Rollback cancelled by user');
          return;
        }
      }
      
      // Execute rollback
      section('Rolling Back Migration');
      const startTime = performance.now();
      
      const result = await db.migrationManager.rollbackLastMigration();
      const duration = performance.now() - startTime;
      
      if (result.success) {
        success(`Migration "${result.migration.name}" rolled back successfully`);
        log(`⏱️  Rollback completed in ${formatTime(duration)}`);
      } else {
        error(`Rollback failed: ${result.error}`);
        process.exit(1);
      }
      
    } catch (err) {
      error(`Rollback failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

/**
 * Create command - Create new migration template
 */
program
  .command('create <name>')
  .description('Create a new migration template')
  .option('-d, --description <desc>', 'Migration description')
  .action(async (name, options) => {
    try {
      const db = await initializeDatabaseService();
      
      const description = options.description || `Add ${name.toLowerCase()}`;
      
      section('Creating Migration');
      log(`📝 Name: ${chalk.yellow(name)}`);
      log(`📋 Description: ${chalk.gray(description)}`);
      
      const filePath = await db.migrationManager.createMigration(name, description);
      
      success(`Migration template created: ${filePath}`);
      info('Edit the migration file and implement the up() and down() methods');
      
    } catch (err) {
      error(`Migration creation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

/**
 * Validate command - Validate migration integrity
 */
program
  .command('validate')
  .description('Validate migration files and integrity')
  .action(async () => {
    try {
      const db = await initializeDatabaseService();
      
      section('Validating Migrations');
      
      const validation = await db.migrationManager.validateMigrations();
      
      if (validation.valid) {
        success('All migrations are valid');
      } else {
        error(`Found ${validation.issues.length} validation issues:`);
        validation.issues.forEach(issue => log(`  • ${issue}`));
        process.exit(1);
      }
      
    } catch (err) {
      error(`Validation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

/**
 * Reset command - Reset migration system (DANGEROUS)
 */
program
  .command('reset')
  .description('Reset migration system - clears all migration records (DANGEROUS)')
  .option('--confirm', 'Required confirmation flag')
  .action(async (options) => {
    if (!options.confirm) {
      error('This is a dangerous operation that will clear all migration records');
      error('Use --confirm flag if you really want to proceed');
      process.exit(1);
    }
    
    try {
      const db = await initializeDatabaseService();
      
      warning('⚠️  DANGER: This will clear ALL migration records');
      warning('This action cannot be undone!');
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise<string>((resolve) => {
        rl.question(chalk.red('Type "RESET_MIGRATIONS" to confirm: '), resolve);
      });
      
      rl.close();
      
      if (answer !== 'RESET_MIGRATIONS') {
        info('Reset cancelled - confirmation failed');
        return;
      }
      
      await db.migrationManager.resetMigrations();
      
      warning('Migration system has been reset');
      warning('All migration records have been cleared');
      
    } catch (err) {
      error(`Reset failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}