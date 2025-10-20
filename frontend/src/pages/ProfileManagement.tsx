import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Device as DeviceIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Bluetooth as BluetoothIcon,
  PhoneAndroid as PhoneIcon,
  Computer as ComputerIcon,
  Watch as WatchIcon,
  Headset as HeadsetIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { AuthContext } from '../App';
import { profileAPI } from '../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    audioProfile: string;
    autoTuning: boolean;
    backgroundListening: boolean;
    notifications: boolean;
  };
  stats: {
    sessionsCount: number;
    totalListeningTime: number;
    devicesRegistered: number;
  };
}

interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'tablet' | 'computer' | 'smartwatch' | 'headphones' | 'car_system';
  status: 'connected' | 'disconnected';
  lastSeen: string;
  batteryLevel?: number;
}

const ProfileManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [newDeviceDialog, setNewDeviceDialog] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'smartphone' as const });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulujem API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProfile: UserProfile = {
        id: user?.id || '1',
        name: user?.name || 'John Doe',
        email: user?.email || 'john@example.com',
        avatar: user?.avatar,
        preferences: {
          audioProfile: 'balanced',
          autoTuning: true,
          backgroundListening: false,
          notifications: true,
        },
        stats: {
          sessionsCount: 127,
          totalListeningTime: 45.5, // hours
          devicesRegistered: 4,
        },
      };

      const mockDevices: Device[] = [
        {
          id: '1',
          name: 'iPhone 14 Pro',
          type: 'smartphone',
          status: 'connected',
          lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          batteryLevel: 85,
        },
        {
          id: '2',
          name: 'MacBook Pro',
          type: 'computer',
          status: 'connected',
          lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'BMW iDrive',
          type: 'car_system',
          status: 'disconnected',
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          name: 'AirPods Pro',
          type: 'headphones',
          status: 'connected',
          lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          batteryLevel: 92,
        },
      ];

      setProfile(mockProfile);
      setDevices(mockDevices);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      // Simulujem API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProfile = { ...profile, ...editedProfile };
      setProfile(updatedProfile);
      setEditProfileDialog(false);
      setEditedProfile({});
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDevice.name) return;

    try {
      setLoading(true);
      // Simulujem API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const device: Device = {
        id: Date.now().toString(),
        name: newDevice.name,
        type: newDevice.type,
        status: 'connected',
        lastSeen: new Date().toISOString(),
        batteryLevel: Math.floor(Math.random() * 100),
      };

      setDevices(prev => [...prev, device]);
      setNewDeviceDialog(false);
      setNewDevice({ name: '', type: 'smartphone' });
    } catch (err) {
      setError('Failed to add device');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      setLoading(true);
      // Simulujem API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setDevices(prev => prev.filter(d => d.id !== deviceId));
    } catch (err) {
      setError('Failed to remove device');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return <PhoneIcon />;
      case 'computer':
        return <ComputerIcon />;
      case 'smartwatch':
        return <WatchIcon />;
      case 'headphones':
        return <HeadsetIcon />;
      case 'car_system':
        return <DeviceIcon />;
      default:
        return <DeviceIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'success' : 'default';
  };

  const formatLastSeen = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hours ago`;
    }
  };

  const formatListeningTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  if (loading && !profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">Profile Information</Typography>
              <IconButton onClick={() => {
                setEditedProfile(profile);
                setEditProfileDialog(true);
              }}>
                <EditIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 80, height: 80, mb: 2 }}
                src={profile.avatar}
              >
                {profile.name.charAt(0)}
              </Avatar>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {profile.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Audio Preferences
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Audio Profile: <strong>{profile.preferences.audioProfile}</strong>
              </Typography>
            </Box>
            
            <FormControlLabel
              control={<Switch checked={profile.preferences.autoTuning} disabled />}
              label="Auto Tuning"
            />
            <FormControlLabel
              control={<Switch checked={profile.preferences.backgroundListening} disabled />}
              label="Background Listening"
            />
            <FormControlLabel
              control={<Switch checked={profile.preferences.notifications} disabled />}
              label="Notifications"
            />
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {profile.stats.sessionsCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Sessions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="secondary">
                    {formatListeningTime(profile.stats.totalListeningTime)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Listening Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {profile.stats.devicesRegistered}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Registered Devices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Devices */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Connected Devices</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setNewDeviceDialog(true)}
              >
                Add Device
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Device</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell>Battery</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getDeviceIcon(device.type)}
                          <Typography sx={{ ml: 1 }}>{device.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{device.type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Chip
                          label={device.status}
                          color={getStatusColor(device.status)}
                          size="small"
                          icon={<BluetoothIcon />}
                        />
                      </TableCell>
                      <TableCell>{formatLastSeen(device.lastSeen)}</TableCell>
                      <TableCell>
                        {device.batteryLevel ? `${device.batteryLevel}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleRemoveDevice(device.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {devices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        No devices registered. Add your first device to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialog} onClose={() => setEditProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={editedProfile.name || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editedProfile.email || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedProfile.preferences?.autoTuning ?? false}
                    onChange={(e) => setEditedProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, autoTuning: e.target.checked }
                    }))}
                  />
                }
                label="Auto Tuning"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editedProfile.preferences?.backgroundListening ?? false}
                    onChange={(e) => setEditedProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, backgroundListening: e.target.checked }
                    }))}
                  />
                }
                label="Background Listening"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editedProfile.preferences?.notifications ?? false}
                    onChange={(e) => setEditedProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, notifications: e.target.checked }
                    }))}
                  />
                }
                label="Notifications"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Device Dialog */}
      <Dialog open={newDeviceDialog} onClose={() => setNewDeviceDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Device Name"
                value={newDevice.name}
                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Device Type"
                value={newDevice.type}
                onChange={(e) => setNewDevice(prev => ({ ...prev, type: e.target.value as any }))}
                SelectProps={{ native: true }}
              >
                <option value="smartphone">Smartphone</option>
                <option value="tablet">Tablet</option>
                <option value="computer">Computer</option>
                <option value="smartwatch">Smartwatch</option>
                <option value="headphones">Headphones</option>
                <option value="car_system">Car System</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDeviceDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddDevice}
            variant="contained"
            disabled={!newDevice.name}
          >
            Add Device
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileManagement;