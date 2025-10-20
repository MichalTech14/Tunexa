# 🗄️ Tunexa Migration System Documentation

## Overview

The Tunexa Migration System provides comprehensive database schema management with professional-grade features including automatic rollback support, dependency tracking, validation, and secure API access.

## 🚀 Quick Start

### Installation
```bash
npm install commander chalk
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure for development
export NODE_ENV=development
export MIGRATION_AUTH_BYPASS=true
```

### Basic Usage
```bash
# Check migration status
npm run migrate:status

# Run pending migrations
npm run migrate:run

# Create new migration
npm run migrate:create "Add user settings table"

# Rollback last migration
npm run migrate:rollback
```

## 📋 Core Features

### ✅ Migration Management
- **Automatic Discovery**: Scans `database/migrations/` directory
- **Dependency Tracking**: Ensures migrations run in correct order
- **Rollback Support**: Automatic rollback with `down()` methods
- **Validation**: Comprehensive integrity checks
- **Status Tracking**: Real-time migration status and history

### 🔐 Security & Access Control
- **API Key Authentication**: Secure access to migration endpoints
- **JWT Support**: Token-based authentication (configurable)
- **IP Whitelisting**: Restrict access by IP address
- **Rate Limiting**: Prevent abuse with request throttling
- **Audit Logging**: Complete audit trail of all operations

### 📊 Monitoring & Performance
- **Execution Timing**: Track migration performance
- **Memory Monitoring**: Track resource usage during migrations
- **Error Handling**: Comprehensive error reporting
- **Status Reports**: Detailed system health reports

## 🛠️ CLI Commands

### Status Commands
```bash
# Basic status
npm run migrate:status

# Detailed status with verbose output
npx tsx scripts/migrate.ts status --verbose

# Validate migration integrity
npm run migrate:validate
```

### Execution Commands
```bash
# Run all pending migrations
npm run migrate:run

# Run with auto-confirmation (skip prompts)
npx tsx scripts/migrate.ts run --yes

# Rollback last migration
npm run migrate:rollback

# Rollback with auto-confirmation
npx tsx scripts/migrate.ts rollback --yes
```

### Creation Commands
```bash
# Create new migration with description
npm run migrate:create "Add user preferences"

# Create with custom description
npx tsx scripts/migrate.ts create "Add audio settings" --description "Add user audio preferences table"
```

### Advanced Commands
```bash
# Reset migration system (DANGEROUS)
npx tsx scripts/migrate.ts reset --confirm

# Generate comprehensive report
npx tsx scripts/migrate.ts status --verbose > migration-report.txt
```

## 🌐 REST API Endpoints

### Authentication
All API endpoints require authentication (except in development mode with `MIGRATION_AUTH_BYPASS=true`).

```bash
# API Key authentication
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/migrations/status

# JWT authentication
curl -H "Authorization: Bearer your-jwt-token" http://localhost:3000/api/migrations/status
```

### Status Endpoints

#### GET /api/migrations/status
Get comprehensive migration status.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "status": {
      "totalMigrations": 5,
      "executedMigrations": 3,
      "pendingMigrations": 2,
      "lastExecuted": {
        "name": "20251020_110000_add_vehicle_performance_metrics",
        "executedAt": "2025-01-20T15:30:00Z"
      }
    }
  }
}
```

#### GET /api/migrations/pending
List all pending migrations.

#### GET /api/migrations/executed  
List all executed migrations.

#### GET /api/migrations/report
Generate comprehensive system report (JSON or text format).

```bash
# JSON report
curl "http://localhost:3000/api/migrations/report"

# Text report
curl "http://localhost:3000/api/migrations/report?format=text"
```

### Execution Endpoints

#### POST /api/migrations/run
Execute all pending migrations.

**Example Request:**
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/migrations/run
```

#### POST /api/migrations/rollback
Rollback the last executed migration.

#### POST /api/migrations/create
Create a new migration template.

**Example Request:**
```json
{
  "name": "Add User Settings",
  "description": "Add settings column to users table"
}
```

### Validation Endpoints

#### GET /api/migrations/validate
Validate migration system integrity.

### Administrative Endpoints

#### POST /api/migrations/reset
**DANGEROUS**: Reset entire migration system.

**Required Request:**
```json
{
  "confirm": "RESET_MIGRATIONS"
}
```

## 📝 Creating Migrations

### Migration File Structure
```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUserSettings20251020100000 implements MigrationInterface {
  name = 'AddUserSettings20251020100000';
  
  // Optional: Dependencies on other migrations
  dependencies = ['20251020090000_create_users_table'];
  
  // Optional: Human-readable description
  description = 'Add settings column to users table';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration logic
    await queryRunner.query(`
      ALTER TABLE "user" ADD COLUMN "settings" TEXT DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback migration logic
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "settings"
    `);
  }
}
```

### Migration Naming Convention
- **Format**: `YYYYMMDD_HHMMSS_description.ts`
- **Example**: `20251020_143000_add_user_preferences.ts`
- **Auto-generated** when using `npm run migrate:create`

### Best Practices

#### ✅ Do's
- Always implement both `up()` and `down()` methods
- Use descriptive migration names
- Test migrations in development environment
- Keep migrations focused on single changes
- Add meaningful descriptions
- Specify dependencies when needed

#### ❌ Don'ts
- Don't modify existing migration files after execution
- Don't skip rollback implementation
- Don't make breaking changes without consideration
- Don't hardcode values - use environment variables
- Don't bundle multiple unrelated changes

### Example Migrations

#### Simple Column Addition
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "user" ADD COLUMN "avatar_url" VARCHAR(255)
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "user" DROP COLUMN "avatar_url"
  `);
}
```

#### Table Creation with Index
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE "user_sessions" (
      "id" VARCHAR PRIMARY KEY,
      "user_id" VARCHAR NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expires_at" DATETIME NOT NULL,
      FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
    )
  `);
  
  await queryRunner.query(`
    CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" ("user_id")
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP INDEX "idx_user_sessions_user_id"`);
  await queryRunner.query(`DROP TABLE "user_sessions"`);
}
```

## 🔧 Configuration

### Environment Variables

#### Database Configuration
```bash
DATABASE_URL="file:./database/tunexa.db"
DB_SYNCHRONIZE=false  # Always false with migrations
MIGRATION_TABLE="_tunexa_migrations"
```

#### Security Configuration
```bash
# Development bypass
NODE_ENV=development
MIGRATION_AUTH_BYPASS=true

# Production security
MIGRATION_API_KEYS="key1,key2,key3"
JWT_SECRET="your-secret-key"
MIGRATION_ALLOWED_IPS="127.0.0.1,10.0.0.0/8"
```

#### Performance Configuration
```bash
MIGRATION_TIMEOUT=300000  # 5 minutes
MIGRATION_BACKUP=true
AUTO_RUN_MIGRATIONS=false  # Never true in production
```

### Security Middleware Configuration
```typescript
const migrationSecurity = createMigrationSecurity({
  auth: 'api-key',     // 'api-key' | 'jwt' | 'none'
  allowedIPs: ['127.0.0.1', '10.0.0.0/8'],
  rateLimit: true,     // Enable rate limiting
  audit: true         // Enable audit logging
});
```

## 📊 Monitoring & Logging

### Audit Logs
All migration operations are logged with:
- User identification
- Operation type and parameters
- Execution time and result
- IP address and user agent
- Timestamp and request ID

### Performance Metrics
- Migration execution time
- Memory usage during operations
- Database query performance
- Cache hit rates
- Error rates and types

### Health Checks
```bash
# Check migration system health
curl http://localhost:3000/api/migrations/status

# Validate system integrity  
curl http://localhost:3000/api/migrations/validate

# Generate comprehensive report
curl "http://localhost:3000/api/migrations/report?format=text"
```

## 🚨 Error Handling

### Common Error Scenarios

#### Migration Execution Failures
- **Syntax Errors**: Fix SQL syntax in migration file
- **Constraint Violations**: Check data integrity before migration
- **Timeout Errors**: Increase `MIGRATION_TIMEOUT` for large operations
- **Lock Errors**: Ensure no concurrent database access during migration

#### Authentication Errors
- **Missing API Key**: Ensure `X-API-Key` header is set
- **Invalid API Key**: Verify key is in `MIGRATION_API_KEYS` list
- **IP Blocked**: Check IP whitelist configuration
- **Rate Limited**: Reduce request frequency

#### Validation Errors
- **Missing Files**: Ensure all migration files exist
- **Dependency Issues**: Check migration dependency chain
- **Duplicate Names**: Ensure unique migration names
- **Invalid Format**: Follow migration file naming convention

### Recovery Procedures

#### Failed Migration Recovery
```bash
# 1. Check migration status
npm run migrate:status

# 2. Identify failed migration
npm run migrate:validate

# 3. Fix migration file
# Edit the problematic migration file

# 4. Reset if necessary (DANGEROUS)
npx tsx scripts/migrate.ts reset --confirm

# 5. Re-run migrations
npm run migrate:run
```

#### Rollback Recovery
```bash
# 1. Attempt automatic rollback
npm run migrate:rollback

# 2. If automatic fails, manual rollback
# - Identify changes made by failed migration
# - Manually reverse changes in database
# - Update migration status table
```

## 🔄 Deployment & CI/CD

### Development Workflow
```bash
# 1. Create migration
npm run migrate:create "Add new feature"

# 2. Edit migration file
# Implement up() and down() methods

# 3. Test locally
npm run migrate:status
npm run migrate:run

# 4. Test rollback
npm run migrate:rollback

# 5. Commit to repository
git add database/migrations/
git commit -m "Add migration for new feature"
```

### Production Deployment
```bash
# 1. Set production environment
export NODE_ENV=production
export MIGRATION_AUTH_BYPASS=false

# 2. Run migrations (with proper authentication)
curl -X POST \
  -H "X-API-Key: $PRODUCTION_API_KEY" \
  https://api.tunexa.com/api/migrations/run

# 3. Verify deployment
curl -H "X-API-Key: $PRODUCTION_API_KEY" \
  https://api.tunexa.com/api/migrations/status
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Database Migrations
  env:
    MIGRATION_API_KEY: ${{ secrets.MIGRATION_API_KEY }}
  run: |
    npm run migrate:validate
    npm run migrate:run
```

## 🧪 Testing

### Migration Testing
```bash
# Run migrations in test environment
export NODE_ENV=test
export TEST_DATABASE_URL="file:./database/tunexa-test.db"

# Test migration forward and backward
npm run migrate:run
npm run migrate:rollback
npm run migrate:run
```

### Integration Tests
```typescript
describe('Migration System', () => {
  test('should execute migrations successfully', async () => {
    const result = await migrationManager.runMigrations();
    expect(result.every(r => r.success)).toBe(true);
  });
  
  test('should rollback migrations successfully', async () => {
    await migrationManager.runMigrations();
    const rollback = await migrationManager.rollbackLastMigration();
    expect(rollback.success).toBe(true);
  });
});
```

## 🎯 Advanced Usage

### Custom Migration Manager
```typescript
import { MigrationManager } from './database/migration-manager.js';

const customManager = new MigrationManager(dataSource, {
  migrationsDir: './custom/migrations',
  tableName: 'my_migrations',
  timeout: 600000  // 10 minutes
});
```

### Programmatic Usage
```typescript
// Get migration status
const status = await migrationManager.getStatusReport();

// Run specific migrations
const results = await migrationManager.runMigrations(['migration1', 'migration2']);

// Create migration programmatically
await migrationManager.createMigration('AddFeature', 'Add new feature table');
```

### Custom Validation Rules
```typescript
// Add custom validation
migrationManager.addValidator('checkTableExists', async (migration) => {
  // Custom validation logic
  return { valid: true, message: 'OK' };
});
```

## 🤝 Contributing

### Migration System Development
1. Follow TypeScript strict mode
2. Add comprehensive error handling
3. Include audit logging for all operations
4. Write tests for new features
5. Update documentation

### Code Style
- Use meaningful variable names
- Add JSDoc comments for public methods
- Handle all error scenarios
- Log important operations
- Follow existing patterns

---

## 📞 Support

For migration system issues:
1. Check the logs: `./logs/migrations.log`
2. Validate system: `npm run migrate:validate`
3. Review environment configuration
4. Check API authentication setup
5. Consult error handling section

**Remember**: Always backup your database before running migrations in production!