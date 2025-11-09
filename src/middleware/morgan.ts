import morgan from 'morgan';
import { logger } from '../logger';
import { config } from '../config';

// Create a stream object with a 'write' function that will be used by Morgan
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export const morganMiddleware = (format?: string) => {
  const logFormat = format || (config.isDevelopment ? 'dev' : 'combined');
  
  return morgan(logFormat, {
    stream,
    skip: (req) => {
      // Skip logging for health check endpoints
      return req.url === '/health' || req.url === '/healthz';
    },
  });
};

