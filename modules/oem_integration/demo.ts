/**
 * OEM Integration Demo
 * 
 * Demonstration of advanced automotive protocol integration
 * and diagnostic capabilities
 */

import { 
  createAdvancedOEMInterface,
  detectManufacturerFromVIN,
  type IAdvancedOEMInterface,
  type AdvancedConnectionConfig,
  type VehicleDataStream
} from './advanced-index';

import { getProtocolConfig, BMW_PROTOCOL_CONFIGS } from './protocol-config';
import AdvancedDiagnosticEngine from './advanced-diagnostics';

/**
 * Comprehensive OEM Integration Demo
 */
export class OEMIntegrationDemo {
  private oemInterface?: IAdvancedOEMInterface;
  private diagnosticEngine: AdvancedDiagnosticEngine;

  constructor() {
    this.diagnosticEngine = new AdvancedDiagnosticEngine();
  }

  /**
   * Demonstrate complete OEM integration workflow
   */
  async runCompleteDemo(): Promise<void> {
    console.log('🚗 Starting OEM Integration Demo...\n');

    try {
      // Step 1: Vehicle Detection and Connection
      await this.demonstrateVehicleDetection();
      
      // Step 2: Protocol Configuration
      await this.demonstrateProtocolConfiguration();
      
      // Step 3: Audio Parameter Management
      await this.demonstrateAudioParameterManagement();
      
      // Step 4: Advanced Diagnostics
      await this.demonstrateAdvancedDiagnostics();
      
      // Step 5: Real-time Data Streaming
      await this.demonstrateRealTimeStreaming();
      
      // Step 6: Security and Authentication
      await this.demonstrateSecurityFeatures();
      
      console.log('\n✅ OEM Integration Demo completed successfully!');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    } finally {
      if (this.oemInterface?.isConnected()) {
        await this.oemInterface.disconnect();
      }
    }
  }

  /**
   * Step 1: Vehicle Detection and Connection
   */
  private async demonstrateVehicleDetection(): Promise<void> {
    console.log('📍 Step 1: Vehicle Detection and Connection');
    console.log('=' .repeat(50));

    // Simulate VIN reading
    const testVins = [
      'WBANE1C50HCW00001', // BMW
      'WDD2130461A123456', // Mercedes-Benz
      '5YJ3E1EA4JF123456', // Tesla
      'TMB123456789'       // Skoda
    ];

    for (const vin of testVins) {
      try {
        const manufacturer = detectManufacturerFromVIN(vin);
        console.log(`VIN: ${vin} → Manufacturer: ${manufacturer}`);
      } catch (error) {
        console.log(`VIN: ${vin} → Error: ${error}`);
      }
    }

    // Connect to BMW vehicle (demo)
    const bmwVin = 'WBANE1C50HCW00001';
    const manufacturer = detectManufacturerFromVIN(bmwVin);
    
    console.log(`\n🔌 Connecting to ${manufacturer} vehicle...`);
    this.oemInterface = createAdvancedOEMInterface(manufacturer);

    // Add event listeners
    this.setupEventListeners();

    console.log('✅ Vehicle detection completed\n');
  }

  /**
   * Step 2: Protocol Configuration
   */
  private async demonstrateProtocolConfiguration(): Promise<void> {
    console.log('⚙️  Step 2: Protocol Configuration');
    console.log('=' .repeat(50));

    if (!this.oemInterface) {
      throw new Error('OEM Interface not initialized');
    }

    // Demonstrate different protocol connections
    const protocols = ['CAN-FD', 'Ethernet', 'FlexRay'] as const;

    for (const protocolName of protocols) {
      console.log(`\n🔧 Configuring ${protocolName} protocol...`);
      
      const protocolConfig = getProtocolConfig(protocolName);
      if (!protocolConfig) {
        console.log(`❌ Configuration not found for ${protocolName}`);
        continue;
      }

      // Create connection configuration
      const connectionConfig: AdvancedConnectionConfig = {
        protocol: protocolName,
        interface: `${protocolName.toLowerCase()}0`,
        security: {
          encryptionEnabled: true,
          authLevel: 'advanced'
        }
      };

      // Add protocol-specific config
      switch (protocolName) {
        case 'CAN-FD':
          connectionConfig.canFdConfig = {
            dataBitRate: 2000000,
            nominalBitRate: 500000,
            maxPayload: 64
          };
          break;
        case 'Ethernet':
          connectionConfig.ethernetConfig = {
            ipAddress: '192.168.1.50',
            port: 13400,
            protocol: 'TCP',
            timeout: 5000
          };
          break;
        case 'FlexRay':
          connectionConfig.flexRayConfig = {
            cluster: 1,
            node: 1,
            cycleLength: 5000,
            staticSlots: 62
          };
          break;
      }

      try {
        await this.oemInterface.connect(connectionConfig);
        console.log(`✅ ${protocolName} connected successfully`);
        
        // Demonstrate protocol-specific operations
        await this.demonstrateProtocolOperations(protocolName);
        
        await this.oemInterface.disconnect();
        
      } catch (error) {
        console.log(`❌ ${protocolName} connection failed:`, error);
      }
    }

    console.log('\n✅ Protocol configuration completed\n');
  }

  /**
   * Step 3: Audio Parameter Management
   */
  private async demonstrateAudioParameterManagement(): Promise<void> {
    console.log('🎵 Step 3: Audio Parameter Management');
    console.log('=' .repeat(50));

    if (!this.oemInterface) {
      throw new Error('OEM Interface not initialized');
    }

    // Connect for audio testing
    await this.oemInterface.connect({
      protocol: 'CAN-FD',
      interface: 'can0',
      canFdConfig: {
        dataBitRate: 2000000,
        nominalBitRate: 500000,
        maxPayload: 64
      }
    });

    // Get available audio parameters
    console.log('📋 Available audio parameters:');
    const parameters = await this.oemInterface.getAudioParameterDefinitions();
    
    for (const param of parameters) {
      console.log(`  • ${param.name} (${param.id}): ${param.range[0]}-${param.range[1]} ${param.unit}`);
    }

    // Read current values
    console.log('\n📖 Reading current audio settings:');
    for (const param of parameters) {
      try {
        const value = await this.oemInterface.readAudioParameter(param.id);
        console.log(`  ${param.name}: ${value} ${param.unit}`);
      } catch (error) {
        console.log(`  ${param.name}: Error reading - ${error}`);
      }
    }

    // Demonstrate writing parameters
    console.log('\n✏️  Testing audio parameter modifications:');
    try {
      // Adjust master volume
      await this.oemInterface.writeAudioParameter('masterVolume', 50);
      console.log('  ✅ Master volume set to 50%');

      // Test surround mode
      await this.oemInterface.writeAudioParameter('hkSurroundMode', 1);
      console.log('  ✅ Surround mode changed');

      // Test advanced EQ (if supported)
      try {
        const eqSettings = [0, 2, -1, 3, 1, 0, -2, 4, 2, 0];
        await this.oemInterface.writeAudioParameter('bwAdvancedEQ', eqSettings);
        console.log('  ✅ Advanced EQ configured');
      } catch (eqError) {
        console.log('  ⚠️  Advanced EQ not available on current protocol');
      }

    } catch (error) {
      console.log(`  ❌ Parameter modification failed: ${error}`);
    }

    console.log('\n✅ Audio parameter management completed\n');
  }

  /**
   * Step 4: Advanced Diagnostics
   */
  private async demonstrateAdvancedDiagnostics(): Promise<void> {
    console.log('🔍 Step 4: Advanced Diagnostics');
    console.log('=' .repeat(50));

    if (!this.oemInterface) {
      throw new Error('OEM Interface not initialized');
    }

    // Get diagnostic codes
    console.log('📋 Reading diagnostic codes...');
    const diagnosticCodes = await this.oemInterface.getDiagnosticCodes();
    
    if (diagnosticCodes.length > 0) {
      console.log('Found diagnostic codes:');
      diagnosticCodes.forEach(code => {
        console.log(`  • ${code.code}: ${code.description} [${code.severity.toUpperCase()}]`);
        if (code.environmentalData) {
          console.log(`    Environment: ${code.environmentalData.temperature}°C, ${code.environmentalData.voltage}V`);
        }
      });
    } else {
      console.log('  ✅ No diagnostic codes found');
    }

    // Perform diagnostic routines
    console.log('\n🧪 Running diagnostic routines...');
    const routines = ['audioSystemTest', 'canBusTest', 'securityCheck'];

    for (const routine of routines) {
      try {
        console.log(`\n  Running ${routine}...`);
        const result = await this.oemInterface.performDiagnosticRoutine(routine);
        console.log(`  ✅ ${routine} completed: ${result.result}`);
        
        if (result.speakerTests) {
          console.log('    Speaker test results:');
          Object.entries(result.speakerTests).forEach(([speaker, status]) => {
            const statusIcon = status === 'passed' ? '✅' : 
                             status === 'warning' ? '⚠️' : '❌';
            console.log(`      ${statusIcon} ${speaker}: ${status}`);
          });
        }
      } catch (error) {
        console.log(`  ❌ ${routine} failed: ${error}`);
      }
    }

    // Advanced diagnostic analysis
    console.log('\n🧠 Advanced diagnostic analysis...');
    const networkHealth = await this.diagnosticEngine.getNetworkDiagnostics(['CAN-FD', 'Ethernet']);
    const systemHealth = await this.diagnosticEngine.analyzeSystemHealth(
      diagnosticCodes, 
      networkHealth, 
      { vehicleSpeed: 0, engineRpm: 800 }
    );

    console.log(`  Overall system health: ${systemHealth.overall}/100`);
    console.log('  Category breakdown:');
    Object.entries(systemHealth.categories).forEach(([category, score]) => {
      console.log(`    ${category}: ${score}/100`);
    });

    if (systemHealth.recommendations.length > 0) {
      console.log('  Recommendations:');
      systemHealth.recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'critical' ? '🚨' : 
                           rec.priority === 'high' ? '⚠️' : 'ℹ️';
        console.log(`    ${priorityIcon} ${rec.description}`);
        console.log(`      Action: ${rec.action}`);
      });
    }

    console.log('\n✅ Advanced diagnostics completed\n');
  }

  /**
   * Step 5: Real-time Data Streaming
   */
  private async demonstrateRealTimeStreaming(): Promise<void> {
    console.log('📡 Step 5: Real-time Data Streaming');
    console.log('=' .repeat(50));

    if (!this.oemInterface) {
      throw new Error('OEM Interface not initialized');
    }

    console.log('🚀 Starting real-time data stream...');
    
    const streamParameters = [
      'audioSystem', 'vehicleState', 'environmental', 'networkHealth'
    ];

    await this.oemInterface.startDataStream(streamParameters);

    // Collect stream data for a few seconds
    console.log('📊 Collecting stream data (5 seconds)...');
    
    let streamCount = 0;
    const maxStreams = 20; // ~2 seconds at 10Hz

    const streamInterval = setInterval(async () => {
      try {
        const streamData = await this.oemInterface!.getStreamData();
        streamCount++;

        if (streamCount % 5 === 0) { // Display every 5th sample
          console.log(`\n  📊 Sample ${streamCount}:`);
          console.log(`    Master Volume: ${streamData.audioSystem.masterVolume.toFixed(1)}%`);
          console.log(`    Vehicle Speed: ${streamData.vehicleState.speed.toFixed(1)} km/h`);
          console.log(`    Engine RPM: ${streamData.vehicleState.rpm.toFixed(0)}`);
          console.log(`    Cabin Temp: ${streamData.environmental.cabinTemperature.toFixed(1)}°C`);
          console.log(`    CAN Bus Load: ${streamData.networkHealth.canBusUtilization.toFixed(1)}%`);
        }

        if (streamCount >= maxStreams) {
          clearInterval(streamInterval);
          await this.oemInterface!.stopDataStream();
          console.log('\n✅ Data streaming completed');
        }

      } catch (error) {
        console.log(`  ❌ Stream error: ${error}`);
        clearInterval(streamInterval);
      }
    }, 100); // 10Hz sampling

    // Wait for streaming to complete
    await new Promise(resolve => {
      const checkComplete = setInterval(() => {
        if (streamCount >= maxStreams) {
          clearInterval(checkComplete);
          resolve(undefined);
        }
      }, 100);
    });

    console.log('\n✅ Real-time data streaming completed\n');
  }

  /**
   * Step 6: Security and Authentication
   */
  private async demonstrateSecurityFeatures(): Promise<void> {
    console.log('🔐 Step 6: Security and Authentication');
    console.log('=' .repeat(50));

    if (!this.oemInterface) {
      throw new Error('OEM Interface not initialized');
    }

    // Demonstrate security access levels
    console.log('🔑 Testing security access levels...');
    
    const accessLevels = [1, 2, 3, 4, 5];
    
    for (const level of accessLevels) {
      try {
        const success = await this.oemInterface.performSecurityAccess(level);
        const statusIcon = success ? '✅' : '❌';
        console.log(`  ${statusIcon} Security Level ${level}: ${success ? 'Granted' : 'Denied'}`);
      } catch (error) {
        console.log(`  ❌ Security Level ${level}: Error - ${error}`);
      }
    }

    // Certificate validation
    console.log('\n📜 Validating vehicle certificate...');
    try {
      const certificateValid = await this.oemInterface.validateCertificate();
      const statusIcon = certificateValid ? '✅' : '❌';
      console.log(`  ${statusIcon} Certificate validation: ${certificateValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      console.log(`  ❌ Certificate validation error: ${error}`);
    }

    // Raw message demonstration
    console.log('\n📡 Testing raw message communication...');
    try {
      const testMessage = Buffer.from([0x02, 0x10, 0x01, 0x00]); // UDS diagnostic session control
      const response = await this.oemInterface.sendRawMessage('UDS', testMessage);
      console.log(`  ✅ Sent: ${testMessage.toString('hex')}`);
      console.log(`  ✅ Received: ${response.toString('hex')}`);
    } catch (error) {
      console.log(`  ❌ Raw message communication error: ${error}`);
    }

    console.log('\n✅ Security and authentication completed\n');
  }

  /**
   * Protocol-specific operations demonstration
   */
  private async demonstrateProtocolOperations(protocol: string): Promise<void> {
    if (!this.oemInterface) return;

    console.log(`  🔧 Testing ${protocol}-specific operations:`);

    try {
      // Configure protocol with specific settings
      const config = getProtocolConfig(protocol);
      if (config) {
        await this.oemInterface.configureProtocol(protocol as any, config);
        console.log(`    ✅ Protocol configuration applied`);
      }

      // Test raw communication
      const testMessage = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      const response = await this.oemInterface.sendRawMessage(protocol as any, testMessage);
      console.log(`    ✅ Raw communication test: ${response.length} bytes received`);

    } catch (error) {
      console.log(`    ❌ Protocol operations failed: ${error}`);
    }
  }

  /**
   * Setup event listeners for the OEM interface
   */
  private setupEventListeners(): void {
    if (!this.oemInterface) return;

    this.oemInterface.on('connected', (data) => {
      console.log(`🔗 Connected via ${data.protocol} on ${data.interface}`);
    });

    this.oemInterface.on('disconnected', () => {
      console.log('🔌 Disconnected from vehicle');
    });

    this.oemInterface.on('protocolConfigured', (data) => {
      console.log(`⚙️  Protocol ${data.protocol} configured with features: ${data.features?.join(', ')}`);
    });

    this.oemInterface.on('parameterRead', (data) => {
      console.log(`📖 Parameter ${data.parameterId} read: ${data.value}`);
    });

    this.oemInterface.on('parameterWritten', (data) => {
      console.log(`✏️  Parameter ${data.parameterId} written: ${data.value}`);
    });

    this.oemInterface.on('securityAccess', (data) => {
      console.log(`🔐 Security access level ${data.level}: ${data.success ? 'Granted' : 'Denied'}`);
    });

    this.oemInterface.on('dataStream', (data: VehicleDataStream) => {
      // Only log occasionally to avoid spam
      if (Math.random() < 0.1) {
        console.log(`📊 Stream: Volume ${data.audioSystem.masterVolume.toFixed(1)}%, Speed ${data.vehicleState.speed.toFixed(1)} km/h`);
      }
    });
  }
}

// Run demo if this file is executed directly
async function runDemo() {
  const demo = new OEMIntegrationDemo();
  await demo.runCompleteDemo();
}

// Check if this is the main module (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export default OEMIntegrationDemo;