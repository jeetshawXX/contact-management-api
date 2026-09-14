export function notFound(req, res) {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_CONTACT',
        message: 'A contact with the same email or phone number already exists'
      }
    });
  }

  const status = err.status || 500;
  return res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: status === 500 ? 'Internal server error' : err.message
    }
  });
}
