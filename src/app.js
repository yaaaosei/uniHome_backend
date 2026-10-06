const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const v1Routes = require('./routes/v1');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow static image serving cross-origin
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://uni-home-eosin.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Increase JSON payload limit to handle fallback Base64 if needed
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'UniHome Backend API' }));

// Mount API v1 routes
app.use('/api/v1', v1Routes);

// Central error handling middleware
app.use(errorHandler);

module.exports = app;