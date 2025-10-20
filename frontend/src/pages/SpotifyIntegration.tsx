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
  CardMedia,
  IconButton,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  VolumeUp as VolumeIcon,
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  Queue as QueueIcon,
  Equalizer as EqualizerIcon,
  LibraryMusic as PlaylistIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
} from '@mui/icons-material';
import { spotifyAPI } from '../services/api';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  image?: string;
  preview_url?: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: number;
  image?: string;
  owner: string;
}

interface EQPreset {
  id: string;
  name: string;
  bands: number[];
  description: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
}

const SpotifyIntegration: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    position: 0,
    volume: 75,
    shuffle: false,
    repeat: false,
  });
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [eqPresets, setEqPresets] = useState<EQPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createPresetDialog, setCreatePresetDialog] = useState(false);
  const [newPreset, setNewPreset] = useState({ name: '', description: '' });
  const [eqBands, setEqBands] = useState([0, 2, 4, 2, 0, -1, -2, 0, 3, 1]); // 10-band EQ

  const eqFrequencies = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

  useEffect(() => {
    loadSpotifyData();
  }, []);

  const loadSpotifyData = async () => {
    try {
      setLoading(true);
      // Simulujem loading Spotify data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data
      setConnected(true);
      
      const mockTrack: SpotifyTrack = {
        id: '1',
        name: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 355,
        image: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=♪',
      };

      setPlayerState(prev => ({ ...prev, currentTrack: mockTrack }));

      setPlaylists([
        {
          id: '1',
          name: 'Road Trip Mix',
          description: 'Perfect songs for long drives',
          tracks: 47,
          image: 'https://via.placeholder.com/150x150/1DB954/ffffff?text=🚗',
          owner: 'You',
        },
        {
          id: '2',
          name: 'Audiophile Testing',
          description: 'High-quality tracks for audio testing',
          tracks: 23,
          image: 'https://via.placeholder.com/150x150/1DB954/ffffff?text=🎧',
          owner: 'You',
        },
        {
          id: '3',
          name: 'Bass Heavy',
          description: 'Sub-bass testing tracks',
          tracks: 31,
          image: 'https://via.placeholder.com/150x150/1DB954/ffffff?text=🔊',
          owner: 'You',
        },
      ]);

      setEqPresets([
        { id: 'balanced', name: 'Balanced', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], description: 'Neutral sound' },
        { id: 'bass_boost', name: 'Bass Boost', bands: [6, 4, 2, 0, 0, 0, 0, 0, 1, 2], description: 'Enhanced low frequencies' },
        { id: 'vocal', name: 'Vocal', bands: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2], description: 'Clear vocals' },
        { id: 'rock', name: 'Rock', bands: [3, 2, 1, 0, -1, 0, 1, 2, 3, 4], description: 'Punchy rock sound' },
        { id: 'classical', name: 'Classical', bands: [2, 1, 0, 0, 0, 0, 1, 2, 3, 2], description: 'Natural orchestral' },
      ]);
    } catch (err) {
      setError('Failed to load Spotify data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      // Simulujem Spotify authorization
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnected(true);
      loadSpotifyData();
    } catch (err) {
      setError('Failed to connect to Spotify');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setPlayerState({
      isPlaying: false,
      currentTrack: null,
      position: 0,
      volume: 75,
      shuffle: false,
      repeat: false,
    });
    setPlaylists([]);
  };

  const handlePlayPause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setPlayerState(prev => ({ ...prev, volume: newValue as number }));
  };

  const handleEQChange = (index: number, value: number | number[]) => {
    const newBands = [...eqBands];
    newBands[index] = value as number;
    setEqBands(newBands);
  };

  const applyEQPreset = (presetId: string) => {
    const preset = eqPresets.find(p => p.id === presetId);
    if (preset) {
      setEqBands(preset.bands);
      setSelectedPreset(presetId);
    }
  };

  const createCustomPreset = async () => {
    if (!newPreset.name) return;

    const preset: EQPreset = {
      id: `custom_${Date.now()}`,
      name: newPreset.name,
      description: newPreset.description,
      bands: [...eqBands],
    };

    setEqPresets(prev => [...prev, preset]);
    setSelectedPreset(preset.id);
    setCreatePresetDialog(false);
    setNewPreset({ name: '', description: '' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!connected) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Spotify Integration
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Connect your Spotify account to enable advanced audio tuning and playlist optimization.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                backgroundColor: '#1DB954'
              }}
            >
              <PlaylistIcon sx={{ fontSize: 60 }} />
            </Avatar>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<LinkIcon />}
            onClick={handleConnect}
            disabled={loading}
            sx={{ 
              backgroundColor: '#1DB954',
              '&:hover': { backgroundColor: '#1ed760' },
              px: 4,
              py: 1.5
            }}
          >
            {loading ? 'Connecting...' : 'Connect to Spotify'}
          </Button>

          {loading && <LinearProgress sx={{ mt: 2 }} />}

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            You'll be redirected to Spotify to authorize the connection.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Spotify Integration
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Player Controls */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Now Playing
            </Typography>
            
            {playerState.currentTrack ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 80, height: 80, borderRadius: 1, mr: 2 }}
                    image={playerState.currentTrack.image}
                    alt={playerState.currentTrack.name}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{playerState.currentTrack.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {playerState.currentTrack.artist} • {playerState.currentTrack.album}
                    </Typography>
                  </Box>
                </Box>

                {/* Player Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <IconButton>
                    <ShuffleIcon color={playerState.shuffle ? 'primary' : 'inherit'} />
                  </IconButton>
                  <IconButton>
                    <PrevIcon />
                  </IconButton>
                  <IconButton onClick={handlePlayPause} size="large">
                    {playerState.isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
                  </IconButton>
                  <IconButton>
                    <NextIcon />
                  </IconButton>
                  <IconButton>
                    <RepeatIcon color={playerState.repeat ? 'primary' : 'inherit'} />
                  </IconButton>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    {formatTime(playerState.position)}
                  </Typography>
                  <Slider
                    size="small"
                    value={playerState.position}
                    max={playerState.currentTrack.duration}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {formatTime(playerState.currentTrack.duration)}
                  </Typography>
                </Box>

                {/* Volume Control */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VolumeIcon sx={{ mr: 1 }} />
                  <Slider
                    size="small"
                    value={playerState.volume}
                    onChange={handleVolumeChange}
                    sx={{ flexGrow: 1, maxWidth: 200 }}
                  />
                  <Typography variant="caption" sx={{ ml: 1, minWidth: 35 }}>
                    {playerState.volume}%
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No track currently playing
              </Typography>
            )}
          </Paper>

          {/* Playlists */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Playlists
            </Typography>
            <Grid container spacing={2}>
              {playlists.map((playlist) => (
                <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                  <Card sx={{ cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={playlist.image}
                      alt={playlist.name}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {playlist.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {playlist.tracks} tracks • by {playlist.owner}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Equalizer */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Equalizer</Typography>
              <IconButton onClick={() => setCreatePresetDialog(true)}>
                <AddIcon />
              </IconButton>
            </Box>

            {/* EQ Presets */}
            <Typography variant="subtitle2" gutterBottom>
              Presets
            </Typography>
            <Box sx={{ mb: 3 }}>
              {eqPresets.map((preset) => (
                <Chip
                  key={preset.id}
                  label={preset.name}
                  variant={selectedPreset === preset.id ? 'filled' : 'outlined'}
                  onClick={() => applyEQPreset(preset.id)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            {/* EQ Bands */}
            <Typography variant="subtitle2" gutterBottom>
              10-Band Equalizer
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', height: 200, mb: 2 }}>
              {eqBands.map((band, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%' }}>
                  <Slider
                    orientation="vertical"
                    value={band}
                    onChange={(_, value) => handleEQChange(index, value)}
                    min={-12}
                    max={12}
                    step={1}
                    sx={{ height: 140, mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ transform: 'rotate(-45deg)', fontSize: '0.7rem' }}>
                    {eqFrequencies[index]}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Settings */}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Audio Settings
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Crossfeed" secondary="Improve stereo imaging" />
                <ListItemSecondaryAction>
                  <Switch />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Dynamic Range" secondary="Compress loud passages" />
                <ListItemSecondaryAction>
                  <Switch />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Bass Enhancement" secondary="Enhance low frequencies" />
                <ListItemSecondaryAction>
                  <Switch defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Create EQ Preset Dialog */}
      <Dialog open={createPresetDialog} onClose={() => setCreatePresetDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create EQ Preset</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Preset Name"
            value={newPreset.name}
            onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newPreset.description}
            onChange={(e) => setNewPreset(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePresetDialog(false)}>Cancel</Button>
          <Button
            onClick={createCustomPreset}
            variant="contained"
            disabled={!newPreset.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SpotifyIntegration;