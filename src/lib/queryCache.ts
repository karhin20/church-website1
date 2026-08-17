/**
 * queryCache.ts
 * Lightweight in-memory + sessionStorage caching utility.
 * Eliminates redundant API/Supabase calls across React components.
 *
 * Tiers:
 *  - In-memory Map (fastest; cleared on full page refresh)
 *  - sessionStorage (for VOTD / long-lived data; survives SPA navigation)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // ms epoch
}

// In-memory cache store
const memoryStore = new Map<string, CacheEntry<unknown>>();

/**
 * Read a cached value. Returns `null` if missing or expired.
 * Checks memory first, then sessionStorage as fallback.
 */
export function getCache<T>(key: string): T | null {
  const now = Date.now();

  // 1. Memory tier
  const mem = memoryStore.get(key) as CacheEntry<T> | undefined;
  if (mem) {
    if (mem.expiresAt > now) return mem.data;
    memoryStore.delete(key);
  }

  // 2. sessionStorage tier (for persisted entries like VOTD)
  try {
    const raw = sessionStorage.getItem(`qc:${key}`);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      if (parsed.expiresAt > now) {
        // Promote to memory so next reads are instant
        memoryStore.set(key, parsed as CacheEntry<unknown>);
        return parsed.data;
      }
      sessionStorage.removeItem(`qc:${key}`);
    }
  } catch {
    // sessionStorage unavailable (private mode, quota exceeded, etc.)
  }

  return null;
}

/**
 * Store a value in both memory and optionally sessionStorage.
 * @param key       Cache key
 * @param data      Value to cache
 * @param ttlMs     Time-to-live in milliseconds
 * @param persist   If true, also writes to sessionStorage (use for VOTD etc.)
 */
export function setCache<T>(
  key: string,
  data: T,
  ttlMs: number,
  persist = false
): void {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
  memoryStore.set(key, entry as CacheEntry<unknown>);

  if (persist) {
    try {
      sessionStorage.setItem(`qc:${key}`, JSON.stringify(entry));
    } catch {
      // Quota exceeded or unavailable — memory tier is enough
    }
  }
}

/**
 * Invalidate a cache entry immediately (memory + sessionStorage).
 * Call this after mutations (create / update / delete).
 */
export function clearCache(key: string): void {
  memoryStore.delete(key);
  try {
    sessionStorage.removeItem(`qc:${key}`);
  } catch {
    // ignore
  }
}

// TTL constants — centralised so changes propagate everywhere
export const TTL = {
  VOTD: 24 * 60 * 60 * 1000,        // 24 hours
  SERMONS: 5 * 60 * 1000,           // 5 minutes
  ANNOUNCEMENTS: 5 * 60 * 1000,     // 5 minutes
  DASHBOARD_STATS: 2 * 60 * 1000,   // 2 minutes
} as const;
