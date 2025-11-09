import { getEnv, getEnvNumber, getEnvBoolean } from '../config';

describe('Config utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should return default value if variable is not set', () => {
      expect(getEnv('NON_EXISTENT', 'default')).toBe('default');
    });

    it('should throw error if variable is not set and no default provided', () => {
      expect(() => getEnv('NON_EXISTENT')).toThrow();
    });
  });

  describe('getEnvNumber', () => {
    it('should return number from environment variable', () => {
      process.env.PORT = '3000';
      expect(getEnvNumber('PORT')).toBe(3000);
    });

    it('should return default value if variable is not set', () => {
      expect(getEnvNumber('PORT', 8080)).toBe(8080);
    });
  });

  describe('getEnvBoolean', () => {
    it('should return true for "true" string', () => {
      process.env.DEBUG = 'true';
      expect(getEnvBoolean('DEBUG')).toBe(true);
    });

    it('should return false for "false" string', () => {
      process.env.DEBUG = 'false';
      expect(getEnvBoolean('DEBUG')).toBe(false);
    });

    it('should return default value if variable is not set', () => {
      expect(getEnvBoolean('DEBUG', true)).toBe(true);
    });

    it('should be case insensitive', () => {
      process.env.DEBUG = 'TRUE';
      expect(getEnvBoolean('DEBUG')).toBe(true);
    });
  });
});

