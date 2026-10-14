const DB_NAME = 'PrashantFootwearDB';
const DB_VERSION = 1;
const STORE_NAME = 'media';
const KEY_NAME = 'hero_video_blob';

export async function initDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    } catch (e) {
      console.warn('IndexedDB not supported or blocked:', e);
      resolve(null);
    }
  });
}

export async function saveVideoBlob(blob: Blob, key: string = KEY_NAME): Promise<void> {
  try {
    const db = await initDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(blob, key);

        request.onerror = () => resolve();
        request.onsuccess = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  } catch (e) {
    console.warn('saveVideoBlob error:', e);
  }
}

export async function getVideoBlob(key: string = KEY_NAME): Promise<Blob | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.error('IndexedDB getVideoBlob error:', error);
    return null;
  }
}

export async function clearVideoBlob(key: string = KEY_NAME): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('IndexedDB clearVideoBlob error:', error);
  }
}

export async function saveMediaItem(key: string, data: Blob | string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`IndexedDB saveMediaItem error for key ${key}:`, error);
  }
}

export async function getMediaItem(key: string): Promise<Blob | string | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.error(`IndexedDB getMediaItem error for key ${key}:`, error);
    return null;
  }
}

export async function clearMediaItem(key: string): Promise<void> {
  return clearVideoBlob(key);
}
