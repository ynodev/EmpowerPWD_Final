// Simple in-memory cache implementation
const cache = {
  store: new Map(),
  
  get: async (key) => {
    const item = cache.store.get(key);
    if (!item) return null;
    
    if (item.expiry && item.expiry < Date.now()) {
      cache.store.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  set: async (key, value, ttlSeconds = 300) => {
    cache.store.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
    });
  },
  
  delete: async (key) => {
    cache.store.delete(key);
  },
  
  clear: async () => {
    cache.store.clear();
  }
};

export default cache; 