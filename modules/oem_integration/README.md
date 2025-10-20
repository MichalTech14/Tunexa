# OEM Integration Module - Enhanced

Pokročilé prepojenie s OEM elektronikou a diagnostikou automobilu s podporou moderných protokolov.

## 🔧 Podporované protokoly

### 🚀 Moderné protokoly
- **CAN-FD** - Flexible Data-rate CAN (až 8 Mbps, 64-byte payload)
- **DoIP** - Diagnostics over Internet Protocol (Ethernet-based UDS)
- **FlexRay** - Deterministický high-speed protokol (10 Mbps)
- **SOME/IP** - Service-Oriented Middleware over IP
- **Automotive Ethernet** - High-bandwidth in-vehicle networking

### 🔌 Štandardné protokoly
- **CAN Bus** - Controller Area Network (hlavný komunikačný protokol)
- **UDS** - Unified Diagnostic Services (ISO 14229)
- **OBD-II** - On-Board Diagnostics (štandardný diagnostický port)
- **LIN** - Local Interconnect Network (pre nižšie rýchlosti)

## 🚗 Podporované značky

### 🏆 BMW (Plne implementované)
- **Modely:** 3/5/7 Series, X3/X5/X7, i4, iX
- **Audio systémy:** Harman Kardon, Bowers & Wilkins
- **Protokoly:** CAN-FD, Ethernet, FlexRay, DoIP
- **Pokročilé funkcie:**
  - Real-time data streaming (10Hz)
  - Advanced EQ with 10-band configuration
  - Security access levels 1-3
  - Predictive maintenance analytics

### 🌟 Rozšírená podpora
- **Mercedes-Benz** - C/E/S-Class, GLC/GLE/GLS
- **Audi** - A4/A6/A8, Q5/Q7
- **Tesla** - Model 3/S/X/Y
- **Volkswagen** - Golf, Passat, Tiguan
- **Škoda** - Octavia, Superb, Kodiaq

## 🛠️ Pokročilé funkcie

### 📊 Real-time Data Streaming
```typescript
// Spustenie real-time streamu
await bmwInterface.startDataStream(['audioSystem', 'vehicleState', 'environmental']);

// Čítanie stream dát (10Hz)
const streamData = await bmwInterface.getStreamData();
console.log(`Volume: ${streamData.audioSystem.masterVolume}%`);
console.log(`Speed: ${streamData.vehicleState.speed} km/h`);
```

### 🔍 Pokročilá diagnostika
```typescript
// Komplexná diagnostika systému
const diagnostics = new AdvancedDiagnosticEngine();
const systemHealth = await diagnostics.analyzeSystemHealth(codes, networkHealth, vehicleData);

// Prediktívna údržba
const predictive = await diagnostics.performPredictiveAnalysis('audioSystem');
console.log(`Health: ${predictive.currentHealth}%`);
console.log(`Predicted failure: ${predictive.predictedFailureDate}`);
```

### 🔐 Bezpečnosť a autentifikácia
```typescript
// Security access levels
const accessGranted = await bmwInterface.performSecurityAccess(2);

// Certificate validation
const certificateValid = await bmwInterface.validateCertificate();

// Encrypted communication
const config = {
  protocol: 'Ethernet',
  security: {
    encryptionEnabled: true,
    authLevel: 'advanced'
  }
};
```

### ⚡ Protocol-specific Features

#### CAN-FD
- **Data bitrate:** até 8 Mbps
- **Payload:** až 64 bytov
- **Error detection:** Enhanced
- **Bit rate switching:** Automatic

#### DoIP (Diagnostics over IP)
- **Transport:** TCP/UDP over Ethernet
- **Vehicle discovery:** Automatic
- **Routing activation:** Secure
- **Multi-protocol support:** UDS over IP

#### FlexRay
- **Bandwidth:** až 10 Mbps
- **Deterministic timing:** Guaranteed
- **Fault tolerance:** Dual-channel redundancy
- **Clock synchronization:** Distributed

## 🎵 Audio systém - Pokročilé parametre

### BMW Harman Kardon / Bowers & Wilkins
```typescript
// Master Volume (0-100%)
await bmwInterface.writeAudioParameter('masterVolume', 45);

// Surround Mode (0=Stereo, 1=Concert, 2=Cinema, 3=Stage)
await bmwInterface.writeAudioParameter('hkSurroundMode', 2);

// Advanced 10-band EQ (-12 to +12 dB)
const eqSettings = [0, 2, -1, 3, 1, 0, -2, 4, 2, 0];
await bmwInterface.writeAudioParameter('bwAdvancedEQ', eqSettings);
```

### Protocol Mapping
```typescript
const parameter = {
  id: 'masterVolume',
  protocolMapping: {
    'CAN': { pid: '0x3E8' },
    'UDS': { did: 'F190' },
    'CAN-FD': { pid: '0x3E8' },
    'Ethernet': { serviceId: 'HK_VOLUME_SERVICE' }
  }
};
```

## 📈 Diagnostické možnosti

### Kategórie diagnostických kódov
- **audio** - Audio systém, reproduktory, zosilňovače
- **communication** - Komunikačné protokoly, ECU
- **network** - Sieťové protokoly, bus load
- **sensor** - Senzory, merania
- **actuator** - Aktuátory, motory
- **security** - Bezpečnosť, certifikáty
- **predictive** - Prediktívna analýza

### Health Score systému
```typescript
const healthScore = {
  overall: 87,              // 0-100 celkové skóre
  categories: {
    audio: 92,
    communication: 85,
    network: 89,
    hardware: 94,
    software: 81
  },
  trends: {
    improving: ['audio'],
    degrading: ['network'],
    stable: ['hardware', 'software']
  }
};
```

## 🚀 Quick Start

### Základné použitie
```typescript
import { createAdvancedOEMInterface, detectManufacturerFromVIN } from './advanced-index';

// Auto-detekcia výrobcu
const manufacturer = detectManufacturerFromVIN('WBANE1C50HCW00001'); // BMW

// Vytvorenie pokročilého rozhrania
const bmwInterface = createAdvancedOEMInterface('BMW');

// Pripojenie cez CAN-FD
await bmwInterface.connect({
  protocol: 'CAN-FD',
  interface: 'can0',
  canFdConfig: {
    dataBitRate: 2000000,    // 2 Mbps
    nominalBitRate: 500000,  // 500 kbps
    maxPayload: 64           // 64 bytes
  },
  security: {
    encryptionEnabled: true,
    authLevel: 'advanced'
  }
});
```

### Komplexný workflow
```typescript
// 1. Čítanie audio parametrov
const volume = await bmwInterface.readAudioParameter('masterVolume');

// 2. Diagnostické kódy
const codes = await bmwInterface.getDiagnosticCodes('audio');

// 3. Diagnostické rutiny
const testResult = await bmwInterface.performDiagnosticRoutine('audioSystemTest');

// 4. Real-time streaming
await bmwInterface.startDataStream(['audioSystem', 'vehicleState']);
const streamData = await bmwInterface.getStreamData();

// 5. Pokročilá diagnostika
const diagnostics = new AdvancedDiagnosticEngine();
const report = await diagnostics.generateDiagnosticReport(codes, networkHealth, streamData);
```

## 🎯 Demo a testovania

### Spustenie demo
```bash
cd modules/oem_integration
npm run demo  # Spustí kompletnú ukážku funkcií
```

### Testovanie protokolov
```typescript
import OEMIntegrationDemo from './demo';

const demo = new OEMIntegrationDemo();
await demo.runCompleteDemo();
```

## 📊 Performance metriky

| Protokol | Max. rýchlosť | Payload | Real-time | Fault tolerance | Komplexnosť |
|----------|---------------|---------|-----------|-----------------|-------------|
| CAN      | 1 Mbps        | 8 B     | Áno       | Stredná         | Nízka       |
| CAN-FD   | 8 Mbps        | 64 B    | Áno       | Vysoká          | Stredná     |
| LIN      | 20 kbps       | 8 B     | Obmedzené | Nízka           | Veľmi nízka |
| FlexRay  | 10 Mbps       | 254 B   | Deterministické | Veľmi vysoká | Vysoká    |
| Ethernet | 1 Gbps        | 1500 B  | Konfigurovateľné | Stredná    | Vysoká      |
| SOME/IP  | Ethernet-based| Variable| Konfigurovateľné | Stredná    | Veľmi vysoká|

## 🔧 Konfigurácia protokolov

### BMW Protocol Configs
```typescript
import { BMW_PROTOCOL_CONFIGS } from './protocol-config';

const canFdConfig = BMW_PROTOCOL_CONFIGS['CAN-FD'];
const ethernetConfig = BMW_PROTOCOL_CONFIGS['Ethernet'];
const flexRayConfig = BMW_PROTOCOL_CONFIGS['FlexRay'];
```

## 🛡️ Bezpečnosť

### Security Levels
- **Level 1:** Basic diagnostic access
- **Level 2:** Enhanced diagnostic access  
- **Level 3:** Programming and calibration access
- **Level 4:** Development access (nie je podporované)

### Encryption
- **AES-256** pre Ethernet komunikáciu
- **Certificate-based** autentifikácia
- **Challenge-response** security access
- **Secure boot** verification

## 📝 API Reference

### IAdvancedOEMInterface
```typescript
interface IAdvancedOEMInterface {
  // Connection management
  connect(config: AdvancedConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Audio parameters
  readAudioParameter(parameterId: string): Promise<any>;
  writeAudioParameter(parameterId: string, value: any): Promise<void>;
  getAudioParameterDefinitions(): Promise<AudioParameterDefinition[]>;
  
  // Advanced diagnostics
  getDiagnosticCodes(category?: string): Promise<AdvancedDiagnosticCode[]>;
  performDiagnosticRoutine(routineId: string): Promise<any>;
  
  // Real-time streaming
  startDataStream(parameters: string[]): Promise<void>;
  getStreamData(): Promise<VehicleDataStream>;
  
  // Security
  performSecurityAccess(level: number): Promise<boolean>;
  validateCertificate(): Promise<boolean>;
}
```

## 🔄 Migration z legacy API

### Old vs New
```typescript
// Legacy API
const bmw = new BMWInterface();
await bmw.connect({ protocol: 'CAN', interface: 'can0' });

// New Enhanced API  
const bmw = createAdvancedOEMInterface('BMW');
await bmw.connect({ 
  protocol: 'CAN-FD', 
  interface: 'can0',
  canFdConfig: { dataBitRate: 2000000, nominalBitRate: 500000, maxPayload: 64 }
});
```

## 🏗️ Architektúra

```
┌─────────────────────────────────────────────────────────────────┐
│                    Enhanced OEM Integration                     │
├─────────────────────────────────────────────────────────────────┤
│  Application Layer                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Demo & Tests  │ │ Diagnostic APIs │ │ Streaming APIs  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Enhanced Interface Layer                                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │Advanced BMW Impl│ │Protocol Configs │ │Advanced Diag    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Protocol Layer                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ CAN │ │CAN-FD│ │ UDS │ │DoIP │ │FlexR│ │SOME/│ │Ether│      │
│  │     │ │     │ │     │ │     │ │  ay │ │  IP │ │ net │      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Hardware Abstraction Layer                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   CAN Hardware  │ │Ethernet Hardware│ │FlexRay Hardware │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Roadmap

### V1.1 (Completed)
- ✅ CAN-FD support with extended payload
- ✅ Ethernet/DoIP implementation
- ✅ FlexRay basic support
- ✅ Real-time data streaming
- ✅ Advanced diagnostics engine
- ✅ Security and authentication

### V1.2 (Planned)
- 🔄 SOME/IP full implementation
- 🔄 Multi-manufacturer support
- 🔄 Cloud diagnostics integration
- 🔄 Machine learning analytics

### V2.0 (Future)
- 🚀 5G connectivity support
- 🚀 Over-the-air updates
- 🚀 AI-powered predictive maintenance
- 🚀 Blockchain-based security

---

**Poznámka:** Tento modul vyžaduje reálny hardware pre plnú funkcionalnost. Demo režim simuluje komunikáciu pre vývojové a testovacie účely.
