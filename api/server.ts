import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use('/static', express.static(path.join(process.cwd(), 'public')));

// Dashboard routes with proper content type
app.get('/dashboard', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(process.cwd(), 'public', 'simple.html'));
});

app.get('/app', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(process.cwd(), 'public', 'simple.html'));
});

app.get('/ui', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(process.cwd(), 'public', 'simple.html'));
});

// Simple test route
app.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Test</title></head>
    <body style="background:blue;color:white;padding:20px;">
      <h1>🎵 Test Page</h1>
      <p>Ak vidíš túto stránku, funguje to!</p>
      <a href="/dashboard" style="color:white;">Ísť na Dashboard</a>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Audio Certification Routes
app.get('/api/audio-certification', (req, res) => {
  res.json({ message: 'Audio Certification API', endpoints: ['/certify', '/measurements'] });
});

app.post('/api/audio-certification/certify', (req, res) => {
  res.json({
    status: 'certified',
    score: 95,
    certificateId: `TUNEXA-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// OEM Integration Routes
app.get('/api/oem-integration', (req, res) => {
  res.json({ message: 'OEM Integration API', endpoints: ['/connect', '/protocols'] });
});

app.post('/api/oem-integration/connect', (req, res) => {
  res.json({
    connected: true,
    protocol: 'CAN-FD',
    deviceId: `OEM-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// Spotify Integration Routes
app.get('/api/spotify-integration', (req, res) => {
  res.json({ message: 'Spotify Integration API', endpoints: ['/auth', '/playlists'] });
});

app.post('/api/spotify-integration/auth', (req, res) => {
  res.json({
    authenticated: true,
    token: `spotify-${Date.now()}`,
    expiresIn: 3600,
    timestamp: new Date().toISOString()
  });
});

// Profile Lock Continuity Routes
app.get('/api/profile-lock-continuity', (req, res) => {
  res.json({ message: 'Profile Lock Continuity API', endpoints: ['/save', '/load'] });
});

app.post('/api/profile-lock-continuity/save', (req, res) => {
  res.json({
    saved: true,
    profileId: `PROFILE-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tunexa Intelligent Audio Engine API',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api/audio-certification',
      '/api/oem-integration',
      '/api/spotify-integration',
      '/api/profile-lock-continuity'
    ],
    documentation: '/api/docs'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tunexa API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});