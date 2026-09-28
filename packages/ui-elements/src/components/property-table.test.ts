import { describe, expect, it } from "vitest";

import { VyrnForgePropertyTableElement } from "./property-table";

describe("VyrnForgePropertyTableElement", () => {
  it("is server-safe to import and exposes no stateful component contract", () => {
    expect(VyrnForgePropertyTableElement).toBeDefined();
    expect(VyrnForgePropertyTableElement.properties).toEqual({});
  });
});
