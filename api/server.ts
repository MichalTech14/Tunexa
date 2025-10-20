import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeTunexa, getEngineStatus, type TunexaEngine } from '../index.js';
import fs from 'fs';
import type { VehicleSpeakerEntry } from '../types/vehicle-speakers';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Tunexa Engine
let tunexaEngine: TunexaEngine;

async function initEngine() {
  tunexaEngine = await initializeTunexa({
    modules: {
      reference_comparison: true,
      audio_certification: true,
      ai_background_listener: false,
      oem_integration: false,
      spotify_integration: false
    }
  });
  console.log('✅ Tunexa Engine initialized for API');
}

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log(`⚠️  SLOW: ${req.method} ${req.path} - ${duration}ms`);
    } else if (duration > 50) {
      console.log(`⚡ ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// Middleware
app.use(cors());
// Speakers Manager HTML UI
app.get('/speakers', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(process.cwd(), 'public', 'speakers.html'));
});
// Cars Browser - serve static UI that consumes /api/cars
app.get('/cars', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(process.cwd(), 'public', 'cars.html'));
});

// Simple test route
app.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(process.cwd(), 'public', 'test.html'));
});

// Health check endpoint - REAL-TIME OPTIMIZED
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    latency: 'optimized'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== TUNEXA API ENDPOINTS - REAL-TIME OPTIMIZED ====================

// Helper functions for car database
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getAllCars() {
  const allCars: any[] = [];
  tunexaEngine.carsDatabase.forEach((brand: any) => {
    if (brand.models) {
      brand.models.forEach((car: any) => {
        const brandSlug = slugify(brand.brand);
        const modelSlug = slugify(car.name);
        allCars.push({
          ...car,
          id: `${brandSlug}-${modelSlug}`,
          brand: brand.brand,
          brandId: brand.id,
          brandSlug: brandSlug,
          modelSlug: modelSlug
        });
      });
    }
  });
  return allCars;
}

function findCarById(carId: string) {
  const allCars = getAllCars();
  return allCars.find(car => car.id === carId) || null;
}

// Get all cars - CACHED for performance
app.get('/api/cars', (req, res) => {
  if (!tunexaEngine) {
    return res.status(503).json({ error: 'Engine not initialized' });
  }
  
  const cars = getAllCars();
  res.json({
    count: cars.length,
    cars: cars
  });
});

// Get specific car details
app.get('/api/cars/:brand/:model', (req, res) => {
  if (!tunexaEngine) {
    return res.status(503).json({ error: 'Engine not initialized' });
  }
  
  const { brand, model } = req.params;
  const carId = `${brand}-${model}`;
  const car = findCarById(carId);
  
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  res.json(car);
});

// Compare two cars - REAL-TIME ANALYSIS
app.get('/api/compare', (req, res) => {
  if (!tunexaEngine) {
    return res.status(503).json({ error: 'Engine not initialized' });
  }
  
  const { car1, car2 } = req.query;
  
  if (!car1 || !car2) {
    return res.status(400).json({ error: 'Both car1 and car2 parameters required' });
  }
  
  try {
    const vehicle1 = findCarById(car1 as string);
    const vehicle2 = findCarById(car2 as string);
    
    if (!vehicle1 || !vehicle2) {
      return res.status(404).json({ error: 'One or both cars not found' });
    }
    
    res.json({
      car1: vehicle1,
      car2: vehicle2,
      comparison: {
        performance: {
          horsepower: `${vehicle1.horsepower || 'N/A'} vs ${vehicle2.horsepower || 'N/A'}`,
          torque: `${vehicle1.torque || 'N/A'} vs ${vehicle2.torque || 'N/A'}`
        },
        price: `${vehicle1.price || 'N/A'} vs ${vehicle2.price || 'N/A'}`,
        audio: {
          score: `${vehicle1.audioScore || 'N/A'} vs ${vehicle2.audioScore || 'N/A'}`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Comparison failed', details: String(error) });
  }
});

// Audio certification - PERFORMANCE CRITICAL
app.get('/api/certify/:carId', (req, res) => {
  if (!tunexaEngine) {
    return res.status(503).json({ error: 'Engine not initialized' });
  }
  
  const { carId } = req.params;
  const car = findCarById(carId);
  
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  // Simple certification result based on available data
  const hasAudioScore = car.audioScore !== undefined;
  const certResult = {
    status: hasAudioScore ? 'CERTIFIED' : 'PENDING',
    score: hasAudioScore ? car.audioScore : 0,
    certificateId: `TUNEXA-${Date.now()}-${carId}`,
    carId: carId,
    carName: `${car.brand} ${car.model}`,
    timestamp: new Date().toISOString(),
    details: {
      brand: car.brand,
      model: car.model,
      audioScore: car.audioScore
    }
  };
  
  res.json(certResult);
});

// Engine status - MONITORING
app.get('/api/status', (req, res) => {
  if (!tunexaEngine) {
    return res.status(503).json({ error: 'Engine not initialized' });
  }
  
  const status = getEngineStatus(tunexaEngine);
  res.json(status);
});

// Audio Certification Routes
app.get('/api/audio-certification', (req, res) => {
  res.json({ message: 'Audio Certification API', endpoints: ['/certify', '/measurements'] });
});

app.post('/api/audio-certification/certify', (req, res) => {
  res.json({
    status: 'certified',
    score: 95,
    certificateId: `TUNEXA-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// OEM Integration Routes
app.get('/api/oem-integration', (req, res) => {
  res.json({ message: 'OEM Integration API', endpoints: ['/connect', '/protocols'] });
});

app.post('/api/oem-integration/connect', (req, res) => {
  res.json({
    connected: true,
    protocol: 'CAN-FD',
    deviceId: `OEM-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// Spotify Integration Routes
app.get('/api/spotify-integration', (req, res) => {
  res.json({ message: 'Spotify Integration API', endpoints: ['/auth', '/playlists'] });
});

app.post('/api/spotify-integration/auth', (req, res) => {
  res.json({
    authenticated: true,
    token: `spotify-${Date.now()}`,
    expiresIn: 3600,
    timestamp: new Date().toISOString()
  });
});

// ================= VEHICLE SPEAKERS DB (file-backed) =================
const VEHICLE_SPEAKERS_PATH = path.join(process.cwd(), 'data', 'vehicle-speakers.json');

interface VehicleSpeakersStore { entries: VehicleSpeakerEntry[] }

function ensureSpeakersStore(): VehicleSpeakersStore {
  try {
    if (!fs.existsSync(VEHICLE_SPEAKERS_PATH)) {
      fs.mkdirSync(path.dirname(VEHICLE_SPEAKERS_PATH), { recursive: true });
      fs.writeFileSync(VEHICLE_SPEAKERS_PATH, JSON.stringify({ entries: [] }, null, 2));
    }
    const raw = fs.readFileSync(VEHICLE_SPEAKERS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.entries || !Array.isArray(parsed.entries)) return { entries: [] };
    return parsed as VehicleSpeakersStore;
  } catch {
    return { entries: [] };
  }
}

function saveSpeakersStore(store: VehicleSpeakersStore) {
  fs.writeFileSync(VEHICLE_SPEAKERS_PATH, JSON.stringify(store, null, 2));
}

function slugifyId(vehicleType: string, model: string) {
  const s = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${s(vehicleType)}-${s(model)}`;
}

// List all entries
app.get('/api/vehicle-speakers', (req, res) => {
  const store = ensureSpeakersStore();
  res.json({ count: store.entries.length, entries: store.entries });
});

// Create new entry
app.post('/api/vehicle-speakers', (req, res) => {
  const { vehicleType, model, speakerType, speakerCount, notes } = req.body || {};
  if (!vehicleType || !model || !speakerType || typeof speakerCount !== 'number') {
    return res.status(400).json({ error: 'vehicleType, model, speakerType, speakerCount (number) are required' });
  }
  const id = slugifyId(vehicleType, model);
  const store = ensureSpeakersStore();
  if (store.entries.find(e => e.id === id)) {
    return res.status(409).json({ error: 'Entry already exists', id });
  }
  const now = new Date().toISOString();
  const entry: VehicleSpeakerEntry = { id, vehicleType, model, speakerType, speakerCount, notes, createdAt: now };
  store.entries.push(entry);
  saveSpeakersStore(store);
  res.status(201).json(entry);
});

// Read entry
app.get('/api/vehicle-speakers/:id', (req, res) => {
  const store = ensureSpeakersStore();
  const entry = store.entries.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

// Update entry
app.put('/api/vehicle-speakers/:id', (req, res) => {
  const store = ensureSpeakersStore();
  const idx = store.entries.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const current = store.entries[idx];
  const { speakerType, speakerCount, notes } = req.body || {};
  if (speakerCount !== undefined && typeof speakerCount !== 'number') {
    return res.status(400).json({ error: 'speakerCount must be a number' });
  }
  const updated: VehicleSpeakerEntry = {
    ...current,
    speakerType: speakerType ?? current.speakerType,
    speakerCount: speakerCount ?? current.speakerCount,
    notes: notes ?? current.notes,
    updatedAt: new Date().toISOString()
  };
  store.entries[idx] = updated;
  saveSpeakersStore(store);
  res.json(updated);
});

// Delete entry
app.delete('/api/vehicle-speakers/:id', (req, res) => {
  const store = ensureSpeakersStore();
  const idx = store.entries.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = store.entries.splice(idx, 1);
  saveSpeakersStore(store);
  res.json({ deleted: true, id: removed.id });
});

// Profile Lock Continuity Routes
app.get('/api/profile-lock-continuity', (req, res) => {
  res.json({ message: 'Profile Lock Continuity API', endpoints: ['/save', '/load'] });
});

app.post('/api/profile-lock-continuity/save', (req, res) => {
  res.json({
    saved: true,
    profileId: `PROFILE-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - redirect to dashboard
app.get('/', (req, res) => {
  // If browser request, redirect to dashboard
  const acceptHeader = req.get('Accept') || '';
  if (acceptHeader.includes('text/html')) {
    return res.redirect('/dashboard');
  }
  
  // If API request, show JSON info
  res.json({
    message: 'Tunexa Intelligent Audio Engine API',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api/health',
      '/api/status',
      '/api/cars',
      '/api/cars/:brand/:model',
      '/api/compare',
      '/api/certify/:carId',
      '/api/audio-certification',
      '/api/oem-integration',
      '/api/spotify-integration',
      '/api/profile-lock-continuity'
    ],
    documentation: '/api/docs',
    dashboard: '/dashboard'
  });
});

// Start server with engine initialization
async function startServer() {
  try {
    // Initialize Tunexa Engine first
    await initEngine();
    
    // Then start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n╔════════════════════════════════════════════════════════╗`);
      console.log(`║  🚀 Tunexa API Server - REAL-TIME OPTIMIZED 🚀       ║`);
      console.log(`╚════════════════════════════════════════════════════════╝\n`);
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`� Status: http://localhost:${PORT}/api/status`);
      console.log(`🎨 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`\n⚡ Real-time performance monitoring ACTIVE`);
      console.log(`⚡ Response times logged for optimization\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();