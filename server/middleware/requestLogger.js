export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const contentLength = res.getHeader('content-length') || 0;

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms ${contentLength}b`
    );
  });

  next();
};

