/**
 * Advanced OEM Protocol Configuration
 * 
 * Configuration files for modern automotive protocols
 */

// CAN-FD Protocol Configuration
export interface CanFdProtocolConfig {
  name: 'CAN-FD';
  nominalBitRate: number; // Standard CAN bitrate (125k, 250k, 500k, 1M)
  dataBitRate: number;    // Fast data phase bitrate (up to 8M)
  maxPayload: number;     // 8, 12, 16, 20, 24, 32, 48, or 64 bytes
  features: {
    bitRateSwitching: boolean;
    errorDetection: boolean;
    extendedId: boolean;
  };
  frameFormat: {
    standardId: boolean;   // 11-bit ID
    extendedId: boolean;   // 29-bit ID
    remoteTR: boolean;     // Remote transmission request
  };
}

// DoIP (Diagnostics over Internet Protocol) Configuration
export interface DoIpProtocolConfig {
  name: 'DoIP';
  ipAddress: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  vehicleIdentification: {
    vin: string;
    logicalAddress: number;
    eid: string; // Entity ID
    gid: string; // Group ID
  };
  routing: {
    activationType: number;
    responseCode: number;
  };
  timing: {
    generalInactivity: number; // ms
    initialInactivity: number; // ms
    vehicleDiscovery: number;  // ms
  };
}

// FlexRay Protocol Configuration
export interface FlexRayProtocolConfig {
  name: 'FlexRay';
  cluster: {
    clusterId: number;
    cycleLength: number;      // μs, typically 5000
    macroTickLength: number;  // ns, typically 25000
    staticSlots: number;      // Number of static slots
    dynamicSlots: number;     // Number of dynamic slots
  };
  node: {
    nodeId: number;
    keySlotId: number[];
    coldStartAttempts: number;
    maxDrift: number;
  };
  timing: {
    staticSlotLength: number;
    symbolWindow: number;
    networkIdleTime: number;
    actionPointOffset: number;
  };
  features: {
    dualChannel: boolean;
    clockSynchronization: boolean;
    faultTolerance: boolean;
  };
}

// SOME/IP Protocol Configuration
export interface SomeIpProtocolConfig {
  name: 'SOME-IP';
  serviceDiscovery: {
    multicastAddress: string;
    port: number;
    ttl: number;
    cyclic: {
      delay: number;
      repetitionsBase: number;
      repetitionsMax: number;
    };
  };
  service: {
    serviceId: number;
    instanceId: number;
    majorVersion: number;
    minorVersion: number;
  };
  communication: {
    protocolVersion: number;
    interfaceVersion: number;
    messageType: 'REQUEST' | 'REQUEST_NO_RETURN' | 'NOTIFICATION' | 'RESPONSE' | 'ERROR';
    returnCode: number;
  };
  serialization: {
    endianness: 'little' | 'big';
    lengthField: number;
    alignment: number;
  };
}

// Ethernet Automotive Configuration
export interface EthernetAutomotiveConfig {
  name: 'Ethernet';
  physical: {
    speed: '100BASE-T1' | '1000BASE-T1';
    duplexMode: 'full' | 'half';
    autoNegotiation: boolean;
  };
  network: {
    ipAddress: string;
    subnetMask: string;
    gateway?: string;
    vlanId?: number;
  };
  protocols: {
    doip: DoIpProtocolConfig;
    someip: SomeIpProtocolConfig;
    avb?: {
      enabled: boolean;
      streamReservation: boolean;
      timeSynchronization: boolean;
    };
  };
  qos: {
    priorityMapping: Record<string, number>;
    bandwidthAllocation: Record<string, number>;
  };
}

// Complete Protocol Configuration Union
export type ProtocolConfig = 
  | CanFdProtocolConfig 
  | DoIpProtocolConfig 
  | FlexRayProtocolConfig 
  | SomeIpProtocolConfig 
  | EthernetAutomotiveConfig;

// BMW Specific Protocol Configurations
export const BMW_PROTOCOL_CONFIGS: Record<string, ProtocolConfig> = {
  'CAN-FD': {
    name: 'CAN-FD',
    nominalBitRate: 500000,    // 500 kbps
    dataBitRate: 2000000,      // 2 Mbps
    maxPayload: 64,            // Full CAN-FD payload
    features: {
      bitRateSwitching: true,
      errorDetection: true,
      extendedId: true
    },
    frameFormat: {
      standardId: true,
      extendedId: true,
      remoteTR: false
    }
  },
  'DoIP': {
    name: 'DoIP',
    ipAddress: '192.168.1.100',
    port: 13400,
    protocol: 'TCP',
    vehicleIdentification: {
      vin: 'WBANE1C50HCW00001',
      logicalAddress: 0x1001,
      eid: 'BMW001',
      gid: 'BMWGROUP'
    },
    routing: {
      activationType: 0x00,
      responseCode: 0x10
    },
    timing: {
      generalInactivity: 300000,   // 5 minutes
      initialInactivity: 2000,     // 2 seconds
      vehicleDiscovery: 500        // 500ms
    }
  },
  'FlexRay': {
    name: 'FlexRay',
    cluster: {
      clusterId: 1,
      cycleLength: 5000,       // 5ms
      macroTickLength: 25000,  // 25μs
      staticSlots: 62,
      dynamicSlots: 978
    },
    node: {
      nodeId: 1,
      keySlotId: [1, 2],
      coldStartAttempts: 31,
      maxDrift: 601
    },
    timing: {
      staticSlotLength: 63,
      symbolWindow: 18,
      networkIdleTime: 15,
      actionPointOffset: 4
    },
    features: {
      dualChannel: true,
      clockSynchronization: true,
      faultTolerance: true
    }
  },
  'SOME-IP': {
    name: 'SOME-IP',
    serviceDiscovery: {
      multicastAddress: '224.244.224.245',
      port: 30490,
      ttl: 1,
      cyclic: {
        delay: 1000,
        repetitionsBase: 3,
        repetitionsMax: 7
      }
    },
    service: {
      serviceId: 0x1234,
      instanceId: 0x0001,
      majorVersion: 1,
      minorVersion: 0
    },
    communication: {
      protocolVersion: 1,
      interfaceVersion: 1,
      messageType: 'REQUEST',
      returnCode: 0x00
    },
    serialization: {
      endianness: 'big',
      lengthField: 4,
      alignment: 1
    }
  }
};

// Add Ethernet configuration separately to avoid circular reference
BMW_PROTOCOL_CONFIGS['Ethernet'] = {
  name: 'Ethernet',
  physical: {
    speed: '1000BASE-T1',
    duplexMode: 'full',
    autoNegotiation: true
  },
  network: {
    ipAddress: '192.168.1.50',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    vlanId: 100
  },
  protocols: {
    doip: BMW_PROTOCOL_CONFIGS['DoIP'] as DoIpProtocolConfig,
    someip: BMW_PROTOCOL_CONFIGS['SOME-IP'] as SomeIpProtocolConfig,
    avb: {
      enabled: true,
      streamReservation: true,
      timeSynchronization: true
    }
  },
  qos: {
    priorityMapping: {
      'critical': 7,
      'safety': 6,
      'realtime': 5,
      'control': 4,
      'multimedia': 3,
      'comfort': 2,
      'background': 1,
      'best-effort': 0
    },
    bandwidthAllocation: {
      'critical': 30,    // 30%
      'safety': 25,      // 25%
      'realtime': 20,    // 20%
      'control': 15,     // 15%
      'multimedia': 10   // 10%
    }
  }
};

// Protocol Performance Metrics
export interface ProtocolMetrics {
  latency: {
    min: number;
    max: number;
    average: number;
  };
  throughput: {
    theoretical: number;  // bits/second
    practical: number;    // bits/second
    utilization: number;  // percentage
  };
  reliability: {
    errorRate: number;
    retransmissions: number;
    availability: number; // percentage
  };
  diagnostics: {
    packetsTransmitted: number;
    packetsReceived: number;
    packetsDropped: number;
    errorsDetected: number;
  };
}

// Get protocol configuration by name
export function getProtocolConfig(protocolName: string): ProtocolConfig | undefined {
  return BMW_PROTOCOL_CONFIGS[protocolName];
}

// Validate protocol configuration
export function validateProtocolConfig(config: ProtocolConfig): boolean {
  switch (config.name) {
    case 'CAN-FD':
      return config.nominalBitRate > 0 && 
             config.dataBitRate >= config.nominalBitRate &&
             [8, 12, 16, 20, 24, 32, 48, 64].includes(config.maxPayload);
    
    case 'DoIP':
      return config.port > 0 && 
             config.port < 65536 &&
             config.vehicleIdentification.vin.length === 17;
    
    case 'FlexRay':
      return config.cluster.clusterId > 0 &&
             config.cluster.cycleLength > 0 &&
             config.node.nodeId > 0;
    
    case 'SOME-IP':
      return config.service.serviceId > 0 &&
             config.service.instanceId >= 0;
    
    case 'Ethernet':
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(config.network.ipAddress);
    
    default:
      return false;
  }
}

// Protocol capability matrix
export const PROTOCOL_CAPABILITIES = {
  'CAN': {
    maxSpeed: '1 Mbps',
    payload: '8 bytes',
    realTime: 'Yes',
    faultTolerance: 'Medium',
    complexity: 'Low'
  },
  'CAN-FD': {
    maxSpeed: '8 Mbps',
    payload: '64 bytes',
    realTime: 'Yes',
    faultTolerance: 'High',
    complexity: 'Medium'
  },
  'LIN': {
    maxSpeed: '20 kbps',
    payload: '8 bytes',
    realTime: 'Limited',
    faultTolerance: 'Low',
    complexity: 'Very Low'
  },
  'FlexRay': {
    maxSpeed: '10 Mbps',
    payload: '254 bytes',
    realTime: 'Deterministic',
    faultTolerance: 'Very High',
    complexity: 'High'
  },
  'Ethernet': {
    maxSpeed: '1 Gbps',
    payload: '1500 bytes',
    realTime: 'Configurable',
    faultTolerance: 'Medium',
    complexity: 'High'
  },
  'SOME-IP': {
    maxSpeed: 'Ethernet-based',
    payload: 'Variable',
    realTime: 'Configurable',
    faultTolerance: 'Medium',
    complexity: 'Very High'
  }
} as const;

export default {
  BMW_PROTOCOL_CONFIGS,
  PROTOCOL_CAPABILITIES,
  getProtocolConfig,
  validateProtocolConfig
};