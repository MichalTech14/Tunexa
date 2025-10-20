# 🔒 Profile Lock & Device Continuity Module

**Device = unique identifier (MAC + brand + type)**  
**Tunexa remembers last profile for each device**

## Koncept

### 📱 Device Identification
```
Device ID = hash(MAC Address + Brand + Device Type)
```

**Každé zariadenie má jedinečný identifikátor:**
- **MAC Address** - hardvérový identifikátor
- **Brand** - výrobca zariadenia (Apple, Samsung, BMW)
- **Device Type** - typ zariadenia (smartphone, car_system, tablet)
- **Model** - konkrétny model (iPhone 15, Galaxy S24, BMW iDrive)

### 👤 Profile Binding Rules

**Pri opätovnom pripojení:**
- ✅ **Použije sa výhradne posledný profil**
- ❌ **Neprepína sa automaticky na iný, ani podobný**
- 🔐 **Zmena profilu len na výslovný pokyn používateľa**

### 🔒 Lock Levels

#### **Soft Lock**
- ✅ User môže ručne prepnúť profil
- ✅ Auto-switch povolený (ak enabled)
- 💡 Profile suggestions zobrazené

#### **Medium Lock** (default)
- ✅ User môže ručne prepnúť profil  
- ❌ Auto-switch zakázaný
- 💡 Profile suggestions zobrazené

#### **Hard Lock**
- ❌ Žiadne prepínanie profilov
- ❌ Auto-switch zakázaný
- ❌ Profile suggestions skryté

## API Usage

```typescript
import { ProfileContinuityManager, createDefaultProfile } from './index.js';

const manager = new ProfileContinuityManager();

// Register device
const deviceId = manager.registerDevice({
  macAddress: '00:1B:44:11:3A:B7',
  brand: 'Apple',
  type: 'smartphone',
  model: 'iPhone 15 Pro',
  name: 'John\'s iPhone'
});

// Create user profile
const profile = manager.createProfile(createDefaultProfile('John\'s Car Profile'));

// Bind profile to device with lock level
const binding = manager.bindProfileToDevice(deviceId, profile.id, 'medium');

// Start audio session
const session = manager.startSession(deviceId, profile.id);

// Later reconnection - automatically use bound profile
const boundProfileId = manager.getDeviceProfile(deviceId);
// Returns: profile.id (same profile as before)
```

## Device Session Management

### 🎬 Session Lifecycle
```typescript
// Start session
const session = manager.startSession(deviceId, profileId);

// Track activities during session
session.activitiesLog = [
  { type: 'playback_start', timestamp: Date, source: 'user' },
  { type: 'volume_change', details: { from: 70, to: 85 } },
  { type: 'eq_adjustment', details: { band: '1kHz', gain: +2 } },
  { type: 'profile_switch', details: { to: 'Rock Profile' } },
  { type: 'playback_stop', timestamp: Date, source: 'system' }
];

// End session
manager.endSession(session.sessionId);
```

### 📊 Session Analytics
- **Total duration** tracked per device
- **Most used profile** statistics  
- **Average session length**
- **Activity patterns** analysis

## Continuity Features

### ⚙️ Cross-Device Sync
```typescript
const settings = manager.getContinuitySettings();
settings = {
  enableAutoProfileSwitch: true,     // Auto-switch when device connects
  enableCrossFade: true,            // Smooth audio transitions
  crossFadeDuration: 2.0,           // seconds
  enableProfileSuggestions: true,    // Show suggested profiles
  rememberLastPosition: true,        // Resume playback position
  syncAcrossDevices: false          // Sync profiles across devices
};
```

### 💡 Smart Profile Suggestions
- **Usage-based** - most frequently used profile on device
- **Time-based** - different profiles for morning/evening
- **Location-based** - work vs home profiles
- **Context-aware** - driving vs parked profiles

## Profile Structure

```typescript
interface UserProfile {
  id: string;
  name: string;
  
  // Audio Settings
  audioSettings: {
    masterVolume: number;     // 0-100
    bassLevel: number;        // -9 to +9  
    trebleLevel: number;      // -9 to +9
    balance: number;          // -100 (left) to +100 (right)
    fade: number;            // -100 (rear) to +100 (front)
    loudnessCompensation: boolean;
  };
  
  // EQ Settings
  eqSettings?: {
    enabled: boolean;
    preset: string;          // 'flat', 'rock', 'jazz', 'custom'
    customBands?: EQBand[];
  };
  
  // Vehicle-Specific
  vehicleSettings?: {
    timeAlignment: { FL: 0, FR: 2, RL: 8, RR: 6 };    // ms delays
    crossovers: { [speaker]: { frequency: Hz, slope: dB/oct } };
    speakerLevels: { [speaker]: dB_adjustment };
  };
  
  // Usage Stats
  usage: {
    timesUsed: number;
    totalDuration: number;    // minutes
    favoriteGenres: string[];
    lastVehicle?: { brand, model };
  };
}
```

## Device Types Support

| Device Type | Auto-Detection | MAC Available | Profile Binding |
|-------------|----------------|---------------|-----------------|
| `smartphone` | ✅ User-Agent | ✅ WiFi/BT | ✅ Full Support |
| `car_system` | ✅ OEM Integration | ✅ Built-in | ✅ Full Support |
| `tablet` | ✅ User-Agent | ✅ WiFi/BT | ✅ Full Support |
| `laptop` | ✅ User-Agent | ✅ WiFi/BT | ✅ Full Support |
| `bluetooth_speaker` | ⚠️ Manual | ✅ Bluetooth | ✅ Limited |
| `headphones` | ⚠️ Manual | ✅ Bluetooth | ✅ Limited |
| `smart_tv` | ✅ User-Agent | ⚠️ Varies | ⚠️ Limited |

## Security & Privacy

### 🔐 Data Protection
- **MAC addresses** hashed in storage
- **Profile data** encrypted at rest  
- **Session logs** retention limits
- **No personal data** in device identifiers

### 🚫 Lock Enforcement
- **Hard locks** prevent unauthorized profile changes
- **Admin override** available for device management
- **Temporary unlock** for troubleshooting
- **Audit trail** for all profile switches

## Use Cases

### 🚗 **Family Car**
- **Dad's iPhone** → "Bass Boost" profile (hard lock)
- **Mom's Android** → "Classical" profile (medium lock)  
- **Teen's Phone** → "Pop/EDM" profile (soft lock)

### 🏢 **Company Vehicle**  
- **Driver 1** → "Professional" profile (medium lock)
- **Driver 2** → "Professional" profile (medium lock)
- **Guest Device** → "Default" profile (no lock)

### 🎵 **Personal Setup**
- **Morning commute** → "News/Talk" profile
- **Evening drive** → "Relaxing" profile
- **Weekend trips** → "Road Trip" profile

## Integration Points

- **OEM Integration** - automatic vehicle detection
- **Spotify Integration** - profile-based EQ application
- **AI Background Listener** - voice-activated profile switching
- **Audio Certification** - profile validation against standards
