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
import {
  createOverlayLifecycleController,
  type OverlayDismissReason,
  type OverlayLifecycleEvent,
  type OverlayLifecycleReason,
  type OverlayOpenReason,
} from "./overlay";

export type OverlayComponentKind = "dialog" | "drawer" | "popover" | "tooltip";

export interface OverlayComponentRelationship {
  readonly triggerId: string | null;
  readonly contentId: string | null;
}

export interface OverlayComponentSnapshot extends OverlayComponentRelationship {
  readonly kind: OverlayComponentKind;
  readonly open: boolean;
  readonly isControlled: boolean;
  readonly modal: boolean;
  readonly disabled: boolean;
  readonly lastReason: OverlayLifecycleReason;
  readonly revision: number;
}

export interface OverlayRelationshipChangeDetail {
  readonly relationship: OverlayComponentRelationship;
  readonly previousRelationship: OverlayComponentRelationship;
}

export interface OverlayConfigurationChangeDetail {
  readonly modal: boolean;
  readonly disabled: boolean;
  readonly previousModal: boolean;
  readonly previousDisabled: boolean;
}

export type OverlayComponentEvent =
  | OverlayLifecycleEvent
  | BehaviorEvent<
      "relationship-change",
      OverlayRelationshipChangeDetail,
      "programmatic"
    >
  | BehaviorEvent<
      "configuration-change",
      OverlayConfigurationChangeDetail,
      "programmatic"
    >;

export interface OverlayComponentControllerOptions {
  readonly defaultOpen?: boolean;
  readonly open?: boolean;
  readonly modal?: boolean;
  readonly disabled?: boolean;
  readonly triggerId?: string | null;
  readonly contentId?: string | null;
  readonly onEvent?: BehaviorEventListener<OverlayComponentEvent>;
}

export type OverlayComponentCommand =
  | { readonly type: "open"; readonly reason?: OverlayOpenReason }
  | { readonly type: "dismiss"; readonly reason: OverlayDismissReason }
  | {
      readonly type: "set-open";
      readonly open: boolean;
      readonly reason?: OverlayLifecycleReason;
    }
  | { readonly type: "toggle"; readonly reason?: OverlayOpenReason }
  | { readonly type: "sync-open"; readonly open: boolean }
  | { readonly type: "set-disabled"; readonly disabled: boolean }
  | { readonly type: "set-modal"; readonly modal: boolean }
  | {
      readonly type: "set-relationship";
      readonly triggerId: string | null;
      readonly contentId: string | null;
    };

export interface OverlayComponentController extends BehaviorController<
  OverlayComponentSnapshot,
  OverlayComponentCommand
> {
  open(reason?: OverlayOpenReason): boolean;
  dismiss(reason: OverlayDismissReason): boolean;
  setOpen(open: boolean, reason?: OverlayLifecycleReason): boolean;
  toggle(reason?: OverlayOpenReason): boolean;
  syncOpen(open: boolean): boolean;
  setDisabled(disabled: boolean): boolean;
  setModal(modal: boolean): boolean;
  setRelationship(triggerId: string | null, contentId: string | null): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<OverlayComponentEvent>,
  ): BehaviorUnsubscribe;
}

function createRelationship(
  triggerId: string | null,
  contentId: string | null,
): OverlayComponentRelationship {
  return Object.freeze({ triggerId, contentId });
}

function sameRelationship(
  left: OverlayComponentRelationship,
  right: OverlayComponentRelationship,
): boolean {
  return (
    left.triggerId === right.triggerId && left.contentId === right.contentId
  );
}

function createOverlayComponentController(
  kind: OverlayComponentKind,
  defaults: Pick<OverlayComponentControllerOptions, "modal" | "disabled">,
  options: OverlayComponentControllerOptions = {},
): OverlayComponentController {
  let modal = options.modal ?? defaults.modal ?? false;
  let disabled = options.disabled ?? defaults.disabled ?? false;
  let relationship = createRelationship(
    options.triggerId ?? null,
    options.contentId ?? null,
  );
  let revision = 0;
  let snapshot: OverlayComponentSnapshot;

  const snapshots = createBehaviorSnapshotChannel<OverlayComponentSnapshot>();
  const events = createBehaviorEventChannel<OverlayComponentEvent>();
  const lifecycle = createOverlayLifecycleController({
    defaultOpen: options.defaultOpen,
    ...(Object.prototype.hasOwnProperty.call(options, "open")
      ? { open: options.open }
      : {}),
    onEvent(event) {
      events.emit(event);
      options.onEvent?.(event);
    },
  });

  function createSnapshot(): OverlayComponentSnapshot {
    const lifecycleSnapshot = lifecycle.getSnapshot();
    return Object.freeze({
      kind,
      open: lifecycleSnapshot.open,
      isControlled: lifecycleSnapshot.isControlled,
      modal,
      disabled,
      triggerId: relationship.triggerId,
      contentId: relationship.contentId,
      lastReason: lifecycleSnapshot.lastReason,
      revision,
    });
  }

  function publish(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: OverlayComponentEvent): void {
    events.emit(event);
    options.onEvent?.(event);
  }

  lifecycle.subscribe(() => publish());
  snapshot = createSnapshot();

  const controller: OverlayComponentController = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<OverlayComponentSnapshot>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    open(reason = "programmatic") {
      if (disabled) return false;
      return lifecycle.open(reason);
    },
    dismiss(reason) {
      return lifecycle.dismiss(reason);
    },
    setOpen(open, reason = "programmatic") {
      if (open && disabled) return false;
      return lifecycle.setOpen(open, reason);
    },
    toggle(reason = "trigger") {
      if (!lifecycle.getSnapshot().open && disabled) return false;
      return lifecycle.toggle(reason);
    },
    syncOpen(open) {
      return lifecycle.syncOpen(open);
    },
    setDisabled(nextDisabled) {
      if (disabled === nextDisabled) return false;

      const previousModal = modal;
      const previousDisabled = disabled;
      disabled = nextDisabled;
      publish();
      emit(
        createBehaviorEvent(
          "configuration-change",
          Object.freeze({
            modal,
            disabled,
            previousModal,
            previousDisabled,
          }),
          "programmatic",
        ),
      );
      if (disabled && lifecycle.getSnapshot().open) {
        lifecycle.dismiss("programmatic");
      }
      return true;
    },
    setModal(nextModal) {
      if (modal === nextModal) return false;

      const previousModal = modal;
      const previousDisabled = disabled;
      modal = nextModal;
      publish();
      emit(
        createBehaviorEvent(
          "configuration-change",
          Object.freeze({
            modal,
            disabled,
            previousModal,
            previousDisabled,
          }),
          "programmatic",
        ),
      );
      return true;
    },
    setRelationship(triggerId, contentId) {
      const nextRelationship = createRelationship(triggerId, contentId);
      if (sameRelationship(relationship, nextRelationship)) return false;

      const previousRelationship = relationship;
      relationship = nextRelationship;
      publish();
      emit(
        createBehaviorEvent(
          "relationship-change",
          Object.freeze({ relationship, previousRelationship }),
          "programmatic",
        ),
      );
      return true;
    },
    dispatch(command) {
      switch (command.type) {
        case "open":
          controller.open(command.reason);
          return;
        case "dismiss":
          controller.dismiss(command.reason);
          return;
        case "set-open":
          controller.setOpen(command.open, command.reason);
          return;
        case "toggle":
          controller.toggle(command.reason);
          return;
        case "sync-open":
          controller.syncOpen(command.open);
          return;
        case "set-disabled":
          controller.setDisabled(command.disabled);
          return;
        case "set-modal":
          controller.setModal(command.modal);
          return;
        case "set-relationship":
          controller.setRelationship(command.triggerId, command.contentId);
      }
    },
  };

  return controller;
}

export function createDialogController(
  options: OverlayComponentControllerOptions = {},
): OverlayComponentController {
  return createOverlayComponentController(
    "dialog",
    { modal: true, disabled: false },
    { ...options, modal: true },
  );
}

export function createDrawerController(
  options: OverlayComponentControllerOptions = {},
): OverlayComponentController {
  return createOverlayComponentController(
    "drawer",
    { modal: true, disabled: false },
    options,
  );
}

export function createPopoverController(
  options: OverlayComponentControllerOptions = {},
): OverlayComponentController {
  return createOverlayComponentController(
    "popover",
    { modal: false, disabled: false },
    options,
  );
}

export function createTooltipController(
  options: OverlayComponentControllerOptions = {},
): OverlayComponentController {
  return createOverlayComponentController(
    "tooltip",
    { modal: false, disabled: false },
    { ...options, modal: false },
  );
}
