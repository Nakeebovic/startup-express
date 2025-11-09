import cors from 'cors';

export const corsMiddleware = (options?: cors.CorsOptions) => {
  const defaultOptions: cors.CorsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    ...options,
  };

  return cors(defaultOptions);
};

