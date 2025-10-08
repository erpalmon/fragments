// tests/unit/logger.test.js
const path = require('path');
const loggerPath = path.resolve(__dirname, '../../src/logger');

describe('logger debug transport', () => {
  let original;
  beforeEach(() => {
    original = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'debug';
    delete require.cache[loggerPath];
  });
  afterEach(() => {
    process.env.LOG_LEVEL = original;
    delete require.cache[loggerPath];
  });

  test('creates a pino logger with debug transport', () => {
    const logger = require('../../src/logger');
    expect(typeof logger.info).toBe('function');
    logger.debug('hit debug path'); // executes the pretty transport branch
  });
});
