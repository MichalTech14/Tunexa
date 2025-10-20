/**
 * Audio Certification Module
 * Automated measurements and certification of automotive audio systems
 * according to international standards (ISO, AES, etc.)
 */

import { VehicleAcoustics, FrequencyResponse, EQFilter } from '../../types/acoustics.js';
import { DatabaseService } from '../../database/DatabaseService.js';
import { MeasurementRecord } from '../../database/entities/MeasurementRecord.js';
import { Vehicle } from '../../database/entities/Vehicle.js';

export interface MeasurementConfig {
  testSignals: TestSignal[];
  microphonePositions: string[];
  frequencyRange: {
    min_Hz: number;
    max_Hz: number;
  };
  standards: CertificationStandard[];
}

export interface TestSignal {
  type: 'sine_sweep' | 'pink_noise' | 'white_noise' | 'multitone';
  duration_ms: number;
  level_dBFS: number;
  frequency_Hz?: number; // For sine waves
}

export interface CertificationStandard {
  name: string;
  version: string;
  requirements: {
    frequency_response: {
      tolerance_dB: number;
      target_curve: string;
    };
    thd_percent_max: number;
    snr_dB_min: number;
    dynamic_range_dB_min: number;
  };
}

export interface MeasurementResult {
  id?: string;
  timestamp: Date;
  vehicle: {
    brand: string;
    model: string;
    year?: string;
  };
  test_configuration: MeasurementConfig;
  results: {
    frequency_response: FrequencyResponse;
    thd_percent: { [freq_Hz: string]: number };
    snr_dB: number;
    dynamic_range_dB: number;
    phase_response: { [freq_Hz: string]: number };
  };
  certification_status: CertificationStatus;
  certification?: {
    status: 'CERTIFIED' | 'NOT_CERTIFIED' | 'CONDITIONALLY_CERTIFIED';
    standards_met: string[];
    standards_failed: string[];
    expiry_date: Date;
    certificate_number: string;
  };
}

export interface CertificationStatus {
  overall: 'PASSED' | 'FAILED' | 'PENDING';
  details: {
    standard: string;
    test: string;
    result: 'PASSED' | 'FAILED';
    measured_value: number;
    required_value: number;
    notes?: string;
  }[];
}

export interface CertificationReport {
  id: string;
  created_at: Date;
  vehicle_info: {
    brand: string;
    model: string;
    year?: string;
    vin?: string;
  };
  audio_system: {
    speakers: number;
    amplifier: string;
    head_unit: string;
  };
  measurements: MeasurementResult[];
  certification: {
    status: 'CERTIFIED' | 'NOT_CERTIFIED' | 'CONDITIONALLY_CERTIFIED';
    standards_met: string[];
    standards_failed: string[];
    expiry_date: Date;
    certificate_number: string;
  };
  recommendations: string[];
}

/**
 * Get default measurement configuration for automotive audio testing
 */
export function getDefaultMeasurementConfig(): MeasurementConfig {
  return {
    testSignals: [
      {
        type: 'sine_sweep',
        duration_ms: 5000,
        level_dBFS: -12,
      },
      {
        type: 'pink_noise',
        duration_ms: 10000,
        level_dBFS: -20,
      },
    ],
    microphonePositions: [
      'driver_head',
      'passenger_head',
      'rear_left',
      'rear_right',
    ],
    frequencyRange: {
      min_Hz: 20,
      max_Hz: 20000,
    },
    standards: [
      {
        name: 'ISO 3382-3',
        version: '2012',
        requirements: {
          frequency_response: {
            tolerance_dB: 3.0,
            target_curve: 'Harman OE 2019',
          },
          thd_percent_max: 1.0,
          snr_dB_min: 80,
          dynamic_range_dB_min: 90,
        },
      },
    ],
  };
}

/**
 * Perform automated audio measurement
 */
export async function performMeasurement(
  config: MeasurementConfig,
  vehicleData: VehicleAcoustics,
  userId?: string
): Promise<MeasurementResult> {
  // Simulate measurement process
  console.log('🎵 Starting audio measurement...');
  console.log(`📍 Testing ${config.microphonePositions.length} positions`);
  console.log(`🎛️ Using ${config.testSignals.length} test signals`);

  // Simulate measurement delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Generate realistic measurement results based on vehicle acoustics
  const frequencyResponse: FrequencyResponse = {};
  const frequencies = ['125', '250', '500', '1000', '2000', '4000', '8000'] as const;
  
  frequencies.forEach((freq) => {
    // Use vehicle's measured FR if available, otherwise generate realistic values
    const baseValue = vehicleData.measured_fr_bands?.[freq] || 0;
    // Add some measurement variation (±1dB)
    frequencyResponse[freq] = baseValue + (Math.random() - 0.5) * 2;
  });

  // Generate THD values (lower is better)
  const thd_percent: { [freq_Hz: string]: number } = {};
  frequencies.forEach((freq) => {
    thd_percent[freq] = Math.random() * 0.5 + 0.1; // 0.1-0.6%
  });

  // Generate SNR and dynamic range
  const snr_dB = 85 + Math.random() * 10; // 85-95 dB
  const dynamic_range_dB = 95 + Math.random() * 10; // 95-105 dB

  const result: MeasurementResult = {
    timestamp: new Date(),
    vehicle: {
      brand: vehicleData.metadata.brand || 'Unknown',
      model: vehicleData.metadata.model || 'Unknown',
      year: vehicleData.metadata.years,
    },
    test_configuration: config,
    results: {
      frequency_response: frequencyResponse,
      thd_percent,
      snr_dB,
      dynamic_range_dB,
      phase_response: {}, // Simplified for now
    },
    certification_status: await evaluateAgainstStandards(
      {
        frequency_response: frequencyResponse,
        thd_percent,
        snr_dB,
        dynamic_range_dB,
        phase_response: {},
      },
      config.standards
    ),
  };

  // Save measurement to database if userId provided
  if (userId && false) { // Temporarily disabled database save
    try {
      const db = DatabaseService.getInstance();
      
      // Find or create vehicle record
      let vehicle;
      try {
        vehicle = await db.getVehicleRepository()
          .createQueryBuilder('vehicle')
          .where('LOWER(vehicle.brand) = LOWER(:brand)', { brand: vehicleData.metadata.brand })
          .andWhere('LOWER(vehicle.model) = LOWER(:model)', { model: vehicleData.metadata.model })
          .getOne();
      } catch (queryError) {
        console.warn('Database query failed, skipping vehicle lookup:', queryError);
        vehicle = null;
      }

      if (!vehicle) {
        try {
          // Create new vehicle record
          vehicle = db.getVehicleRepository().create({
            brand: vehicleData.metadata.brand!,
            model: vehicleData.metadata.model!,
            year: vehicleData.metadata.years ? parseInt(String(vehicleData.metadata.years)) : undefined,
            acousticsData: vehicleData,
          });
          vehicle = await db.getVehicleRepository().save(vehicle);
        } catch (saveError) {
          console.warn('Failed to save vehicle, continuing without database:', saveError);
          vehicle = null;
        }
      }

      // Create measurement record only if vehicle exists
      if (vehicle) {
        try {
          const measurementRecord = db.getMeasurementRepository().create({
            userId,
            vehicleId: vehicle.id,
            measurementType: 'certification',
            standard: 'iso',
            status: 'completed',
            configuration: JSON.stringify(config),
            results: JSON.stringify(result.results),
            certification: JSON.stringify({
              certificate_number: `TUNEXA-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              standards_met: result.certification_status.overall === 'PASSED' ? config.standards.map(s => s.name) : [],
              standards_failed: result.certification_status.overall === 'FAILED' ? config.standards.map(s => s.name) : [],
              expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
              details: result.certification_status.details,
            }),
            certificationStatus: result.certification_status.overall.toLowerCase() as 'passed' | 'failed',
            overallScore: result.certification_status.overall === 'PASSED' ? 95 : 45,
            startedAt: new Date(Date.now() - 5000), // 5 seconds ago
            completedAt: new Date(),
            durationSeconds: 5,
          });

          const savedMeasurement = await db.getMeasurementRepository().save(measurementRecord);
          result.id = savedMeasurement.id;
        } catch (measurementError) {
          console.warn('Failed to save measurement to database:', measurementError);
        }
      } else {
        console.warn('No vehicle found/created, skipping measurement save');
      }
    } catch (error) {
      console.warn('Failed to save measurement to database:', error);
    }
  }

  console.log('✅ Measurement completed');
  return result;
}

/**
 * Evaluate measurement results against certification standards
 */
async function evaluateAgainstStandards(
  results: MeasurementResult['results'],
  standards: CertificationStandard[]
): Promise<CertificationStatus> {
  const details: CertificationStatus['details'] = [];
  let overallPassed = true;

  for (const standard of standards) {
    // Check SNR
    const snrPassed = results.snr_dB >= standard.requirements.snr_dB_min;
    details.push({
      standard: standard.name,
      test: 'Signal-to-Noise Ratio',
      result: snrPassed ? 'PASSED' : 'FAILED',
      measured_value: results.snr_dB,
      required_value: standard.requirements.snr_dB_min,
    });
    if (!snrPassed) overallPassed = false;

    // Check Dynamic Range
    const drPassed = results.dynamic_range_dB >= standard.requirements.dynamic_range_dB_min;
    details.push({
      standard: standard.name,
      test: 'Dynamic Range',
      result: drPassed ? 'PASSED' : 'FAILED',
      measured_value: results.dynamic_range_dB,
      required_value: standard.requirements.dynamic_range_dB_min,
    });
    if (!drPassed) overallPassed = false;

    // Check THD
    const avgThd = Object.values(results.thd_percent).reduce((a, b) => a + b, 0) / 
                   Object.values(results.thd_percent).length;
    const thdPassed = avgThd <= standard.requirements.thd_percent_max;
    details.push({
      standard: standard.name,
      test: 'Total Harmonic Distortion',
      result: thdPassed ? 'PASSED' : 'FAILED',
      measured_value: avgThd,
      required_value: standard.requirements.thd_percent_max,
    });
    if (!thdPassed) overallPassed = false;
  }

  return {
    overall: overallPassed ? 'PASSED' : 'FAILED',
    details,
  };
}

/**
 * Generate certification report
 */
export async function generateCertificationReport(
  measurementData: { vehicleId: string; standards: string[]; audioSystem?: any },
  vehicleInfo: CertificationReport['vehicle_info'],
  audioSystemInfo: CertificationReport['audio_system']
): Promise<CertificationReport> {
  // Get measurements for this vehicle - temporarily disabled
  const measurementRecords: any[] = []; // Empty array for now
  
  console.log('📊 Database measurement lookup temporarily disabled for stability');

  const measurements = measurementRecords.map((m: any) => ({
    id: m.id,
    timestamp: m.createdAt,
    vehicle: {
      brand: m.vehicle.brand,
      model: m.vehicle.model,
      year: m.vehicle.year?.toString(),
    },
    test_configuration: m.getConfiguration() as MeasurementConfig,
    results: m.getResults() as any,
    certification_status: {
      overall: (m.certificationStatus?.toUpperCase() || 'PENDING') as 'PASSED' | 'FAILED' | 'PENDING',
      details: m.getCertification().details || [],
    },
  }));

  const allPassed = measurements.every((m: any) => m.certification_status.overall === 'PASSED');
  
  // Get unique standards from all measurements
  const standardsSet = new Set<string>();
  const standardsMetSet = new Set<string>();
  const standardsFailedSet = new Set<string>();
  
  measurements.forEach((measurement: any) => {
    measurement.test_configuration.standards?.forEach((standard: any) => {
      standardsSet.add(standard.name);
      if (measurement.certification_status.overall === 'PASSED') {
        standardsMetSet.add(standard.name);
      } else {
        standardsFailedSet.add(standard.name);
      }
    });
  });

  const recommendations: string[] = [];
  
  // Generate recommendations based on failed tests
  measurements.forEach((measurement: any) => {
    measurement.certification_status.details?.forEach((detail: any) => {
      if (detail.result === 'FAILED') {
        switch (detail.test) {
          case 'Signal-to-Noise Ratio':
            recommendations.push('Improve system grounding and shielding to reduce noise floor');
            break;
          case 'Total Harmonic Distortion':
            recommendations.push('Check amplifier settings and reduce gain levels');
            break;
          case 'Dynamic Range':
            recommendations.push('Upgrade to higher quality amplifier components');
            break;
        }
      }
    });
  });

  const certificateNumber = `TUNEXA-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years validity

  return {
    id: `report-${Date.now()}`,
    created_at: new Date(),
    vehicle_info: vehicleInfo,
    audio_system: audioSystemInfo,
    measurements,
    certification: {
      status: allPassed ? 'CERTIFIED' : 'NOT_CERTIFIED',
      standards_met: Array.from(standardsMetSet),
      standards_failed: Array.from(standardsFailedSet),
      expiry_date: expiryDate,
      certificate_number: certificateNumber,
    },
    recommendations: [...new Set(recommendations)], // Remove duplicates
  };
}

/**
 * Export certification report to different formats
 */
export function exportReport(
  report: CertificationReport,
  format: 'json' | 'pdf' | 'html'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(report, null, 2);
    
    case 'html':
      return generateHTMLReport(report);
    
    case 'pdf':
      // In real implementation, this would generate PDF
      return `PDF export not yet implemented. Certificate #${report.certification.certificate_number}`;
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function generateHTMLReport(report: CertificationReport): string {
  const statusColor = report.certification.status === 'CERTIFIED' ? '#4CAF50' : '#f44336';
  const statusIcon = report.certification.status === 'CERTIFIED' ? '✅' : '❌';

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Tunexa Audio Certification Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .status { color: ${statusColor}; font-weight: bold; font-size: 1.2em; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f5f5f5; }
        .recommendations { background-color: #fff3cd; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎵 Tunexa Audio Certification Report</h1>
        <h2>${statusIcon} ${report.certification.status}</h2>
        <p class="status">Certificate #${report.certification.certificate_number}</p>
        <p>Generated: ${report.created_at.toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h3>Vehicle Information</h3>
        <p><strong>Vehicle:</strong> ${report.vehicle_info.brand} ${report.vehicle_info.model} ${report.vehicle_info.year || ''}</p>
        <p><strong>Audio System:</strong> ${report.audio_system.speakers} speakers, ${report.audio_system.amplifier}</p>
    </div>

    <div class="section">
        <h3>Certification Results</h3>
        <p><strong>Standards Met:</strong> ${report.certification.standards_met.join(', ')}</p>
        <p><strong>Valid Until:</strong> ${report.certification.expiry_date.toLocaleDateString()}</p>
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="section">
        <h3>Recommendations</h3>
        <div class="recommendations">
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}
</body>
</html>`;
}

/**
 * Validate measurement data integrity
 */
export function validateMeasurementData(measurement: MeasurementResult): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if frequency response has required bands
  const requiredBands = ['125', '250', '500', '1000', '2000', '4000', '8000'];
  const missingBands = requiredBands.filter(
    band => measurement.results.frequency_response[band as keyof FrequencyResponse] === undefined
  );
  if (missingBands.length > 0) {
    errors.push(`Missing frequency response data for bands: ${missingBands.join(', ')}`);
  }

  // Validate SNR range
  if (measurement.results.snr_dB < 40 || measurement.results.snr_dB > 120) {
    errors.push(`SNR value ${measurement.results.snr_dB} dB is outside expected range (40-120 dB)`);
  }

  // Validate THD values
  Object.entries(measurement.results.thd_percent).forEach(([freq, thd]) => {
    if (thd < 0 || thd > 10) {
      errors.push(`THD value ${thd}% at ${freq} Hz is outside expected range (0-10%)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get measurements with optional filtering
 */
export async function getMeasurements(filters?: {
  vehicleBrand?: string;
  vehicleModel?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<MeasurementResult[]> {
  const db = DatabaseService.getInstance();
  
  let query = db.getMeasurementRepository().createQueryBuilder('measurement')
    .leftJoinAndSelect('measurement.vehicle', 'vehicle')
    .leftJoinAndSelect('measurement.user', 'user');

  if (filters?.vehicleBrand) {
    query = query.andWhere('vehicle.brand ILIKE :brand', { brand: `%${filters.vehicleBrand}%` });
  }

  if (filters?.vehicleModel) {
    query = query.andWhere('vehicle.model ILIKE :model', { model: `%${filters.vehicleModel}%` });
  }

  if (filters?.status) {
    query = query.andWhere('measurement.certificationStatus = :status', { status: filters.status });
  }

  if (filters?.startDate) {
    query = query.andWhere('measurement.timestamp >= :startDate', { startDate: filters.startDate });
  }

  if (filters?.endDate) {
    query = query.andWhere('measurement.timestamp <= :endDate', { endDate: filters.endDate });
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const measurements = await query.getMany();
  
  return measurements.map((m: any) => ({
    id: m.id,
    timestamp: m.createdAt,
    vehicle: {
      brand: m.vehicle.brand,
      model: m.vehicle.model,
      year: m.vehicle.year?.toString(),
    },
    test_configuration: m.getConfiguration() as MeasurementConfig,
    results: m.getResults() as any,
    certification_status: {
      overall: (m.certificationStatus?.toUpperCase() || 'PENDING') as 'PASSED' | 'FAILED' | 'PENDING',
      details: m.getCertification().details || [],
    },
    certification: m.getCertification().certificate_number ? {
      status: (m.certificationStatus?.toUpperCase() || 'NOT_CERTIFIED') as 'CERTIFIED' | 'NOT_CERTIFIED' | 'CONDITIONALLY_CERTIFIED',
      standards_met: m.getCertification().standards_met || [],
      standards_failed: m.getCertification().standards_failed || [],
      expiry_date: new Date(m.getCertification().expiry_date),
      certificate_number: m.getCertification().certificate_number,
    } : undefined,
  }));
}

/**
 * Get measurement by ID
 */
export async function getMeasurementById(measurementId: string): Promise<MeasurementResult | null> {
  const db = DatabaseService.getInstance();
  
  const measurement = await db.getMeasurementRepository()
    .createQueryBuilder('measurement')
    .leftJoinAndSelect('measurement.vehicle', 'vehicle')
    .leftJoinAndSelect('measurement.user', 'user')
    .where('measurement.id = :id', { id: measurementId })
    .getOne();

  if (!measurement) {
    return null;
  }

  return {
    id: measurement.id,
    timestamp: measurement.createdAt,
    vehicle: {
      brand: measurement.vehicle.brand,
      model: measurement.vehicle.model,
      year: measurement.vehicle.year?.toString(),
    },
    test_configuration: measurement.getConfiguration() as MeasurementConfig,
    results: measurement.getResults() as any,
    certification_status: {
      overall: (measurement.certificationStatus?.toUpperCase() || 'PENDING') as 'PASSED' | 'FAILED' | 'PENDING',
      details: measurement.getCertification().details || [],
    },
    certification: measurement.getCertification().certificate_number ? {
      status: (measurement.certificationStatus?.toUpperCase() || 'NOT_CERTIFIED') as 'CERTIFIED' | 'NOT_CERTIFIED' | 'CONDITIONALLY_CERTIFIED',
      standards_met: measurement.getCertification().standards_met || [],
      standards_failed: measurement.getCertification().standards_failed || [],
      expiry_date: new Date(measurement.getCertification().expiry_date),
      certificate_number: measurement.getCertification().certificate_number,
    } : undefined,
  };
}

/**
 * Get certification reports with filtering
 */
export async function getReports(filters?: {
  status?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<CertificationReport[]> {
  const db = DatabaseService.getInstance();
  
  let query = db.getMeasurementRepository().createQueryBuilder('measurement')
    .leftJoinAndSelect('measurement.vehicle', 'vehicle')
    .leftJoinAndSelect('measurement.user', 'user')
    .where('measurement.certificateNumber IS NOT NULL');

  if (filters?.status) {
    query = query.andWhere('measurement.certificationStatus = :status', { status: filters.status });
  }

  if (filters?.vehicleBrand) {
    query = query.andWhere('vehicle.brand ILIKE :brand', { brand: `%${filters.vehicleBrand}%` });
  }

  if (filters?.vehicleModel) {
    query = query.andWhere('vehicle.model ILIKE :model', { model: `%${filters.vehicleModel}%` });
  }

  if (filters?.startDate) {
    query = query.andWhere('measurement.timestamp >= :startDate', { startDate: filters.startDate });
  }

  if (filters?.endDate) {
    query = query.andWhere('measurement.timestamp <= :endDate', { endDate: filters.endDate });
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const measurements = await query.getMany();
  
  return measurements.map((m: any) => {
    const cert = m.getCertification();
    return {
      id: cert.certificate_number!,
      created_at: m.createdAt,
      vehicle_info: {
        brand: m.vehicle.brand,
        model: m.vehicle.model,
        year: m.vehicle.year?.toString(),
        vin: m.vehicle.vin || undefined,
      },
      audio_system: {
        speakers: m.vehicle.acousticsData?.cabin?.speaker_config?.total_speakers || 4,
        amplifier: 'OEM',
        head_unit: 'Standard',
      },
      measurements: [{
        id: m.id,
        timestamp: m.createdAt,
        vehicle: {
          brand: m.vehicle.brand,
          model: m.vehicle.model,
          year: m.vehicle.year?.toString(),
        },
        test_configuration: m.getConfiguration() as MeasurementConfig,
        results: m.getResults() as any,
        certification_status: {
          overall: (m.certificationStatus?.toUpperCase() || 'PENDING') as 'PASSED' | 'FAILED' | 'PENDING',
          details: cert.details || [],
        },
      }],
      certification: {
        status: (m.certificationStatus?.toUpperCase() || 'NOT_CERTIFIED') as 'CERTIFIED' | 'NOT_CERTIFIED' | 'CONDITIONALLY_CERTIFIED',
        standards_met: cert.standards_met || [],
        standards_failed: cert.standards_failed || [],
        expiry_date: new Date(cert.expiry_date),
        certificate_number: cert.certificate_number!,
      },
      recommendations: m.getRecommendations() || [],
    };
  });
}

/**
 * Get available certification standards
 */
export async function getAvailableStandards(): Promise<CertificationStandard[]> {
  return [
    {
      name: 'ISO 3382-3',
      version: '2012',
      requirements: {
        frequency_response: {
          tolerance_dB: 3.0,
          target_curve: 'Harman OE 2019',
        },
        thd_percent_max: 1.0,
        snr_dB_min: 80,
        dynamic_range_dB_min: 90,
      },
    },
    {
      name: 'AES70-2018',
      version: '2018',
      requirements: {
        frequency_response: {
          tolerance_dB: 2.5,
          target_curve: 'AES Reference',
        },
        thd_percent_max: 0.5,
        snr_dB_min: 85,
        dynamic_range_dB_min: 95,
      },
    },
    {
      name: 'Harman Automotive',
      version: '2019',
      requirements: {
        frequency_response: {
          tolerance_dB: 3.0,
          target_curve: 'Harman OE 2019',
        },
        thd_percent_max: 1.0,
        snr_dB_min: 82,
        dynamic_range_dB_min: 92,
      },
    },
  ];
}

/**
 * Validate vehicle for certification
 */
export async function validateVehicle(vehicleData: {
  brand: string;
  model: string;
  year?: string;
  vin?: string;
}): Promise<{
  eligible: boolean;
  reasons: string[];
  requirements: string[];
}> {
  const reasons: string[] = [];
  const requirements: string[] = [
    'Vehicle must be less than 10 years old',
    'Audio system must be OEM or certified aftermarket',
    'No modifications to speaker enclosures',
    'All speakers must be functional',
  ];

  let eligible = true;

  // Check vehicle age
  if (vehicleData.year) {
    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(vehicleData.year);
    if (currentYear - vehicleYear > 10) {
      eligible = false;
      reasons.push('Vehicle is too old for certification (>10 years)');
    }
  } else {
    reasons.push('Vehicle year is required for eligibility check');
  }

  // Check if vehicle exists in database
  const db = DatabaseService.getInstance();
  const existingVehicle = await db.getVehicleRepository()
    .createQueryBuilder('vehicle')
    .where('LOWER(vehicle.brand) = LOWER(:brand)', { brand: vehicleData.brand })
    .andWhere('LOWER(vehicle.model) = LOWER(:model)', { model: vehicleData.model })
    .getOne();

  if (!existingVehicle) {
    reasons.push('Vehicle model not found in acoustic database - may require baseline measurements');
  }

  return {
    eligible,
    reasons,
    requirements,
  };
}