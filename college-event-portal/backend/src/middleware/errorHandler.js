// Centralized error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `Duplicate value for ${field}` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;
