import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  GetApp as DownloadIcon,
  Science as ScienceIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { certificationAPI } from '../services/api';

interface MeasurementRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  testType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number | null;
  timestamp: string;
  measurements: any;
}

interface TestConfiguration {
  vehicleId: string;
  testType: 'iso_compliance' | 'acoustic_analysis' | 'thd_analysis' | 'frequency_response';
  parameters: {
    sampleRate: number;
    duration: number;
    frequencies: number[];
  };
}

const AudioCertification: React.FC = () => {
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTestDialog, setNewTestDialog] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [testConfiguration, setTestConfiguration] = useState<TestConfiguration>({
    vehicleId: '',
    testType: 'iso_compliance',
    parameters: {
      sampleRate: 48000,
      duration: 30,
      frequencies: [20, 100, 1000, 10000, 20000],
    },
  });

  const testSteps = [
    'Initialize Equipment',
    'Calibrate Microphones',
    'Record Test Signals',
    'Analyze Data',
    'Generate Report',
  ];

  const vehicles = [
    { id: 'bmw-3-series', name: 'BMW 3-Series' },
    { id: 'mercedes-e-class', name: 'Mercedes E-Class' },
    { id: 'tesla-model-3', name: 'Tesla Model 3' },
    { id: 'vw-golf', name: 'Volkswagen Golf' },
    { id: 'skoda-octavia', name: 'Škoda Octavia' },
  ];

  const testTypes = [
    { value: 'iso_compliance', label: 'ISO Compliance Test' },
    { value: 'acoustic_analysis', label: 'Acoustic Analysis' },
    { value: 'thd_analysis', label: 'THD Analysis' },
    { value: 'frequency_response', label: 'Frequency Response' },
  ];

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      // Simulujem API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMeasurements([
        {
          id: '1',
          vehicleId: 'bmw-3-series',
          vehicleName: 'BMW 3-Series',
          testType: 'ISO Compliance Test',
          status: 'completed',
          score: 87,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          measurements: {},
        },
        {
          id: '2',
          vehicleId: 'mercedes-e-class',
          vehicleName: 'Mercedes E-Class',
          testType: 'Acoustic Analysis',
          status: 'completed',
          score: 94,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          measurements: {},
        },
        {
          id: '3',
          vehicleId: 'tesla-model-3',
          vehicleName: 'Tesla Model 3',
          testType: 'THD Analysis',
          status: 'in_progress',
          score: null,
          timestamp: new Date().toISOString(),
          measurements: {},
        },
      ]);
    } catch (err) {
      setError('Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  const startNewTest = async () => {
    if (!testConfiguration.vehicleId || !testConfiguration.testType) {
      setError('Please select vehicle and test type');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setNewTestDialog(false);

      // Simulujem test process
      const testId = `test-${Date.now()}`;
      setActiveTest(testId);

      // Add new test record
      const newTest: MeasurementRecord = {
        id: testId,
        vehicleId: testConfiguration.vehicleId,
        vehicleName: vehicles.find(v => v.id === testConfiguration.vehicleId)?.name || '',
        testType: testTypes.find(t => t.value === testConfiguration.testType)?.label || '',
        status: 'in_progress',
        score: null,
        timestamp: new Date().toISOString(),
        measurements: {},
      };

      setMeasurements(prev => [newTest, ...prev]);

      // Simulujem progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTestProgress(i);
      }

      // Complete test
      const completedScore = Math.floor(Math.random() * 30) + 70; // 70-100
      setMeasurements(prev => prev.map(m => 
        m.id === testId 
          ? { ...m, status: 'completed' as const, score: completedScore }
          : m
      ));

      setActiveTest(null);
      setTestProgress(0);
    } catch (err) {
      setError('Failed to start test');
      setActiveTest(null);
    } finally {
      setLoading(false);
    }
  };

  const stopTest = () => {
    if (activeTest) {
      setMeasurements(prev => prev.map(m => 
        m.id === activeTest 
          ? { ...m, status: 'failed' as const }
          : m
      ));
      setActiveTest(null);
      setTestProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon />;
      case 'in_progress':
        return <CircularProgress size={20} />;
      case 'failed':
        return <ErrorIcon />;
      default:
        return <MicIcon />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    return 'error';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCurrentStep = () => {
    return Math.floor(testProgress / 20);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Audio Certification
        </Typography>
        <Button
          variant="contained"
          startIcon={<ScienceIcon />}
          onClick={() => setNewTestDialog(true)}
          disabled={!!activeTest}
        >
          New Test
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Active Test Progress */}
      {activeTest && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Test in Progress
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopTest}
            >
              Stop Test
            </Button>
          </Box>
          
          <Stepper activeStep={getCurrentStep()} sx={{ mb: 3 }}>
            {testSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={testProgress} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {testProgress}%
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Test Results */}
      <Grid container spacing={3}>
        {/* Recent Measurements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Measurements
            </Typography>
            
            {loading && measurements.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Test Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {measurements.map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell>{measurement.vehicleName}</TableCell>
                        <TableCell>{measurement.testType}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(measurement.status)}
                            label={measurement.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(measurement.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {measurement.score ? (
                            <Chip
                              label={`${measurement.score}/100`}
                              color={getScoreColor(measurement.score)}
                              size="small"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{formatDate(measurement.timestamp)}</TableCell>
                        <TableCell>
                          {measurement.status === 'completed' && (
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => {
                                // Implement report download
                                console.log('Download report for', measurement.id);
                              }}
                            >
                              Report
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {measurements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          No measurements found. Start a new test to begin.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Test Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {measurements.filter(m => m.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed Tests
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {measurements.filter(m => m.score && m.score >= 90).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Excellent Scores
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h4" color="primary">
                {measurements.filter(m => m.score).length > 0
                  ? Math.round(
                      measurements
                        .filter(m => m.score)
                        .reduce((acc, m) => acc + (m.score || 0), 0) /
                      measurements.filter(m => m.score).length
                    )
                  : 0}
                /100
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Across all completed tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New Test Dialog */}
      <Dialog open={newTestDialog} onClose={() => setNewTestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configure New Test</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={testConfiguration.vehicleId}
                  onChange={(e) => setTestConfiguration(prev => ({ ...prev, vehicleId: e.target.value }))}
                  label="Vehicle"
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={testConfiguration.testType}
                  onChange={(e) => setTestConfiguration(prev => ({ ...prev, testType: e.target.value as any }))}
                  label="Test Type"
                >
                  {testTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sample Rate (Hz)"
                type="number"
                value={testConfiguration.parameters.sampleRate}
                onChange={(e) => setTestConfiguration(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, sampleRate: Number(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (seconds)"
                type="number"
                value={testConfiguration.parameters.duration}
                onChange={(e) => setTestConfiguration(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, duration: Number(e.target.value) }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTestDialog(false)}>Cancel</Button>
          <Button
            onClick={startNewTest}
            variant="contained"
            startIcon={<PlayIcon />}
            disabled={!testConfiguration.vehicleId || !testConfiguration.testType}
          >
            Start Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AudioCertification;