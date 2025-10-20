/**
 * Profile Lock & Device Continuity Module
 * Device = unique identifier (MAC + brand + type)
 * Tunexa remembers last profile for each device
 */

export interface DeviceIdentifier {
  macAddress: string;
  brand: string;
  type: DeviceType;
  model?: string;
  name: string;
}

export type DeviceType = 
  | 'smartphone'
  | 'tablet'
  | 'laptop'
  | 'desktop'
  | 'car_system'
  | 'bluetooth_speaker'
  | 'headphones'
  | 'smart_tv'
  | 'gaming_console'
  | 'smartwatch';

export interface UserProfile {
  id: string;
  name: string;
  description?: string;
  created: Date;
  lastUsed: Date;
  
  // Audio preferences
  audioSettings: {
    masterVolume: number; // 0-100
    bassLevel: number; // -9 to +9
    trebleLevel: number; // -9 to +9
    balance: number; // -100 (left) to +100 (right)
    fade: number; // -100 (rear) to +100 (front)
    loudnessCompensation: boolean;
  };
  
  // EQ settings (if available)
  eqSettings?: {
    enabled: boolean;
    preset: string;
    customBands?: Array<{
      frequency: number;
      gain: number;
      q: number;
    }>;
  };
  
  // Vehicle-specific settings
  vehicleSettings?: {
    timeAlignment: { [speaker: string]: number }; // ms delay
    crossovers: { [speaker: string]: { frequency: number; slope: number } };
    speakerLevels: { [speaker: string]: number }; // dB adjustment
  };
  
  // Usage statistics
  usage: {
    timesUsed: number;
    totalDuration: number; // minutes
    favoriteGenres: string[];
    lastVehicle?: {
      brand: string;
      model: string;
    };
  };
}

export interface DeviceProfileBinding {
  deviceId: string; // Generated from DeviceIdentifier
  profileId: string;
  boundAt: Date;
  lastUsed: Date;
  autoSwitch: boolean; // Automatically switch to this profile when device connects
  lockLevel: 'soft' | 'medium' | 'hard';
}

export type LockLevel = 'soft' | 'medium' | 'hard';

export interface ActivityLogEntry {
  timestamp: Date;
  type: string;
  details: any;
  source: 'user' | 'system' | 'auto';
}

export interface DeviceSession {
  sessionId: string;
  deviceId: string;
  profileId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  isActive: boolean;
  activitiesLog: ActivityLogEntry[];
}

export interface SessionInfo extends DeviceSession {}

export interface SessionActivity {
  timestamp: Date;
  type: 'profile_switch' | 'volume_change' | 'eq_adjustment' | 'playback_start' | 'playback_stop';
  details: { [key: string]: any };
  source: 'user' | 'auto' | 'system';
}

export interface DeviceUsageStats {
  totalSessions: number;
  totalDuration: number; // milliseconds
  averageSessionDuration: number; // milliseconds
  mostUsedProfile?: {
    profileId: string;
    usage: number;
  };
}

export interface ContinuitySettings {
  enableAutoProfileSwitch: boolean;
  enableCrossFade: boolean; // Smooth transition between profiles
  crossFadeDuration: number; // seconds
  enableProfileSuggestions: boolean;
  rememberLastPosition: boolean; // Resume playback position
  syncAcrossDevices: boolean;
}

export interface ProfileLockManager {
  // Device Management
  registerDevice(device: DeviceIdentifier): string; // returns deviceId
  getDevice(deviceId: string): DeviceIdentifier | null;
  updateDevice(deviceId: string, updates: Partial<DeviceIdentifier>): boolean;
  listDevices(): DeviceIdentifier[];
  removeDevice(deviceId: string): boolean;
  
  // Profile Management  
  createProfile(profile: Omit<UserProfile, 'id' | 'created' | 'lastUsed'>): UserProfile;
  getProfile(profileId: string): UserProfile | undefined;
  updateProfile(profileId: string, updates: Partial<UserProfile>): boolean;
  deleteProfile(profileId: string): boolean;
  listProfiles(): UserProfile[];
  
  // Device-Profile Binding
  bindProfileToDevice(deviceId: string, profileId: string, lockLevel?: LockLevel): DeviceProfileBinding;
  unbindProfileFromDevice(deviceId: string): boolean;
  getDeviceProfile(deviceId: string): string | null; // returns profileId
  switchProfile(deviceId: string, newProfileId: string, source: 'user' | 'auto'): boolean;
  
  // Session Management
  startSession(deviceId: string, profileId: string): DeviceSession;
  endSession(sessionId: string): DeviceSession | null;
  getCurrentSession(deviceId: string): DeviceSession | null;
  getSessionHistory(deviceId: string, limit?: number): DeviceSession[];
  
  // Continuity Features
  getContinuitySettings(): ContinuitySettings;
  updateContinuitySettings(updates: Partial<ContinuitySettings>): void;
  suggestProfile(deviceId: string): string | null; // returns suggested profileId
}

/**
 * Profile Lock & Continuity Implementation
 */
export class ProfileContinuityManager implements ProfileLockManager {
  private devices = new Map<string, DeviceIdentifier>();
  private profiles = new Map<string, UserProfile>();
  private bindings = new Map<string, DeviceProfileBinding>();
  private sessions = new Map<string, DeviceSession>();
  private continuitySettings: ContinuitySettings;

  constructor() {
    this.continuitySettings = {
      enableAutoProfileSwitch: true,
      enableCrossFade: true,
      crossFadeDuration: 2.0,
      enableProfileSuggestions: true,
      rememberLastPosition: true,
      syncAcrossDevices: false
    };
  }

  // Device Management
  registerDevice(device: DeviceIdentifier): string {
    const deviceId = this.generateDeviceId(device);
    
    if (this.devices.has(deviceId)) {
      console.log(`📱 Device already registered: ${device.name}`);
      return deviceId;
    }

    this.devices.set(deviceId, { ...device });
    console.log(`📱 Registered new device: ${device.name} (${device.type})`);
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   MAC: ${device.macAddress}`);
    
    return deviceId;
  }

  getDevice(deviceId: string): DeviceIdentifier | null {
    return this.devices.get(deviceId) || null;
  }

  updateDevice(deviceId: string, updates: Partial<DeviceIdentifier>): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    this.devices.set(deviceId, { ...device, ...updates });
    console.log(`📱 Updated device: ${deviceId}`);
    return true;
  }

  listDevices(): DeviceIdentifier[] {
    return Array.from(this.devices.values());
  }

  removeDevice(deviceId: string): boolean {
    const removed = this.devices.delete(deviceId);
    if (removed) {
      // Also remove bindings and sessions
      this.bindings.delete(deviceId);
      // Remove sessions for this device
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.deviceId === deviceId) {
          this.sessions.delete(sessionId);
        }
      }
      console.log(`📱 Removed device: ${deviceId}`);
    }
    return removed;
  }

  // Profile Management
  createProfile(profile: Omit<UserProfile, 'id' | 'created' | 'lastUsed'>): UserProfile {
    const newProfile: UserProfile = {
      ...profile,
      id: this.generateProfileId(),
      created: new Date(),
      lastUsed: new Date()
    };

    this.profiles.set(newProfile.id, newProfile);
    console.log(`👤 Created profile: ${newProfile.name} (${newProfile.id})`);
    return newProfile;
  }

  getProfile(profileId: string): UserProfile | undefined {
    return this.profiles.get(profileId);
  }

  updateProfile(profileId: string, updates: Partial<UserProfile>): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    const updatedProfile = { ...profile, ...updates, lastUsed: new Date() };
    this.profiles.set(profileId, updatedProfile);
    console.log(`👤 Updated profile: ${profile.name}`);
    return true;
  }

  deleteProfile(profileId: string): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    this.profiles.delete(profileId);
    
    // Remove all bindings to this profile
    for (const [deviceId, binding] of this.bindings.entries()) {
      if (binding.profileId === profileId) {
        this.bindings.delete(deviceId);
      }
    }

    console.log(`👤 Deleted profile: ${profile.name}`);
    return true;
  }

  listProfiles(): UserProfile[] {
    return Array.from(this.profiles.values())
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  // Device-Profile Binding
  bindProfileToDevice(deviceId: string, profileId: string, lockLevel: LockLevel = 'medium'): DeviceProfileBinding {
    const device = this.devices.get(deviceId);
    const profile = this.profiles.get(profileId);

    if (!device) throw new Error(`Device not found: ${deviceId}`);
    if (!profile) throw new Error(`Profile not found: ${profileId}`);

    const binding: DeviceProfileBinding = {
      deviceId,
      profileId,
      boundAt: new Date(),
      lastUsed: new Date(),
      autoSwitch: true,
      lockLevel
    };

    this.bindings.set(deviceId, binding);
    
    console.log(`🔒 Bound profile "${profile.name}" to device "${device.name}"`);
    console.log(`   Lock level: ${lockLevel}`);
    console.log(`   Auto switch: ${binding.autoSwitch}`);
    
    return binding;
  }

  unbindProfileFromDevice(deviceId: string): boolean {
    const binding = this.bindings.get(deviceId);
    if (!binding) return false;

    this.bindings.delete(deviceId);
    
    const device = this.devices.get(deviceId);
    console.log(`🔓 Unbound profile from device: ${device?.name || deviceId}`);
    return true;
  }

  getDeviceProfile(deviceId: string): string | null {
    const binding = this.bindings.get(deviceId);
    return binding?.profileId || null;
  }

  switchProfile(deviceId: string, newProfileId: string, source: 'user' | 'auto' = 'user'): boolean {
    const device = this.devices.get(deviceId);
    const newProfile = this.profiles.get(newProfileId);
    const currentBinding = this.bindings.get(deviceId);

    if (!device) {
      console.error(`❌ Device not found: ${deviceId}`);
      return false;
    }
    
    if (!newProfile) {
      console.error(`❌ Profile not found: ${newProfileId}`);
      return false;
    }

    // Check lock level restrictions
    if (currentBinding) {
      switch (currentBinding.lockLevel) {
        case 'hard':
          console.warn(`🔒 Profile switch denied: Hard lock on device ${device.name}`);
          return false;
        case 'medium':
          if (source === 'auto') {
            console.warn(`🔒 Auto profile switch denied: Medium lock on device ${device.name}`);
            return false;
          }
          break;
        case 'soft':
          // Allow all switches
          break;
      }
    }

    // Update binding
    const newBinding: DeviceProfileBinding = {
      deviceId,
      profileId: newProfileId,
      boundAt: currentBinding?.boundAt || new Date(),
      lastUsed: new Date(),
      autoSwitch: currentBinding?.autoSwitch ?? true,
      lockLevel: currentBinding?.lockLevel || 'medium'
    };

    this.bindings.set(deviceId, newBinding);

    // Update profile usage
    newProfile.lastUsed = new Date();
    newProfile.usage.timesUsed++;

    // Log activity in current session
    const currentSession = this.getCurrentSession(deviceId);
    if (currentSession) {
      currentSession.activitiesLog.push({
        timestamp: new Date(),
        type: 'profile_switch',
        details: { 
          fromProfile: currentBinding?.profileId,
          toProfile: newProfileId,
          lockLevel: newBinding.lockLevel
        },
        source
      });
    }

    console.log(`🔄 Switched to profile "${newProfile.name}" on device "${device.name}"`);
    console.log(`   Source: ${source}`);
    console.log(`   Lock level: ${newBinding.lockLevel}`);

    return true;
  }

  // Session Management
  startSession(deviceId: string, profileId: string): DeviceSession {
    const device = this.devices.get(deviceId);
    const profile = this.profiles.get(profileId);

    if (!device) throw new Error(`Device not found: ${deviceId}`);
    if (!profile) throw new Error(`Profile not found: ${profileId}`);

    // End any existing session for this device
    const existingSession = this.getCurrentSession(deviceId);
    if (existingSession) {
      this.endSession(existingSession.sessionId);
    }

    const session: DeviceSession = {
      sessionId: this.generateSessionId(),
      deviceId,
      profileId,
      startTime: new Date(),
      isActive: true,
      activitiesLog: []
    };

    this.sessions.set(session.sessionId, session);
    console.log(`🎬 Started session: ${session.sessionId}`);
    console.log(`   Device: ${device.name}`);
    console.log(`   Profile: ${profile.name}`);

    return session;
  }

  endSession(sessionId: string): DeviceSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    if (session.endTime) return null;

    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime(); // milliseconds
    session.isActive = false;

    // Add end activity
    session.activitiesLog.push({
      timestamp: session.endTime,
      type: 'playback_stop',
      details: { duration: session.duration },
      source: 'system'
    });

    // Update profile usage statistics
    const profile = this.profiles.get(session.profileId);
    if (profile) {
      profile.usage.timesUsed += 1;
      if (session.duration) {
        profile.usage.totalDuration += session.duration;
      }
      profile.lastUsed = session.endTime;
    }

    console.log(`🏁 Ended session: ${sessionId} (${Math.round(session.duration / 1000)}s)`);
    return session;
  }

  getCurrentSession(deviceId: string): DeviceSession | null {
    for (const session of this.sessions.values()) {
      if (session.deviceId === deviceId && !session.endTime) {
        return session;
      }
    }
    return null;
  }

  getSessionHistory(deviceId: string, limit: number = 10): DeviceSession[] {
    const deviceSessions = Array.from(this.sessions.values())
      .filter(session => session.deviceId === deviceId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);

    return deviceSessions;
  }

  // Continuity Features
  getContinuitySettings(): ContinuitySettings {
    return { ...this.continuitySettings };
  }

  updateContinuitySettings(updates: Partial<ContinuitySettings>): void {
    this.continuitySettings = { ...this.continuitySettings, ...updates };
    console.log('⚙️ Updated continuity settings:', Object.keys(updates));
  }

  suggestProfile(deviceId: string): string | null {
    if (!this.continuitySettings.enableProfileSuggestions) {
      return null;
    }

    const device = this.devices.get(deviceId);
    if (!device) return null;

    // Get recent sessions for this device
    const recentSessions = this.getSessionHistory(deviceId, 5);
    
    if (recentSessions.length === 0) {
      // No history, suggest most used profile
      const profiles = this.listProfiles();
      return profiles.length > 0 ? profiles[0].id : null;
    }

    // Suggest most frequently used profile for this device
    const profileUsage = new Map<string, number>();
    
    for (const session of recentSessions) {
      const count = profileUsage.get(session.profileId) || 0;
      profileUsage.set(session.profileId, count + 1);
    }

    const mostUsedProfileId = Array.from(profileUsage.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (mostUsedProfileId) {
      const profile = this.profiles.get(mostUsedProfileId);
      console.log(`💡 Suggesting profile "${profile?.name}" for device "${device.name}"`);
    }

    return mostUsedProfileId || null;
  }

  // Helper methods
  private generateDeviceId(device: DeviceIdentifier): string {
    const hash = this.simpleHash(device.macAddress + device.brand + device.type);
    return `dev_${hash}`;
  }

  private generateProfileId(): string {
    return `prof_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Statistics and Analytics
  getDeviceStatistics(deviceId: string): {
    totalSessions: number;
    totalDuration: number;
    mostUsedProfile: string | null;
    averageSessionDuration: number;
  } | null {
    const sessions = this.getSessionHistory(deviceId, 1000); // Get all sessions
    
    if (sessions.length === 0) {
      return null;
    }

    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const profileUsage = new Map<string, number>();

    sessions.forEach(session => {
      const count = profileUsage.get(session.profileId) || 0;
      profileUsage.set(session.profileId, count + 1);
    });

    const mostUsedProfileId = Array.from(profileUsage.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    return {
      totalSessions: sessions.length,
      totalDuration,
      mostUsedProfile: mostUsedProfileId,
      averageSessionDuration: totalDuration / sessions.length
    };
  }

  /**
   * Get device info by ID (alias for getDevice)
   */
  getDeviceInfo(deviceId: string): DeviceIdentifier | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get device binding info
   */
  private getDeviceBinding(deviceId: string): DeviceProfileBinding | undefined {
    return this.bindings.get(deviceId);
  }

  /**
   * Check if profile switch is allowed based on lock level
   */
  canSwitchProfile(deviceId: string, newProfileId: string): boolean {
    const binding = this.getDeviceBinding(deviceId);
    if (!binding) {
      return false; // No binding = no switch allowed
    }

    switch (binding.lockLevel) {
      case 'soft':
      case 'medium':
        return true; // Manual switch allowed
      case 'hard':
        return false; // No switch allowed
      default:
        return false;
    }
  }

  /**
   * Get device usage statistics (interface compatible version)
   */
  getDeviceUsageStats(deviceId: string): DeviceUsageStats {
    const sessions = this.getSessionHistory(deviceId, 1000); // Get all sessions
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageSessionDuration: 0,
        mostUsedProfile: undefined
      };
    }

    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const profileUsage = new Map<string, number>();

    sessions.forEach(session => {
      const count = profileUsage.get(session.profileId) || 0;
      profileUsage.set(session.profileId, count + 1);
    });

    // Find most used profile
    let mostUsedProfile: { profileId: string; usage: number } | undefined;
    let maxUsage = 0;
    profileUsage.forEach((usage, profileId) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedProfile = { profileId, usage };
      }
    });

    return {
      totalSessions: sessions.length,
      totalDuration,
      averageSessionDuration: totalDuration / sessions.length,
      mostUsedProfile
    };
  }
}

/**
 * Create default user profile
 */
export function createDefaultProfile(name: string): Omit<UserProfile, 'id' | 'created' | 'lastUsed'> {
  return {
    name,
    description: 'Default audio profile',
    audioSettings: {
      masterVolume: 75,
      bassLevel: 0,
      trebleLevel: 0,
      balance: 0,
      fade: 0,
      loudnessCompensation: false
    },
    eqSettings: {
      enabled: false,
      preset: 'flat'
    },
    usage: {
      timesUsed: 0,
      totalDuration: 0,
      favoriteGenres: []
    }
  };
}

/**
 * Detect device type from user agent or device info
 */
export function detectDeviceType(userAgent: string, deviceInfo?: any): DeviceType {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'smartphone';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  if (ua.includes('smart-tv') || ua.includes('tv')) {
    return 'smart_tv';
  }
  if (ua.includes('car') || deviceInfo?.type === 'automotive') {
    return 'car_system';
  }
  
  return 'desktop'; // Default fallback
}

/**
 * Generate MAC address for testing (real implementation would get actual MAC)
 */
export function generateMockMACAddress(): string {
  const hexDigits = '0123456789ABCDEF';
  let mac = '';
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      mac += hexDigits[Math.floor(Math.random() * 16)];
    }
    if (i < 5) mac += ':';
  }
  
  return mac;
}

// Additional API functions needed by routes
export async function getDevices(filters?: any): Promise<DeviceIdentifier[]> {
  // Mock implementation for now
  const manager = new ProfileContinuityManager();
  return manager.listDevices().filter((device: DeviceIdentifier) => {
    if (filters?.type && device.type !== filters.type) return false;
    if (filters?.brand && !device.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
    return true;
  });
}

export async function getDeviceById(deviceId: string): Promise<DeviceIdentifier | null> {
  const manager = new ProfileContinuityManager();
  return manager.getDevice(deviceId);
}

export async function blockDevice(deviceId: string): Promise<{ success: boolean; message?: string }> {
  // Mock implementation
  return { success: true, message: 'Device blocked successfully' };
}

export async function syncProfile(data: {
  deviceId: string;
  profileId: string;
  settings: any;
}): Promise<{
  success: boolean;
  syncedAt: Date;
  conflicts?: any[];
}> {
  // Mock profile sync
  return {
    success: true,
    syncedAt: new Date(),
    conflicts: [],
  };
}

export async function configureLock(config: {
  userId: string;
  lockType: string;
  settings: any;
}): Promise<{
  success: boolean;
  lockId: string;
  expiresAt?: Date;
}> {
  return {
    success: true,
    lockId: `lock-${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
}

export async function getLockStatus(userId: string): Promise<{
  isLocked: boolean;
  lockType?: string;
  lockedAt?: Date;
  expiresAt?: Date;
  reason?: string;
}> {
  return {
    isLocked: false,
    lockType: undefined,
    lockedAt: undefined,
    expiresAt: undefined,
    reason: undefined,
  };
}

export async function getSessions(filters?: any): Promise<SessionInfo[]> {
  // Mock sessions
  return [];
}

export async function terminateSession(sessionId: string): Promise<{ success: boolean; message?: string }> {
  return { success: true, message: 'Session terminated successfully' };
}

export async function getUsageStatistics(filters: {
  userId?: string;
  deviceId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  mostActiveDevice?: string;
  mostUsedProfile?: string;
  dailyStats: Array<{
    date: string;
    sessions: number;
    duration: number;
  }>;
}> {
  return {
    totalSessions: 0,
    totalDuration: 0,
    averageSessionDuration: 0,
    mostActiveDevice: undefined,
    mostUsedProfile: undefined,
    dailyStats: [],
  };
}