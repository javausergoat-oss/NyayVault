/**
 * Centralized error handler middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  console.error(`[API ERROR] ${req.method} ${req.originalUrl} - ${statusCode}:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
}

export default errorHandler;
