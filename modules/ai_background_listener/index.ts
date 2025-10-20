/**
 * Enhanced AI Background Listener Module
 * Continuously monitors audio environment in vehicle for trigger phrases,
 * advanced anomaly detection, environment monitoring patterns, and intelligent trigger responses.
 */

import { AdvancedAIBackgroundListener, defaultAdvancedConfig, AdvancedAnomalyConfig } from './advanced-anomaly-detection.js';
import { EnvironmentPatternMonitor } from './environment-monitoring.js';

export interface TriggerPhrase {
  phrase: string;
  language: string;
  action: string;
  confidence_threshold: number;
}

export interface AnomalyEvent {
  type: 'accident' | 'help_request' | 'unusual_sound' | 'emergency' | 'other';
  timestamp: Date;
  confidence: number;
  audio_sample?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ListenerConfig {
  enabled: boolean;
  trigger_phrases: TriggerPhrase[];
  anomaly_detection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    types: AnomalyEvent['type'][];
  };
  privacy: {
    store_audio: boolean;
    audio_retention_days: number;
    send_to_cloud: boolean;
    local_only: boolean;
  };
  emergency_services: {
    enabled: boolean;
    auto_call: boolean;
    emergency_number: string;
  };
}

export interface ListenerState {
  active: boolean;
  listening: boolean;
  last_event?: ListenerEvent;
  events_count: number;
  uptime_seconds: number;
}

export interface EnhancedListenerConfig {
  // Basic configuration
  enabled: boolean;
  trigger_phrases: TriggerPhrase[];
  
  // Basic anomaly detection
  anomaly_detection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    types: AnomalyEvent['type'][];
  };
  
  // Privacy settings
  privacy: {
    store_audio: boolean;
    audio_retention_days: number;
    send_to_cloud: boolean;
    local_only: boolean;
  };
  
  // Emergency services
  emergency_services: {
    enabled: boolean;
    auto_call: boolean;
    emergency_number: string;
  };
  
  // Advanced features
  advanced: {
    enabled: boolean;
    anomalyConfig: AdvancedAnomalyConfig;
    environmentMonitoring: boolean;
    mlModelsEnabled: boolean;
    patternRecognition: boolean;
    contextualAwareness: boolean;
  };
}

export interface ListenerEvent {
  event_id: string;
  timestamp: Date;
  type: 'trigger' | 'anomaly' | 'context' | 'advanced_anomaly' | 'environment_change';
  trigger?: {
    phrase: string;
    confidence: number;
    action_taken: string;
  };
  anomaly?: AnomalyEvent;
  advanced_anomaly?: any; // From advanced anomaly detection
  environment_change?: any; // From environment monitoring
  context?: {
    vehicle_speed_kmh: number;
    engine_running: boolean;
    passengers: number;
  };
}

export interface EnhancedListenerState {
  active: boolean;
  listening: boolean;
  advanced_features_active: boolean;
  environment_monitoring_active: boolean;
  last_event?: ListenerEvent;
  events_count: number;
  uptime_seconds: number;
  ml_models_loaded: number;
  pattern_recognizers_active: number;
}

/**
 * Enhanced AI Background Listener Class
 * Main class for managing background audio monitoring with advanced AI analysis
 */
export class EnhancedAIBackgroundListener {
  private config: EnhancedListenerConfig;
  private state: EnhancedListenerState;
  private basicListener: AIBackgroundListener;
  private advancedListener?: AdvancedAIBackgroundListener;
  private environmentMonitor?: EnvironmentPatternMonitor;
  private isListening = false;
  private events: ListenerEvent[] = [];
  private startTime: Date;

  constructor(config?: Partial<EnhancedListenerConfig>) {
    this.startTime = new Date();
    this.config = { ...this.getDefaultConfig(), ...config };
    this.state = this.initializeState();
    this.basicListener = new AIBackgroundListener({
      enabled: this.config.enabled,
      trigger_phrases: this.config.trigger_phrases,
      anomaly_detection: this.config.anomaly_detection,
      privacy: this.config.privacy,
      emergency_services: this.config.emergency_services
    });
  }

  /**
   * Initialize the enhanced listener system
   */
  async initialize(): Promise<void> {
    try {
      console.log('🤖 Initializing Enhanced AI Background Listener...');
      
      // Initialize basic listener
      console.log('📱 Initializing basic listener...');
      
      // Initialize advanced features if enabled
      if (this.config.advanced.enabled) {
        await this.initializeAdvancedFeatures();
      }
      
      // Initialize environment monitoring if enabled
      if (this.config.advanced.environmentMonitoring) {
        await this.initializeEnvironmentMonitoring();
      }
      
      this.updateState();
      console.log('✅ Enhanced AI Background Listener initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced AI Background Listener:', error);
      throw error;
    }
  }

  /**
   * Initialize advanced AI features
   */
  private async initializeAdvancedFeatures(): Promise<void> {
    console.log('🧠 Initializing advanced AI features...');
    
    this.advancedListener = new AdvancedAIBackgroundListener(this.config.advanced.anomalyConfig);
    
    // Setup event handlers
    this.advancedListener.on('anomalyDetected', (anomaly) => {
      this.handleAdvancedAnomaly(anomaly);
    });
    
    this.advancedListener.on('emergencyProtocol', (anomaly) => {
      this.handleEmergencyProtocol(anomaly);
    });
    
    await this.advancedListener.initialize();
    console.log('✅ Advanced AI features initialized');
  }

  /**
   * Initialize environment monitoring
   */
  private async initializeEnvironmentMonitoring(): Promise<void> {
    console.log('🌍 Initializing environment monitoring...');
    
    this.environmentMonitor = new EnvironmentPatternMonitor();
    
    // Setup event handlers
    this.environmentMonitor.on('monitoringResult', (result) => {
      this.handleEnvironmentChange(result);
    });
    
    this.environmentMonitor.on('adaptationApplied', (adaptation) => {
      console.log(`🔧 Environment adaptation applied: ${adaptation.adaptation.action}`);
    });
    
    console.log('✅ Environment monitoring initialized');
  }

  /**
   * Start the enhanced listener system
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('Enhanced listener is disabled in configuration');
    }

    try {
      console.log('🚀 Starting Enhanced AI Background Listener...');
      
      // Start basic listener
      this.basicListener.start();
      
      // Start advanced features
      if (this.advancedListener) {
        // Advanced listener starts automatically when processing audio
        this.state.advanced_features_active = true;
      }
      
      // Start environment monitoring
      if (this.environmentMonitor) {
        this.environmentMonitor.start();
        this.state.environment_monitoring_active = true;
      }
      
      this.isListening = true;
      this.state.active = true;
      this.state.listening = true;
      
      console.log('✅ Enhanced AI Background Listener started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start Enhanced AI Background Listener:', error);
      throw error;
    }
  }

  /**
   * Stop the enhanced listener system
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping Enhanced AI Background Listener...');
      
      // Stop basic listener
      this.basicListener.stop();
      
      // Stop advanced features
      if (this.advancedListener) {
        await this.advancedListener.shutdown();
        this.state.advanced_features_active = false;
      }
      
      // Stop environment monitoring
      if (this.environmentMonitor) {
        this.environmentMonitor.stop();
        this.state.environment_monitoring_active = false;
      }
      
      this.isListening = false;
      this.state.active = false;
      this.state.listening = false;
      
      console.log('✅ Enhanced AI Background Listener stopped');
      
    } catch (error) {
      console.error('❌ Error stopping Enhanced AI Background Listener:', error);
      throw error;
    }
  }

  /**
   * Process audio input with enhanced analysis
   */
  async processAudio(audioData: number[]): Promise<ListenerEvent | null> {
    if (!this.isListening) {
      return null;
    }

    let detectedEvent: ListenerEvent | null = null;

    try {
      // Process with basic listener first
      const basicEvent = this.basicListener.processAudio(audioData);
      if (basicEvent) {
        detectedEvent = this.convertBasicEvent(basicEvent);
      }

      // Process with advanced listener if enabled
      if (this.advancedListener && this.config.advanced.enabled) {
        const advancedEvent = await this.advancedListener.processAudio(audioData);
        if (advancedEvent) {
          detectedEvent = this.convertAdvancedEvent(advancedEvent);
        }
      }

      // Record event if detected
      if (detectedEvent) {
        this.recordEvent(detectedEvent);
      }

      return detectedEvent;

    } catch (error) {
      console.error('❌ Error processing audio:', error);
      return null;
    }
  }

  /**
   * Process trigger phrase
   */
  processTrigger(phrase: string): ListenerEvent | null {
    if (!this.isListening) {
      return null;
    }

    try {
      const basicEvent = this.basicListener.processTrigger(phrase);
      if (basicEvent) {
        const enhancedEvent = this.convertBasicEvent(basicEvent);
        this.recordEvent(enhancedEvent);
        return enhancedEvent;
      }
    } catch (error) {
      console.error('❌ Error processing trigger phrase:', error);
    }

    return null;
  }

  /**
   * Handle advanced anomaly detection
   */
  private handleAdvancedAnomaly(anomaly: any): void {
    const event: ListenerEvent = {
      event_id: this.generateEventId(),
      timestamp: new Date(),
      type: 'advanced_anomaly',
      advanced_anomaly: anomaly
    };

    this.recordEvent(event);
    console.log(`🚨 Advanced anomaly detected: ${anomaly.type} (${anomaly.subtype}) - Confidence: ${(anomaly.confidence * 100).toFixed(1)}%`);
  }

  /**
   * Handle emergency protocol activation
   */
  private handleEmergencyProtocol(anomaly: any): void {
    console.log(`🚨 EMERGENCY PROTOCOL ACTIVATED: ${anomaly.type} - ${anomaly.subtype}`);
    
    // Would integrate with vehicle's emergency systems
    if (this.config.emergency_services.enabled && this.config.emergency_services.auto_call) {
      console.log(`📞 Auto-calling emergency services: ${this.config.emergency_services.emergency_number}`);
    }
  }

  /**
   * Handle environment monitoring changes
   */
  private handleEnvironmentChange(result: any): void {
    if (result.patterns.length > 0) {
      const event: ListenerEvent = {
        event_id: this.generateEventId(),
        timestamp: new Date(),
        type: 'environment_change',
        environment_change: {
          patterns: result.patterns,
          adaptations: result.adaptations,
          confidence: result.confidence,
          recommendations: result.recommendations
        }
      };

      this.recordEvent(event);
      console.log(`🌍 Environment change detected: ${result.patterns.length} patterns, ${result.adaptations.length} adaptations applied`);
    }
  }

  /**
   * Convert basic listener event to enhanced event
   */
  private convertBasicEvent(basicEvent: any): ListenerEvent {
    return {
      event_id: basicEvent.event_id || this.generateEventId(),
      timestamp: basicEvent.timestamp || new Date(),
      type: basicEvent.type,
      trigger: basicEvent.trigger,
      anomaly: basicEvent.anomaly,
      context: basicEvent.context
    };
  }

  /**
   * Convert advanced listener event to enhanced event
   */
  private convertAdvancedEvent(advancedEvent: any): ListenerEvent {
    return {
      event_id: advancedEvent.id || this.generateEventId(),
      timestamp: advancedEvent.timestamp || new Date(),
      type: 'advanced_anomaly',
      advanced_anomaly: advancedEvent
    };
  }

  /**
   * Record event and update state
   */
  private recordEvent(event: ListenerEvent): void {
    this.events.push(event);
    this.state.last_event = event;
    this.state.events_count++;
    
    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  /**
   * Update listener state
   */
  private updateState(): void {
    this.state.uptime_seconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    
    if (this.advancedListener) {
      const advancedStatus = this.advancedListener.getStatus();
      this.state.ml_models_loaded = advancedStatus.modelsLoaded || 0;
      this.state.pattern_recognizers_active = advancedStatus.patternRecognizers || 0;
    }
  }

  /**
   * Get current state
   */
  getState(): EnhancedListenerState {
    this.updateState();
    return { ...this.state };
  }

  /**
   * Get configuration
   */
  getConfig(): EnhancedListenerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: Partial<EnhancedListenerConfig>): Promise<void> {
    const wasListening = this.isListening;
    
    if (wasListening) {
      await this.stop();
    }
    
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize if needed
    if (newConfig.advanced && this.config.advanced.enabled && !this.advancedListener) {
      await this.initializeAdvancedFeatures();
    }
    
    if (newConfig.advanced?.environmentMonitoring && !this.environmentMonitor) {
      await this.initializeEnvironmentMonitoring();
    }
    
    if (wasListening) {
      await this.start();
    }
  }

  /**
   * Get recent events
   */
  getEvents(limit = 10): ListenerEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear events history
   */
  clearEvents(): void {
    this.events = [];
    this.state.events_count = 0;
    this.state.last_event = undefined;
  }

  /**
   * Get comprehensive status including all subsystems
   */
  getComprehensiveStatus(): any {
    const status = {
      enhanced: this.getState(),
      basic: this.basicListener.getState(),
      advanced: this.advancedListener?.getStatus(),
      environment: this.environmentMonitor?.getStatus()
    };

    return status;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): any {
    const totalEvents = this.events.length;
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      eventsByType,
      uptime: this.state.uptime_seconds,
      averageEventsPerHour: totalEvents / Math.max(this.state.uptime_seconds / 3600, 1),
      mlModelsLoaded: this.state.ml_models_loaded,
      patternRecognizersActive: this.state.pattern_recognizers_active,
      environmentMonitoringActive: this.state.environment_monitoring_active
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `eevt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize default state
   */
  private initializeState(): EnhancedListenerState {
    return {
      active: false,
      listening: false,
      advanced_features_active: false,
      environment_monitoring_active: false,
      events_count: 0,
      uptime_seconds: 0,
      ml_models_loaded: 0,
      pattern_recognizers_active: 0
    };
  }

  /**
   * Get default enhanced configuration
   */
  private getDefaultConfig(): EnhancedListenerConfig {
    return {
      enabled: true,
      trigger_phrases: [
        {
          phrase: 'hey tunexa',
          language: 'en',
          action: 'activate_voice_assistant',
          confidence_threshold: 0.85
        },
        {
          phrase: 'emergency',
          language: 'en',
          action: 'emergency_alert',
          confidence_threshold: 0.90
        },
        {
          phrase: 'pomoc',
          language: 'sk',
          action: 'emergency_alert',
          confidence_threshold: 0.90
        }
      ],
      anomaly_detection: {
        enabled: true,
        sensitivity: 'medium',
        types: ['accident', 'help_request', 'unusual_sound', 'emergency']
      },
      privacy: {
        store_audio: false,
        audio_retention_days: 7,
        send_to_cloud: false,
        local_only: true
      },
      emergency_services: {
        enabled: true,
        auto_call: false,
        emergency_number: '112'
      },
      advanced: {
        enabled: true,
        anomalyConfig: defaultAdvancedConfig,
        environmentMonitoring: true,
        mlModelsEnabled: true,
        patternRecognition: true,
        contextualAwareness: true
      }
    };
  }
}

// Export enhanced components
export {
  AdvancedAIBackgroundListener,
  defaultAdvancedConfig,
  type AdvancedAnomalyConfig,
  type AdvancedAnomalyEvent
} from './advanced-anomaly-detection.js';

export {
  EnvironmentPatternMonitor,
  type EnvironmentPattern,
  type EnvironmentContext,
  type MonitoringResult
} from './environment-monitoring.js';

// Default enhanced listener instance
export const enhancedListener = new EnhancedAIBackgroundListener();

/**
 * Initialize the AI Background Listener with configuration
 * @param config Listener configuration
 * @returns Initial listener state
 */
export function initializeListener(config: ListenerConfig): ListenerState {
  if (!config.enabled) {
    return {
      active: false,
      listening: false,
      events_count: 0,
      uptime_seconds: 0
    };
  }

  return {
    active: true,
    listening: true,
    events_count: 0,
    uptime_seconds: 0
  };
}

/**
 * Process detected trigger phrase
 * @param phrase Detected phrase
 * @param config Listener configuration
 * @returns Listener event if trigger matches configured phrases
 */
export function processTriggerPhrase(
  phrase: string,
  config: ListenerConfig
): ListenerEvent | null {
  const matchedTrigger = config.trigger_phrases.find(
    t => phrase.toLowerCase().includes(t.phrase.toLowerCase())
  );

  if (!matchedTrigger) {
    return null;
  }

  return {
    event_id: generateEventId(),
    timestamp: new Date(),
    type: 'trigger',
    trigger: {
      phrase: matchedTrigger.phrase,
      confidence: matchedTrigger.confidence_threshold,
      action_taken: matchedTrigger.action
    }
  };
}

/**
 * Detect anomaly in audio environment
 * @param audioData Audio data for analysis
 * @param config Listener configuration
 * @returns Anomaly event if detected
 */
export function detectAnomaly(
  audioData: number[],
  config: ListenerConfig
): AnomalyEvent | null {
  if (!config.anomaly_detection.enabled) {
    return null;
  }

  // Simulate anomaly detection logic
  // In real implementation, this would use AI models
  const avgAmplitude = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
  
  let threshold = 0;
  switch (config.anomaly_detection.sensitivity) {
    case 'low':
      threshold = 0.8;
      break;
    case 'medium':
      threshold = 0.6;
      break;
    case 'high':
      threshold = 0.4;
      break;
  }

  if (avgAmplitude > threshold) {
    return {
      type: 'unusual_sound',
      timestamp: new Date(),
      confidence: Math.min(avgAmplitude, 1.0)
    };
  }

  return null;
}

/**
 * Handle emergency event
 * @param event Anomaly event
 * @param config Listener configuration
 * @returns Action taken status
 */
export function handleEmergency(
  event: AnomalyEvent,
  config: ListenerConfig
): { called: boolean; message: string } {
  if (!config.emergency_services.enabled) {
    return {
      called: false,
      message: 'Emergency services disabled'
    };
  }

  if (event.type === 'accident' || event.type === 'emergency') {
    if (config.emergency_services.auto_call) {
      return {
        called: true,
        message: `Called ${config.emergency_services.emergency_number}`
      };
    }
    return {
      called: false,
      message: 'Emergency detected but auto-call disabled'
    };
  }

  return {
    called: false,
    message: 'Event type does not require emergency call'
  };
}

/**
 * Get default listener configuration
 * @returns Default configuration
 */
export function getDefaultConfig(): ListenerConfig {
  return {
    enabled: true,
    trigger_phrases: [
      {
        phrase: 'hey tunexa',
        language: 'en',
        action: 'activate_voice_assistant',
        confidence_threshold: 0.85
      },
      {
        phrase: 'help me',
        language: 'en',
        action: 'emergency_alert',
        confidence_threshold: 0.75
      },
      {
        phrase: 'pomoc',
        language: 'sk',
        action: 'emergency_alert',
        confidence_threshold: 0.75
      }
    ],
    anomaly_detection: {
      enabled: true,
      sensitivity: 'medium',
      types: ['accident', 'help_request', 'unusual_sound', 'emergency']
    },
    privacy: {
      store_audio: false,
      audio_retention_days: 7,
      send_to_cloud: false,
      local_only: true
    },
    emergency_services: {
      enabled: true,
      auto_call: false,
      emergency_number: '112'
    }
  };
}

/**
 * Generate unique event ID
 * @returns Event ID string
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate listener configuration
 * @param config Configuration to validate
 * @returns Validation result
 */
export function validateConfig(config: ListenerConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.enabled && config.trigger_phrases.length === 0) {
    errors.push('At least one trigger phrase is required when listener is enabled');
  }

  for (const phrase of config.trigger_phrases) {
    if (phrase.confidence_threshold < 0 || phrase.confidence_threshold > 1) {
      errors.push(`Invalid confidence threshold for phrase "${phrase.phrase}": must be between 0 and 1`);
    }
  }

  if (config.privacy.audio_retention_days < 0) {
    errors.push('Audio retention days must be non-negative');
  }

  if (config.emergency_services.enabled && !config.emergency_services.emergency_number) {
    errors.push('Emergency number is required when emergency services are enabled');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * AI Background Listener Class
 * Main class for managing background audio monitoring and AI analysis
 */
export class AIBackgroundListener {
  private config: ListenerConfig;
  private state: ListenerState;
  private isListening = false;
  private events: ListenerEvent[] = [];

  constructor(config?: Partial<ListenerConfig>) {
    this.config = { ...getDefaultConfig(), ...config };
    this.state = initializeListener(this.config);
  }

  /**
   * Start the background listener
   */
  start(): void {
    if (!this.config.enabled) {
      throw new Error('Listener is disabled in configuration');
    }

    this.isListening = true;
    this.state.active = true;
    this.state.listening = true;
    
    console.log('AI Background Listener started');
  }

  /**
   * Stop the background listener
   */
  stop(): void {
    this.isListening = false;
    this.state.active = false;
    this.state.listening = false;
    
    console.log('AI Background Listener stopped');
  }

  /**
   * Process audio input
   */
  processAudio(audioData: number[]): ListenerEvent | null {
    if (!this.isListening) {
      return null;
    }

    // Check for anomalies
    const anomaly = detectAnomaly(audioData, this.config);
    if (anomaly) {
      const event: ListenerEvent = {
        event_id: generateEventId(),
        timestamp: new Date(),
        type: 'anomaly',
        anomaly
      };

      this.events.push(event);
      this.state.events_count++;
      this.state.last_event = event;

      // Handle emergency if needed
      if (anomaly.type === 'emergency' || anomaly.type === 'accident') {
        handleEmergency(anomaly, this.config);
      }

      return event;
    }

    return null;
  }

  /**
   * Process trigger phrase
   */
  processTrigger(phrase: string): ListenerEvent | null {
    if (!this.isListening) {
      return null;
    }

    const event = processTriggerPhrase(phrase, this.config);
    if (event) {
      this.events.push(event);
      this.state.events_count++;
      this.state.last_event = event;
    }

    return event;
  }

  /**
   * Get current state
   */
  getState(): ListenerState {
    return { ...this.state };
  }

  /**
   * Get configuration
   */
  getConfig(): ListenerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ListenerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get recent events
   */
  getEvents(limit = 10): ListenerEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear events history
   */
  clearEvents(): void {
    this.events = [];
    this.state.events_count = 0;
  }
}

// Default configuration for AI Background Listener
export const defaultListenerConfig: ListenerConfig = {
  enabled: true,
  trigger_phrases: [
    { phrase: "hey tunexa", language: "en", action: "voice_assistant", confidence_threshold: 0.8 },
    { phrase: "emergency", language: "en", action: "emergency_mode", confidence_threshold: 0.9 },
  ],
  anomaly_detection: {
    enabled: true,
    sensitivity: "medium",
    types: ["accident", "emergency", "unusual_sound"],
  },
  privacy: {
    store_audio: false,
    audio_retention_days: 7,
    send_to_cloud: false,
    local_only: true,
  },
  emergency_services: {
    enabled: false,
    auto_call: false,
    emergency_number: "112",
  },
};
