import { openDB } from 'idb';

const DB_NAME = 'unearth-db';
const DB_VERSION = 2; // Increment when schema changes

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Items store
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('name', 'name');
        itemStore.createIndex('homePlaceId', 'homePlaceId');
        itemStore.createIndex('createdAt', 'createdAt');
      } else {
        // If upgrading, you can add indexes here
        const itemStore = transaction.objectStore('items');
        if (!itemStore.indexNames.contains('name')) {
          itemStore.createIndex('name', 'name');
        }
        if (!itemStore.indexNames.contains('homePlaceId')) {
          itemStore.createIndex('homePlaceId', 'homePlaceId');
        }
        if (!itemStore.indexNames.contains('createdAt')) {
          itemStore.createIndex('createdAt', 'createdAt');
        }
      }

      // Places store
      if (!db.objectStoreNames.contains('places')) {
        const placeStore = db.createObjectStore('places', { keyPath: 'id' });
        placeStore.createIndex('name', 'name');
        placeStore.createIndex('createdAt', 'createdAt');
      } else {
        const placeStore = transaction.objectStore('places');
        if (!placeStore.indexNames.contains('name')) {
          placeStore.createIndex('name', 'name');
        }
        if (!placeStore.indexNames.contains('createdAt')) {
          placeStore.createIndex('createdAt', 'createdAt');
        }
      }

      // Logs store
      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
        logStore.createIndex('itemId', 'itemId');
        logStore.createIndex('placeId', 'placeId');
        logStore.createIndex('timestamp', 'timestamp');
        logStore.createIndex('type', 'type'); // 'stored' or 'found' or 'moved'
      } else {
        const logStore = transaction.objectStore('logs');
        if (!logStore.indexNames.contains('itemId')) {
          logStore.createIndex('itemId', 'itemId');
        }
        if (!logStore.indexNames.contains('placeId')) {
          logStore.createIndex('placeId', 'placeId');
        }
        if (!logStore.indexNames.contains('timestamp')) {
          logStore.createIndex('timestamp', 'timestamp');
        }
        if (!logStore.indexNames.contains('type')) {
          logStore.createIndex('type', 'type');
        }
      }

      // Progress store (single record: key 'user')
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress');
      }

      // Sync queue (for offline actions)
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
}
