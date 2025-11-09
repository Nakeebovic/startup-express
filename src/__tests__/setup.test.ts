import express, { Express } from 'express';
import request from 'supertest';
import { setupExpress, addErrorHandlers } from '../setup';

describe('setupExpress', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
  });

  it('should setup Express app with default configuration', () => {
    setupExpress(app);
    expect(app).toBeDefined();
  });

  it('should register health check endpoint', async () => {
    setupExpress(app);
    addErrorHandlers(app);

    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Server is healthy');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should handle custom configuration', () => {
    const customApp = setupExpress(app, {
      cors: {
        enabled: false,
      },
      helmet: {
        enabled: false,
      },
    });

    expect(customApp).toBeDefined();
  });
});

describe('addErrorHandlers', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    setupExpress(app);
  });

  it('should handle 404 errors', async () => {
    addErrorHandlers(app);

    const response = await request(app).get('/nonexistent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('Route not found');
  });
});

