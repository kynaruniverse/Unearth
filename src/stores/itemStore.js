import { create } from 'zustand';
import { initDB } from '../utils/db';

const useItemStore = create((set, get) => ({
  items: [],
  places: [],
  logs: [],

  // Load all data from IndexedDB
  loadData: async () => {
    try {
      const db = await initDB();
      const items = await db.getAll('items');
      const places = await db.getAll('places');
      const logs = await db.getAll('logs');
      set({ items, places, logs });
    } catch (error) {
      console.error('Failed to load data', error);
    }
  },

  // Add a new item
  addItem: async (item) => {
    const db = await initDB();
    const id = crypto.randomUUID();
    const newItem = {
      id,
      name: item.name,
      emoji: item.emoji || '📦',
      homePlaceId: item.homePlaceId || null,
      createdAt: Date.now(),
    };
    await db.add('items', newItem);
    set(state => ({ items: [...state.items, newItem] }));
    return newItem;
  },

  // Update an item
  updateItem: async (id, updates) => {
    const db = await initDB();
    const existing = await db.get('items', id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    await db.put('items', updated);
    set(state => ({
      items: state.items.map(item => item.id === id ? updated : item)
    }));
    return updated;
  },

  // Delete an item
  deleteItem: async (id) => {
    const db = await initDB();
    await db.delete('items', id);
    set(state => ({
      items: state.items.filter(item => item.id !== id)
    }));
  },

  // Places
  addPlace: async (place) => {
    const db = await initDB();
    const id = crypto.randomUUID();
    const newPlace = {
      id,
      name: place.name,
      emoji: place.emoji || '📍',
      createdAt: Date.now(),
    };
    await db.add('places', newPlace);
    set(state => ({ places: [...state.places, newPlace] }));
    return newPlace;
  },

  updatePlace: async (id, updates) => {
    const db = await initDB();
    const existing = await db.get('places', id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    await db.put('places', updated);
    set(state => ({
      places: state.places.map(p => p.id === id ? updated : p)
    }));
  },

  deletePlace: async (id) => {
    const db = await initDB();
    await db.delete('places', id);
    set(state => ({
      places: state.places.filter(p => p.id !== id)
    }));
  },

  // Logs
  addLog: async (log) => {
    const db = await initDB();
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newLog = {
      id,
      itemId: log.itemId,
      placeId: log.placeId,
      type: log.type, // 'stored', 'found', 'moved'
      timestamp: Date.now(),
      note: log.note || '',
    };
    await db.add('logs', newLog);
    set(state => ({ logs: [...state.logs, newLog] }));

    // If this log is a 'stored' action and the item's homePlaceId is not set, optionally set it
    if (log.type === 'stored') {
      const item = get().items.find(i => i.id === log.itemId);
      if (item && !item.homePlaceId) {
        get().updateItem(item.id, { homePlaceId: log.placeId });
      }
    }
    return newLog;
  },

  // Get logs for a specific item
  getLogsForItem: (itemId) => {
    return get().logs.filter(log => log.itemId === itemId).sort((a, b) => b.timestamp - a.timestamp);
  },

  // Get logs for a specific place
  getLogsForPlace: (placeId) => {
    return get().logs.filter(log => log.placeId === placeId).sort((a, b) => b.timestamp - a.timestamp);
  },
}));

export default useItemStore;
