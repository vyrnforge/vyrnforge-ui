import { describe, expect, it } from "vitest";
import { createLocalStorageGridPersistence } from "./gridPersistence";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}

describe("createLocalStorageGridPersistence", () => {
  it("saves, loads, and clears persisted grid state", () => {
    const storage = createMemoryStorage();
    const adapter = createLocalStorageGridPersistence({
      namespace: "test",
      storage
    });

    adapter.save("users", {
      search: "alpha",
      pagination: { pageIndex: 0, pageSize: 25 },
      columnSizing: { name: 220 },
      density: "compact"
    });

    expect(adapter.load("users")).toEqual({
      search: "alpha",
      pagination: { pageIndex: 0, pageSize: 25 },
      columnSizing: { name: 220 },
      density: "compact"
    });

    adapter.clear?.("users");
    expect(adapter.load("users")).toBeNull();
  });

  it("returns null for invalid stored JSON", () => {
    const storage = createMemoryStorage();
    storage.setItem("test:users", "{");

    expect(
      createLocalStorageGridPersistence({ namespace: "test", storage }).load(
        "users"
      )
    ).toBeNull();
  });
});
