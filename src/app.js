/**
 * Express application factory
 * Configures middleware, routes, and error handling
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const logger = require('./utils/logger');
const { limiter } = require('./middleware/rateLimit');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet: Set various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS: Allow requests from specified origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}));

// Rate Limiting: Protect API from abuse
app.use('/api/', limiter);

// ============================================
// BODY PARSING & LOGGING
// ============================================

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// ============================================
// STATIC FILES
// ============================================

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
}));

// ============================================
// VIEW ENGINE & ROUTES
// ============================================

// Set view engine to HTML (using Express native)
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', (filePath, options, callback) => {
  const fs = require('fs');
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    const rendered = content.toString();
    return callback(null, rendered);
  });
});

// API Routes
app.use('/api/', apiRoutes);

// Page Routes
app.use('/', pageRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    path: req.path,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
