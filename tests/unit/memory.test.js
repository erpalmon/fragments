// tests/unit/memory.test.js

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

  beforeEach(() => {
    jest.resetModules();
    // Prefer the strategy entry (../../src/model/data); fall back to memory path.
    try {
      // If you created src/model/data/index.js that re-exports './memory'
      store = require('../../src/model/data');
    } catch (e) {
      // Otherwise, import the memory module directly
      store = require('../../src/model/data/memory');
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

    // Write minimal metadata first (data is stored separately)
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
    const a = { id: 'a', ownerId, type: 'text/plain', size: 1, created: nowIso(), updated: nowIso() };
    const b = { id: 'b', ownerId, type: 'text/plain', size: 2, created: nowIso(), updated: nowIso() };

    await store.writeFragment(a);
    await store.writeFragment(b);

    const ids = await store.listFragments(ownerId);
    expect(ids.sort()).toEqual(['a', 'b']);

    const expanded = await store.listFragments(ownerId, true);
    // Should be full objects (not strings), order not guaranteed
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

    // Sanity: they exist
    expect(await store.readFragment(ownerId, id)).toEqual(meta);
    expect((await store.readFragmentData(ownerId, id)).toString()).toBe('test');

    await store.deleteFragment(ownerId, id);

    // Both removed
    expect(await store.readFragment(ownerId, id)).toBeUndefined();
    expect(await store.readFragmentData(ownerId, id)).toBeUndefined();
  });
});
