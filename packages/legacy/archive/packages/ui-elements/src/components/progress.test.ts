import { describe, expect, it } from "vitest";

import { VyrnForgeProgressElement } from "./progress";

describe("VyrnForgeProgressElement", () => {
  it("is server-safe to import and exposes the canonical numeric contract", () => {
    expect(VyrnForgeProgressElement).toBeDefined();
    expect(VyrnForgeProgressElement.properties).toEqual({
      max: { reflect: true, type: "number" },
      value: { reflect: true, type: "number" },
    });
  });
});
