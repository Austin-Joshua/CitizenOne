const { MemoryCacheAdapter } = require('./MemoryCacheAdapter');
const { RedisCacheAdapter } = require('./RedisCacheAdapter');

let singleton;

/**
 * @returns {MemoryCacheAdapter | RedisCacheAdapter}
 */
function getCacheAdapter() {
  if (!singleton) {
    const redisUrl = String(process.env.REDIS_URL || '').trim();
    const ttl = Number(process.env.CACHE_DEFAULT_TTL_SEC || 120);
    if (redisUrl) {
      singleton = new RedisCacheAdapter({ redisUrl, defaultTtlSec: ttl });
    } else {
      const max = Number(process.env.CACHE_MAX_ENTRIES || 10000);
      singleton = new MemoryCacheAdapter({ maxEntries: max, defaultTtlSec: ttl });
    }
  }
  return singleton;
}

async function resetCacheAdapterForTests() {
  if (singleton && typeof singleton.quit === 'function') {
    try {
      await singleton.quit();
    } catch {
      /* ignore */
    }
  }
  singleton = undefined;
}

module.exports = { getCacheAdapter, resetCacheAdapterForTests };
