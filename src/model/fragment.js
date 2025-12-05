// src/model/fragment.js
const { DataStore } = require('./data-store');
const logger = require('../logger');

class Fragment {
  constructor(attributes) {
    this.id = attributes.id;
    this.ownerId = attributes.ownerId;
    this.type = attributes.type;
    this.size = attributes.size || 0;
    this.created = attributes.created || new Date();
    this.updated = attributes.updated || new Date();
  }

  static async byId(ownerId, id) {
    try {
      const data = await DataStore.get(ownerId, id);
      return new Fragment(JSON.parse(data));
    } catch (err) {
      if (err.message.includes('missing entry')) {
        return null;
      }
      throw err;
    }
  }

  static async delete(ownerId, id) {
    try {
      await DataStore.del(ownerId, id);
      return true;
    } catch (err) {
      if (err.message.includes('missing entry')) {
        return false;
      }
      logger.error({ err, ownerId, id }, 'Error deleting fragment');
      throw new Error(`Error deleting fragment: ${err.message}`);
    }
  }

  // ... rest of the Fragment class methods
}

module.exports = { Fragment };
