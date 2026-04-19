interface CacheItem<T> { value: T; expires: number; }

export class Cache<T = any> {
  private store = new Map<string, CacheItem<T>>();

  set(key: string, value: T, ttl = 3600) {
    this.store.set(key, { value, expires: Date.now() + ttl * 1000 });
  }

  get(key: string): T | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expires) { this.store.delete(key); return undefined; }
    return item.value;
  }

  has(key: string): boolean { return this.get(key) !== undefined; }
  delete(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }

  // LRU eviction
  prune() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expires) this.store.delete(key);
    }
  }
}

export class Memoize {
  static fn<T extends Function>(fn: T, cache = new Cache()): T {
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as any;
  }
}
export default Cache;
