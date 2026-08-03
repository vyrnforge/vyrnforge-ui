import { describe, expect, it } from "vitest";

import {
  behaviorChangeReasons,
  createBehaviorEvent,
  createAutocompleteController,
  createCollectionController,
  createConfirmDialogController,
  createDialogController,
  createControllableState,
  createMultiSelectController,
  createNavigationController,
  createOverlayLifecycleController,
  createPopoverController,
  createSelectionController,
  createToastController,
  createTooltipController,
  createTransferListController,
  vyrnForgeUiBehaviorsVersion,
} from "./index";

describe("ui-behaviors public surface", () => {
  it("exposes the coordinated package version", () => {
    expect(vyrnForgeUiBehaviorsVersion).toBe("0.2.0-beta.1");
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
    expect(createNavigationController().getSnapshot().items).toEqual([]);
    expect(createOverlayLifecycleController().getSnapshot().open).toBe(false);
    expect(createDialogController().getSnapshot().kind).toBe("dialog");
    expect(createPopoverController().getSnapshot().kind).toBe("popover");
    expect(createTooltipController().getSnapshot().kind).toBe("tooltip");
    expect(createToastController().getSnapshot().records).toEqual([]);
    expect(createConfirmDialogController().getSnapshot().open).toBe(false);
    expect(createTransferListController().getSnapshot().items).toEqual([]);
    expect(behaviorChangeReasons).toContain("keyboard");
  });
});
