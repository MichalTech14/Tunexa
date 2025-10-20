export interface VehicleSpeakerEntry {
  id: string; // slug of vehicleType-model
  vehicleType: string; // e.g., BMW, Sedan, etc.
  model: string; // e.g., 3 Series
  speakerType: string; // e.g., Bose, Harman, OEM
  speakerCount: number; // number of speakers
  // Optional complementary fields
  basicSystem?: string; // e.g., Základný, OEM
  basicCount?: number; // number of speakers in basic system
  generation?: string; // e.g., G20, Gen 4 (NX)
  years?: string; // e.g., 2020-súčasnosť
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
