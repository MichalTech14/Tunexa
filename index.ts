#!/usr/bin/env node

/**
 * Tunexa - Intelligent Audio Engine
 * Main entry point that orchestrates all modules
 */

import { readFile } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Import module implementations  
import * as ReferenceComparison from './modules/reference_car_comparison/index.js';
import * as AudioCertification from './modules/audio_certification/index.js';
import * as OEMIntegration from './modules/oem_integration/index.js';
import { SpotifyIntegration } from './modules/spotify-integration/index.js';
import { ProfileContinuityManager } from './modules/profile-lock-continuity/index.js';
import { AIBackgroundListener } from './modules/ai_background_listener/index.js';

// Import database service
import { databaseService } from './database/DatabaseService.js';

// Import types
import { VehicleAcoustics, CarsDataWithAcoustics } from './types/acoustics.js';

export interface TunexaConfig {
  modules: {
    reference_comparison: boolean;
    audio_certification: boolean;
    ai_background_listener: boolean;
    oem_integration: boolean;
    spotify_integration: boolean;
  };
  audio_certification?: AudioCertification.MeasurementConfig;
  ai_listener?: {
    enabled: boolean;
    sensitivity: number;
    keywords: string[];
  };
}

export interface TunexaEngine {
  carsDatabase: any[];
  database: typeof databaseService;
  config: TunexaConfig;
  isInitialized: boolean;
  modules: {
    referenceComparison?: typeof ReferenceComparison;
    audioCertification?: typeof AudioCertification;
    oemIntegration?: typeof OEMIntegration;
    spotifyIntegration?: SpotifyIntegration;
    profileContinuity?: ProfileContinuityManager;
    aiBackgroundListener?: AIBackgroundListener;
  };
  findVehicleById: (id: string) => Promise<any>;
}

/**
 * Initialize Tunexa Engine with configuration
 */
export async function initializeTunexa(config?: Partial<TunexaConfig>): Promise<TunexaEngine> {
  console.log('🎵 Initializing Tunexa Intelligent Audio Engine...');

  // Default configuration
  const defaultConfig: TunexaConfig = {
    modules: {
      reference_comparison: true,
      audio_certification: true,
      ai_background_listener: false, // Disabled by default for privacy
      oem_integration: false,        // Requires special hardware
      spotify_integration: false,    // Requires API keys
    },
    audio_certification: AudioCertification.getDefaultMeasurementConfig(),
    ai_listener: {
      enabled: true,
      sensitivity: 0.7,
      keywords: ['tunexa', 'audio', 'music', 'sound']
    },
  };

  const finalConfig: TunexaConfig = {
    ...defaultConfig,
    ...config,
    modules: {
      ...defaultConfig.modules,
      ...config?.modules,
    },
  };

  // Load cars database
  console.log('📊 Loading cars database...');
  const carsData = await loadCarsDatabase();
  console.log(`✅ Loaded ${getTotalModelsCount(carsData)} car models from ${carsData.length} brands`);

  // Initialize modules
  let aiListenerState: any | undefined;
  if (finalConfig.modules.ai_background_listener && finalConfig.ai_listener) {
    console.log('🤖 Initializing AI Background Listener...');
    // TODO: Implement AI Background Listener module
    aiListenerState = { enabled: finalConfig.ai_listener.enabled, active: false };
    console.log(`✅ AI Listener initialized (active: ${aiListenerState.active})`);
  }
  
  // Initialize Profile & Continuity Manager
  const profileManager = new ProfileContinuityManager();
  console.log('🔒 Profile Lock & Continuity Manager initialized');

  // Initialize database service
  await databaseService.initialize();

  const engine: TunexaEngine = {
    carsDatabase: carsData,
    database: databaseService,
    config: finalConfig,
    isInitialized: true,
    modules: {
      profileContinuity: profileManager
    },
    findVehicleById: async (id: string) => {
      // Try database first
      const dbVehicle = await databaseService.findVehicleBySlug(id);
      if (dbVehicle) return dbVehicle;
      
      // Fallback to JSON data
      for (const brand of carsData) {
        for (const model of brand.models) {
          const slug = `${brand.brand}-${model.name}`.toLowerCase().replace(/\s+/g, '-');
          if (slug === id) {
            return { brand: brand.brand, ...model };
          }
        }
      }
      return null;
    }
  };

  console.log('🚀 Tunexa Engine initialized successfully!');
  console.log(`📋 Active modules: ${Object.entries(finalConfig.modules)
    .filter(([_, enabled]) => enabled)
    .map(([module, _]) => module)
    .join(', ')}`);

  return engine;
}

/**
 * Load cars database from JSON file
 */
async function loadCarsDatabase(): Promise<CarsDataWithAcoustics> {
  try {
    const carsPath = path.join(process.cwd(), 'cars.json');
    const carsContent = await readFile(carsPath, 'utf-8');
    return JSON.parse(carsContent) as CarsDataWithAcoustics;
  } catch (error) {
    console.error('❌ Failed to load cars database:', error);
    throw new Error('Could not load cars database');
  }
}

/**
 * Get total number of car models across all brands
 */
function getTotalModelsCount(carsData: CarsDataWithAcoustics): number {
  return carsData.reduce((total, brand) => total + brand.models.length, 0);
}

/**
 * Compare two car models using Reference Comparison module
 */
export async function compareCarModels(
  engine: TunexaEngine,
  brandA: string,
  modelA: string,
  brandB: string,
  modelB: string
): Promise<string> {
  if (!engine.config.modules.reference_comparison) {
    throw new Error('Reference Comparison module is disabled');
  }

  console.log(`🔍 Comparing ${brandA} ${modelA} vs ${brandB} ${modelB}...`);

  // Find car models in database
  const carA = findCarModel(engine.carsDatabase, brandA, modelA);
  const carB = findCarModel(engine.carsDatabase, brandB, modelB);

  if (!carA) throw new Error(`Car not found: ${brandA} ${modelA}`);
  if (!carB) throw new Error(`Car not found: ${brandB} ${modelB}`);

  // Create CarSpecs objects for comparison
  const specA: ReferenceComparison.CarSpecs = {
    model: `${brandA} ${modelA}`,
    horsepower: estimateHorsepower(carA),
    torque: estimateTorque(carA),
    audioScore: ReferenceComparison.calculateAudioScore(carA.audio),
    price: estimatePrice(carA),
    audio: carA.audio,
  };

  const specB: ReferenceComparison.CarSpecs = {
    model: `${brandB} ${modelB}`,
    horsepower: estimateHorsepower(carB),
    torque: estimateTorque(carB),
    audioScore: ReferenceComparison.calculateAudioScore(carB.audio),
    price: estimatePrice(carB),
    audio: carB.audio,
  };

  return ReferenceComparison.compareCars(specA, specB);
}

/**
 * Perform audio certification for a vehicle
 */
export async function certifyAudioSystem(
  engine: TunexaEngine,
  brand: string,
  model: string,
  vehicleInfo: AudioCertification.CertificationReport['vehicle_info'],
  audioSystemInfo: AudioCertification.CertificationReport['audio_system']
): Promise<AudioCertification.CertificationReport> {
  if (!engine.config.modules.audio_certification) {
    throw new Error('Audio Certification module is disabled');
  }

  console.log(`🎵 Starting audio certification for ${brand} ${model}...`);

  // Load vehicle acoustics data
  const acousticsData = await loadVehicleAcoustics(brand, model);
  
  if (!acousticsData) {
    throw new Error(`No acoustics data available for ${brand} ${model}`);
  }

  if (!engine.config.audio_certification) {
    throw new Error('Audio certification config not available');
  }

  // Perform measurements
  const measurement = await AudioCertification.performMeasurement(
    engine.config.audio_certification,
    acousticsData
  );

  // Validate measurement data
  const validation = AudioCertification.validateMeasurementData(measurement);
  if (!validation.valid) {
    console.warn('⚠️  Measurement validation warnings:', validation.errors);
  }

  // Find or create vehicle in database to get ID
  const db = engine.database;
  let vehicle;
  
  try {
    vehicle = await db.getVehicleRepository()
      .createQueryBuilder('vehicle')
      .where('LOWER(vehicle.brand) = LOWER(:brand)', { brand })
      .andWhere('LOWER(vehicle.model) = LOWER(:model)', { model })
      .getOne();
  } catch (error: any) {
    console.warn('⚠️  Database query failed, using fallback ID generation:', error.message);
    vehicle = null;
  }

  if (!vehicle) {
    // Create new vehicle record or use fallback ID
    const fallbackId = `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`;
    vehicle = { id: fallbackId, brand, model };
    console.log(`📝 Using fallback vehicle ID: ${fallbackId}`);
  }

  // Generate certification report
  const report = await AudioCertification.generateCertificationReport(
    {
      vehicleId: vehicle.id,
      standards: engine.config.audio_certification!.standards.map((s: any) => s.name),
      audioSystem: audioSystemInfo
    },
    vehicleInfo,
    audioSystemInfo
  );

  console.log(`✅ Certification completed: ${report.certification.status}`);
  return report;
}

/**
 * Load vehicle acoustics data by brand and model
 */
async function loadVehicleAcoustics(brand: string, model: string): Promise<VehicleAcoustics | null> {
  try {
    // Convert to filename format (lowercase, hyphens)
    const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
    const modelSlug = model.toLowerCase().replace(/\s+/g, '-');
    
    const acousticsPath = path.join(process.cwd(), 'acoustics', brandSlug, `${modelSlug}.json`);
    const acousticsContent = await readFile(acousticsPath, 'utf-8');
    return JSON.parse(acousticsContent) as VehicleAcoustics;
  } catch (error) {
    console.warn(`⚠️  No acoustics data found for ${brand} ${model}`);
    return null;
  }
}

/**
 * Find car model in database
 */
function findCarModel(
  carsData: CarsDataWithAcoustics, 
  brandName: string, 
  modelName: string
): CarsDataWithAcoustics[0]['models'][0] | null {
  const brand = carsData.find(b => 
    b.brand.toLowerCase() === brandName.toLowerCase()
  );
  
  if (!brand) return null;

  const model = brand.models.find(m => 
    m.name.toLowerCase() === modelName.toLowerCase()
  );

  return model || null;
}

/**
 * Estimate horsepower based on car type and audio system
 */
function estimateHorsepower(car: CarsDataWithAcoustics[0]['models'][0]): number {
  // Simple estimation based on audio system quality and car type
  let baseHP = 150; // Base horsepower
  
  if (car.types.includes('SUV')) baseHP += 50;
  if (car.types.includes('Sedan')) baseHP += 20;
  if (car.audio.speakers >= 12) baseHP += 30; // Premium cars tend to have more HP
  
  return baseHP + Math.floor(Math.random() * 50); // Add some variation
}

/**
 * Estimate torque based on horsepower
 */
function estimateTorque(car: CarsDataWithAcoustics[0]['models'][0]): number {
  const hp = estimateHorsepower(car);
  return Math.floor(hp * 1.3); // Rough HP to torque conversion
}

/**
 * Estimate price based on audio system and car features
 */
function estimatePrice(car: CarsDataWithAcoustics[0]['models'][0]): number {
  let basePrice = 25000; // Base price in EUR

  // Audio system premium
  const audioScore = ReferenceComparison.calculateAudioScore(car.audio);
  basePrice += audioScore * 300;

  // Car type premium
  if (car.types.includes('SUV')) basePrice += 10000;
  if (car.types.includes('Coupe')) basePrice += 15000;
  if (car.types.includes('Cabrio')) basePrice += 20000;

  return Math.floor(basePrice);
}

/**
 * Get engine status and statistics
 */
export function getEngineStatus(engine: TunexaEngine): {
  initialized: boolean;
  activeModules: string[];
  databaseStats: {
    totalBrands: number;
    totalModels: number;
    modelsWithAcoustics: number;
  };
} {
  const modelsWithAcoustics = engine.carsDatabase.reduce((count, brand) => {
    return count + brand.models.filter((model: any) => model.acoustics).length;
  }, 0);

  return {
    initialized: engine.isInitialized,
    activeModules: Object.entries(engine.config.modules)
      .filter(([_, enabled]) => enabled)
      .map(([module, _]) => module),
    databaseStats: {
      totalBrands: engine.carsDatabase.length,
      totalModels: getTotalModelsCount(engine.carsDatabase),
      modelsWithAcoustics,
    },
  };
}

/**
 * CLI interface for running Tunexa
 */
export async function main(): Promise<void> {
  try {
    // Initialize engine
    const engine = await initializeTunexa();

    // Show status
    const status = getEngineStatus(engine);
    console.log('\n📊 Engine Status:');
    console.log(`   Active modules: ${status.activeModules.join(', ')}`);
    console.log(`   Database: ${status.databaseStats.totalModels} models, ${status.databaseStats.modelsWithAcoustics} with acoustics data`);

    // Example comparison
    console.log('\n🔍 Example: Comparing BMW 3 Series vs Mercedes E-Class...');
    const comparison = await compareCarModels(engine, 'BMW', '3 Series', 'Mercedes-Benz', 'E-Class');
    console.log(comparison);

    // Example certification
    console.log('\n🎵 Example: Certifying BMW 3 Series audio system...');
    const certificationReport = await certifyAudioSystem(
      engine,
      'BMW',
      '3 Series',
      {
        brand: 'BMW',
        model: '3 Series',
        year: '2023',
      },
      {
        speakers: 16,
        amplifier: 'Harman Kardon',
        head_unit: 'BMW iDrive 8',
      }
    );

    console.log(`✅ Certification result: ${certificationReport.certification.status}`);
    console.log(`📄 Certificate #${certificationReport.certification.certificate_number}`);

    console.log('\n🎉 Tunexa demo completed successfully!');
  } catch (error) {
    console.error('❌ Error running Tunexa:', error);
    process.exit(1);
  }
}

// Run CLI if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}