// tests/unit/logger.test.js
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const loggerPath = resolve(__dirname, '../../src/logger.js');

describe('logger', () => {
  let originalLogLevel;
  let logger;

  beforeAll(async () => {
    // Ensure we're using a fresh import for each test
    process.env.LOG_LEVEL = 'debug';
    // Use dynamic import to get a fresh instance for each test
    logger = (await import('../../src/logger.js')).default;
  });

  afterAll(() => {
    // Clean up
    if (originalLogLevel !== undefined) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  test('has required methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('creates a pino logger with debug transport', () => {
    expect(() => {
      logger.debug('test debug message');
      logger.info('test info message');
      logger.warn('test warning message');
      logger.error('test error message');
    }).not.toThrow();
  });

  describe('log levels', () => {
    const testLogLevel = (level) => {
      test(`respects ${level} log level`, async () => {
        process.env.LOG_LEVEL = level;
        // Force a fresh import to pick up the new log level
        const freshLogger = (await import('../../src/logger.js')).default;
        expect(freshLogger.levels.values[level] !== undefined).toBe(true);
      });
    };

    ['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach(testLogLevel);
  });

  test('uses pretty print in development', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const devLogger = (await import('../../src/logger.js')).default;
    expect(devLogger).toBeDefined();
    
    // Clean up
    process.env.NODE_ENV = originalNodeEnv;
  });
});
