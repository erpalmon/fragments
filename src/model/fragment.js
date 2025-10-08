// src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Import our data helper functions (in-memory DB for now)
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
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (!Fragment.isSupportedType(type)) throw new Error('Unsupported type');
    if (typeof size !== 'number' || size < 0) throw new Error('Invalid size');

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /** Get all fragments (id or full) for the given user */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    if (!expand) return fragments;
    return fragments.map((f) => new Fragment(f));
  }

  /** Get a fragment by id for a user */
  static async byId(ownerId, id) {
    const data = await readFragment(ownerId, id);
    if (!data) throw new Error('Fragment not found');
    return new Fragment(data);
  }

  /** Delete a fragment (metadata + data) */
  static async delete(ownerId, id) {
    await deleteFragment(ownerId, id);
  }

  /** Save fragment metadata */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  /** Get fragment data buffer */
  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /** Set fragment data buffer (and update size/updated) */
  async setData(data) {
    if (!Buffer.isBuffer(data)) throw new Error('Data must be a Buffer');
    this.size = data.length;
    this.updated = new Date().toISOString();
    await writeFragment(this);
    await writeFragmentData(this.ownerId, this.id, data);
  }

  /** Mime type without charset */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /** Is this a text/* type? */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /** Supported conversions for this type */
  get formats() {
    if (this.mimeType === 'text/plain') return ['text/plain'];
    return [];
  }

  /** Do we support this Content-Type? */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return type === 'text/plain';
    } catch {
      // Parsing failed or unsupported
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
