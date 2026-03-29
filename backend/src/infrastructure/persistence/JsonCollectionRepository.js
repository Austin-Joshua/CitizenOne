const { readCollection, writeCollection, nextId } = require('../../lib/dataStore');

/**
 * Centralised read/write for a named collection (JSON files or PostgreSQL json_collections).
 */
class JsonCollectionRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async findAll() {
    return readCollection(this.collectionName);
  }

  async saveAll(rows) {
    return writeCollection(this.collectionName, rows);
  }

  nextId(prefix, rows) {
    return nextId(prefix, rows);
  }
}

module.exports = { JsonCollectionRepository };
