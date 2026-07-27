import { describe, expect, it, vi } from "vitest";
import { createConfirmDialogController } from "./confirm-dialog";

describe("confirm-dialog behavior", () => {
  it("emits controlled cancel and confirm actions", () => {
    const onEvent = vi.fn();
    const controller = createConfirmDialogController({ open: true, onEvent });

    expect(controller.confirm()).toBe(true);
    expect(controller.cancel()).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      open: true,
      isControlled: true,
    });
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "confirm", reason: "confirm" }),
    );
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "open-change",
        reason: "cancel",
        detail: expect.objectContaining({ open: false }),
      }),
    );
  });

  it("blocks actions and user dismissal while loading", () => {
    const controller = createConfirmDialogController({
      defaultOpen: true,
      loading: true,
    });

    expect(controller.getSnapshot()).toMatchObject({
      canCancel: false,
      canConfirm: false,
    });
    expect(controller.cancel()).toBe(false);
    expect(controller.confirm()).toBe(false);
    expect(controller.setOpen(false, "close-button")).toBe(false);
    expect(controller.syncOpen(false)).toBe(true);
  });

  it("synchronizes state and dispatches every public command", () => {
    const controller = createConfirmDialogController();

    controller.dispatch({ type: "set-open", open: true });
    controller.dispatch({ type: "confirm" });
    controller.dispatch({ type: "cancel" });
    controller.dispatch({ type: "sync-open", open: true });
    controller.dispatch({ type: "set-state", loading: false, disabled: true });

    expect(controller.getSnapshot()).toMatchObject({
      open: true,
      disabled: true,
      canCancel: false,
      canConfirm: false,
    });
  });

  it("covers subscriptions and no-op state transitions", () => {
    const snapshotListener = vi.fn();
    const eventListener = vi.fn();
    const controller = createConfirmDialogController();
    const unsubscribeSnapshot = controller.subscribe(snapshotListener);
    const unsubscribeEvent = controller.subscribeEvent(eventListener);

    expect(controller.setOpen(false)).toBe(false);
    expect(controller.setState(false, false)).toBe(false);
    expect(controller.setOpen(true, "programmatic")).toBe(true);
    expect(controller.syncOpen(true)).toBe(false);

    expect(snapshotListener).toHaveBeenCalledTimes(1);
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "open-change",
        reason: "programmatic",
        detail: expect.objectContaining({ open: true, previousOpen: false }),
      }),
    );

    unsubscribeSnapshot();
    unsubscribeEvent();

    expect(controller.setOpen(false, "close-button")).toBe(true);
    expect(snapshotListener).toHaveBeenCalledTimes(1);
    expect(eventListener).toHaveBeenCalledTimes(1);
  });
});
