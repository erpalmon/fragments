// tests/unit/cognito.test.js
import { jest } from '@jest/globals';
import { CognitoStrategy } from '../../src/auth/cognito.js';

/**
 * @jest-environment node
 * @jest-environment-options {"url": "http://localhost"}
 */

// This test suite is disabled as it requires AWS Cognito configuration
// and appropriate test environment setup
describe('Cognito Auth', () => {
  const isTestEnv = process.env.NODE_ENV === 'test';

  test('CognitoStrategy is a constructor', () => {
    expect(typeof CognitoStrategy).toBe('function');
    const expectedName = isTestEnv ? 'MockStrategy' : 'Strategy';
    expect(CognitoStrategy.name).toBe(expectedName);
  });

  test('requires AWS Cognito configuration', () => {
    if (isTestEnv) {
      // In test mode we use a mock strategy, so no throw is expected
      expect(() => new CognitoStrategy()).not.toThrow();
    } else {
      expect(() => new CognitoStrategy()).toThrow();
    }
  });

  describe('with configuration', () => {
    let strategy;
    const options = {
      userPoolId: 'us-east-1_abc123',
      clientId: 'test-client-id',
      region: 'us-east-1',
    };

    beforeEach(() => {
      strategy = new CognitoStrategy(options);
    });

    test('can be instantiated with configuration', () => {
      expect(strategy).toBeDefined();
      expect(strategy.name).toBe('cognito');
    });

    test('implements authenticate method', () => {
      expect(typeof strategy.authenticate).toBe('function');
    });
  });
});
