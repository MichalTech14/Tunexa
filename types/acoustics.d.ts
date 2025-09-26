/**
 * TypeScript type definitions for vehicle acoustics data
 * Corresponds to acoustics/schema.json
 */

export interface AcousticsMetadata {
  name: string;
  brand?: string;
  model?: string;
  years?: string;
  source?: string;
  measured_by?: string;
  measured_at?: string;
  notes?: string;
}

export interface Cabin {
  type?: 'sedan' | 'hatchback' | 'suv' | 'coupe' | 'cabrio' | 'pickup' | 'van';
  volume_l?: number;
}

export interface NVH {
  idle_dBA?: number;
  speed_100kmh_dBA?: number;
  noise_profile?: Array<'road' | 'wind' | 'engine' | 'hvac' | 'electrical'>;
}

export interface RT60Measurements {
  '31.5'?: number;
  '63'?: number;
  '125'?: number;
  '250'?: number;
  '500'?: number;
  '1000'?: number;
  '2000'?: number;
  '4000'?: number;
  '8000'?: number;
  '16000'?: number;
}

export interface ResonanceMode {
  freq_Hz: number;
  q: number;
}

export interface MicPosition {
  name: string;
  x: number;
  y: number;
  z: number;
}

export interface IRAsset {
  channel: string;
  url: string;
}

export interface FrequencyResponse {
  '31.5'?: number;
  '63'?: number;
  '125'?: number;
  '250'?: number;
  '500'?: number;
  '1000'?: number;
  '2000'?: number;
  '4000'?: number;
  '8000'?: number;
  '16000'?: number;
}

export interface EQFilter {
  type: 'peaking' | 'shelf_high' | 'shelf_low' | 'highpass' | 'lowpass';
  f_Hz: number;
  q: number;
  gain_dB: number;
}

export interface TimeAlignment {
  FL?: number;
  FR?: number;
  RL?: number;
  RR?: number;
  SUB?: number;
  C?: number;
  SL?: number;
  SR?: number;
}

export interface CrossoverFilter {
  type: 'LPF' | 'HPF' | 'BPF';
  f_Hz: number;
  slope_dB_oct: 6 | 12 | 18 | 24 | 48;
}

export interface Crossovers {
  [channel: string]: CrossoverFilter;
}

export interface RecommendedTuning {
  eq?: EQFilter[];
  time_alignment_ms?: TimeAlignment;
  crossovers?: Crossovers;
}

export interface VehicleAcoustics {
  version: number;
  metadata: AcousticsMetadata;
  cabin?: Cabin;
  nvh?: NVH;
  rt60_ms?: RT60Measurements;
  resonance_modes?: ResonanceMode[];
  target_curve?: string;
  mic_positions?: MicPosition[];
  ir_assets?: IRAsset[];
  measured_fr_bands?: FrequencyResponse;
  recommended_tuning?: RecommendedTuning;
}

/**
 * Extended car model interface that includes acoustics reference
 * Extends the existing CarModel interface from reference_car_comparison
 */
export interface CarModelWithAcoustics {
  name: string;
  types: string[];
  audio: {
    speakers: number;
    system: string;
    locations: string[];
  };
  acoustics?: string; // Path to acoustics JSON file
}

export interface CarBrandWithAcoustics {
  brand: string;
  models: CarModelWithAcoustics[];
}

export type CarsDataWithAcoustics = CarBrandWithAcoustics[];