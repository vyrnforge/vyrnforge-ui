import type {
  DataGridPersistenceAdapter,
  DataGridPersistedState
} from "../types/dataGrid.types";

export type LocalStorageGridPersistenceOptions = {
  namespace?: string;
  storage?: Storage;
};

const defaultNamespace = "udg";

const getStorage = (providedStorage?: Storage) => {
  if (providedStorage) {
    return providedStorage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const createStorageKey = (namespace: string, tableId: string) =>
  `${namespace}:${tableId}`;

export function createLocalStorageGridPersistence(
  options: LocalStorageGridPersistenceOptions = {}
): DataGridPersistenceAdapter {
  const namespace = options.namespace ?? defaultNamespace;

  return {
    load(tableId) {
      const storage = getStorage(options.storage);

      if (!storage) {
        return null;
      }

      try {
        const value = storage.getItem(createStorageKey(namespace, tableId));
        return value ? (JSON.parse(value) as DataGridPersistedState) : null;
      } catch {
        return null;
      }
    },
    save(tableId, state) {
      const storage = getStorage(options.storage);

      if (!storage) {
        return;
      }

      try {
        storage.setItem(createStorageKey(namespace, tableId), JSON.stringify(state));
      } catch {
        // Persistence should never break the grid.
      }
    },
    clear(tableId) {
      const storage = getStorage(options.storage);

      if (!storage) {
        return;
      }

      try {
        storage.removeItem(createStorageKey(namespace, tableId));
      } catch {
        // Persistence should never break the grid.
      }
    }
  };
}
