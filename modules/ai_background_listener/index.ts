/**
 * AI Background Listener Module
 * Continuously monitors audio environment in vehicle for trigger phrases,
 * anomaly detection, and context-aware actions.
 */

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

export interface ListenerEvent {
  event_id: string;
  timestamp: Date;
  type: 'trigger' | 'anomaly' | 'context';
  trigger?: {
    phrase: string;
    confidence: number;
    action_taken: string;
  };
  anomaly?: AnomalyEvent;
  context?: {
    vehicle_speed_kmh: number;
    engine_running: boolean;
    passengers: number;
  };
}

export interface ListenerState {
  active: boolean;
  listening: boolean;
  last_event?: ListenerEvent;
  events_count: number;
  uptime_seconds: number;
}

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
