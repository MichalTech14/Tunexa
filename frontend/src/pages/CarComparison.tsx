import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Autocomplete,
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
  Divider,
} from '@mui/material';
import {
  Compare as CompareIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  VolumeUp as VolumeIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { carAPI } from '../services/api';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  audioScore?: number;
}

interface ComparisonCriteria {
  acoustics: boolean;
  performance: boolean;
  features: boolean;
  nvh: boolean;
}

interface ComparisonResult {
  vehicle1: Vehicle;
  vehicle2: Vehicle;
  criteria: ComparisonCriteria;
  scores: {
    overall: { vehicle1: number; vehicle2: number };
    acoustics: { vehicle1: number; vehicle2: number };
    performance: { vehicle1: number; vehicle2: number };
    features: { vehicle1: number; vehicle2: number };
    nvh: { vehicle1: number; vehicle2: number };
  };
  details: {
    acoustics: any;
    performance: any;
    features: any;
    nvh: any;
  };
}

const CarComparison: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle1, setSelectedVehicle1] = useState<Vehicle | null>(null);
  const [selectedVehicle2, setSelectedVehicle2] = useState<Vehicle | null>(null);
  const [criteria, setCriteria] = useState<ComparisonCriteria>({
    acoustics: true,
    performance: true,
    features: true,
    nvh: true,
  });
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await carAPI.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      // Fallback data pre demo
      setVehicles([
        { id: '1', brand: 'BMW', model: '3-Series', year: 2023, audioScore: 87 },
        { id: '2', brand: 'Mercedes-Benz', model: 'E-Class', year: 2023, audioScore: 92 },
        { id: '3', brand: 'Tesla', model: 'Model 3', year: 2023, audioScore: 85 },
        { id: '4', brand: 'Volkswagen', model: 'Golf', year: 2023, audioScore: 78 },
        { id: '5', brand: 'Škoda', model: 'Octavia', year: 2023, audioScore: 75 },
      ]);
    }
  };

  const handleCompare = async () => {
    if (!selectedVehicle1 || !selectedVehicle2) {
      setError('Please select two vehicles to compare');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Simulujem API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: ComparisonResult = {
        vehicle1: selectedVehicle1,
        vehicle2: selectedVehicle2,
        criteria,
        scores: {
          overall: { vehicle1: 85, vehicle2: 92 },
          acoustics: { vehicle1: 87, vehicle2: 94 },
          performance: { vehicle1: 82, vehicle2: 89 },
          features: { vehicle1: 88, vehicle2: 95 },
          nvh: { vehicle1: 84, vehicle2: 90 },
        },
        details: {
          acoustics: {
            frequency_response: { vehicle1: 'Good', vehicle2: 'Excellent' },
            thd: { vehicle1: '0.8%', vehicle2: '0.3%' },
            snr: { vehicle1: '95dB', vehicle2: '102dB' },
          },
          performance: {
            speakers: { vehicle1: 8, vehicle2: 13 },
            amplifier_power: { vehicle1: '200W', vehicle2: '400W' },
            subwoofer: { vehicle1: 'No', vehicle2: 'Yes' },
          },
          features: {
            eq_presets: { vehicle1: 5, vehicle2: 12 },
            surround_sound: { vehicle1: 'No', vehicle2: 'Yes' },
            noise_cancellation: { vehicle1: 'Basic', vehicle2: 'Advanced' },
          },
          nvh: {
            idle_noise: { vehicle1: '35dBA', vehicle2: '32dBA' },
            highway_noise: { vehicle1: '68dBA', vehicle2: '65dBA' },
            isolation: { vehicle1: 'Good', vehicle2: 'Excellent' },
          },
        },
      };

      setComparisonResult(result);
    } catch (err) {
      setError('Failed to compare vehicles');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    return 'error';
  };

  const getWinner = (score1: number, score2: number) => {
    if (score1 > score2) return 1;
    if (score2 > score1) return 2;
    return 0; // tie
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Car Comparison
      </Typography>

      {/* Vehicle Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Vehicles to Compare
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={vehicles}
              getOptionLabel={(option) => `${option.brand} ${option.model} (${option.year})`}
              value={selectedVehicle1}
              onChange={(_, newValue) => setSelectedVehicle1(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Vehicle 1" fullWidth />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <CarIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body1">
                      {option.brand} {option.model}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {option.year} • Audio Score: {option.audioScore || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              VS
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={vehicles}
              getOptionLabel={(option) => `${option.brand} ${option.model} (${option.year})`}
              value={selectedVehicle2}
              onChange={(_, newValue) => setSelectedVehicle2(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Vehicle 2" fullWidth />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <CarIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body1">
                      {option.brand} {option.model}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {option.year} • Audio Score: {option.audioScore || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<CompareIcon />}
            onClick={handleCompare}
            disabled={!selectedVehicle1 || !selectedVehicle2 || loading}
            size="large"
          >
            {loading ? 'Comparing...' : 'Compare Vehicles'}
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Analyzing vehicle specifications and audio characteristics...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <Grid container spacing={3}>
          {/* Overall Scores */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Overall Comparison
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CarIcon sx={{ mr: 2 }} />
                        <Typography variant="h6">
                          {comparisonResult.vehicle1.brand} {comparisonResult.vehicle1.model}
                        </Typography>
                        {getWinner(
                          comparisonResult.scores.overall.vehicle1,
                          comparisonResult.scores.overall.vehicle2
                        ) === 1 && (
                          <StarIcon color="warning" sx={{ ml: 1 }} />
                        )}
                      </Box>
                      <Typography variant="h4" color="primary">
                        {comparisonResult.scores.overall.vehicle1}/100
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={comparisonResult.scores.overall.vehicle1}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CarIcon sx={{ mr: 2 }} />
                        <Typography variant="h6">
                          {comparisonResult.vehicle2.brand} {comparisonResult.vehicle2.model}
                        </Typography>
                        {getWinner(
                          comparisonResult.scores.overall.vehicle1,
                          comparisonResult.scores.overall.vehicle2
                        ) === 2 && (
                          <StarIcon color="warning" sx={{ ml: 1 }} />
                        )}
                      </Box>
                      <Typography variant="h4" color="primary">
                        {comparisonResult.scores.overall.vehicle2}/100
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={comparisonResult.scores.overall.vehicle2}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Category Scores */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="center">
                        {comparisonResult.vehicle1.brand} {comparisonResult.vehicle1.model}
                      </TableCell>
                      <TableCell align="center">
                        {comparisonResult.vehicle2.brand} {comparisonResult.vehicle2.model}
                      </TableCell>
                      <TableCell align="center">Winner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VolumeIcon sx={{ mr: 1 }} />
                          Acoustics
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={comparisonResult.scores.acoustics.vehicle1}
                          color={getScoreColor(comparisonResult.scores.acoustics.vehicle1)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={comparisonResult.scores.acoustics.vehicle2}
                          color={getScoreColor(comparisonResult.scores.acoustics.vehicle2)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {getWinner(
                          comparisonResult.scores.acoustics.vehicle1,
                          comparisonResult.scores.acoustics.vehicle2
                        ) === 1 ? comparisonResult.vehicle1.model :
                         getWinner(
                          comparisonResult.scores.acoustics.vehicle1,
                          comparisonResult.scores.acoustics.vehicle2
                        ) === 2 ? comparisonResult.vehicle2.model : 'Tie'
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon sx={{ mr: 1 }} />
                          Performance
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={comparisonResult.scores.performance.vehicle1}
                          color={getScoreColor(comparisonResult.scores.performance.vehicle1)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={comparisonResult.scores.performance.vehicle2}
                          color={getScoreColor(comparisonResult.scores.performance.vehicle2)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {getWinner(
                          comparisonResult.scores.performance.vehicle1,
                          comparisonResult.scores.performance.vehicle2
                        ) === 1 ? comparisonResult.vehicle1.model :
                         getWinner(
                          comparisonResult.scores.performance.vehicle1,
                          comparisonResult.scores.performance.vehicle2
                        ) === 2 ? comparisonResult.vehicle2.model : 'Tie'
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Detailed Comparison */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Acoustics Details
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Frequency Response</TableCell>
                          <TableCell>{comparisonResult.details.acoustics.frequency_response.vehicle1}</TableCell>
                          <TableCell>{comparisonResult.details.acoustics.frequency_response.vehicle2}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>THD</TableCell>
                          <TableCell>{comparisonResult.details.acoustics.thd.vehicle1}</TableCell>
                          <TableCell>{comparisonResult.details.acoustics.thd.vehicle2}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SNR</TableCell>
                          <TableCell>{comparisonResult.details.acoustics.snr.vehicle1}</TableCell>
                          <TableCell>{comparisonResult.details.acoustics.snr.vehicle2}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Performance Details
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Speakers</TableCell>
                          <TableCell>{comparisonResult.details.performance.speakers.vehicle1}</TableCell>
                          <TableCell>{comparisonResult.details.performance.speakers.vehicle2}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Amplifier Power</TableCell>
                          <TableCell>{comparisonResult.details.performance.amplifier_power.vehicle1}</TableCell>
                          <TableCell>{comparisonResult.details.performance.amplifier_power.vehicle2}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Subwoofer</TableCell>
                          <TableCell>{comparisonResult.details.performance.subwoofer.vehicle1}</TableCell>
                          <TableCell>{comparisonResult.details.performance.subwoofer.vehicle2}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CarComparison;