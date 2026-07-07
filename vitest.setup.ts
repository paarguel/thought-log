import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

// vitest 4 + jsdom 29 doesn't surface window.localStorage onto the test
// global, and Node's own experimental localStorage global is undefined
// without --localstorage-file. Provide a plain in-memory implementation.
if (typeof window !== "undefined" && !window.localStorage) {
  const store = new Map<string, string>();
  const localStorage: Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, "localStorage", { value: localStorage, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: localStorage, configurable: true });
}
