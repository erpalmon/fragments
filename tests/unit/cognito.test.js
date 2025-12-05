// tests/unit/cognito.test.js
import { jest } from '@jest/globals';
import { CognitoStrategy } from '../../src/auth/cognito.js';

/**
 * @jest-environment node
 * @jest-environment-options {"url": "http://localhost"}
 */

// This test suite is disabled as it requires AWS Cognito configuration
// and appropriate test environment setup
describe.skip('Cognito Auth', () => {
  test('CognitoStrategy is a constructor', () => {
    expect(typeof CognitoStrategy).toBe('function');
    expect(CognitoStrategy.name).toBe('Strategy');
  });

  test('requires AWS Cognito configuration', () => {
    expect(() => new CognitoStrategy()).toThrow();
  });

  describe('with configuration', () => {
    let strategy;
    const options = {
      userPoolId: 'us-east-1_abc123',
      clientId: 'test-client-id',
      region: 'us-east-1'
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
