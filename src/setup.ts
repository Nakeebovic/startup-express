import express, { Express } from 'express';
import { StartupExpressConfig } from './types';
import {
  corsMiddleware,
  helmetMiddleware,
  compressionMiddleware,
  rateLimitMiddleware,
  morganMiddleware,
  jsonMiddleware,
  urlencodedMiddleware,
  requestIdMiddleware,
  timingMiddleware,
  sanitizeMiddleware,
} from './middleware';
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from './errorHandler';
import { logger } from './logger';

/**
 * Setup Express app with all essential middleware and configurations
 * @param app - Express application instance
 * @param config - Configuration options
 */
export const setupExpress = (
  app: Express,
  config: StartupExpressConfig = {}
): Express => {
  // Setup global error handlers
  setupGlobalErrorHandlers();

  // Trust proxy (for proper IP detection behind reverse proxies)
  app.set('trust proxy', 1);

  // Disable x-powered-by header
  app.disable('x-powered-by');

  // Request ID middleware (should be first)
  if (config.requestId?.enabled !== false) {
    app.use(
      requestIdMiddleware({
        header: config.requestId?.header,
      })
    );
    logger.info('✓ Request ID middleware enabled');
  }

  // Timing middleware
  app.use(timingMiddleware());
  logger.info('✓ Request timing middleware enabled');

  // Security middleware
  if (config.helmet?.enabled !== false) {
    app.use(helmetMiddleware());
    logger.info('✓ Helmet security middleware enabled');
  }

  // CORS middleware
  if (config.cors?.enabled !== false) {
    app.use(
      corsMiddleware({
        origin: config.cors?.origin,
        credentials: config.cors?.credentials,
      })
    );
    logger.info('✓ CORS middleware enabled');
  }

  // Compression middleware
  if (config.compression?.enabled !== false) {
    app.use(compressionMiddleware());
    logger.info('✓ Compression middleware enabled');
  }

  // Rate limiting middleware
  if (config.rateLimit?.enabled !== false) {
    app.use(
      rateLimitMiddleware({
        windowMs: config.rateLimit?.windowMs,
        max: config.rateLimit?.max,
      })
    );
    logger.info('✓ Rate limiting middleware enabled');
  }

  // Body parser middleware
  app.use(jsonMiddleware());
  app.use(urlencodedMiddleware());
  logger.info('✓ Body parser middleware enabled');

  // Sanitize input middleware (after body parser)
  app.use(sanitizeMiddleware());
  logger.info('✓ Input sanitization middleware enabled');

  // Logging middleware (after body parser)
  if (config.logging?.enabled !== false) {
    app.use(morganMiddleware(config.logging?.format));
    logger.info('✓ HTTP request logging middleware enabled');
  }

  // Health check endpoint with detailed info
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      requestId: req.requestId,
    });
  });

  // Readiness check endpoint (for k8s, docker)
  app.get('/ready', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is ready',
    });
  });

  logger.info('✓ Health check endpoints registered at /health and /ready');

  // Note: 404 and error handlers should be added after all routes
  // This function returns a configured app, but routes should be added before calling addErrorHandlers()
  
  return app;
};

/**
 * Add error handlers to Express app (should be called after all routes are defined)
 * @param app - Express application instance
 */
export const addErrorHandlers = (app: Express): Express => {
  app.use(notFoundHandler);
  app.use(errorHandler);
  logger.info('✓ Error handlers registered');
  return app;
};

