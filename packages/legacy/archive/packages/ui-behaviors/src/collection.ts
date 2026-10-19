import {
  createBehaviorEvent,
  createBehaviorEventChannel,
  type BehaviorChangeReason,
  type BehaviorEvent,
  type BehaviorEventListener,
  type BehaviorUnsubscribe,
} from "./events";
import {
  createBehaviorSnapshotChannel,
  type BehaviorController,
  type BehaviorListener,
} from "./controller";

export type CollectionKey = string | number;
export type CollectionMoveIntent = "first" | "last" | "next" | "previous";
export type CollectionMutation = "register" | "update" | "remove" | "clear";

export interface CollectionItem<
  TKey extends CollectionKey = CollectionKey,
  TData = unknown,
> {
  readonly key: TKey;
  readonly data: TData;
  readonly disabled?: boolean;
  readonly order?: number;
}

export interface CollectionSnapshot<
  TKey extends CollectionKey = CollectionKey,
  TData = unknown,
> {
  readonly items: readonly CollectionItem<TKey, TData>[];
  readonly enabledKeys: readonly TKey[];
  readonly activeKey: TKey | null;
  readonly revision: number;
}

export interface CollectionChangeDetail<TKey extends CollectionKey, TData> {
  readonly mutation: CollectionMutation;
  readonly key: TKey | null;
  readonly items: readonly CollectionItem<TKey, TData>[];
}

export interface ActiveItemChangeDetail<TKey extends CollectionKey> {
  readonly activeKey: TKey | null;
  readonly previousActiveKey: TKey | null;
}

export type CollectionControllerEvent<TKey extends CollectionKey, TData> =
  | BehaviorEvent<"collection-change", CollectionChangeDetail<TKey, TData>>
  | BehaviorEvent<"active-change", ActiveItemChangeDetail<TKey>>;

export interface CollectionControllerOptions<
  TKey extends CollectionKey,
  TData,
> {
  readonly initialItems?: readonly CollectionItem<TKey, TData>[];
  readonly activeKey?: TKey | null;
  readonly loop?: boolean;
  readonly onEvent?: BehaviorEventListener<
    CollectionControllerEvent<TKey, TData>
  >;
}

export type CollectionCommand<TKey extends CollectionKey, TData> =
  | {
      readonly type: "upsert";
      readonly item: CollectionItem<TKey, TData>;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "remove";
      readonly key: TKey;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "clear";
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "set-active";
      readonly key: TKey | null;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-active";
      readonly intent: CollectionMoveIntent;
      readonly reason?: BehaviorChangeReason;
      readonly loop?: boolean;
    };

export interface CollectionController<
  TKey extends CollectionKey,
  TData,
> extends BehaviorController<
  CollectionSnapshot<TKey, TData>,
  CollectionCommand<TKey, TData>
> {
  upsertItem(
    item: CollectionItem<TKey, TData>,
    reason?: BehaviorChangeReason,
  ): boolean;
  removeItem(key: TKey, reason?: BehaviorChangeReason): boolean;
  clear(reason?: BehaviorChangeReason): boolean;
  setActiveKey(key: TKey | null, reason?: BehaviorChangeReason): boolean;
  moveActive(
    intent: CollectionMoveIntent,
    options?: {
      readonly reason?: BehaviorChangeReason;
      readonly loop?: boolean;
    },
  ): TKey | null;
  getItem(key: TKey): CollectionItem<TKey, TData> | undefined;
  subscribeEvent(
    listener: BehaviorEventListener<CollectionControllerEvent<TKey, TData>>,
  ): BehaviorUnsubscribe;
}

interface InternalCollectionItem<
  TKey extends CollectionKey,
  TData,
> extends CollectionItem<TKey, TData> {
  readonly sequence: number;
}

function freezeItem<TKey extends CollectionKey, TData>(
  item: CollectionItem<TKey, TData>,
): CollectionItem<TKey, TData> {
  return Object.freeze({
    key: item.key,
    data: item.data,
    disabled: item.disabled === true,
    ...(item.order === undefined ? {} : { order: item.order }),
  });
}

function sameItem<TKey extends CollectionKey, TData>(
  left: CollectionItem<TKey, TData>,
  right: CollectionItem<TKey, TData>,
): boolean {
  return (
    left.key === right.key &&
    Object.is(left.data, right.data) &&
    (left.disabled === true) === (right.disabled === true) &&
    left.order === right.order
  );
}

export function createCollectionController<
  TKey extends CollectionKey,
  TData = unknown,
>(
  options: CollectionControllerOptions<TKey, TData> = {},
): CollectionController<TKey, TData> {
  const records = new Map<TKey, InternalCollectionItem<TKey, TData>>();
  let sequence = 0;
  let activeKey = options.activeKey ?? null;
  let revision = 0;
  let snapshot: CollectionSnapshot<TKey, TData>;

  const snapshotChannel =
    createBehaviorSnapshotChannel<CollectionSnapshot<TKey, TData>>();
  const eventChannel =
    createBehaviorEventChannel<CollectionControllerEvent<TKey, TData>>();

  function orderedInternalItems(): readonly InternalCollectionItem<
    TKey,
    TData
  >[] {
    return [...records.values()].sort((left, right) => {
      const leftOrder = left.order ?? left.sequence;
      const rightOrder = right.order ?? right.sequence;
      return leftOrder === rightOrder
        ? left.sequence - right.sequence
        : leftOrder - rightOrder;
    });
  }

  function createSnapshot(): CollectionSnapshot<TKey, TData> {
    const items = orderedInternalItems().map(freezeItem);
    const enabledKeys = items
      .filter((item) => item.disabled !== true)
      .map((item) => item.key);

    return Object.freeze({
      items: Object.freeze(items),
      enabledKeys: Object.freeze(enabledKeys),
      activeKey,
      revision,
    });
  }

  function publishSnapshot(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshotChannel.publish(snapshot);
  }

  function emit(event: CollectionControllerEvent<TKey, TData>): void {
    eventChannel.emit(event);
    options.onEvent?.(event);
  }

  function emitCollectionChange(
    mutation: CollectionMutation,
    key: TKey | null,
    reason: BehaviorChangeReason,
  ): void {
    emit(
      createBehaviorEvent(
        "collection-change",
        Object.freeze({
          mutation,
          key,
          items: snapshot.items,
        }),
        reason,
      ),
    );
  }

  function emitActiveChange(
    previousActiveKey: TKey | null,
    reason: BehaviorChangeReason,
  ): void {
    emit(
      createBehaviorEvent(
        "active-change",
        Object.freeze({ activeKey, previousActiveKey }),
        reason,
      ),
    );
  }

  function isEnabled(key: TKey): boolean {
    return records.get(key)?.disabled !== true && records.has(key);
  }

  function reconcileActive(
    previousItems: readonly InternalCollectionItem<TKey, TData>[],
    previousActiveKey: TKey | null,
  ): boolean {
    if (activeKey === null || isEnabled(activeKey)) return false;

    const enabledKeys = orderedInternalItems()
      .filter((item) => item.disabled !== true)
      .map((item) => item.key);
    if (enabledKeys.length === 0) {
      activeKey = null;
      return previousActiveKey !== null;
    }

    const previousIndex = previousItems.findIndex(
      (item) => item.key === previousActiveKey,
    );
    const candidateIndex = Math.min(
      Math.max(previousIndex, 0),
      enabledKeys.length - 1,
    );
    activeKey = enabledKeys[candidateIndex];
    return activeKey !== previousActiveKey;
  }

  function upsertInitial(item: CollectionItem<TKey, TData>): void {
    records.set(item.key, {
      ...freezeItem(item),
      sequence,
    });
    sequence += 1;
  }

  for (const item of options.initialItems ?? []) {
    upsertInitial(item);
  }
  if (activeKey !== null && !isEnabled(activeKey)) {
    activeKey = null;
  }
  snapshot = createSnapshot();

  const controller: CollectionController<TKey, TData> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<CollectionSnapshot<TKey, TData>>) {
      return snapshotChannel.subscribe(listener);
    },
    subscribeEvent(listener) {
      return eventChannel.subscribe(listener);
    },
    getItem(key) {
      const item = records.get(key);
      return item ? freezeItem(item) : undefined;
    },
    upsertItem(item, reason = "collection-change") {
      const existing = records.get(item.key);
      if (existing && sameItem(existing, item)) return false;

      const previousItems = orderedInternalItems();
      const previousActiveKey = activeKey;
      records.set(item.key, {
        ...freezeItem(item),
        sequence: existing?.sequence ?? sequence,
      });
      if (!existing) sequence += 1;

      const activeChanged = reconcileActive(previousItems, previousActiveKey);
      publishSnapshot();
      emitCollectionChange(existing ? "update" : "register", item.key, reason);
      if (activeChanged) {
        emitActiveChange(previousActiveKey, "collection-change");
      }
      return true;
    },
    removeItem(key, reason = "collection-change") {
      if (!records.has(key)) return false;

      const previousItems = orderedInternalItems();
      const previousActiveKey = activeKey;
      records.delete(key);
      const activeChanged = reconcileActive(previousItems, previousActiveKey);
      publishSnapshot();
      emitCollectionChange("remove", key, reason);
      if (activeChanged) {
        emitActiveChange(previousActiveKey, "collection-change");
      }
      return true;
    },
    clear(reason = "clear") {
      if (records.size === 0 && activeKey === null) return false;

      const previousActiveKey = activeKey;
      records.clear();
      activeKey = null;
      publishSnapshot();
      emitCollectionChange("clear", null, reason);
      if (previousActiveKey !== null) {
        emitActiveChange(previousActiveKey, reason);
      }
      return true;
    },
    setActiveKey(key, reason = "programmatic") {
      if (key !== null && !isEnabled(key)) return false;
      if (activeKey === key) return false;

      const previousActiveKey = activeKey;
      activeKey = key;
      publishSnapshot();
      emitActiveChange(previousActiveKey, reason);
      return true;
    },
    moveActive(intent, moveOptions = {}) {
      const enabledKeys = snapshot.enabledKeys;
      if (enabledKeys.length === 0) {
        controller.setActiveKey(null, moveOptions.reason ?? "keyboard");
        return null;
      }

      const shouldLoop = moveOptions.loop ?? options.loop ?? false;
      let nextKey: TKey;
      if (intent === "first") {
        nextKey = enabledKeys[0];
      } else if (intent === "last") {
        nextKey = enabledKeys[enabledKeys.length - 1];
      } else {
        const currentIndex = enabledKeys.findIndex((key) => key === activeKey);
        const step = intent === "next" ? 1 : -1;
        if (currentIndex < 0) {
          nextKey =
            intent === "next"
              ? enabledKeys[0]
              : enabledKeys[enabledKeys.length - 1];
        } else {
          const candidateIndex = currentIndex + step;
          if (shouldLoop) {
            nextKey =
              enabledKeys[
                (candidateIndex + enabledKeys.length) % enabledKeys.length
              ];
          } else {
            nextKey =
              enabledKeys[
                Math.min(Math.max(candidateIndex, 0), enabledKeys.length - 1)
              ];
          }
        }
      }

      controller.setActiveKey(nextKey, moveOptions.reason ?? "keyboard");
      return nextKey;
    },
    dispatch(command) {
      if (command.type === "upsert") {
        controller.upsertItem(command.item, command.reason);
        return;
      }
      if (command.type === "remove") {
        controller.removeItem(command.key, command.reason);
        return;
      }
      if (command.type === "clear") {
        controller.clear(command.reason);
        return;
      }
      if (command.type === "set-active") {
        controller.setActiveKey(command.key, command.reason);
        return;
      }
      controller.moveActive(command.intent, {
        reason: command.reason,
        loop: command.loop,
      });
    },
  };

  return controller;
}
