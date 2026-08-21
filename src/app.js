const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const v1Routes = require('./routes/v1');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'UniHome Backend API' }));

// Mount API v1 routes
app.use('/api/v1', v1Routes);

// Central error handling middleware
app.use(errorHandler);

module.exports = app;