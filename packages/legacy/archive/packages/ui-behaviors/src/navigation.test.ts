import { describe, expect, it, vi } from "vitest";
import { createNavigationController } from "./navigation";

const items = [
  { id: "overview" },
  { id: "disabled", disabled: true },
  { id: "audit" },
];

describe("navigation behavior", () => {
  it("uses roving active intent and skips disabled items", () => {
    const controller = createNavigationController({ items });

    expect(controller.getSnapshot()).toMatchObject({
      activeId: "overview",
      enabledIds: ["overview", "audit"],
    });
    expect(controller.moveActive("next")).toBe("audit");
    expect(controller.moveActive("next")).toBe("overview");
    expect(controller.moveActive("previous")).toBe("audit");
    expect(controller.moveActive("first")).toBe("overview");
    expect(controller.moveActive("last")).toBe("audit");
  });

  it("supports clamped navigation", () => {
    const controller = createNavigationController({ items, loop: false });

    expect(controller.moveActive("previous")).toBe("overview");
    expect(controller.moveActive("last")).toBe("audit");
    expect(controller.moveActive("next")).toBe("audit");
  });

  it("emits activation, selection, and dismissal reasons", () => {
    const onEvent = vi.fn();
    const controller = createNavigationController({
      items,
      dismissOnSelect: true,
      onEvent,
    });

    expect(controller.select("disabled", "pointer")).toBe(false);
    expect(controller.select("audit", "keyboard")).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      activeId: "audit",
      selectedId: "audit",
    });
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "selection-change", reason: "keyboard" }),
    );
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dismiss", reason: "selection" }),
    );

    controller.dismiss("escape-key");
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dismiss", reason: "escape-key" }),
    );
  });

  it("reconciles active and selected items after collection replacement", () => {
    const controller = createNavigationController({
      items,
      activeId: "audit",
      selectedId: "audit",
    });

    expect(
      controller.replaceItems([{ id: "overview" }, { id: "reports" }]),
    ).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      activeId: "overview",
      selectedId: null,
    });
    expect(
      controller.replaceItems([{ id: "overview" }, { id: "reports" }]),
    ).toBe(false);
  });

  it("normalizes duplicate items and respects explicit order", () => {
    const controller = createNavigationController({
      items: [
        { id: "audit", order: 2 },
        { id: "overview", order: 1 },
        { id: "audit", disabled: true },
      ],
    });

    expect(controller.getSnapshot().items.map((item) => item.id)).toEqual([
      "overview",
      "audit",
    ]);
    expect(controller.isDisabled("missing")).toBe(true);
    expect(controller.setActiveId("missing")).toBe(false);
  });

  it("supports external selected-item synchronization", () => {
    const controller = createNavigationController({ items });

    expect(controller.syncSelectedId("audit")).toBe(true);
    expect(controller.getSnapshot().selectedId).toBe("audit");
    expect(controller.syncSelectedId("audit")).toBe(false);
    expect(controller.syncSelectedId("missing")).toBe(false);
  });

  it("dispatches every public navigation command", () => {
    const onEvent = vi.fn();
    const controller = createNavigationController({ items, onEvent });

    controller.dispatch({ type: "move-active", intent: "next" });
    controller.dispatch({ type: "set-active", id: "overview" });
    controller.dispatch({ type: "select", id: "audit" });
    controller.dispatch({ type: "sync-selected", id: "overview" });
    controller.dispatch({
      type: "replace-items",
      items: [{ id: "overview" }],
    });
    controller.dispatch({ type: "dismiss", reason: "programmatic" });

    expect(controller.getSnapshot()).toMatchObject({
      activeId: "overview",
      selectedId: "overview",
    });
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dismiss", reason: "programmatic" }),
    );
  });
});
