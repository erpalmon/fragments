// tests/unit/fragment.test.js
const { Fragment } = require('../../src/model/fragment');

describe('Fragment', () => {
  test('should create a new fragment', () => {
    const fragment = new Fragment({
      id: 'test-id',
      ownerId: 'user123',
      type: 'text/plain',
      size: 0,
    });

    expect(fragment).toBeDefined();
    expect(fragment.id).toBe('test-id');
    expect(fragment.ownerId).toBe('user123');
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(0);
  });

  // Add more real tests for Fragment methods
  test('should update timestamps on save', async () => {
    const fragment = new Fragment({
      id: 'test-save',
      ownerId: 'user123',
      type: 'text/plain',
      size: 0,
    });

    const originalUpdated = fragment.updated;

    // Small delay to ensure timestamp changes
    await new Promise((resolve) => setTimeout(resolve, 10));

    await fragment.save();

    expect(fragment.updated).not.toBe(originalUpdated);
    expect(fragment.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
  });
});
