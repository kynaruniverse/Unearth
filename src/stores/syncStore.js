import { create } from 'zustand';
import { initDB } from '../utils/db';

const useSyncStore = create((set, get) => ({
  isOnline: navigator.onLine,
  syncQueue: [],

  init: () => {
    window.addEventListener('online', () => {
      set({ isOnline: true });
      get().processQueue();
    });
    window.addEventListener('offline', () => set({ isOnline: false }));
  },

  // Add an action to the queue (when offline)
  addToQueue: async (action) => {
    const db = await initDB();
    const id = Date.now() + Math.random().toString(36);
    const item = { id, ...action, timestamp: Date.now() };
    await db.add('syncQueue', item);
    set(state => ({ syncQueue: [...state.syncQueue, item] }));
  },

  // Process queue when online
  processQueue: async () => {
    if (!get().isOnline) return;
    const db = await initDB();
    const queue = await db.getAll('syncQueue');
    for (const item of queue.sort((a, b) => a.timestamp - b.timestamp)) {
      try {
        // Perform the action (e.g., API call to sync)
        console.log('Syncing:', item);
        // Here you would send to server if you had one
        await db.delete('syncQueue', item.id);
      } catch (error) {
        console.error('Sync failed, will retry later', error);
      }
    }
    // Refresh queue
    const remaining = await db.getAll('syncQueue');
    set({ syncQueue: remaining });
  },
}));

export default useSyncStore;
