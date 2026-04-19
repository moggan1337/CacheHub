# CacheHub ⚡

**Flexible Caching** - TTL, LRU, memoization.

## Features

- **⏱️ TTL Support** - Automatic expiration
- **🔄 LRU Eviction** - Least Recently Used
- **✨ Memoization** - Cache function results
- **💾 Multiple Backends** - Memory, Redis (planned)

## Installation

```bash
npm install cachehub
```

## Usage

```typescript
import { Cache, Memoize } from 'cachehub';

// Basic cache
const cache = new Cache<string>();

cache.set('user:1', 'John', 3600); // 1 hour TTL
const user = cache.get('user:1');

if (cache.has('user:1')) {
  console.log('Cache hit!');
}

// Memoization
const slowFunction = async (id: number) => {
  return await fetchFromDatabase(id);
};

const memoized = Memoize.fn(slowFunction, cache);
const result = await memoized(1); // Fetched
const result2 = await memoized(1); // Cached!
```

## API

### Cache<T>
| Method | Description |
|--------|-------------|
| `set(key, value, ttl?)` | Set with optional TTL (seconds) |
| `get(key)` | Get value or undefined |
| `has(key)` | Check if key exists |
| `delete(key)` | Remove key |
| `clear()` | Clear all |
| `prune()` | Remove expired items |

### Memoize
```typescript
Memoize.fn(fn, cache) // Returns memoized version
```

## LRU

Cache automatically evicts least recently used items when capacity is reached.

```typescript
const cache = new Cache({ maxSize: 100 });
```

## License

MIT
