/**
 * Process-local TTL cache. Replace with RedisClusterAdapter when running multiple API instances.
 */

class MemoryCacheAdapter {
  constructor({ maxEntries = 10000, defaultTtlSec = 120 } = {}) {
    this.maxEntries = maxEntries;
    this.defaultTtlSec = defaultTtlSec;
    /** @type {Map<string, { value: string, expiresAt: number }>} */
    this._store = new Map();
  }

  _evictIfNeeded() {
    if (this._store.size <= this.maxEntries) return;
    const first = this._store.keys().next().value;
    if (first != null) this._store.delete(first);
  }

  async get(key) {
    const row = this._store.get(key);
    if (!row) return null;
    if (Date.now() > row.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return row.value;
  }

  /**
   * @param {string} key
   * @param {string} value serialized payload (e.g. JSON string)
   * @param {number} [ttlSec]
   */
  async set(key, value, ttlSec) {
    const ttl = ttlSec ?? this.defaultTtlSec;
    this._evictIfNeeded();
    this._store.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  }

  async delete(key) {
    this._store.delete(key);
  }

  async invalidatePrefix(prefix) {
    for (const k of [...this._store.keys()]) {
      if (k.startsWith(prefix)) this._store.delete(k);
    }
  }
}

module.exports = { MemoryCacheAdapter };
