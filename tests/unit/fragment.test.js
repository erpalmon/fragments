// tests/unit/fragment.test.js
const { readFragment, writeFragment, listFragments, deleteFragment } = require('../../src/model/data/aws');
const Fragment = require('../../src/model/fragment');

describe('Fragment class', () => {
  let testFragment;

  beforeEach(() => {
    // Reset test data
    testFragment = {
      ownerId: 'test-owner',
      id: 'test-id',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'text/plain',
      size: 11 // "hello world".length
    };
  });

  test('writeFragment() writes a fragment', async () => {
    const result = await writeFragment(testFragment);
    expect(result).toEqual(testFragment);
  });

  test('readFragment() returns what we write into the db', async () => {
    await writeFragment(testFragment);
    const result = await readFragment(testFragment.ownerId, testFragment.id);
    expect(result).toMatchObject(testFragment);
  });

  test('listFragments() returns all fragment ids for an owner', async () => {
    await writeFragment(testFragment);
    const ids = await listFragments(testFragment.ownerId);
    expect(ids).toEqual([{ id: testFragment.id }]);
  });

  test('deleteFragment() removes the fragment', async () => {
    await writeFragment(testFragment);
    await deleteFragment(testFragment.ownerId, testFragment.id);
    const result = await readFragment(testFragment.ownerId, testFragment.id);
    expect(result).toEqual({});
  });
});
