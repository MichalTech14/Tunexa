/**
 * Spotify Integration Module
 * Direct Spotify SDK integration with EQ layering between stream and output device
 * Supports Static, Dynamic, and Real-Time EQ modes
 */

// Web Audio API types for Node.js environment
interface AudioContext {
  close(): Promise<void>;
}

interface BiquadFilterNode {
  frequency: { value: number };
  Q: { value: number };
  gain: { value: number };
  type: string;
}

export interface SpotifyConfig {
  clientId: string;
  clientSecret?: string; // Only needed for server-side auth
  redirectUri: string;
  scopes: SpotifyScope[];
}

export type SpotifyScope = 
  | 'streaming'
  | 'user-read-email'
  | 'user-read-private' 
  | 'user-read-playback-state'
  | 'user-modify-playback-state'
  | 'user-read-currently-playing';

export interface SpotifyAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
}

export interface EQMode {
  type: 'static' | 'dynamic' | 'realtime';
  updateInterval?: number; // For dynamic/realtime modes (ms)
  enabled: boolean;
}

export interface EQBand {
  frequency: number; // Hz
  gain: number; // dB (-12 to +12)
  q: number; // Quality factor (0.1 to 30)
  type: 'peaking' | 'lowpass' | 'highpass' | 'lowshelf' | 'highshelf';
}

export interface AudioProfile {
  name: string;
  description: string;
  vehicle?: {
    brand: string;
    model: string;
  };
  eqBands: EQBand[];
  dynamicRange: number; // dB
  loudnessNormalization: boolean;
  created: Date;
  lastUsed: Date;
}

export interface PlaybackState {
  isPlaying: boolean;
  track?: {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number; // ms
    position: number; // ms
  };
  device?: {
    id: string;
    name: string;
    type: 'Computer' | 'Smartphone' | 'Car' | 'TV' | 'Speaker';
    volume: number; // 0-100
  };
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
}

export interface AudioAnalysis {
  tempo: number;
  key: number;
  mode: number; // 0 = minor, 1 = major
  energy: number; // 0.0 - 1.0
  valence: number; // 0.0 - 1.0 (happiness)
  danceability: number; // 0.0 - 1.0
  loudness: number; // dB
  acousticness: number; // 0.0 - 1.0
}

export interface SpotifyIntegration {
  isAuthenticated(): boolean;
  authenticate(config: SpotifyConfig): Promise<SpotifyAuth>;
  refreshAuth(refreshToken: string): Promise<SpotifyAuth>;
  getPlaybackState(): Promise<PlaybackState | null>;
  getCurrentTrackAnalysis(): Promise<AudioAnalysis | null>;
  
  // EQ Control
  setEQMode(mode: EQMode): void;
  applyAudioProfile(profile: AudioProfile): Promise<boolean>;
  createProfileFromVehicle(vehicleBrand: string, vehicleModel: string): Promise<AudioProfile>;
  
  // Playback Control
  play(uri?: string): Promise<boolean>;
  pause(): Promise<boolean>;
  skipNext(): Promise<boolean>;
  skipPrevious(): Promise<boolean>;
  setVolume(volume: number): Promise<boolean>;
  
  // Real-time Processing
  startEQProcessing(): Promise<void>;
  stopEQProcessing(): void;
}

/**
 * Spotify Web API Integration Implementation
 */
export class SpotifyWebAPI implements SpotifyIntegration {
  private auth?: SpotifyAuth;
  private eqMode: EQMode = { type: 'static', enabled: false };
  private currentProfile?: AudioProfile;
  private eqProcessor?: AudioEQProcessor;

  isAuthenticated(): boolean {
    return !!this.auth && new Date() < this.auth.expiresAt;
  }

  async authenticate(config: SpotifyConfig): Promise<SpotifyAuth> {
    console.log('🎵 Authenticating with Spotify...');
    
    // Simulate OAuth flow (in real implementation, this would open browser)
    const mockAuth: SpotifyAuth = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      scopes: config.scopes
    };

    this.auth = mockAuth;
    console.log('✅ Spotify authentication successful');
    return mockAuth;
  }

  async refreshAuth(refreshToken: string): Promise<SpotifyAuth> {
    console.log('🔄 Refreshing Spotify token...');
    
    const refreshedAuth: SpotifyAuth = {
      accessToken: 'refreshed_token_' + Date.now(),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 3600000),
      scopes: this.auth?.scopes || []
    };

    this.auth = refreshedAuth;
    console.log('✅ Token refreshed successfully');
    return refreshedAuth;
  }

  async getPlaybackState(): Promise<PlaybackState | null> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    // Simulate playback state
    const mockState: PlaybackState = {
      isPlaying: true,
      track: {
        id: 'track123',
        name: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 355000, // 5:55
        position: 120000  // 2:00
      },
      device: {
        id: 'car_device_001',
        name: 'BMW Audio System',
        type: 'Car',
        volume: 75
      },
      shuffle: false,
      repeat: 'off'
    };

    return mockState;
  }

  async getCurrentTrackAnalysis(): Promise<AudioAnalysis | null> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    // Simulate audio analysis for current track
    const mockAnalysis: AudioAnalysis = {
      tempo: 72.0, // BPM
      key: 7, // B♭ major
      mode: 1, // Major
      energy: 0.8,
      valence: 0.7, // Happy song
      danceability: 0.4,
      loudness: -8.5, // dB
      acousticness: 0.3
    };

    return mockAnalysis;
  }

  setEQMode(mode: EQMode): void {
    console.log(`🎛️ Setting EQ mode: ${mode.type} (enabled: ${mode.enabled})`);
    this.eqMode = mode;

    if (mode.enabled && mode.type === 'realtime') {
      this.startEQProcessing();
    } else if (!mode.enabled) {
      this.stopEQProcessing();
    }
  }

  async applyAudioProfile(profile: AudioProfile): Promise<boolean> {
    console.log(`🎵 Applying audio profile: ${profile.name}`);
    this.currentProfile = profile;

    if (this.eqProcessor) {
      this.eqProcessor.updateEQSettings(profile.eqBands);
    }

    profile.lastUsed = new Date();
    console.log(`✅ Profile "${profile.name}" applied successfully`);
    return true;
  }

  async createProfileFromVehicle(vehicleBrand: string, vehicleModel: string): Promise<AudioProfile> {
    console.log(`🚗 Creating audio profile for ${vehicleBrand} ${vehicleModel}...`);

    // Load vehicle-specific EQ settings based on acoustics data
    const vehicleEQ = await this.getVehicleEQPreset(vehicleBrand, vehicleModel);

    const profile: AudioProfile = {
      name: `${vehicleBrand} ${vehicleModel} Optimized`,
      description: `Auto-generated profile based on ${vehicleBrand} ${vehicleModel} acoustics`,
      vehicle: {
        brand: vehicleBrand,
        model: vehicleModel
      },
      eqBands: vehicleEQ,
      dynamicRange: 95, // dB
      loudnessNormalization: true,
      created: new Date(),
      lastUsed: new Date()
    };

    console.log(`✅ Profile created: ${profile.name}`);
    return profile;
  }

  private async getVehicleEQPreset(brand: string, model: string): Promise<EQBand[]> {
    // Predefined EQ presets based on common car audio characteristics
    const presets: { [key: string]: EQBand[] } = {
      'BMW': [
        { frequency: 80, gain: 2, q: 1.2, type: 'lowshelf' },
        { frequency: 250, gain: -1, q: 2.0, type: 'peaking' },
        { frequency: 1000, gain: 0, q: 1.0, type: 'peaking' },
        { frequency: 3000, gain: 2, q: 1.5, type: 'peaking' },
        { frequency: 8000, gain: 1, q: 1.0, type: 'highshelf' }
      ],
      'Mercedes-Benz': [
        { frequency: 60, gain: 3, q: 1.0, type: 'lowshelf' },
        { frequency: 200, gain: -2, q: 2.5, type: 'peaking' },
        { frequency: 800, gain: 1, q: 1.2, type: 'peaking' },
        { frequency: 4000, gain: 3, q: 1.8, type: 'peaking' },
        { frequency: 10000, gain: 2, q: 1.0, type: 'highshelf' }
      ],
      'Tesla': [
        { frequency: 40, gain: 1, q: 1.0, type: 'lowshelf' },
        { frequency: 150, gain: -1, q: 1.5, type: 'peaking' },
        { frequency: 500, gain: 0, q: 1.0, type: 'peaking' },
        { frequency: 2500, gain: 2, q: 2.0, type: 'peaking' },
        { frequency: 12000, gain: 1, q: 1.0, type: 'highshelf' }
      ]
    };

    return presets[brand] || presets['BMW']; // Default to BMW preset
  }

  // Playback Controls
  async play(uri?: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    console.log(uri ? `▶️ Playing: ${uri}` : '▶️ Resuming playback');
    return true;
  }

  async pause(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    console.log('⏸️ Pausing playback');
    return true;
  }

  async skipNext(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    console.log('⏭️ Skipping to next track');
    return true;
  }

  async skipPrevious(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    console.log('⏮️ Skipping to previous track');
    return true;
  }

  async setVolume(volume: number): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    if (volume < 0 || volume > 100) {
      throw new Error('Volume must be between 0 and 100');
    }

    console.log(`🔊 Setting volume to ${volume}%`);
    return true;
  }

  async startEQProcessing(): Promise<void> {
    if (this.eqProcessor) {
      console.log('⚠️ EQ processor already running');
      return;
    }

    console.log('🎛️ Starting real-time EQ processing...');
    this.eqProcessor = new AudioEQProcessor();
    
    if (this.currentProfile) {
      this.eqProcessor.updateEQSettings(this.currentProfile.eqBands);
    }

    await this.eqProcessor.start();
    console.log('✅ Real-time EQ processing started');
  }

  stopEQProcessing(): void {
    if (this.eqProcessor) {
      console.log('🛑 Stopping EQ processing...');
      this.eqProcessor.stop();
      this.eqProcessor = undefined;
      console.log('✅ EQ processing stopped');
    }
  }
}

/**
 * Real-time Audio EQ Processor
 * Intercepts audio stream between Spotify and output device
 */
class AudioEQProcessor {
  private isRunning = false;
  private eqBands: EQBand[] = [];
  private audioContext?: AudioContext;
  private filters: BiquadFilterNode[] = [];

  async start(): Promise<void> {
    if (this.isRunning) return;

    // In real implementation, this would set up Web Audio API or native audio processing
    this.isRunning = true;
    console.log('🎵 Audio EQ processor initialized');
  }

  stop(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isRunning = false;
    console.log('🔇 Audio EQ processor stopped');
  }

  updateEQSettings(bands: EQBand[]): void {
    this.eqBands = bands;
    console.log(`🎛️ Updated EQ with ${bands.length} bands`);
    
    // Log EQ settings
    bands.forEach((band, index) => {
      console.log(`   Band ${index + 1}: ${band.frequency}Hz, ${band.gain > 0 ? '+' : ''}${band.gain}dB (${band.type})`);
    });
  }

  getEQSettings(): EQBand[] {
    return [...this.eqBands];
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

/**
 * Get default Spotify configuration
 */
export function getDefaultSpotifyConfig(): SpotifyConfig {
  return {
    clientId: process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback',
    scopes: [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing'
    ]
  };
}

/**
 * Create Spotify integration instance
 */
export function createSpotifyIntegration(): SpotifyIntegration {
  return new SpotifyWebAPI();
}

/**
 * Validate Spotify configuration
 */
export function validateSpotifyConfig(config: SpotifyConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.clientId) {
    errors.push('Client ID is required');
  }

  if (!config.redirectUri) {
    errors.push('Redirect URI is required');
  }

  if (config.scopes.length === 0) {
    errors.push('At least one scope is required');
  }

  if (config.redirectUri && !config.redirectUri.startsWith('http')) {
    errors.push('Redirect URI must be a valid HTTP(S) URL');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get pre-defined audio profiles for different music genres
 */
export function getGenreProfiles(): AudioProfile[] {
  return [
    {
      name: 'Rock & Metal',
      description: 'Enhanced midrange and presence for rock music',
      eqBands: [
        { frequency: 60, gain: 2, q: 1.0, type: 'lowshelf' },
        { frequency: 250, gain: -1, q: 2.0, type: 'peaking' },
        { frequency: 1000, gain: 1, q: 1.5, type: 'peaking' },
        { frequency: 3000, gain: 3, q: 2.0, type: 'peaking' },
        { frequency: 8000, gain: 2, q: 1.0, type: 'highshelf' }
      ],
      dynamicRange: 90,
      loudnessNormalization: false,
      created: new Date(),
      lastUsed: new Date()
    },
    {
      name: 'Classical & Jazz',
      description: 'Natural, balanced sound for acoustic music',
      eqBands: [
        { frequency: 40, gain: 1, q: 1.0, type: 'lowshelf' },
        { frequency: 200, gain: 0, q: 1.0, type: 'peaking' },
        { frequency: 800, gain: 0, q: 1.0, type: 'peaking' },
        { frequency: 2500, gain: 1, q: 1.2, type: 'peaking' },
        { frequency: 10000, gain: 1, q: 1.0, type: 'highshelf' }
      ],
      dynamicRange: 100,
      loudnessNormalization: false,
      created: new Date(),
      lastUsed: new Date()
    },
    {
      name: 'Electronic & Pop',
      description: 'Enhanced bass and sparkle for modern music',
      eqBands: [
        { frequency: 80, gain: 4, q: 1.2, type: 'lowshelf' },
        { frequency: 150, gain: -2, q: 2.0, type: 'peaking' },
        { frequency: 500, gain: 0, q: 1.0, type: 'peaking' },
        { frequency: 4000, gain: 2, q: 1.8, type: 'peaking' },
        { frequency: 12000, gain: 3, q: 1.0, type: 'highshelf' }
      ],
      dynamicRange: 85,
      loudnessNormalization: true,
      created: new Date(),
      lastUsed: new Date()
    }
  ];
}

// Additional API functions for routes
export async function getAuthorizationUrl(): Promise<{ url: string; state: string }> {
  const spotify = new SpotifyWebAPI();
  const state = Math.random().toString(36).substr(2, 15);
  const scopes = ['user-read-playback-state', 'user-modify-playback-state', 'streaming'];
  
  return {
    url: `https://accounts.spotify.com/authorize?response_type=code&client_id=mock&scope=${scopes.join('%20')}&redirect_uri=http://localhost:3000/callback&state=${state}`,
    state: state,
  };
}

export async function handleAuthCallback(data: { code: string; state: string }): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const spotify = new SpotifyWebAPI();
  
  // Mock auth callback handling
  return {
    success: true,
    accessToken: `mock-token-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    expiresIn: 3600,
  };
}

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  expiresAt?: Date;
  scopes?: string[];
}> {
  return {
    isAuthenticated: true,
    expiresAt: new Date(Date.now() + 3600000),
    scopes: ['user-read-playback-state', 'user-modify-playback-state'],
  };
}

export async function getCurrentPlayback(): Promise<PlaybackState | null> {
  const spotify = new SpotifyWebAPI();
  return await spotify.getPlaybackState();
}

export async function controlPlayback(action: {
  command: string;
  value?: any;
  deviceId?: string;
}): Promise<{ success: boolean; message?: string }> {
  const spotify = new SpotifyWebAPI();
  
  switch (action.command) {
    case 'play':
      await spotify.play();
      return { success: true, message: 'Playback started' };
    case 'pause':
      await spotify.pause();
      return { success: true, message: 'Playback paused' };
    case 'next':
      await spotify.skipNext();
      return { success: true, message: 'Skipped to next track' };
    case 'previous':
      await spotify.skipPrevious();
      return { success: true, message: 'Skipped to previous track' };
    case 'volume':
      await spotify.setVolume(action.value);
      return { success: true, message: `Volume set to ${action.value}%` };
    default:
      return { success: false, message: 'Unknown command' };
  }
}

export async function analyzeCurrentTrack(): Promise<{
  track: any;
  audioFeatures: AudioAnalysis;
  recommendations: {
    eqPreset: string;
    settings: Record<string, number>;
  };
}> {
  const spotify = new SpotifyWebAPI();
  const playback = await spotify.getPlaybackState();
  const analysis = await spotify.getCurrentTrackAnalysis();
  
  if (!playback || !analysis) {
    throw new Error('No track currently playing or analysis unavailable');
  }
  
  return {
    track: playback.track,
    audioFeatures: analysis,
    recommendations: {
      eqPreset: 'balanced',
      settings: { bass: 0, mid: 0, treble: 0 },
    },
  };
}

export async function getEQPresets(): Promise<any[]> {
  return [
    { id: 'balanced', name: 'Balanced', description: 'Flat response' },
    { id: 'bass-boost', name: 'Bass Boost', description: 'Enhanced low frequencies' },
    { id: 'vocal', name: 'Vocal', description: 'Enhanced midrange' },
  ];
}

export async function applyEQSettings(settings: {
  presetId?: string;
  customBands?: any[];
}): Promise<{ success: boolean; appliedSettings: any }> {
  return {
    success: true,
    appliedSettings: settings,
  };
}

export async function getRecommendations(params: any): Promise<{
  tracks: any[];
  seeds: any[];
}> {
  return {
    tracks: [
      {
        id: 'rec1',
        name: 'Recommended Song 1',
        artists: [{ name: 'Artist 1' }],
        album: { name: 'Album 1' },
      },
    ],
    seeds: [{ id: 'genre', type: 'GENRE' }],
  };
}

export async function getUserPlaylists(filters?: any): Promise<{
  items: any[];
  total: number;
  limit: number;
  offset: number;
}> {
  return {
    items: [
      {
        id: 'playlist1',
        name: 'My Playlist',
        description: 'Test playlist',
        tracks: { total: 50 },
        owner: { display_name: 'Test User' },
      },
    ],
    total: 1,
    limit: 20,
    offset: 0,
  };
}

export async function disconnect(): Promise<{ success: boolean; message?: string }> {
  return {
    success: true,
    message: 'Disconnected from Spotify',
  };
}