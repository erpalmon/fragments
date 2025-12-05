// tests/unit/data-store.test.js
const { DataStore } = require('../../src/model/data-store');

describe('DataStore', () => {
  const owner = 'owner1';
  const id = 'id1';
  const metadata = { id, ownerId: owner, type: 'text/plain' };
  const data = Buffer.from('hello');

  afterEach(async () => {
    // Clear internal store by deleting and recreating owner map
    // there is no clear method, so use delete via delete() when exists
    try {
      await DataStore.delete(owner, id);
    } catch (_) {
      // ignore
    }
  });

  test('saves and retrieves metadata and data', async () => {
    await DataStore.saveMetadata(owner, id, metadata);
    await DataStore.saveData(owner, id, data);

    const gotMeta = await DataStore.getMetadata(owner, id);
    const gotData = await DataStore.getData(owner, id);
    expect(gotMeta).toEqual(metadata);
    expect(gotData).toEqual(data);
  });

  test('list returns metadata entries', async () => {
    await DataStore.saveMetadata(owner, id, metadata);
    const list = await DataStore.list(owner);
    expect(list).toEqual([metadata]);
  });

  test('delete removes entry and throws when missing', async () => {
    await DataStore.saveMetadata(owner, id, metadata);
    await DataStore.delete(owner, id);
    await expect(DataStore.getMetadata(owner, id)).resolves.toBeUndefined();
    await expect(DataStore.delete(owner, id)).rejects.toThrow('missing entry');
  });

  test('findMetadataById finds across owners', async () => {
    await DataStore.saveMetadata(owner, id, metadata);
    const found = DataStore.findMetadataById(id);
    expect(found).toEqual({ ownerId: owner, metadata });
  });
});
