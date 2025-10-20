import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CarComparison from './pages/CarComparison';
import AudioCertification from './pages/AudioCertification';
import ProfileManagement from './pages/ProfileManagement';
import SpotifyIntegration from './pages/SpotifyIntegration';
import OEMIntegration from './pages/OEMIntegration';
import Login from './pages/Login';
import Register from './pages/Register';
import { authAPI, User } from './services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loading: true,
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authAPI.getProfile()
        .then(response => {
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('auth_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    authAPI.logout().catch(console.error);
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {authContextValue.isAuthenticated && <Navbar />}
        
        <Box component="main" sx={{ flexGrow: 1, p: authContextValue.isAuthenticated ? 3 : 0 }}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={!authContextValue.isAuthenticated ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!authContextValue.isAuthenticated ? <Register /> : <Navigate to="/" />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={authContextValue.isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/car-comparison" 
              element={authContextValue.isAuthenticated ? <CarComparison /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/audio-certification" 
              element={authContextValue.isAuthenticated ? <AudioCertification /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile-management" 
              element={authContextValue.isAuthenticated ? <ProfileManagement /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/spotify" 
              element={authContextValue.isAuthenticated ? <SpotifyIntegration /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/oem-integration" 
              element={authContextValue.isAuthenticated ? <OEMIntegration /> : <Navigate to="/login" />} 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>
      </Box>
    </AuthContext.Provider>
  );
}

export default App;