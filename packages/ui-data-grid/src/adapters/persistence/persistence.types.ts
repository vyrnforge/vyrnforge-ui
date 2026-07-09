import type {
  DataGridPersistenceAdapter,
  DataGridPersistedState
} from "../../types/dataGrid.types";

export type {
  DataGridPersistenceAdapter,
  DataGridPersistedState
};

export type LocalStorageGridPersistenceOptions = {
  namespace?: string;
  storage?: Storage;
};
