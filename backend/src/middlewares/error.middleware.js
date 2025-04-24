// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error for server-side debugging
  console.error(err.stack);
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  AppError
};
