import compression from 'compression';

export const compressionMiddleware = (options?: Parameters<typeof compression>[0]) => {
  return compression({
    level: 6,
    threshold: 1024, // Only compress if size > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    ...options,
  });
};

