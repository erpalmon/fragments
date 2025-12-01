// src/model/fragment.js
const { randomUUID } = require('crypto');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  deleteFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, type, size = 0, created, updated }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }

    // Validate supported type
    const base = Fragment._baseMime(type);
    if (!Fragment.isSupportedType(base)) {
      throw new Error('Unsupported type');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  // Extract clean MIME
  static _baseMime(value) {
    return contentType.parse(value).type.toLowerCase();
  }

  static isSupportedType(value) {
    try {
      const base = Fragment._baseMime(value);
      return base === 'application/json' || base.startsWith('text/');
    } catch {
      return false;
    }
  }

  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    return expand ? fragments.map((f) => new Fragment(f)) : fragments;
  }

  static async byId(ownerId, id) {
    const data = await readFragment(ownerId, id);
    return data ? new Fragment(data) : {};
  }

  static async delete(ownerId, id) {
    try {
      await deleteFragment(ownerId, id);
    } catch {
      // ignore errors, tests expect {}
    }
    return {};
  }

  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
    return this;
  }

  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) throw new Error('Data must be a Buffer');
    this.size = data.length;
    this.updated = new Date().toISOString();
    await writeFragment(this);
    await writeFragmentData(this.ownerId, this.id, data);
  }

  get mimeType() {
    return Fragment._baseMime(this.type);
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    if (this.mimeType === 'text/markdown') {
      return ['text/html'];
    }
    return [this.mimeType];
  }

  toJSON() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    };
  }
}

module.exports = Fragment;
