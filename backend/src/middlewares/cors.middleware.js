const config = require('../config/app.config');

// CORS options
const corsOptions = {
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

module.exports = {
  corsOptions
};
