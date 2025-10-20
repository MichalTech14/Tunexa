export interface VehicleSpeakerEntry {
  id: string; // slug of vehicleType-model
  vehicleType: string; // e.g., BMW, Sedan, etc.
  model: string; // e.g., 3 Series
  speakerType: string; // e.g., Bose, Harman, OEM
  speakerCount: number; // number of speakers
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
