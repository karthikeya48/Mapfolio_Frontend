class PersistentLRUCache {
  constructor(capacity, storageKey) {
    this.capacity = capacity;
    this.storageKey = storageKey;
    this.cache = new Map();
    this.loadFromStorage();
  }

  loadFromStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      const entries = JSON.parse(data);
      entries.forEach(([key, value]) => this.cache.set(key, value));
    }
  }

  saveToStorage() {
    const entries = Array.from(this.cache.entries());
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    this.saveToStorage();
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const leastUsedKey = this.cache.keys().next().value;
      this.cache.delete(leastUsedKey);
    }
    this.cache.set(key, value);
    this.saveToStorage();
  }

  getAll() {
    return Array.from(this.cache.values()).reverse();
  }

  getKeys() {
    return Array.from(this.cache.keys()).reverse();
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
  }
}

export default PersistentLRUCache;
