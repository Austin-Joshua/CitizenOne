/**
 * Redis-backed TTL cache (shared across API instances). Requires REDIS_URL and `ioredis`.
 */

const Redis = require('ioredis');

class RedisCacheAdapter {
  /**
   * @param {{ redisUrl: string, defaultTtlSec?: number }} opts
   */
  constructor({ redisUrl, defaultTtlSec = 120 } = {}) {
    if (!redisUrl) throw new Error('RedisCacheAdapter requires redisUrl');
    this.defaultTtlSec = defaultTtlSec;
    this._redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  async get(key) {
    const v = await this._redis.get(key);
    return v == null ? null : v;
  }

  async set(key, value, ttlSec) {
    const ttl = ttlSec ?? this.defaultTtlSec;
    if (ttl > 0) {
      await this._redis.set(key, value, 'EX', ttl);
    } else {
      await this._redis.set(key, value);
    }
  }

  async delete(key) {
    await this._redis.del(key);
  }

  async invalidatePrefix(prefix) {
    let cursor = '0';
    const match = `${prefix}*`;
    do {
      const [next, keys] = await this._redis.scan(cursor, 'MATCH', match, 'COUNT', 128);
      cursor = next;
      if (keys.length) await this._redis.del(...keys);
    } while (cursor !== '0');
  }

  /** @returns {Promise<boolean>} */
  async ping() {
    const r = await this._redis.ping();
    return r === 'PONG';
  }

  async quit() {
    await this._redis.quit();
  }
}

module.exports = { RedisCacheAdapter };
