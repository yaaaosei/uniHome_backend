const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorType = 'SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred.';

  // Mongoose duplicate key error (e.g. unique email, duplicate favorite)
  if (err.code === 11000) {
    statusCode = 409;
    errorType = 'CONFLICT';
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `A record with this ${field} already exists.`
      : 'Duplicate key error.';
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorType = 'BAD_REQUEST';
    message = `Invalid format for field '${err.path}'.`;
  }

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'BAD_REQUEST';
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'UNAUTHORIZED';
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'UNAUTHORIZED';
    message = 'Authentication token expired.';
  }

  res.status(statusCode).json({
    error: errorType,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
