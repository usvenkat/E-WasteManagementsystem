const mongoose = require('mongoose');

/**
 * Middleware to check database connectivity
 * Returns 503 Service Unavailable if database is not connected
 */
const checkDatabaseConnection = (req, res, next) => {
  const connectionState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  console.log(`🔍 DB Connection Check: ${states[connectionState]} (state: ${connectionState})`);

  // Only allow if connected (state 1)
  if (connectionState !== 1) {
    console.warn(`⚠️  Blocking request - Database not connected (state: ${connectionState})`);
    return res.status(503).json({
      message: 'Database service is currently unavailable. Please try again later.',
      status: 'disconnected',
      database_state: states[connectionState],
      code: 'DB_UNAVAILABLE',
      suggestion: 'MongoDB Atlas cluster may be paused. Please resume it and try again.',
      retry_after_seconds: 30
    });
  }

  // Database is connected, proceed
  next();
};

/**
 * Middleware to log API requests with timestamps
 */
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
};

module.exports = { checkDatabaseConnection, logRequest };
