// tests/unit/memory.test.js
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// We re-require the module before each test so the in-memory state is fresh.
describe('in-memory fragments data backend', () => {
  /** @type {{
   *  writeFragment: Function,
   *  readFragment: Function,
   *  writeFragmentData: Function,
   *  readFragmentData: Function,
   *  listFragments: Function,
   *  deleteFragment: Function
   * }} */
  let store;

  const nowIso = () => new Date().toISOString();

  beforeEach(async () => {
    jest.resetModules();
    // Prefer the strategy entry (../../src/model/data); fall back to memory path.
    try {
      store = (await import('../../src/model/data/index.js')).default;
    } catch {
      store = (await import('../../src/model/data/memory/index.js')).default;
    }
  });

  test('writeFragment() then readFragment() round-trips metadata', async () => {
    const ownerId = 'user@example.com';
    const id = 'frag-1';
    const frag = {
      id,
      ownerId,
      type: 'text/plain',
      size: 12,
      created: nowIso(),
      updated: nowIso(),
    };

    await store.writeFragment(frag);
    const got = await store.readFragment(ownerId, id);

    expect(got).toEqual(frag);
  });

  test('readFragment() for a missing id resolves to undefined', async () => {
    const got = await store.readFragment('user@example.com', 'nope');
    expect(got).toBeUndefined();
  });

  test('writeFragmentData() and readFragmentData() round-trip a Buffer', async () => {
    const ownerId = 'user2@example.com';
    const id = 'frag-2';

    await store.writeFragment({
      id,
      ownerId,
      type: 'text/plain',
      size: 5,
      created: nowIso(),
      updated: nowIso(),
    });

    const input = Buffer.from('hello');
    await store.writeFragmentData(ownerId, id, input);

    const output = await store.readFragmentData(ownerId, id);
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.equals(input)).toBe(true);
    expect(output.toString()).toBe('hello');
  });

  test('listFragments() returns ids by default and full objects when expand=true', async () => {
    const ownerId = 'user3@example.com';
    const a = {
      id: 'a',
      ownerId,
      type: 'text/plain',
      size: 1,
      created: nowIso(),
      updated: nowIso(),
    };
    const b = {
      id: 'b',
      ownerId,
      type: 'text/plain',
      size: 2,
      created: nowIso(),
      updated: nowIso(),
    };

    await store.writeFragment(a);
    await store.writeFragment(b);

    const ids = await store.listFragments(ownerId);
    expect(ids.sort()).toEqual(['a', 'b']);

    const expanded = await store.listFragments(ownerId, true);
    expect(expanded.every((o) => typeof o === 'object' && o.id)).toBe(true);
    expect(expanded).toEqual(expect.arrayContaining([a, b]));
  });

  test('listFragments() returns an empty array when user has none', async () => {
    const ids = await store.listFragments('nobody@example.com');
    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toEqual([]);
  });

  test('deleteFragment() removes both metadata and data', async () => {
    const ownerId = 'user4@example.com';
    const id = 'frag-3';
    const meta = {
      id,
      ownerId,
      type: 'text/plain',
      size: 4,
      created: nowIso(),
      updated: nowIso(),
    };

    await store.writeFragment(meta);
    await store.writeFragmentData(ownerId, id, Buffer.from('test'));

    expect(await store.readFragment(ownerId, id)).toEqual(meta);
    expect((await store.readFragmentData(ownerId, id)).toString()).toBe('test');

    await store.deleteFragment(ownerId, id);

    expect(await store.readFragment(ownerId, id)).toBeUndefined();
    expect(await store.readFragmentData(ownerId, id)).toBeUndefined();
  });

  test('writeFragment() throws when required fields are missing', async () => {
    await expect(store.writeFragment({})).rejects.toThrow();
  });

  test('readFragmentData() returns undefined for non-existent fragment', async () => {
    const data = await store.readFragmentData('nonexistent', 'fragment');
    expect(data).toBeUndefined();
  });

  test('concurrent modifications are handled correctly', async () => {
    const ownerId = 'concurrent@example.com';
    const id = 'concurrent-1';
    const frag = {
      id,
      ownerId,
      type: 'text/plain',
      size: 10,
      created: nowIso(),
      updated: nowIso(),
    };

    await store.writeFragment(frag);
    const promises = Array(10).fill().map((_, i) => 
      store.writeFragmentData(ownerId, id, Buffer.from(`test-${i}`))
    );
    await Promise.all(promises);

    const data = await store.readFragmentData(ownerId, id);
    expect(data.toString()).toMatch(/^test-\d$/);
  });
});
