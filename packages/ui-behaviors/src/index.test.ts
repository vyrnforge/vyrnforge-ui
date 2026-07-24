import { describe, expect, it } from "vitest";

import {
  behaviorChangeReasons,
  createBehaviorEvent,
  createAutocompleteController,
  createCollectionController,
  createControllableState,
  createMultiSelectController,
  createSelectionController,
  createTransferListController,
  vyrnForgeUiBehaviorsVersion,
} from "./index";

describe("ui-behaviors public surface", () => {
  it("exposes the coordinated package version", () => {
    expect(vyrnForgeUiBehaviorsVersion).toBe("0.1.0-alpha.1");
  });

  it("exports the behavior foundations through the package entry point", () => {
    expect(createBehaviorEvent("change", {}, "user").type).toBe("change");
    expect(
      createControllableState({ defaultValue: 1 }).getSnapshot().value,
    ).toBe(1);
    expect(createCollectionController().getSnapshot().items).toEqual([]);
    expect(createSelectionController().getSnapshot().selectedKeys).toEqual([]);
    expect(createAutocompleteController().getSnapshot().items).toEqual([]);
    expect(createMultiSelectController().getSnapshot().items).toEqual([]);
    expect(createTransferListController().getSnapshot().items).toEqual([]);
    expect(behaviorChangeReasons).toContain("keyboard");
  });
});
