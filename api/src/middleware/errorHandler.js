// 404 handler for unmatched routes.
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Centralized error handler. Any thrown/forwarded error ends up here.
export function errorHandler(err, req, res, next) {
  console.error(err);

  // Unique-violation from PostgreSQL (e.g. duplicate email).
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error.',
  });
}
