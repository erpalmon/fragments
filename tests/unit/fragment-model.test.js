// tests/unit/fragment-model.test.js
const { Fragment } = require('../../src/model/fragment');

describe('Fragment model', () => {
  const ownerId = 'owner-abc';

  test('save throws without ownerId', async () => {
    const fragment = new Fragment({ type: 'text/plain' });
    await expect(fragment.save()).rejects.toThrow('ownerId is required');
  });

  test('save throws on unsupported type', async () => {
    const fragment = new Fragment({ ownerId, type: 'invalid/type' });
    await expect(fragment.save()).rejects.toThrow('Unsupported type');
  });

  test('getData round-trips', async () => {
    const fragment = new Fragment({ ownerId, type: 'text/plain' });
    await fragment.save();
    await fragment.setData('hello');
    const data = await fragment.getData();
    expect(Buffer.isBuffer(data)).toBe(true);
    expect(data.toString()).toBe('hello');
  });

  test('list expand returns metadata objects', async () => {
    const f = new Fragment({ ownerId, type: 'text/plain' });
    await f.save();
    await f.setData('x');
    const list = await Fragment.list(ownerId, true);
    const ids = list.map((frag) => frag.id);
    expect(ids).toContain(f.id);
    expect(list.find((frag) => frag.id === f.id).ownerId).toBe(ownerId);
  });

  test('byId returns null when missing and delete returns false when missing', async () => {
    const missing = await Fragment.byId(ownerId, 'nope');
    expect(missing).toBeNull();
    const result = await Fragment.delete(ownerId, 'nope');
    expect(result).toBe(false);
  });
});
