const cache = new Map();

function makeKey(key) {
  return typeof key === "string" ? key : JSON.stringify(key);
}

export function getCached(key) {
  const k = makeKey(key);
  const entry = cache.get(k);
  if (!entry) return undefined;
  if (entry.expiry && Date.now() > entry.expiry) {
    cache.delete(k);
    return undefined;
  }
  return entry.data;
}

export function setCached(key, data, ttl = 120000) {
  const k = makeKey(key);
  cache.set(k, { data, expiry: Date.now() + ttl });
}

export function clearCached(key) {
  const k = makeKey(key);
  cache.delete(k);
}

export function clearAllCached() {
  cache.clear();
}

export async function fetchWithCache(key, url, options = {}, ttl = 120000, skipCache = false) {
  const k = makeKey(key);
  if (!skipCache) {
    const cached = getCached(k);
    if (cached !== undefined) return cached;
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  const data = await res.json();
  setCached(k, data, ttl);
  return data;
}

export default { getCached, setCached, clearCached, clearAllCached, fetchWithCache };
