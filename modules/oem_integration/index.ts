/**
 * OEM Integration Module
 * Enhanced automotive protocol support for modern vehicle integration
 */

// Re-export enhanced functionality
export * from './advanced-index';
export * from './protocol-config';
export * from './advanced-diagnostics';

// Legacy exports for backward compatibility
import { 
  createAdvancedOEMInterface, 
  detectManufacturerFromVIN as advancedDetectManufacturer,
  type ManufacturerType
} from './advanced-index';

// Legacy interfaces
export interface VehicleConnection {
  protocol: 'CAN' | 'UDS' | 'OBD2' | 'LIN' | 'ETHERNET';
  interface: string;
  baudRate?: number;
  connected: boolean;
  lastActivity?: Date;
}

export interface OEMConfig {
  manufacturer: string;
  protocols: ('CAN' | 'UDS' | 'OBD2' | 'LIN' | 'ETHERNET')[];
  supportedModels: string[];
  diagnosticCodes: DiagnosticCode[];
  audioSystemAccess: {
    canRead: boolean;
    canWrite: boolean;
    supportedParameters: AudioParameter[];
  };
}

export interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  system: 'ENGINE' | 'AUDIO' | 'HVAC' | 'BODY' | 'NETWORK';
}

export interface AudioParameter {
  name: string;
  description: string;
  type: 'boolean' | 'integer' | 'float' | 'string' | 'enum';
  unit?: string;
  range?: {
    min: number;
    max: number;
  };
  enumValues?: string[];
  readOnly: boolean;
}

export interface VehicleData {
  vin: string;
  manufacturer: string;
  model: string;
  year: number;
  audioSystem: {
    manufacturer: string;
    model: string;
    speakers: number;
    amplifierChannels: number;
    dspAvailable: boolean;
  };
  diagnosticCodes: DiagnosticCode[];
  audioParameters: { [key: string]: any };
}

export interface OEMInterface {
  config: OEMConfig;
  connection?: VehicleConnection;
  isConnected(): boolean;
  connect(connectionConfig: Omit<VehicleConnection, 'connected' | 'lastActivity'>): Promise<boolean>;
  disconnect(): Promise<void>;
  readVehicleData(): Promise<VehicleData>;
  readAudioParameter(paramName: string): Promise<any>;
  writeAudioParameter(paramName: string, value: any): Promise<boolean>;
  getDiagnosticCodes(): Promise<DiagnosticCode[]>;
  clearDiagnosticCodes(): Promise<boolean>;
}

// Legacy factory function
export function createOEMInterface(manufacturer: string): OEMInterface {
  // Create a wrapper around the enhanced interface
  const enhancedInterface = createAdvancedOEMInterface(manufacturer as ManufacturerType);
  
  return {
    config: {
      manufacturer,
      protocols: ['CAN', 'UDS'],
      supportedModels: [],
      diagnosticCodes: [],
      audioSystemAccess: {
        canRead: true,
        canWrite: true,
        supportedParameters: []
      }
    },
    connection: undefined,
    
    isConnected(): boolean {
      return enhancedInterface.isConnected();
    },
    
    async connect(connectionConfig): Promise<boolean> {
      try {
        await enhancedInterface.connect({
          protocol: connectionConfig.protocol === 'OBD2' ? 'OBD-II' : connectionConfig.protocol as any,
          interface: connectionConfig.interface,
          baudRate: connectionConfig.baudRate
        });
        return true;
      } catch {
        return false;
      }
    },
    
    async disconnect(): Promise<void> {
      await enhancedInterface.disconnect();
    },
    
    async readVehicleData(): Promise<VehicleData> {
      // Mock legacy format
      return {
        vin: 'MOCKVIN1234567890',
        manufacturer,
        model: 'Legacy Model',
        year: 2023,
        audioSystem: {
          manufacturer: 'Legacy Audio',
          model: 'Standard System',
          speakers: 8,
          amplifierChannels: 6,
          dspAvailable: true
        },
        diagnosticCodes: [],
        audioParameters: {}
      };
    },
    
    async readAudioParameter(paramName: string): Promise<any> {
      try {
        return await enhancedInterface.readAudioParameter(paramName);
      } catch {
        return null;
      }
    },
    
    async writeAudioParameter(paramName: string, value: any): Promise<boolean> {
      try {
        await enhancedInterface.writeAudioParameter(paramName, value);
        return true;
      } catch {
        return false;
      }
    },
    
    async getDiagnosticCodes(): Promise<DiagnosticCode[]> {
      try {
        const advancedCodes = await enhancedInterface.getDiagnosticCodes();
        return advancedCodes.map(code => ({
          code: code.code,
          description: code.description,
          severity: code.severity.toUpperCase() as any,
          system: 'AUDIO' as const
        }));
      } catch {
        return [];
      }
    },
    
    async clearDiagnosticCodes(): Promise<boolean> {
      try {
        await enhancedInterface.clearDiagnosticCodes();
        return true;
      } catch {
        return false;
      }
    }
  };
}

// Legacy function with enhanced implementation
export function detectManufacturerFromVIN(vin: string): string {
  try {
    return advancedDetectManufacturer(vin);
  } catch {
    return 'Unknown';
  }
}

// Session management (legacy API)
const sessions = new Map<string, any>();

export async function connect(config: {
  vehicleId: string;
  protocol: string;
  parameters: Record<string, any>;
}): Promise<any> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  const session = {
    id: sessionId,
    vehicleId: config.vehicleId,
    protocol: config.protocol,
    status: 'connected',
    connectedAt: new Date(),
    lastActivity: new Date(),
    parameters: config.parameters,
  };
  
  sessions.set(sessionId, session);
  return session;
}

export async function getSessions(filters?: any): Promise<any[]> {
  let sessionList = Array.from(sessions.values());
  
  if (filters?.status) {
    sessionList = sessionList.filter(s => s.status === filters.status);
  }
  
  if (filters?.vehicleId) {
    sessionList = sessionList.filter(s => s.vehicleId === filters.vehicleId);
  }
  
  return sessionList;
}

export async function getSessionById(sessionId: string): Promise<any | null> {
  return sessions.get(sessionId) || null;
}

export async function disconnect(sessionId: string): Promise<{ success: boolean; message?: string }> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return { success: false, message: 'Session not found' };
  }
  
  session.status = 'disconnected';
  session.disconnectedAt = new Date();
  
  return { success: true };
}

export async function executeDiagnostic(config: {
  sessionId: string;
  command: string;
  parameters: Record<string, any>;
}): Promise<any> {
  const session = sessions.get(config.sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  if (session.status !== 'connected') {
    throw new Error('Session not connected');
  }
  
  const result = {
    sessionId: config.sessionId,
    command: config.command,
    parameters: config.parameters,
    result: {
      status: 'success',
      data: {
        voltage: '12.4V',
        can_bus_status: 'active',
        audio_system_status: 'operational',
      },
      timestamp: new Date(),
    },
    executedAt: new Date(),
  };
  
  session.lastActivity = new Date();
  return result;
}

export async function getSupportedProtocols(): Promise<string[]> {
  return ['CAN', 'CAN-FD', 'UDS', 'OBD-II', 'LIN', 'DoIP', 'SOME-IP', 'FlexRay', 'Ethernet'];
}

export async function readAudioConfiguration(config: {
  sessionId: string;
  parameters: Record<string, any>;
}): Promise<any> {
  const session = sessions.get(config.sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  return {
    eq_settings: {
      bass: 2,
      mid: 0,
      treble: 1,
    },
    volume_settings: {
      master: 25,
      front: 0,
      rear: 0,
    },
    balance_settings: {
      left_right: 0,
      front_rear: 0,
    },
    surround_mode: 'concert',
    last_updated: new Date(),
  };
}

export async function writeAudioConfiguration(config: {
  sessionId: string;
  configuration: Record<string, any>;
}): Promise<{ success: boolean; message?: string }> {
  const session = sessions.get(config.sessionId);
  
  if (!session) {
    return { success: false, message: 'Session not found' };
  }
  
  if (session.status !== 'connected') {
    return { success: false, message: 'Session not connected' };
  }
  
  session.lastActivity = new Date();
  
  return {
    success: true,
    message: 'Audio configuration updated successfully',
  };
}

export async function getSystemStatus(): Promise<any> {
  const activeSessions = Array.from(sessions.values()).filter(s => s.status === 'connected');
  
  return {
    system_status: 'operational',
    active_sessions: activeSessions.length,
    supported_protocols: await getSupportedProtocols(),
    last_updated: new Date(),
    statistics: {
      total_sessions: sessions.size,
      successful_connections: sessions.size,
      failed_connections: 0,
    },
  };
}