import { describe, expect, it } from "vitest";

import { createBehaviorEvent, vyrnForgeUiBehaviorsVersion } from "./index";

describe("ui-behaviors foundation", () => {
  it("exposes the coordinated package version", () => {
    expect(vyrnForgeUiBehaviorsVersion).toBe("0.1.0-alpha.1");
  });

  it("creates immutable framework-neutral behavior events", () => {
    const event = createBehaviorEvent(
      "value-change",
      { value: "approved" },
      "user",
    );

    expect(event).toEqual({
      type: "value-change",
      detail: { value: "approved" },
      reason: "user",
    });
    expect(Object.isFrozen(event)).toBe(true);
  });
});
