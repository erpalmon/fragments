// src/model/fragment.js
const { randomUUID } = require('crypto');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('missing parameter: ownerId');
    }
    if (!type) {
      throw new Error('missing parameter: type');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`unsupported fragment type: ${type}`);
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  static async byUser(ownerId, expand = false) {
    try {
      const fragments = await listFragments(ownerId, expand);
      if (!fragments) {
        throw new Error('No fragments found for user');
      }
      return expand ? fragments.map(f => new Fragment(f)) : fragments;
    } catch (err) {
      throw new Error(`Error retrieving user fragments: ${err.message}`);
    }
  }

  static async byId(ownerId, id) {
    try {
      const fragment = await readFragment(ownerId, id);
      if (!fragment) {
        throw new Error('Fragment not found');
      }
      return new Fragment(fragment);
    } catch (err) {
      throw new Error(`Error retrieving fragment: ${err.message}`);
    }
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      const validTypes = [
        'text/plain',
        'text/markdown',
        'text/html',
        'application/json',
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
      ];
      return validTypes.includes(type);
    } catch {
      return false;
    }
  }

  static async delete(ownerId, id) {
    try {
      await deleteFragment(ownerId, id);
      return;
    } catch (err) {
      throw new Error(`Error deleting fragment: ${err.message}`);
    }
  }

  async save() {
    try {
      this.updated = new Date().toISOString();
      await writeFragment(this);
      return this;
    } catch (err) {
      throw new Error(`Error saving fragment: ${err.message}`);
    }
  }

  async getData() {
    try {
      const data = await readFragmentData(this.ownerId, this.id);
      if (!data) {
        throw new Error('Fragment data not found');
      }
      return data;
    } catch (err) {
      throw new Error(`Error retrieving fragment data: ${err.message}`);
    }
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }
    try {
      this.size = data.length;
      this.updated = new Date().toISOString();
      await writeFragment(this);
      await writeFragmentData(this.ownerId, this.id, data);
    } catch (err) {
      throw new Error(`Error setting fragment data: ${err.message}`);
    }
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    const type = this.mimeType;
    switch (type) {
      case 'text/plain':
        return ['text/plain'];
      case 'text/markdown':
        return ['text/markdown', 'text/html', 'text/plain'];
      case 'text/html':
        return ['text/html', 'text/plain'];
      case 'application/json':
        return ['application/json', 'text/plain'];
      case 'image/png':
      case 'image/jpeg':
      case 'image/webp':
      case 'image/gif':
        return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      default:
        return [type];
    }
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
