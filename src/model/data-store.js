const store = new Map(); // ownerId -> Map<id, { metadata, data }>

function getOwnerStore(ownerId) {
  if (!store.has(ownerId)) {
    store.set(ownerId, new Map());
  }
  return store.get(ownerId);
}

class DataStore {
  static async saveMetadata(ownerId, id, metadata) {
    const owner = getOwnerStore(ownerId);
    const current = owner.get(id) || {};
    owner.set(id, { ...current, metadata });
  }

  static async saveData(ownerId, id, data) {
    const owner = getOwnerStore(ownerId);
    const current = owner.get(id) || {};
    owner.set(id, { ...current, data });
  }

  static async getMetadata(ownerId, id) {
    const entry = getOwnerStore(ownerId).get(id);
    return entry ? entry.metadata : undefined;
  }

  static async getData(ownerId, id) {
    const entry = getOwnerStore(ownerId).get(id);
    return entry ? entry.data : undefined;
  }

  static async delete(ownerId, id) {
    const owner = getOwnerStore(ownerId);
    if (!owner.has(id)) {
      throw new Error(`missing entry for primaryKey=${ownerId} and secondaryKey=${id}`);
    }
    owner.delete(id);
  }

  static async list(ownerId) {
    const owner = getOwnerStore(ownerId);
    return Array.from(owner.values())
      .map((entry) => entry.metadata)
      .filter(Boolean);
  }

  static findMetadataById(id) {
    for (const [ownerId, entries] of store.entries()) {
      const entry = entries.get(id);
      if (entry && entry.metadata) {
        return { ownerId, metadata: entry.metadata };
      }
    }
    return null;
  }
}

module.exports = { DataStore };

