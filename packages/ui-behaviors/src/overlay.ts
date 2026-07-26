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

export type OverlayPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

export type OverlayOpenReason =
  "trigger" | "keyboard" | "pointer" | "focus" | "programmatic";

export type OverlayDismissReason =
  | "escape-key"
  | "outside-pointer"
  | "outside-focus"
  | "selection"
  | "close-button"
  | "programmatic";

export type OverlayLifecycleReason = OverlayOpenReason | OverlayDismissReason;

export interface OverlayLifecycleSnapshot {
  readonly open: boolean;
  readonly isControlled: boolean;
  readonly lastReason: OverlayLifecycleReason;
  readonly revision: number;
}

export interface OverlayOpenChangeDetail {
  readonly open: boolean;
  readonly previousOpen: boolean;
  readonly isControlled: boolean;
}

export type OverlayLifecycleEvent = BehaviorEvent<
  "open-change",
  OverlayOpenChangeDetail,
  OverlayLifecycleReason
>;

export interface OverlayLifecycleControllerOptions {
  readonly defaultOpen?: boolean;
  readonly open?: boolean;
  readonly onEvent?: BehaviorEventListener<OverlayLifecycleEvent>;
}

export type OverlayLifecycleCommand =
  | { readonly type: "open"; readonly reason?: OverlayOpenReason }
  | { readonly type: "dismiss"; readonly reason: OverlayDismissReason }
  | {
      readonly type: "set-open";
      readonly open: boolean;
      readonly reason?: OverlayLifecycleReason;
    }
  | { readonly type: "toggle"; readonly reason?: OverlayOpenReason }
  | { readonly type: "sync"; readonly open: boolean };

export interface OverlayLifecycleController extends BehaviorController<
  OverlayLifecycleSnapshot,
  OverlayLifecycleCommand
> {
  open(reason?: OverlayOpenReason): boolean;
  dismiss(reason: OverlayDismissReason): boolean;
  setOpen(open: boolean, reason?: OverlayLifecycleReason): boolean;
  toggle(reason?: OverlayOpenReason): boolean;
  syncOpen(open: boolean): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<OverlayLifecycleEvent>,
  ): BehaviorUnsubscribe;
}

export interface OverlayLayerHandle {
  readonly stackIndex: number;
  isTopmost(): boolean;
  release(): void;
}

export interface OverlayLayerRegistry {
  register(): OverlayLayerHandle;
  size(): number;
}

export interface OverlayLayerRegistryOptions {
  readonly baseStackIndex?: number;
}

export interface OverlayRectangle {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

export interface OverlayViewport {
  readonly width: number;
  readonly height: number;
}

export interface OverlayPositionOptions {
  readonly placement?: OverlayPlacement;
  readonly offset?: number;
  readonly viewportPadding?: number;
  readonly flip?: boolean;
  readonly shift?: boolean;
}

export interface OverlayResolvedPosition {
  readonly x: number;
  readonly y: number;
  readonly resolvedPlacement: OverlayPlacement;
}

export type OverlayFocusIntent =
  "initial" | "first" | "last" | "next" | "previous" | "restore";

export interface OverlayFocusAdapter<TTarget = unknown> {
  captureReturnTarget(): TTarget | null;
  focus(target: TTarget | null, intent: OverlayFocusIntent): boolean;
}

export interface OverlayPositionAdapter<
  TAnchor = unknown,
  TFloating = unknown,
> {
  update(input: {
    readonly anchor: TAnchor;
    readonly floating: TFloating;
    readonly placement: OverlayPlacement;
  }): OverlayResolvedPosition;
}

function createLifecycleSnapshot(
  open: boolean,
  isControlled: boolean,
  lastReason: OverlayLifecycleReason,
  revision: number,
): OverlayLifecycleSnapshot {
  return Object.freeze({ open, isControlled, lastReason, revision });
}

export function createOverlayLifecycleController(
  options: OverlayLifecycleControllerOptions = {},
): OverlayLifecycleController {
  const isControlled = Object.prototype.hasOwnProperty.call(options, "open");
  const initialOpen = isControlled
    ? (options.open as boolean)
    : (options.defaultOpen ?? false);
  let snapshot = createLifecycleSnapshot(
    initialOpen,
    isControlled,
    "programmatic",
    0,
  );
  const snapshots = createBehaviorSnapshotChannel<OverlayLifecycleSnapshot>();
  const events = createBehaviorEventChannel<OverlayLifecycleEvent>();

  function publish(open: boolean, reason: OverlayLifecycleReason): void {
    snapshot = createLifecycleSnapshot(
      open,
      isControlled,
      reason,
      snapshot.revision + 1,
    );
    snapshots.publish(snapshot);
  }

  function requestOpen(open: boolean, reason: OverlayLifecycleReason): boolean {
    const previousOpen = snapshot.open;
    if (previousOpen === open) return false;

    if (!isControlled) publish(open, reason);
    const event = createBehaviorEvent(
      "open-change",
      Object.freeze({ open, previousOpen, isControlled }),
      reason,
    );
    events.emit(event);
    options.onEvent?.(event);
    return true;
  }

  const controller: OverlayLifecycleController = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<OverlayLifecycleSnapshot>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    open(reason = "programmatic") {
      return requestOpen(true, reason);
    },
    dismiss(reason) {
      return requestOpen(false, reason);
    },
    setOpen(open, reason = "programmatic") {
      return requestOpen(open, reason);
    },
    toggle(reason = "trigger") {
      return requestOpen(!snapshot.open, reason);
    },
    syncOpen(open) {
      if (snapshot.open === open) return false;
      publish(open, "programmatic");
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
        case "sync":
          controller.syncOpen(command.open);
      }
    },
  };

  return controller;
}

export function createOverlayLayerRegistry(
  options: OverlayLayerRegistryOptions = {},
): OverlayLayerRegistry {
  const entries = new Map<number, number>();
  const baseStackIndex = options.baseStackIndex ?? 1000;
  let nextId = 1;
  let nextOrder = 1;

  return {
    register() {
      const id = nextId++;
      const order = nextOrder++;
      let active = true;
      entries.set(id, order);

      return Object.freeze({
        stackIndex: baseStackIndex + order,
        isTopmost() {
          if (!active) return false;
          let highestOrder = -1;
          let highestId = -1;
          for (const [entryId, entryOrder] of entries) {
            if (entryOrder > highestOrder) {
              highestOrder = entryOrder;
              highestId = entryId;
            }
          }
          return highestId === id;
        },
        release() {
          if (!active) return;
          active = false;
          entries.delete(id);
        },
      });
    },
    size() {
      return entries.size;
    },
  };
}

function oppositePlacement(placement: OverlayPlacement): OverlayPlacement {
  if (placement.startsWith("bottom")) {
    return placement.replace("bottom", "top") as OverlayPlacement;
  }
  if (placement.startsWith("top")) {
    return placement.replace("top", "bottom") as OverlayPlacement;
  }
  return placement === "left" ? "right" : "left";
}

function positionForPlacement(
  anchor: OverlayRectangle,
  floating: OverlayRectangle,
  placement: OverlayPlacement,
  offset: number,
): OverlayResolvedPosition {
  switch (placement) {
    case "top":
      return {
        x: anchor.left + (anchor.width - floating.width) / 2,
        y: anchor.top - floating.height - offset,
        resolvedPlacement: placement,
      };
    case "top-start":
      return {
        x: anchor.left,
        y: anchor.top - floating.height - offset,
        resolvedPlacement: placement,
      };
    case "top-end":
      return {
        x: anchor.right - floating.width,
        y: anchor.top - floating.height - offset,
        resolvedPlacement: placement,
      };
    case "bottom":
      return {
        x: anchor.left + (anchor.width - floating.width) / 2,
        y: anchor.bottom + offset,
        resolvedPlacement: placement,
      };
    case "bottom-end":
      return {
        x: anchor.right - floating.width,
        y: anchor.bottom + offset,
        resolvedPlacement: placement,
      };
    case "left":
      return {
        x: anchor.left - floating.width - offset,
        y: anchor.top + (anchor.height - floating.height) / 2,
        resolvedPlacement: placement,
      };
    case "right":
      return {
        x: anchor.right + offset,
        y: anchor.top + (anchor.height - floating.height) / 2,
        resolvedPlacement: placement,
      };
    case "bottom-start":
    default:
      return {
        x: anchor.left,
        y: anchor.bottom + offset,
        resolvedPlacement: "bottom-start",
      };
  }
}

function overflowsViewport(
  position: OverlayResolvedPosition,
  floating: OverlayRectangle,
  viewport: OverlayViewport,
  padding: number,
): boolean {
  return (
    position.x < padding ||
    position.y < padding ||
    position.x + floating.width > viewport.width - padding ||
    position.y + floating.height > viewport.height - padding
  );
}

export function resolveOverlayPosition(
  anchor: OverlayRectangle,
  floating: OverlayRectangle,
  viewport: OverlayViewport,
  options: OverlayPositionOptions = {},
): OverlayResolvedPosition {
  const {
    flip = true,
    offset = 8,
    placement = "bottom-start",
    shift = true,
    viewportPadding = 8,
  } = options;
  let next = positionForPlacement(anchor, floating, placement, offset);

  if (flip && overflowsViewport(next, floating, viewport, viewportPadding)) {
    const flipped = positionForPlacement(
      anchor,
      floating,
      oppositePlacement(placement),
      offset,
    );
    if (!overflowsViewport(flipped, floating, viewport, viewportPadding)) {
      next = flipped;
    }
  }

  if (shift) {
    const maximumX = Math.max(
      viewportPadding,
      viewport.width - floating.width - viewportPadding,
    );
    const maximumY = Math.max(
      viewportPadding,
      viewport.height - floating.height - viewportPadding,
    );
    next = {
      ...next,
      x: Math.min(Math.max(viewportPadding, next.x), maximumX),
      y: Math.min(Math.max(viewportPadding, next.y), maximumY),
    };
  }

  return Object.freeze(next);
}
