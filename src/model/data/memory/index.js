const MemoryDB = require('./memory-db');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

// Factory used by unit tests to exercise a fresh in-memory store
function createDatabase() {
  return new MemoryDB();
}

// Write a fragment's metadata to memory db. Returns a Promise<void>
function writeFragment(fragment) {
  if (!fragment || !fragment.ownerId || !fragment.id || !fragment.type) {
    return Promise.reject(new Error('fragment ownerId, id, and type are required'));
  }

  // Store only JSON serialization to mimic real stores (e.g., AWS)
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

// Read a fragment's metadata from memory db. Returns a Promise<Object|undefined>
async function readFragment(ownerId, id) {
  const serialized = await metadata.get(ownerId, id);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

// Write a fragment's data buffer to memory db. Returns a Promise<void>
function writeFragmentData(ownerId, id, buffer) {
  return data.put(ownerId, id, buffer);
}

// Read a fragment's data from memory db. Returns a Promise<Buffer|undefined>
function readFragmentData(ownerId, id) {
  return data.get(ownerId, id);
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise<Array>
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  // Always return an array
  if (!fragments || fragments.length === 0) return [];

  // Parse serialized JSON back to objects
  const parsed = fragments.map((f) => (typeof f === 'string' ? JSON.parse(f) : f));

  // If expand=true, return full objects; otherwise just IDs
  return expand ? parsed : parsed.map((f) => f.id);
}

// Delete a fragment's metadata and data from memory db. Returns a Promise<void[]>
function deleteFragment(ownerId, id) {
  return Promise.all([
    metadata.del(ownerId, id), // metadata
    data.del(ownerId, id), // data
  ]);
}

module.exports = {
  createDatabase,
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
};
