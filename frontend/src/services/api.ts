import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year?: number;
  vin?: string;
  isActive: boolean;
  acousticsData?: any;
}

export interface CarComparisonRequest {
  brandA: string;
  modelA: string;
  brandB: string;
  modelB: string;
  criteria: string[];
}

export interface MeasurementRecord {
  id: string;
  timestamp: string;
  vehicle: {
    brand: string;
    model: string;
    year?: string;
  };
  test_configuration: any;
  results: any;
  certification_status: {
    overall: 'PASSED' | 'FAILED' | 'PENDING';
    details: any[];
  };
  certification?: {
    status: string;
    standards_met: string[];
    standards_failed: string[];
    expiry_date: string;
    certificate_number: string;
  };
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  },
};

// Car Comparison API
export const carAPI = {
  getBrands: async (): Promise<ApiResponse<{ brand: string; models: any[] }[]>> => {
    const response = await api.get('/car-comparison/brands');
    return response.data;
  },

  getModels: async (brand: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/car-comparison/brands/${brand}/models`);
    return response.data;
  },

  compare: async (request: CarComparisonRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/car-comparison/compare', request);
    return response.data;
  },

  getVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get('/car-comparison/vehicles');
    return response.data;
  },
};

// Audio Certification API
export const certificationAPI = {
  startMeasurement: async (config: {
    vehicleId: string;
    testType: string;
    standards: string[];
  }): Promise<ApiResponse<MeasurementRecord>> => {
    const response = await api.post('/audio-certification/measurements', config);
    return response.data;
  },

  getMeasurements: async (filters?: {
    vehicleBrand?: string;
    vehicleModel?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MeasurementRecord[]>> => {
    const response = await api.get('/audio-certification/measurements', { params: filters });
    return response.data;
  },

  getMeasurement: async (id: string): Promise<ApiResponse<MeasurementRecord>> => {
    const response = await api.get(`/audio-certification/measurements/${id}`);
    return response.data;
  },

  generateReport: async (config: {
    vehicleId: string;
    standards: string[];
    audioSystem: any;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/audio-certification/reports', config);
    return response.data;
  },

  getReports: async (filters?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/audio-certification/reports', { params: filters });
    return response.data;
  },

  getStandards: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/audio-certification/standards');
    return response.data;
  },

  validateVehicle: async (vehicle: {
    brand: string;
    model: string;
    year?: string;
    vin?: string;
  }): Promise<ApiResponse<{
    eligible: boolean;
    reasons: string[];
    requirements: string[];
  }>> => {
    const response = await api.post('/audio-certification/validate-vehicle', vehicle);
    return response.data;
  },
};

// Profile Management API
export const profileAPI = {
  getDevices: async (filters?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/profile-lock-continuity/devices', { params: filters });
    return response.data;
  },

  registerDevice: async (device: {
    macAddress: string;
    brand: string;
    deviceType: string;
    model?: string;
    name: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/profile-lock-continuity/devices', device);
    return response.data;
  },

  getProfiles: async (userId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/profile-lock-continuity/profiles/${userId}`);
    return response.data;
  },

  getSessions: async (filters?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/profile-lock-continuity/sessions', { params: filters });
    return response.data;
  },

  getUsageStats: async (filters: {
    userId?: string;
    deviceId?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.get('/profile-lock-continuity/usage-statistics', { params: filters });
    return response.data;
  },
};

// Spotify Integration API
export const spotifyAPI = {
  getAuthUrl: async (): Promise<ApiResponse<{ url: string; state: string }>> => {
    const response = await api.get('/spotify-integration/auth');
    return response.data;
  },

  handleCallback: async (code: string, state: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/spotify-integration/auth/callback', { code, state });
    return response.data;
  },

  getAuthStatus: async (): Promise<ApiResponse<{
    isAuthenticated: boolean;
    expiresAt?: string;
    scopes?: string[];
  }>> => {
    const response = await api.get('/spotify-integration/auth/status');
    return response.data;
  },

  getCurrentPlayback: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/spotify-integration/playback');
    return response.data;
  },

  controlPlayback: async (action: {
    command: string;
    value?: any;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/spotify-integration/playback/control', action);
    return response.data;
  },

  getEQPresets: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/spotify-integration/eq/presets');
    return response.data;
  },

  applyEQ: async (settings: {
    presetId?: string;
    customBands?: any[];
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/spotify-integration/eq/apply', settings);
    return response.data;
  },

  getRecommendations: async (params: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/spotify-integration/recommendations', params);
    return response.data;
  },

  disconnect: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/spotify-integration/disconnect');
    return response.data;
  },
};

// OEM Integration API
export const oemAPI = {
  connect: async (config: {
    vehicleId: string;
    protocol: string;
    interface: string;
    parameters: any;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/oem-integration/connect', config);
    return response.data;
  },

  getSessions: async (filters?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/oem-integration/sessions', { params: filters });
    return response.data;
  },

  disconnect: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/oem-integration/sessions/${sessionId}/disconnect`);
    return response.data;
  },

  executeDiagnostic: async (sessionId: string, command: string, parameters: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/oem-integration/sessions/${sessionId}/diagnostic`, {
      command,
      parameters,
    });
    return response.data;
  },

  getProtocols: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/oem-integration/protocols');
    return response.data;
  },

  getSystemStatus: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/oem-integration/status');
    return response.data;
  },
};

export default api;