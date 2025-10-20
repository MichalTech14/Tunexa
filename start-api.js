#!/usr/bin/env node

// Start the Tunexa API Server
import('./dist/api/server.js').catch(err => {
  console.error('Failed to start API server:', err);
  process.exit(1);
});