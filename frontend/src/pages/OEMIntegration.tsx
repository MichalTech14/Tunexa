import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
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
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Bluetooth as BluetoothIcon,
  Wifi as WifiIcon,
  Usb as UsbIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  BatteryFull as BatteryIcon,
  Thermostat as TempIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { oemAPI } from '../services/api';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  connectionType: 'bluetooth' | 'wifi' | 'usb' | 'obd';
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: string;
}

interface DiagnosticData {
  engineRpm: number;
  speed: number;
  engineTemp: number;
  batteryVoltage: number;
  fuelLevel: number;
  errors: DiagnosticError[];
}

interface DiagnosticError {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface AudioSystemInfo {
  manufacturer: string;
  model: string;
  version: string;
  speakers: number;
  amplifiers: number;
  digitalSignalProcessor: boolean;
  supportedCodecs: string[];
}

const OEMIntegration: React.FC = () => {
  const [connectedVehicle, setConnectedVehicle] = useState<Vehicle | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [audioSystemInfo, setAudioSystemInfo] = useState<AudioSystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectDialog, setConnectDialog] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({
    type: 'bluetooth' as 'bluetooth' | 'wifi' | 'usb' | 'obd',
    identifier: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const supportedBrands = [
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Tesla', 
    'Toyota', 'Honda', 'Ford', 'Škoda', 'Hyundai'
  ];

  const connectionTypes = [
    { value: 'bluetooth', label: 'Bluetooth', icon: <BluetoothIcon /> },
    { value: 'wifi', label: 'Wi-Fi', icon: <WifiIcon /> },
    { value: 'usb', label: 'USB/OTG', icon: <UsbIcon /> },
    { value: 'obd', label: 'OBD-II', icon: <SettingsIcon /> },
  ];

  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const handleConnect = async () => {
    if (!connectionConfig.identifier) {
      setError('Please enter connection identifier');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Simulujem connection process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockVehicle: Vehicle = {
        id: 'vehicle_1',
        brand: 'BMW',
        model: '3-Series',
        year: 2023,
        vin: 'WBANU13507CT12345',
        connectionType: connectionConfig.type,
        status: 'connected',
        lastConnected: new Date().toISOString(),
      };

      const mockDiagnosticData: DiagnosticData = {
        engineRpm: 800,
        speed: 0,
        engineTemp: 90,
        batteryVoltage: 12.4,
        fuelLevel: 75,
        errors: [
          {
            code: 'P0171',
            description: 'System Too Lean (Bank 1)',
            severity: 'medium',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      const mockAudioSystem: AudioSystemInfo = {
        manufacturer: 'Harman Kardon',
        model: 'Logic 7',
        version: '2.1.4',
        speakers: 13,
        amplifiers: 1,
        digitalSignalProcessor: true,
        supportedCodecs: ['SBC', 'AAC', 'aptX', 'LDAC'],
      };

      setConnectedVehicle(mockVehicle);
      setDiagnosticData(mockDiagnosticData);
      setAudioSystemInfo(mockAudioSystem);
      setConnectDialog(false);

      // Start real-time updates
      const interval = setInterval(() => {
        setDiagnosticData(prev => prev ? {
          ...prev,
          engineRpm: 800 + Math.random() * 200,
          speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 10),
          engineTemp: 90 + Math.random() * 5,
          batteryVoltage: 12.4 + Math.random() * 0.4,
          fuelLevel: Math.max(0, prev.fuelLevel - Math.random() * 0.1),
        } : null);
      }, 2000);
      setRefreshInterval(interval);

    } catch (err) {
      setError('Failed to connect to vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnectedVehicle(null);
    setDiagnosticData(null);
    setAudioSystemInfo(null);
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'low':
        return <CheckIcon />;
      default:
        return <CheckIcon />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!connectedVehicle) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          OEM Integration
        </Typography>

        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CarIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Vehicle
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Connect to your vehicle's OEM system to access advanced diagnostics and audio integration.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {supportedBrands.map((brand) => (
              <Grid item key={brand}>
                <Chip label={brand} variant="outlined" />
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            size="large"
            startIcon={<LinkIcon />}
            onClick={() => setConnectDialog(true)}
            disabled={loading}
          >
            Connect Vehicle
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Connection Dialog */}
        <Dialog open={connectDialog} onClose={() => setConnectDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Connect to Vehicle</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Choose your connection method and enter the required information.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Connection Type</InputLabel>
              <Select
                value={connectionConfig.type}
                onChange={(e) => setConnectionConfig(prev => ({ ...prev, type: e.target.value as any }))}
                label="Connection Type"
              >
                {connectionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {type.icon}
                      <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={
                connectionConfig.type === 'bluetooth' ? 'Device Name/MAC Address' :
                connectionConfig.type === 'wifi' ? 'IP Address' :
                connectionConfig.type === 'usb' ? 'Device ID' :
                'OBD-II Adapter'
              }
              value={connectionConfig.identifier}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, identifier: e.target.value }))}
              placeholder={
                connectionConfig.type === 'bluetooth' ? 'BMW_AUDIO_123ABC' :
                connectionConfig.type === 'wifi' ? '192.168.4.1' :
                connectionConfig.type === 'usb' ? 'USB_DEVICE_001' :
                'ELM327'
              }
            />

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Establishing connection...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConnectDialog(false)}>Cancel</Button>
            <Button
              onClick={handleConnect}
              variant="contained"
              disabled={!connectionConfig.identifier || loading}
            >
              Connect
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          OEM Integration
        </Typography>
        <Button
          variant="outlined"
          startIcon={<UnlinkIcon />}
          onClick={handleDisconnect}
          color="error"
        >
          Disconnect
        </Button>
      </Box>

      {/* Vehicle Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CarIcon sx={{ mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h6">
              {connectedVehicle.brand} {connectedVehicle.model} ({connectedVehicle.year})
            </Typography>
            <Typography variant="body2" color="textSecondary">
              VIN: {connectedVehicle.vin} • Connected via {connectedVehicle.connectionType.toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              icon={<CheckIcon />}
              label="Connected"
              color="success"
            />
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Diagnostics" />
          <Tab label="Audio System" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>

      {/* Diagnostics Tab */}
      {activeTab === 0 && diagnosticData && (
        <Grid container spacing={3}>
          {/* Real-time Data */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Real-time Data
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpeedIcon color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h6">
                            {Math.round(diagnosticData.engineRpm)} RPM
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Engine Speed
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TempIcon color="secondary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h6">
                            {Math.round(diagnosticData.engineTemp)}°C
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Engine Temp
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BatteryIcon color="success" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h6">
                            {diagnosticData.batteryVoltage.toFixed(1)}V
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Battery
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MemoryIcon color="warning" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h6">
                            {Math.round(diagnosticData.fuelLevel)}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Fuel Level
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Error Codes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Diagnostic Trouble Codes
              </Typography>
              {diagnosticData.errors.length > 0 ? (
                <List>
                  {diagnosticData.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getSeverityIcon(error.severity)}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${error.code}: ${error.description}`}
                        secondary={formatTimestamp(error.timestamp)}
                      />
                      <Chip
                        label={error.severity.toUpperCase()}
                        color={getSeverityColor(error.severity)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No diagnostic errors found
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Audio System Tab */}
      {activeTab === 1 && audioSystemInfo && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Audio System Information
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Manufacturer</TableCell>
                    <TableCell>{audioSystemInfo.manufacturer}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell>{audioSystemInfo.model}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Firmware Version</TableCell>
                    <TableCell>{audioSystemInfo.version}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Speakers</TableCell>
                    <TableCell>{audioSystemInfo.speakers}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Amplifiers</TableCell>
                    <TableCell>{audioSystemInfo.amplifiers}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DSP</TableCell>
                    <TableCell>
                      <Chip
                        label={audioSystemInfo.digitalSignalProcessor ? 'Yes' : 'No'}
                        color={audioSystemInfo.digitalSignalProcessor ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Supported Audio Codecs
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {audioSystemInfo.supportedCodecs.map((codec) => (
                  <Chip key={codec} label={codec} variant="outlined" />
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Audio Controls
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Volume Control" secondary="Direct volume adjustment" />
                  <Chip label="Available" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="EQ Settings" secondary="Built-in equalizer access" />
                  <Chip label="Available" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Sound Profiles" secondary="Custom audio profiles" />
                  <Chip label="Limited" color="warning" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Advanced DSP" secondary="Digital signal processing" />
                  <Chip label="Available" color="success" size="small" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Settings Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Integration Settings
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Configure how Tunexa integrates with your vehicle's OEM system.
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Auto-connect on startup"
                    secondary="Automatically connect when the app starts"
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Sync audio profiles"
                    secondary="Synchronize Tunexa profiles with vehicle settings"
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Diagnostic monitoring"
                    secondary="Enable continuous diagnostic data collection"
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Export diagnostic data"
                    secondary="Download diagnostic logs and audio measurements"
                  />
                  <Button variant="outlined" size="small" startIcon={<BuildIcon />}>
                    Export
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default OEMIntegration;