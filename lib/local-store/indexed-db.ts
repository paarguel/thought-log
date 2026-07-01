import type { ThoughtLogEntry } from "@/lib/thought-log/types";

const DB_NAME = "thought-log-local";
const STORE_NAME = "entries";
const DB_VERSION = 1;

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = callback(tx.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

export const saveLocalEntry = (entry: ThoughtLogEntry) => withStore("readwrite", (store) => store.put(entry));

export const listLocalEntries = () => withStore<ThoughtLogEntry[]>("readonly", (store) => store.getAll());

export const deleteLocalEntry = (id: string) => withStore("readwrite", (store) => store.delete(id));

export const clearLocalEntries = async () => {
  await withStore("readwrite", (store) => store.clear());
};
