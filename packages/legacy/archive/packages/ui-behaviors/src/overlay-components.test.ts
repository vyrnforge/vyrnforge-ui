import { describe, expect, it, vi } from "vitest";
import {
  createDialogController,
  createDrawerController,
  createPopoverController,
  createTooltipController,
} from "./overlay-components";

describe("component overlay behaviors", () => {
  it("preserves controlled dialog proposals and relationships", () => {
    const onEvent = vi.fn();
    const controller = createDialogController({
      open: false,
      contentId: "dialog-content",
      onEvent,
    });

    expect(controller.getSnapshot()).toMatchObject({
      kind: "dialog",
      modal: true,
      open: false,
      contentId: "dialog-content",
    });
    expect(controller.open("keyboard")).toBe(true);
    expect(controller.getSnapshot().open).toBe(false);
    expect(controller.syncOpen(true)).toBe(true);
    expect(controller.setRelationship("dialog-trigger", "dialog-content")).toBe(
      true,
    );
    expect(controller.getSnapshot().triggerId).toBe("dialog-trigger");
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "open-change", reason: "keyboard" }),
    );
  });

  it("configures drawer and popover modality independently", () => {
    const drawer = createDrawerController({ defaultOpen: true, modal: false });
    const popover = createPopoverController({ defaultOpen: true, modal: true });

    expect(drawer.getSnapshot()).toMatchObject({
      kind: "drawer",
      modal: false,
      open: true,
    });
    expect(popover.getSnapshot()).toMatchObject({
      kind: "popover",
      modal: true,
      open: true,
    });
    expect(drawer.setModal(true)).toBe(true);
    expect(popover.dismiss("outside-pointer")).toBe(true);
  });

  it("prevents disabled tooltips from opening and dismisses active ones", () => {
    const controller = createTooltipController({
      triggerId: "tip-trigger",
      contentId: "tip-content",
    });

    expect(controller.open("focus")).toBe(true);
    expect(controller.getSnapshot().open).toBe(true);
    expect(controller.setDisabled(true)).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      disabled: true,
      open: false,
    });
    expect(controller.open("pointer")).toBe(false);
  });

  it("dispatches every public component-overlay command", () => {
    const controller = createPopoverController();

    controller.dispatch({ type: "open", reason: "trigger" });
    controller.dispatch({ type: "dismiss", reason: "escape-key" });
    controller.dispatch({ type: "set-open", open: true, reason: "pointer" });
    controller.dispatch({ type: "toggle", reason: "keyboard" });
    controller.dispatch({ type: "sync-open", open: true });
    controller.dispatch({ type: "set-disabled", disabled: false });
    controller.dispatch({ type: "set-modal", modal: true });
    controller.dispatch({
      type: "set-relationship",
      triggerId: "trigger",
      contentId: "content",
    });

    expect(controller.getSnapshot()).toMatchObject({
      open: true,
      modal: true,
      triggerId: "trigger",
      contentId: "content",
    });
  });

  it("covers subscriptions, disabled proposals, and configuration no-ops", () => {
    const snapshotListener = vi.fn();
    const eventListener = vi.fn();
    const controller = createPopoverController({ disabled: true });
    const unsubscribeSnapshot = controller.subscribe(snapshotListener);
    const unsubscribeEvent = controller.subscribeEvent(eventListener);

    expect(controller.open()).toBe(false);
    expect(controller.setOpen(true)).toBe(false);
    expect(controller.toggle()).toBe(false);
    expect(controller.setDisabled(true)).toBe(false);
    expect(controller.setModal(false)).toBe(false);
    expect(controller.setRelationship(null, null)).toBe(false);

    expect(controller.setDisabled(false)).toBe(true);
    expect(controller.open("trigger")).toBe(true);
    expect(controller.syncOpen(true)).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      open: true,
      disabled: false,
      modal: false,
    });

    expect(snapshotListener).toHaveBeenCalled();
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "configuration-change",
        reason: "programmatic",
      }),
    );
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({ type: "open-change", reason: "trigger" }),
    );

    unsubscribeSnapshot();
    unsubscribeEvent();
  });
});
