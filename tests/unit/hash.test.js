// tests/unit/hash.test.js
import { jest } from '@jest/globals';
import hash from '../../src/hash.js';

describe('hash()', () => {
  const email = 'user1@example.com';
  const expectedHash = 'b36a83701f1c3191e19722d6f90274bc1b5501fe69ebf33313e440fe4b0fe210';

  test('email addresses should get hashed using sha256 to hex strings', () => {
    expect(hash(email)).toBe(expectedHash);
  });

  test('hashing should always return the same value for a given string', () => {
    expect(hash(email)).toBe(hash(email));
  });

  test('produces a 64-character hex string', () => {
    const result = hash('test');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[a-f0-9]{64}$/i);
  });

  test('produces different hashes for different inputs', () => {
    const hash1 = hash('test1');
    const hash2 = hash('test2');
    expect(hash1).not.toBe(hash2);
  });

  test('handles empty strings', () => {
    const result = hash('');
    expect(result).toMatch(/^[a-f0-9]{64}$/i);
  });

  test('is case sensitive', () => {
    const lower = hash('test');
    const upper = hash('TEST');
    expect(lower).not.toBe(upper);
  });
});
