import {
  createBehaviorSnapshotChannel,
  type BehaviorController,
  type BehaviorListener,
} from "./controller";
import {
  createBehaviorEvent,
  createBehaviorEventChannel,
  type BehaviorEvent,
  type BehaviorEventListener,
  type BehaviorUnsubscribe,
} from "./events";

export type ConfirmDialogReason =
  | "cancel"
  | "confirm"
  | "escape-key"
  | "outside-pointer"
  | "close-button"
  | "programmatic";

export interface ConfirmDialogSnapshot {
  readonly open: boolean;
  readonly isControlled: boolean;
  readonly loading: boolean;
  readonly disabled: boolean;
  readonly canCancel: boolean;
  readonly canConfirm: boolean;
  readonly revision: number;
}

export interface ConfirmDialogOpenChangeDetail {
  readonly open: boolean;
  readonly previousOpen: boolean;
  readonly isControlled: boolean;
}

export interface ConfirmDialogActionDetail {
  readonly open: boolean;
}

export type ConfirmDialogEvent =
  | BehaviorEvent<
      "open-change",
      ConfirmDialogOpenChangeDetail,
      ConfirmDialogReason
    >
  | BehaviorEvent<"cancel", ConfirmDialogActionDetail, "cancel">
  | BehaviorEvent<"confirm", ConfirmDialogActionDetail, "confirm">;

export interface ConfirmDialogControllerOptions {
  readonly defaultOpen?: boolean;
  readonly open?: boolean;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly onEvent?: BehaviorEventListener<ConfirmDialogEvent>;
}

export type ConfirmDialogCommand =
  | { readonly type: "cancel" }
  | { readonly type: "confirm" }
  | {
      readonly type: "set-open";
      readonly open: boolean;
      readonly reason?: ConfirmDialogReason;
    }
  | { readonly type: "sync-open"; readonly open: boolean }
  | {
      readonly type: "set-state";
      readonly loading: boolean;
      readonly disabled: boolean;
    };

export interface ConfirmDialogController extends BehaviorController<
  ConfirmDialogSnapshot,
  ConfirmDialogCommand
> {
  cancel(): boolean;
  confirm(): boolean;
  setOpen(open: boolean, reason?: ConfirmDialogReason): boolean;
  syncOpen(open: boolean): boolean;
  setState(loading: boolean, disabled: boolean): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<ConfirmDialogEvent>,
  ): BehaviorUnsubscribe;
}

export function createConfirmDialogController(
  options: ConfirmDialogControllerOptions = {},
): ConfirmDialogController {
  const isControlled = Object.prototype.hasOwnProperty.call(options, "open");
  let open = isControlled
    ? (options.open as boolean)
    : (options.defaultOpen ?? false);
  let loading = options.loading ?? false;
  let disabled = options.disabled ?? false;
  let revision = 0;
  let snapshot: ConfirmDialogSnapshot;

  const snapshots = createBehaviorSnapshotChannel<ConfirmDialogSnapshot>();
  const events = createBehaviorEventChannel<ConfirmDialogEvent>();

  function createSnapshot(): ConfirmDialogSnapshot {
    return Object.freeze({
      open,
      isControlled,
      loading,
      disabled,
      canCancel: !loading && !disabled,
      canConfirm: !loading && !disabled,
      revision,
    });
  }

  function publish(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: ConfirmDialogEvent): void {
    events.emit(event);
    options.onEvent?.(event);
  }

  function requestOpen(
    nextOpen: boolean,
    reason: ConfirmDialogReason,
  ): boolean {
    if (!nextOpen && loading) return false;
    if (open === nextOpen) return false;

    const previousOpen = open;
    if (!isControlled) {
      open = nextOpen;
      publish();
    }
    emit(
      createBehaviorEvent(
        "open-change",
        Object.freeze({ open: nextOpen, previousOpen, isControlled }),
        reason,
      ),
    );
    return true;
  }

  snapshot = createSnapshot();

  const controller: ConfirmDialogController = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<ConfirmDialogSnapshot>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    cancel() {
      if (!snapshot.canCancel) return false;
      emit(
        createBehaviorEvent(
          "cancel",
          Object.freeze({ open: snapshot.open }),
          "cancel",
        ),
      );
      requestOpen(false, "cancel");
      return true;
    },
    confirm() {
      if (!snapshot.canConfirm) return false;
      emit(
        createBehaviorEvent(
          "confirm",
          Object.freeze({ open: snapshot.open }),
          "confirm",
        ),
      );
      return true;
    },
    setOpen(nextOpen, reason = "programmatic") {
      return requestOpen(nextOpen, reason);
    },
    syncOpen(nextOpen) {
      if (open === nextOpen) return false;
      open = nextOpen;
      publish();
      return true;
    },
    setState(nextLoading, nextDisabled) {
      if (loading === nextLoading && disabled === nextDisabled) return false;
      loading = nextLoading;
      disabled = nextDisabled;
      publish();
      return true;
    },
    dispatch(command) {
      switch (command.type) {
        case "cancel":
          controller.cancel();
          return;
        case "confirm":
          controller.confirm();
          return;
        case "set-open":
          controller.setOpen(command.open, command.reason);
          return;
        case "sync-open":
          controller.syncOpen(command.open);
          return;
        case "set-state":
          controller.setState(command.loading, command.disabled);
      }
    },
  };

  return controller;
}
