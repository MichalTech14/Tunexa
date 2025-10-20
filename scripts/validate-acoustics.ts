#!/usr/bin/env npx tsx

/**
 * Validation script for acoustics data files
 * Validates all JSON files in acoustics/ directory against schema.json
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { glob } from 'glob';

interface ValidationResult {
  file: string;
  valid: boolean;
  errors?: string[];
}

async function validateAcousticsFiles(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Load schema
  const schemaPath = path.join(process.cwd(), 'acoustics', 'schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  
  // Setup AJV validator
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  // Find all acoustics JSON files (excluding schema.json)
  const acousticsFiles = await glob('acoustics/**/*.json', {
    ignore: ['acoustics/schema.json']
  });

  if (acousticsFiles.length === 0) {
    console.warn('⚠️  No acoustics files found to validate');
    return results;
  }

  console.log(`🔍 Found ${acousticsFiles.length} acoustics files to validate\n`);

  // Validate each file
  for (const filePath of acousticsFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      const valid = validate(data);
      const result: ValidationResult = {
        file: filePath,
        valid: valid
      };

      if (!valid && validate.errors) {
        result.errors = validate.errors.map(error => {
          const path = error.instancePath || 'root';
          return `${path}: ${error.message}`;
        });
      }

      results.push(result);

    } catch (error) {
      results.push({
        file: filePath,
        valid: false,
        errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  return results;
}

function printResults(results: ValidationResult[]): void {
  let validCount = 0;
  let invalidCount = 0;

  for (const result of results) {
    if (result.valid) {
      console.log(`✅ ${result.file}`);
      validCount++;
    } else {
      console.log(`❌ ${result.file}`);
      if (result.errors) {
        result.errors.forEach(error => {
          console.log(`   • ${error}`);
        });
      }
      invalidCount++;
      console.log(''); // Empty line for readability
    }
  }

  console.log('\n📊 Validation Summary:');
  console.log(`   Valid files: ${validCount}`);
  console.log(`   Invalid files: ${invalidCount}`);
  console.log(`   Total files: ${results.length}`);

  if (invalidCount > 0) {
    console.log('\n❌ Validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All acoustics files are valid!');
  }
}

// Main execution
async function main() {
  console.log('🎵 Tunexa Acoustics Data Validator\n');
  
  try {
    const results = await validateAcousticsFiles();
    printResults(results);
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateAcousticsFiles, ValidationResult };