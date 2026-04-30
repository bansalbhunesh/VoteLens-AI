const isProd = process.env.NODE_ENV === 'production';

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const requestId = req.id || 'unknown';

  if (status >= 500) {
    console.error(JSON.stringify({
      level: 'error',
      requestId,
      method: req.method,
      path: req.path,
      status,
      message: err.message,
      stack: isProd ? undefined : err.stack,
    }));
  }

  res.status(status).json({
    error: isProd && status >= 500 ? 'Internal server error.' : err.message,
    requestId,
  });
}
