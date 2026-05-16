require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const pickupRequestRoutes = require('./routes/pickupRequests');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pickup-requests', pickupRequestRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    message: 'E-Waste Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      connection_state: mongoose.connection.readyState
    }
  });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  
  const currentState = mongoose.connection.readyState;
  res.json({
    status: states[currentState] || 'unknown',
    state_code: currentState,
    host: mongoose.connection.host || 'N/A',
    database: mongoose.connection.name || 'N/A',
    port: mongoose.connection.port || 'N/A',
    timestamp: new Date().toISOString()
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendBuild));

  // All non-API routes → return React's index.html (client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
} else {
  // Development: simple 404 for unknown routes
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     E-Waste Management Backend Server Started          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 Server is running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log(`📝 API Endpoints:\n`);
  console.log(`   Health Check:   GET  http://localhost:${PORT}/api/health`);
  console.log(`   DB Status:      GET  http://localhost:${PORT}/api/db-status`);
  console.log(`   Auth:           POST http://localhost:${PORT}/api/auth/*`);
  console.log(`   Pickup:         POST http://localhost:${PORT}/api/pickup-requests/*`);
  console.log(`   Admin:          POST http://localhost:${PORT}/api/admin/*`);
  console.log(`\n📖 API Documentation: See README.md`);
  console.log(`\n🔗 MongoDB Connection Status: Initializing...`);
  console.log('   Use GET /api/db-status to check connection status\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
