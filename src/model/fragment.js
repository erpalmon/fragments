// src/model/fragment.js
const { DataStore } = require('./data-store');
const { randomUUID } = require('crypto');
const logger = require('../logger');

class Fragment {
  constructor(attributes) {
    this.id = attributes.id || randomUUID();
    this.ownerId = attributes.ownerId;
    this.type = attributes.type;
    this.size = attributes.size || 0;
    this.created = attributes.created || new Date().toISOString();
    this.updated = attributes.updated || new Date().toISOString();
    this.data = attributes.data;
  }

  static async byId(ownerId, id) {
    try {
      const metadata = await DataStore.getMetadata(ownerId, id);
      if (!metadata) return null;
      return new Fragment(metadata);
    } catch (err) {
      if (err.message.includes('missing entry')) {
        return null;
      }
      throw err;
    }
  }

  static async delete(ownerId, id) {
    try {
      await DataStore.delete(ownerId, id);
      return true;
    } catch (err) {
      if (err.message.includes('missing entry')) {
        return false;
      }
      logger.error({ err, ownerId, id }, 'Error deleting fragment');
      throw new Error(`Error deleting fragment: ${err.message}`);
    }
  }

  static isSupportedType(type) {
    return ['text/plain', 'text/markdown', 'text/html', 'application/json'].some((t) =>
      type.startsWith(t)
    );
  }

  toObject() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      type: this.type,
      size: this.size,
      created: this.created,
      updated: this.updated,
    };
  }

  async save() {
    if (!this.ownerId) throw new Error('ownerId is required');
    if (!Fragment.isSupportedType(this.type)) {
      throw new Error('Unsupported type');
    }

    await DataStore.saveMetadata(this.ownerId, this.id, this.toObject());
    return this;
  }

  async setData(data) {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
    this.size = buffer.length;
    this.updated = new Date().toISOString();
    await DataStore.saveMetadata(this.ownerId, this.id, this.toObject());
    await DataStore.saveData(this.ownerId, this.id, buffer);
    return this;
  }

  async getData() {
    return DataStore.getData(this.ownerId, this.id);
  }

  static async list(ownerId, expand = false) {
    const fragments = await DataStore.list(ownerId);
    if (!fragments || fragments.length === 0) return [];
    return expand ? fragments : fragments.map((f) => f.id);
  }
}

module.exports = { Fragment };
