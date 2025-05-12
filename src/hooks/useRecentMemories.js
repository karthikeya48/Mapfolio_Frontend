import { useEffect, useState } from "react";
import { getRecentMemoriesFromFirestore } from "../services/memoryService";
import PersistentLRUCache from "../services/lruCache.js";

const recentMemoryCache = new PersistentLRUCache(10, "recentMemories");

export const useRecentMemories = (userId) => {
  const [recentMemories, setRecentMemories] = useState([]);

  useEffect(() => {
    const loadMemories = async () => {
      const memories = await loadRecentMemories(userId);
      setRecentMemories(memories);
    };
    loadMemories();
  }, [userId]);

  const loadRecentMemories = async (userId) => {
    const recentMemoriesFromCache = recentMemoryCache.getAll();

    if (recentMemoriesFromCache.length === 0) {
      const recentMemoriesFromFirestore = await getRecentMemoriesFromFirestore(
        userId
      );
      recentMemoryCache.clear();
      recentMemoriesFromFirestore.forEach((memoryId) => {
        recentMemoryCache.put(memoryId, null); // Fetch more details later if needed
      });
      return recentMemoriesFromFirestore;
    }

    return recentMemoriesFromCache;
  };

  return recentMemories;
};
