/**
 * Database Seed Script
 * Populate database with sample data
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, closeDatabase, getRepository } from './config.js';
import { User, UserProfile, Device, Vehicle, MeasurementRecord } from './entities/index.js';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

async function seedDatabase() {
  console.log('🌱 Seeding Tunexa database...');
  
  try {
    await initializeDatabase();
    
    // Get repositories
    const userRepo = getRepository(User);
    const profileRepo = getRepository(UserProfile);
    const deviceRepo = getRepository(Device);
    const vehicleRepo = getRepository(Vehicle);
    const measurementRepo = getRepository(MeasurementRecord);

    console.log('👤 Creating sample users...');
    
    // Create admin user
    const adminUser = userRepo.create({
      username: 'admin',
      email: 'admin@tunexa.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      emailVerified: true
    });
    await userRepo.save(adminUser);
    console.log('✅ Admin user created');

    // Create demo user
    const demoUser = userRepo.create({
      username: 'demo',
      email: 'demo@tunexa.com', 
      passwordHash: await bcrypt.hash('demo123', 10),
      firstName: 'Demo',
      lastName: 'User',
      role: 'premium',
      status: 'active',
      emailVerified: true,
      preferences: JSON.stringify({
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoSync: true
      })
    });
    await userRepo.save(demoUser);
    console.log('✅ Demo user created');

    console.log('📱 Creating sample devices...');
    
    // Create sample devices
    const devices = [
      {
        macAddress: '00:1A:2B:3C:4D:5E',
        deviceName: 'iPhone 15 Pro',
        deviceType: 'smartphone' as const,
        manufacturer: 'Apple',
        model: 'iPhone 15 Pro',
        operatingSystem: 'iOS',
        osVersion: '17.2',
        status: 'active' as const,
        isTrusted: true
      },
      {
        macAddress: 'AA:BB:CC:DD:EE:FF',
        deviceName: 'MacBook Pro',
        deviceType: 'laptop' as const,
        manufacturer: 'Apple',
        model: 'MacBook Pro 16"',
        operatingSystem: 'macOS',
        osVersion: '14.2',
        status: 'active' as const,
        isTrusted: true
      },
      {
        macAddress: '11:22:33:44:55:66',
        deviceName: 'BMW iDrive',
        deviceType: 'car_system' as const,
        manufacturer: 'BMW',
        model: 'iDrive 8.5',
        operatingSystem: 'BMW OS',
        osVersion: '8.5.23',
        status: 'active' as const,
        isTrusted: true
      }
    ];

    const savedDevices = [];
    for (const deviceData of devices) {
      const device = deviceRepo.create(deviceData);
      device.updateFingerprint();
      device.updateActivity();
      await deviceRepo.save(device);
      savedDevices.push(device);
      console.log(`✅ Device created: ${device.deviceName}`);
    }

    console.log('👤 Creating user profiles...');
    
    // Create sample profiles
    const profiles = [
      {
        name: 'Bass Heavy',
        description: 'Enhanced bass for hip-hop and electronic music',
        userId: demoUser.id,
        deviceId: savedDevices[0].id,
        audioSettings: JSON.stringify({
          eq: {
            '60': 6,
            '170': 4,
            '310': 1,
            '600': -1,
            '1000': -2,
            '3000': 0,
            '6000': 1,
            '12000': 2,
            '14000': 1
          },
          volume: 75,
          balance: 0,
          fade: 0
        }),
        lockLevel: 'soft' as const,
        isDefault: true
      },
      {
        name: 'Classical',
        description: 'Optimized for orchestral and acoustic music',
        userId: demoUser.id,
        deviceId: savedDevices[0].id,
        audioSettings: JSON.stringify({
          eq: {
            '60': -2,
            '170': -1,
            '310': 0,
            '600': 2,
            '1000': 3,
            '3000': 2,
            '6000': 1,
            '12000': 0,
            '14000': -1
          },
          volume: 65,
          balance: 0,
          fade: -2
        }),
        lockLevel: 'medium' as const
      },
      {
        name: 'Car Audio',
        description: 'Optimized for BMW audio system',
        userId: demoUser.id,
        deviceId: savedDevices[2].id,
        audioSettings: JSON.stringify({
          eq: {
            '60': 2,
            '170': 1,
            '310': 0,
            '600': 1,
            '1000': 0,
            '3000': -1,
            '6000': 0,
            '12000': 1,
            '14000': 0
          },
          volume: 80,
          balance: 0,
          fade: 1
        }),
        vehicleSettings: JSON.stringify({
          surroundMode: 'concert_hall',
          speedVolumeCompensation: true,
          bassBoost: 3
        }),
        lockLevel: 'hard' as const
      }
    ];

    for (const profileData of profiles) {
      const profile = profileRepo.create({
        ...profileData,
        usageCount: 1,
        lastUsedAt: new Date()
      });
      await profileRepo.save(profile);
      console.log(`✅ Profile created: ${profile.name}`);
    }

    console.log('🚗 Loading vehicle data...');
    
    // Load vehicles from acoustics data
    const acousticsFiles = await glob('acoustics/*/*.json');
    const vehicleCount = Math.min(acousticsFiles.length, 10); // Limit to 10 for demo
    
    for (let i = 0; i < vehicleCount; i++) {
      const filePath = acousticsFiles[i];
      const fileContent = await readFile(filePath, 'utf-8');
      const acousticData = JSON.parse(fileContent);
      
      const pathParts = filePath.split('/');
      const brand = pathParts[1];
      const modelFile = pathParts[2];
      const modelName = modelFile.replace('.json', '').replace('-', ' ');
      
      const vehicle = vehicleRepo.create({
        brand: brand.charAt(0).toUpperCase() + brand.slice(1).replace('-', ' '),
        model: modelName.charAt(0).toUpperCase() + modelName.slice(1),
        slug: Vehicle.generateSlug(brand, modelName),
        acousticData: JSON.stringify(acousticData),
        audioSystemBrand: acousticData.cabin?.audio_system?.brand,
        speakerCount: acousticData.cabin?.audio_system?.speakers?.total,
        amplifierPower: acousticData.cabin?.audio_system?.amplifier?.power_watts,
        hasSubwoofer: acousticData.cabin?.audio_system?.features?.includes('subwoofer') || false,
        hasDSP: acousticData.cabin?.audio_system?.features?.includes('dsp') || false,
        supportedProtocols: JSON.stringify(['CAN', 'UDS', 'OBD2']),
        oemConfiguration: JSON.stringify({
          canId: '0x740',
          responseId: '0x748',
          baudRate: 500000
        })
      });
      
      await vehicleRepo.save(vehicle);
      console.log(`✅ Vehicle created: ${vehicle.getDisplayName()}`);
    }

    console.log('📊 Creating sample measurements...');
    
    // Create sample measurements
    const vehicles = await vehicleRepo.find({ take: 3 });
    
    for (const vehicle of vehicles) {
      const measurement = measurementRepo.create({
        userId: demoUser.id,
        vehicleId: vehicle.id,
        measurementType: 'full',
        standard: 'iso',
        status: 'completed',
        configuration: JSON.stringify({
          sampleRate: 48000,
          duration: 30,
          positions: ['driver', 'passenger', 'rear_left', 'rear_right'],
          signals: ['sweep', 'pink_noise']
        }),
        results: JSON.stringify({
          frequencyResponse: {
            '20-20000': 'measured data would be here'
          },
          thd: {
            '1kHz': 0.02,
            '10kHz': 0.05
          },
          noiseFloor: -75,
          powerOutput: {
            rms: 45,
            peak: 120
          }
        }),
        certification: JSON.stringify({
          status: 'passed',
          score: 87,
          standard: 'ISO 26262',
          issues: [],
          recommendations: ['Consider bass optimization']
        }),
        certificationStatus: 'passed',
        overallScore: 87,
        startedAt: new Date(Date.now() - 120000), // 2 minutes ago
        completedAt: new Date(),
        durationSeconds: 120
      });

      await measurementRepo.save(measurement);
      vehicle.incrementMeasurementCount();
      await vehicleRepo.save(vehicle);
      
      console.log(`✅ Measurement created for ${vehicle.getDisplayName()}`);
    }

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('👤 Sample accounts:');
    console.log('   Admin: admin@tunexa.com / admin123');
    console.log('   Demo:  demo@tunexa.com / demo123');
    console.log('');
    console.log('📊 Sample data created:');
    console.log(`   Users: ${await userRepo.count()}`);
    console.log(`   Devices: ${await deviceRepo.count()}`);
    console.log(`   Profiles: ${await profileRepo.count()}`);
    console.log(`   Vehicles: ${await vehicleRepo.count()}`);
    console.log(`   Measurements: ${await measurementRepo.count()}`);
    
    await closeDatabase();
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };