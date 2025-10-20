import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CarRental as CarIcon,
  Assessment as AssessmentIcon,
  LibraryMusic as MusicIcon,
  Settings as SettingsIcon,
  Bluetooth as BluetoothIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  VolumeUp as VolumeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { carAPI, certificationAPI, spotifyAPI } from '../services/api';

interface DashboardStats {
  connectedDevices: number;
  activeSessions: number;
  measurementsToday: number;
  avgAudioScore: number;
}

interface RecentActivity {
  id: string;
  type: 'measurement' | 'comparison' | 'certification' | 'spotify';
  description: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    connectedDevices: 0,
    activeSessions: 0,
    measurementsToday: 0,
    avgAudioScore: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulujem loading dashboard data
      // V reálnej aplikácii by sme volali API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        connectedDevices: 3,
        activeSessions: 1,
        measurementsToday: 7,
        avgAudioScore: 87,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'measurement',
          description: 'Audio measurement completed for BMW 3-Series',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'comparison',
          description: 'Compared Mercedes E-Class vs Tesla Model 3',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'spotify',
          description: 'Spotify playlist "Road Trip Mix" optimized',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          type: 'certification',
          description: 'ISO certification report generated',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'measurement':
        return <AssessmentIcon />;
      case 'comparison':
        return <CarIcon />;
      case 'certification':
        return <SettingsIcon />;
      case 'spotify':
        return <MusicIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'measurement':
        return 'primary';
      case 'comparison':
        return 'secondary';
      case 'certification':
        return 'success';
      case 'spotify':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={loadDashboardData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BluetoothIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Connected Devices
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.connectedDevices}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Sessions
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.activeSessions}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Measurements Today
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.measurementsToday}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VolumeIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Audio Score
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.avgAudioScore}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CarIcon />}
                  onClick={() => navigate('/car-comparison')}
                  sx={{ py: 2 }}
                >
                  Compare Cars
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/audio-certification')}
                  sx={{ py: 2 }}
                >
                  New Measurement
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MusicIcon />}
                  onClick={() => navigate('/spotify-integration')}
                  sx={{ py: 2 }}
                >
                  Open Spotify
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/oem-integration')}
                  sx={{ py: 2 }}
                >
                  OEM Tools
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {recentActivity.length === 0 ? (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recent activity
                </Typography>
              ) : (
                recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid #eee',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Chip
                      icon={getActivityIcon(activity.type)}
                      label={activity.type}
                      color={getActivityColor(activity.type) as any}
                      size="small"
                      sx={{ mr: 2, minWidth: 100 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTimeAgo(activity.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;