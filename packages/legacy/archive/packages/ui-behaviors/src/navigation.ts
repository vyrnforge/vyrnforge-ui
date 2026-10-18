import type { CollectionMoveIntent } from "./collection";
import {
  createBehaviorSnapshotChannel,
  type BehaviorController,
  type BehaviorListener,
} from "./controller";
import {
  createBehaviorEvent,
  createBehaviorEventChannel,
  type BehaviorChangeReason,
  type BehaviorEvent,
  type BehaviorEventListener,
  type BehaviorUnsubscribe,
} from "./events";

export type NavigationDismissReason =
  | "selection"
  | "escape-key"
  | "outside-pointer"
  | "outside-focus"
  | "programmatic";

export interface NavigationItem {
  readonly id: string;
  readonly disabled?: boolean;
  readonly order?: number;
}

export interface NavigationSnapshot {
  readonly items: readonly NavigationItem[];
  readonly enabledIds: readonly string[];
  readonly activeId: string | null;
  readonly selectedId: string | null;
  readonly revision: number;
}

export interface NavigationActiveChangeDetail {
  readonly activeId: string | null;
  readonly previousActiveId: string | null;
}

export interface NavigationSelectionChangeDetail {
  readonly selectedId: string;
  readonly previousSelectedId: string | null;
}

export interface NavigationDismissDetail {
  readonly activeId: string | null;
  readonly selectedId: string | null;
}

export type NavigationControllerEvent =
  | BehaviorEvent<"active-change", NavigationActiveChangeDetail>
  | BehaviorEvent<"selection-change", NavigationSelectionChangeDetail>
  | BehaviorEvent<"dismiss", NavigationDismissDetail, NavigationDismissReason>;

export interface NavigationControllerOptions {
  readonly items?: readonly NavigationItem[];
  readonly activeId?: string | null;
  readonly selectedId?: string | null;
  readonly loop?: boolean;
  readonly dismissOnSelect?: boolean;
  readonly onEvent?: BehaviorEventListener<NavigationControllerEvent>;
}

export type NavigationCommand =
  | {
      readonly type: "replace-items";
      readonly items: readonly NavigationItem[];
    }
  | {
      readonly type: "set-active";
      readonly id: string | null;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-active";
      readonly intent: CollectionMoveIntent;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "select";
      readonly id: string;
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "sync-selected"; readonly id: string | null }
  | { readonly type: "dismiss"; readonly reason: NavigationDismissReason };

export interface NavigationController extends BehaviorController<
  NavigationSnapshot,
  NavigationCommand
> {
  replaceItems(items: readonly NavigationItem[]): boolean;
  setActiveId(id: string | null, reason?: BehaviorChangeReason): boolean;
  moveActive(
    intent: CollectionMoveIntent,
    reason?: BehaviorChangeReason,
  ): string | null;
  select(id: string, reason?: BehaviorChangeReason): boolean;
  syncSelectedId(id: string | null): boolean;
  dismiss(reason: NavigationDismissReason): void;
  isDisabled(id: string): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<NavigationControllerEvent>,
  ): BehaviorUnsubscribe;
}

function normalizeItems(
  input: readonly NavigationItem[],
): readonly NavigationItem[] {
  const records = new Map<string, NavigationItem & { sequence: number }>();

  input.forEach((item, sequence) => {
    if (records.has(item.id)) return;
    records.set(item.id, {
      id: item.id,
      disabled: item.disabled === true,
      ...(item.order === undefined ? {} : { order: item.order }),
      sequence,
    });
  });

  return Object.freeze(
    [...records.values()]
      .sort((left, right) => {
        const leftOrder = left.order ?? left.sequence;
        const rightOrder = right.order ?? right.sequence;
        return leftOrder === rightOrder
          ? left.sequence - right.sequence
          : leftOrder - rightOrder;
      })
      .map(({ sequence: _sequence, ...item }) => Object.freeze(item)),
  );
}

function sameItems(
  left: readonly NavigationItem[],
  right: readonly NavigationItem[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.id === right[index]?.id &&
        item.disabled === right[index]?.disabled &&
        item.order === right[index]?.order,
    )
  );
}

export function createNavigationController(
  options: NavigationControllerOptions = {},
): NavigationController {
  const loop = options.loop ?? true;
  let items = normalizeItems(options.items ?? []);
  let enabledIds = items
    .filter((item) => item.disabled !== true)
    .map((item) => item.id);
  let selectedId =
    options.selectedId !== undefined &&
    items.some((item) => item.id === options.selectedId)
      ? options.selectedId
      : null;
  let activeId =
    options.activeId !== undefined &&
    enabledIds.includes(options.activeId ?? "")
      ? options.activeId
      : selectedId !== null && enabledIds.includes(selectedId)
        ? selectedId
        : (enabledIds[0] ?? null);
  let revision = 0;
  let snapshot: NavigationSnapshot;

  const snapshots = createBehaviorSnapshotChannel<NavigationSnapshot>();
  const events = createBehaviorEventChannel<NavigationControllerEvent>();

  function createSnapshot(): NavigationSnapshot {
    return Object.freeze({
      items,
      enabledIds: Object.freeze([...enabledIds]),
      activeId,
      selectedId,
      revision,
    });
  }

  function publish(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: NavigationControllerEvent): void {
    events.emit(event);
    options.onEvent?.(event);
  }

  function isEnabled(id: string): boolean {
    return enabledIds.includes(id);
  }

  function fallbackActiveId(): string | null {
    return selectedId !== null && isEnabled(selectedId)
      ? selectedId
      : (enabledIds[0] ?? null);
  }

  snapshot = createSnapshot();

  const controller: NavigationController = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<NavigationSnapshot>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    replaceItems(nextItems) {
      const normalized = normalizeItems(nextItems);
      if (sameItems(items, normalized)) return false;

      const previousActiveId = activeId;
      items = normalized;
      enabledIds = items
        .filter((item) => item.disabled !== true)
        .map((item) => item.id);
      if (
        selectedId !== null &&
        !items.some((item) => item.id === selectedId)
      ) {
        selectedId = null;
      }
      if (activeId !== null && !isEnabled(activeId)) {
        activeId = fallbackActiveId();
      }
      publish();
      if (previousActiveId !== activeId) {
        emit(
          createBehaviorEvent(
            "active-change",
            Object.freeze({ activeId, previousActiveId }),
            "collection-change",
          ),
        );
      }
      return true;
    },
    setActiveId(id, reason = "programmatic") {
      if (id !== null && !isEnabled(id)) return false;
      if (activeId === id) return false;

      const previousActiveId = activeId;
      activeId = id;
      publish();
      emit(
        createBehaviorEvent(
          "active-change",
          Object.freeze({ activeId, previousActiveId }),
          reason,
        ),
      );
      return true;
    },
    moveActive(intent, reason = "keyboard") {
      if (enabledIds.length === 0) {
        controller.setActiveId(null, reason);
        return null;
      }

      let nextIndex: number;
      const currentIndex = enabledIds.indexOf(activeId ?? "");
      if (intent === "first") nextIndex = 0;
      else if (intent === "last") nextIndex = enabledIds.length - 1;
      else if (intent === "next")
        nextIndex = currentIndex < 0 ? 0 : currentIndex + 1;
      else
        nextIndex = currentIndex < 0 ? enabledIds.length - 1 : currentIndex - 1;

      if (loop) {
        nextIndex = (nextIndex + enabledIds.length) % enabledIds.length;
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), enabledIds.length - 1);
      }

      const nextId = enabledIds[nextIndex] ?? null;
      controller.setActiveId(nextId, reason);
      return nextId;
    },
    select(id, reason = "selection") {
      if (!isEnabled(id)) return false;

      const previousActiveId = activeId;
      const previousSelectedId = selectedId;
      activeId = id;
      selectedId = id;
      if (previousActiveId !== activeId || previousSelectedId !== selectedId) {
        publish();
      }
      if (previousActiveId !== activeId) {
        emit(
          createBehaviorEvent(
            "active-change",
            Object.freeze({ activeId, previousActiveId }),
            reason,
          ),
        );
      }
      emit(
        createBehaviorEvent(
          "selection-change",
          Object.freeze({ selectedId: id, previousSelectedId }),
          reason,
        ),
      );
      if (options.dismissOnSelect) controller.dismiss("selection");
      return true;
    },
    syncSelectedId(id) {
      if (id !== null && !items.some((item) => item.id === id)) return false;
      if (selectedId === id) return false;

      selectedId = id;
      if (activeId === null && id !== null && isEnabled(id)) activeId = id;
      publish();
      return true;
    },
    dismiss(reason) {
      emit(
        createBehaviorEvent(
          "dismiss",
          Object.freeze({ activeId, selectedId }),
          reason,
        ),
      );
    },
    isDisabled(id) {
      return !isEnabled(id);
    },
    dispatch(command) {
      switch (command.type) {
        case "replace-items":
          controller.replaceItems(command.items);
          return;
        case "set-active":
          controller.setActiveId(command.id, command.reason);
          return;
        case "move-active":
          controller.moveActive(command.intent, command.reason);
          return;
        case "select":
          controller.select(command.id, command.reason);
          return;
        case "sync-selected":
          controller.syncSelectedId(command.id);
          return;
        case "dismiss":
          controller.dismiss(command.reason);
      }
    },
  };

  return controller;
}
