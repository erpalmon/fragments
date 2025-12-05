const { createDatabase } = require('@/model/data/memory');

describe('Memory Database', () => {
  let db;

  beforeEach(() => {
    db = createDatabase();
  });

  test('put() and get() work correctly', async () => {
    await db.put('test', 'key1', { value: 1 });
    const result = await db.get('test', 'key1');
    expect(result).toEqual({ value: 1 });
  });

  test('get() returns undefined for non-existent key', async () => {
    const result = await db.get('test', 'nonexistent');
    expect(result).toBeUndefined();
  });

  test('put() updates existing key', async () => {
    await db.put('test', 'key1', { value: 1 });
    await db.put('test', 'key1', { value: 2 });
    const result = await db.get('test', 'key1');
    expect(result).toEqual({ value: 2 });
  });

  test('del() removes key', async () => {
    await db.put('test', 'key1', { value: 1 });
    await db.del('test', 'key1');
    const result = await db.get('test', 'key1');
    expect(result).toBeUndefined();
  });

  test('query() returns all items for prefix', async () => {
    await db.put('test', 'a1', { value: 1 });
    await db.put('test', 'a2', { value: 2 });
    await db.put('other', 'b1', { value: 3 });

    const results = await db.query('test');
    expect(results).toHaveLength(2);
    expect(results).toEqual(expect.arrayContaining([
      { value: 1 },
      { value: 2 }
    ]));
  });

  test('query() returns empty array for non-existent prefix', async () => {
    const results = await db.query('nonexistent');
    expect(results).toEqual([]);
  });
});
