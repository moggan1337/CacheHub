# CacheHub ⚡

<!-- Badges -->
[![npm version](https://img.shields.io/npm/v/cachehub?style=flat-square)](https://npmjs.com/package/cachehub)
[![license](https://img.shields.io/npm/l/cachehub?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)](https://nodejs.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](#)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/cachehub?style=flat-square)](https://bundlephobia.com/package/cachehub)

---

**CacheHub** is a lightweight, flexible caching library for Node.js with built-in TTL (Time-To-Live) support, LRU (Least Recently Used) eviction, and function memoization.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [LRU Cache Explained](#lru-cache-explained)
- [Backend Options](#backend-options)
- [Configuration](#configuration)
- [TypeScript Support](#typescript-support)
- [Best Practices](#best-practices)
- [License](#license)

---

## Features

### ⏱️ TTL (Time-To-Live) Support

Automatic expiration of cached items ensures data freshness. Set per-item TTL in seconds, or use the default:

```typescript
// Default TTL of 3600 seconds (1 hour)
cache.set('user:1', userData);

// Custom TTL: 5 minutes
cache.set('session:abc123', sessionData, 300);

// Custom TTL: 30 seconds
cache.set('rate:limit', { count: 1 }, 30);
```

### 🔄 LRU (Least Recently Used) Eviction

When the cache reaches maximum capacity, CacheHub automatically evicts the **least recently accessed** items first. This ensures frequently accessed data remains in cache:

```typescript
const cache = new Cache({ maxSize: 100 });

// When adding the 101st item, the LRU item is evicted
cache.set('item:1', data);
cache.set('item:2', data);
cache.get('item:1'); // item:1 is now more recent
cache.set('item:3', data); // item:2 is evicted (LRU)
```

### ✨ Memoization

Cache expensive function results automatically. Perfect for database queries, API calls, or computationally intensive operations:

```typescript
const fetchUser = async (id: number) => {
  const response = await fetch(`https://api.example.com/users/${id}`);
  return response.json();
};

const memoizedFetch = Memoize.fn(fetchUser, cache);

// First call - fetches from API
const user1 = await memoizedFetch(123);

// Second call - returns from cache
const user2 = await memoizedFetch(123);
```

### 💾 Multiple Backend Options

CacheHub supports pluggable storage backends:

| Backend | Status | Use Case |
|---------|--------|----------|
| **Memory** | ✅ Stable | Single-instance apps, development |
| **Redis** | 🚧 Planned | Distributed systems, production |

---

## Installation

### NPM

```bash
npm install cachehub
```

### Yarn

```bash
yarn add cachehub
```

### PNPM

```bash
pnpm add cachehub
```

### Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (optional but recommended)

---

## Quick Start

### Basic Usage

```typescript
import { Cache } from 'cachehub';

// Create a cache instance
const cache = new Cache<string>();

// Set values with optional TTL (in seconds)
cache.set('username', 'john_doe', 3600);
cache.set('session', 'abc123xyz', 1800);

// Get values
const username = cache.get('username'); // 'john_doe'

// Check existence
if (cache.has('username')) {
  console.log('User found in cache');
}

// Delete specific keys
cache.delete('username');

// Clear entire cache
cache.clear();
```

### With Configuration

```typescript
import { Cache } from 'cachehub';

// Create configured cache
const cache = new Cache({
  maxSize: 500,           // Maximum number of items
  defaultTTL: 7200,       // Default 2 hours
  onEvict: (key, value) => {
    console.log(`Evicted: ${key}`);
  }
});
```

### Memoization Example

```typescript
import { Cache, Memoize } from 'cachehub';

const cache = new Cache();
const db = new DatabaseConnection();

// Memoize a database query
const getUserById = Memoize.fn(async (id: number) => {
  return await db.users.findById(id);
}, cache);

// First call - hits database
const user1 = await getUserById(1);

// Second call - cache hit!
const user2 = await getUserById(1);
```

### Express.js Integration

```typescript
import express from 'express';
import { Cache, Memoize } from 'cachehub';

const app = express();
const cache = new Cache({ maxSize: 1000, defaultTTL: 300 });

// Memoize the data fetching function
const fetchProduct = Memoize.fn(async (productId: string) => {
  return await ProductService.getById(productId);
}, cache);

app.get('/products/:id', async (req, res) => {
  const product = await fetchProduct(req.params.id);
  res.json(product);
});
```

---

## API Reference

### Cache Class

```typescript
import { Cache } from 'cachehub';

const cache = new Cache<T>(options?);
```

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSize` | `number` | `1000` | Maximum number of items in cache |
| `defaultTTL` | `number` | `3600` | Default TTL in seconds |
| `onEvict` | `Function` | `undefined` | Callback when items are evicted |

#### Methods

##### `set(key, value, ttl?)`

Store a value in the cache with optional TTL.

```typescript
cache.set(key: string, value: T, ttl?: number): void
```

**Parameters:**
- `key` - Unique identifier for the cached item
- `value` - Value to store (any type)
- `ttl` - Time-to-live in seconds (optional, uses default if not provided)

**Examples:**
```typescript
// Without TTL (uses defaultTTL)
cache.set('user', { name: 'John' });

// With TTL (30 seconds)
cache.set('temp', { id: 123 }, 30);

// With TTL (1 hour)
cache.set('session', sessionData, 3600);
```

---

##### `get(key)`

Retrieve a value from the cache.

```typescript
cache.get(key: string): T | undefined
```

**Parameters:**
- `key` - The key to look up

**Returns:** The cached value, or `undefined` if not found or expired.

**Examples:**
```typescript
const user = cache.get('user:1');
const data = cache.get('complex-key');

if (data !== undefined) {
  console.log('Cache hit:', data);
} else {
  console.log('Cache miss');
}
```

---

##### `has(key)`

Check if a key exists and is not expired.

```typescript
cache.has(key: string): boolean
```

**Parameters:**
- `key` - The key to check

**Returns:** `true` if the key exists and is not expired, `false` otherwise.

**Examples:**
```typescript
if (cache.has('api:response')) {
  // Use cached response
} else {
  // Fetch fresh data
}
```

---

##### `delete(key)`

Remove a specific key from the cache.

```typescript
cache.delete(key: string): boolean
```

**Parameters:**
- `key` - The key to delete

**Returns:** `true` if the key was deleted, `false` if it didn't exist.

**Examples:**
```typescript
// Invalidate a user's cache after update
cache.delete(`user:${userId}`);

// Invalidate all related keys
cache.delete('session:abc');
cache.delete('permissions:abc');
```

---

##### `clear()`

Remove all items from the cache.

```typescript
cache.clear(): void
```

**Examples:**
```typescript
// Clear on logout
app.post('/logout', (req, res) => {
  cache.clear();
  res.json({ message: 'Logged out' });
});
```

---

##### `prune()`

Remove all expired items from the cache.

```typescript
cache.prune(): void
```

**Examples:**
```typescript
// Run periodically to clean up expired items
setInterval(() => {
  cache.prune();
  console.log('Cache pruned');
}, 60000);
```

---

##### `size`

Get the current number of items in the cache.

```typescript
const itemCount = cache.size; // number
```

---

##### `keys()`

Get all keys in the cache (including expired items pending removal).

```typescript
const allKeys = cache.keys(); // string[]
```

---

##### `values()`

Get all values in the cache.

```typescript
const allValues = cache.values(); // T[]
```

---

### Memoize Class

```typescript
import { Memoize } from 'cachehub';
```

#### `Memoize.fn(fn, cache)`

Create a memoized version of a function.

```typescript
Memoize.fn<T extends Function>(
  fn: T,
  cache: Cache
): T
```

**Parameters:**
- `fn` - The function to memoize (can be async)
- `cache` - The Cache instance to use for storage

**Returns:** A memoized version of the function

**Examples:**

```typescript
// Async function memoization
const fetchUser = async (id: number) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

const memoizedFetchUser = Memoize.fn(fetchUser, cache);

// Sync function memoization
const expensiveCalculation = (n: number): number => {
  return Math.pow(n, 10);
};

const memoizedCalc = Memoize.fn(expensiveCalculation, cache);
```

---

## LRU Cache Explained

### What is LRU?

**LRU (Least Recently Used)** is a cache eviction policy that removes the least recently accessed items when the cache reaches its maximum capacity.

### How It Works

```
Cache with maxSize = 3:

Step 1: set('A', data)  →  [A]
Step 2: set('B', data)  →  [A, B]
Step 3: set('C', data)  →  [A, B, C]
Step 4: get('A')        →  Updates A's access time  [B, C, A]
Step 5: set('D', data)  →  Evicts B (LRU)            [C, A, D]
```

### Why Use LRU?

1. **Memory Efficiency**: Keeps only the most relevant data
2. **Performance**: Frequently accessed items stay in cache
3. **Predictable**: Bounded memory usage
4. **Simple**: No complex eviction algorithms needed

### CacheHub LRU Behavior

In CacheHub, LRU eviction occurs:

1. **When cache is full**: Adding a new item evicts the LRU item
2. **On prune()**: Removes expired items, then applies LRU if still over capacity
3. **Access tracking**: Calling `get()` or `has()` updates the item's position

### Tuning LRU with maxSize

```typescript
// Small cache - faster, less memory
const smallCache = new Cache({ maxSize: 100 });

// Large cache - more memory, better hit rate
const largeCache = new Cache({ maxSize: 10000 });

// Custom eviction callback
const cache = new Cache({
  maxSize: 500,
  onEvict: (key, value) => {
    console.log(`Cache full! Evicting: ${key}`);
    // Could write to disk for persistence
  }
});
```

---

## Backend Options

### Memory Backend (Default)

The default in-memory backend uses JavaScript Maps for O(1) access.

```typescript
import { Cache } from 'cachehub';

const cache = new Cache(); // Uses memory backend
```

**Pros:**
- ✅ Fastest performance
- ✅ No external dependencies
- ✅ Perfect for development

**Cons:**
- ❌ Data lost on restart
- ❌ Not shared between processes
- ❌ Memory limited to single machine

---

### Redis Backend (Planned)

Coming soon - Redis support for distributed caching.

```typescript
// Future API (not yet implemented)
import { Cache } from 'cachehub';

const cache = new Cache({
  backend: 'redis',
  host: 'localhost',
  port: 6379,
  password: 'secret'
});
```

**Pros:**
- ✅ Persistent across restarts
- ✅ Shared across processes
- ✅ Scales horizontally

**Cons:**
- ❌ Requires Redis server
- ❌ Network latency
- ❌ Additional infrastructure

---

## Configuration

### Complete Configuration Example

```typescript
import { Cache } from 'cachehub';

const cache = new Cache({
  // Maximum items in cache (triggers LRU eviction)
  maxSize: 1000,

  // Default TTL in seconds (3600 = 1 hour)
  defaultTTL: 3600,

  // Called when items are evicted
  onEvict: (key: string, value: any) => {
    console.log(`[Cache] Evicted: ${key}`);
  },

  // Enable debug logging
  debug: false
});
```

### Environment-Based Configuration

```typescript
import { Cache } from 'cachehub';

const cache = new Cache({
  maxSize: process.env.NODE_ENV === 'production' ? 5000 : 100,
  defaultTTL: parseInt(process.env.DEFAULT_TTL || '3600', 10),
  onEvict: process.env.NODE_ENV === 'development'
    ? (key) => console.log(`Evicted: ${key}`)
    : undefined
});
```

---

## TypeScript Support

CacheHub is written in TypeScript and provides full type safety.

### Typed Cache

```typescript
import { Cache } from 'cachehub';

// String cache
const stringCache = new Cache<string>();
stringCache.set('key', 'value'); // ✓
stringCache.set('key', 123);     // ✗ Error: number is not assignable to string

// Object cache
interface User {
  id: number;
  name: string;
  email: string;
}

const userCache = new Cache<User>();
userCache.set('user:1', { id: 1, name: 'John', email: 'john@example.com' });

const user = userCache.get('user:1');
if (user) {
  // user is fully typed here
  console.log(user.name);
}
```

### Typed Memoization

```typescript
interface ApiResponse {
  data: any;
  timestamp: number;
}

const fetchData = async (endpoint: string): Promise<ApiResponse> => {
  const response = await fetch(endpoint);
  return response.json();
};

// TypeScript infers return type from the function
const memoizedFetch = Memoize.fn(fetchData, cache);

// Result is properly typed as Promise<ApiResponse>
const result = await memoizedFetch('/api/users');
```

---

## Best Practices

### 1. Choose Appropriate TTLs

```typescript
// Frequently changing data - short TTL
const trendingCache = new Cache({ defaultTTL: 60 }); // 1 minute

// Static reference data - long TTL
const countryCodesCache = new Cache({ defaultTTL: 86400 }); // 24 hours
```

### 2. Use Descriptive Keys

```typescript
// ✗ Bad
cache.set('1', userData);

// ✓ Good
cache.set(`user:${userId}`, userData);
cache.set(`product:${productId}:price`, priceData);
```

### 3. Handle Cache Misses Gracefully

```typescript
async function getUser(id: number) {
  const cached = cache.get(`user:${id}`);
  if (cached) return cached;

  const user = await db.users.findById(id);
  cache.set(`user:${id}`, user, 3600);
  return user;
}
```

### 4. Monitor Cache Performance

```typescript
const cache = new Cache({
  maxSize: 1000,
  onEvict: (key, value) => {
    metrics.increment('cache.evictions');
  }
});
```

### 5. Prune Periodically

```typescript
// Production: prune every minute
setInterval(() => {
  cache.prune();
}, 60000);

// Or on demand
process.on('SIGTERM', () => {
  cache.prune();
  cache.clear();
});
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for the Node.js community</strong>
</div>
