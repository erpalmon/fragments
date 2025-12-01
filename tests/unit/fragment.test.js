// tests/unit/fragment.test.js
const { readFragment, writeFragment, listFragments, deleteFragment } = require('../../src/model/data');
const Fragment = require('../../src/model/fragment');

describe('Fragment class', () => {
  let testFragment;

  beforeEach(() => {
    // Reset test data
    testFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
  });

  test('writeFragment() writes a fragment', async () => {
    await testFragment.save();
    const result = await Fragment.byId(testFragment.ownerId, testFragment.id);
    expect(result).toMatchObject(testFragment);
  });

  test('readFragment() returns what we write into the db', async () => {
    await testFragment.save();
    const result = await Fragment.byId(testFragment.ownerId, testFragment.id);
    expect(result).toMatchObject(testFragment);
  });

  test('listFragments() returns all fragments for an owner', async () => {
    await testFragment.save();
    const fragments = await Fragment.byUser(testFragment.ownerId, true);
    expect(fragments).toEqual(expect.arrayContaining([expect.objectContaining({
      id: testFragment.id,
      ownerId: testFragment.ownerId,
      type: testFragment.type
    })]));
  });

  test('deleteFragment() removes the fragment', async () => {
    await testFragment.save();
    const result = await Fragment.delete(testFragment.ownerId, testFragment.id);
    expect(result).toEqual({});
    
    const fragment = await Fragment.byId(testFragment.ownerId, testFragment.id);
    expect(fragment).toEqual({});
  });

  test('setData() and getData() work with buffers', async () => {
    const data = Buffer.from('hello world');
    await testFragment.setData(data);
    await testFragment.save();
    
    const result = await testFragment.getData();
    expect(result).toEqual(data);
    expect(testFragment.size).toBe(data.length);
  });
});
