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

export type SelectionKey = string | number;
export type SelectionMode = "single" | "multiple";
export type SelectionOperation =
  "select" | "deselect" | "toggle" | "range" | "replace" | "clear";

export interface SelectionSnapshot<TKey extends SelectionKey> {
  readonly selectedKeys: readonly TKey[];
  readonly anchorKey: TKey | null;
  readonly isControlled: boolean;
  readonly revision: number;
}

export interface SelectionChangeDetail<TKey extends SelectionKey> {
  readonly operation: SelectionOperation;
  readonly selectedKeys: readonly TKey[];
  readonly previousSelectedKeys: readonly TKey[];
  readonly addedKeys: readonly TKey[];
  readonly removedKeys: readonly TKey[];
  readonly anchorKey: TKey | null;
  readonly isControlled: boolean;
}

export type SelectionChangeEvent<TKey extends SelectionKey> = BehaviorEvent<
  "selection-change",
  SelectionChangeDetail<TKey>
>;

export interface SelectionControllerOptions<TKey extends SelectionKey> {
  readonly mode?: SelectionMode;
  readonly selectedKeys?: readonly TKey[];
  readonly defaultSelectedKeys?: readonly TKey[];
  readonly allowEmpty?: boolean;
  readonly orderedKeys?: readonly TKey[] | (() => readonly TKey[]);
  readonly isDisabled?: (key: TKey) => boolean;
  readonly onSelectionChange?: BehaviorEventListener<
    SelectionChangeEvent<TKey>
  >;
}

export type SelectionCommand<TKey extends SelectionKey> =
  | {
      readonly type: "select";
      readonly key: TKey;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "deselect";
      readonly key: TKey;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "toggle";
      readonly key: TKey;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "range";
      readonly key: TKey;
      readonly additive?: boolean;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "replace";
      readonly keys: readonly TKey[];
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "clear";
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "sync";
      readonly keys: readonly TKey[];
    }
  | {
      readonly type: "set-anchor";
      readonly key: TKey | null;
    };

export interface SelectionController<
  TKey extends SelectionKey,
> extends BehaviorController<SelectionSnapshot<TKey>, SelectionCommand<TKey>> {
  select(key: TKey, reason?: BehaviorChangeReason): boolean;
  deselect(key: TKey, reason?: BehaviorChangeReason): boolean;
  toggle(key: TKey, reason?: BehaviorChangeReason): boolean;
  selectRange(
    key: TKey,
    options?: {
      readonly additive?: boolean;
      readonly reason?: BehaviorChangeReason;
    },
  ): boolean;
  replace(keys: readonly TKey[], reason?: BehaviorChangeReason): boolean;
  clear(reason?: BehaviorChangeReason): boolean;
  syncSelectedKeys(keys: readonly TKey[]): boolean;
  setAnchorKey(key: TKey | null): boolean;
  isSelected(key: TKey): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<SelectionChangeEvent<TKey>>,
  ): BehaviorUnsubscribe;
}

function sameKeys<TKey extends SelectionKey>(
  left: readonly TKey[],
  right: readonly TKey[],
): boolean {
  return (
    left.length === right.length &&
    left.every((key, index) => key === right[index])
  );
}

function uniqueKeys<TKey extends SelectionKey>(keys: readonly TKey[]): TKey[] {
  return [...new Set(keys)];
}

function difference<TKey extends SelectionKey>(
  left: readonly TKey[],
  right: readonly TKey[],
): TKey[] {
  const rightKeys = new Set(right);
  return left.filter((key) => !rightKeys.has(key));
}

export function createSelectionController<TKey extends SelectionKey>(
  options: SelectionControllerOptions<TKey> = {},
): SelectionController<TKey> {
  const mode = options.mode ?? "multiple";
  const allowEmpty = options.allowEmpty ?? true;
  const isControlled = Object.prototype.hasOwnProperty.call(
    options,
    "selectedKeys",
  );
  const isDisabled = options.isDisabled ?? (() => false);

  function normalize(keys: readonly TKey[]): readonly TKey[] {
    const enabled = uniqueKeys(keys).filter((key) => !isDisabled(key));
    return Object.freeze(mode === "single" ? enabled.slice(0, 1) : enabled);
  }

  let selectedKeys = normalize(
    isControlled
      ? (options.selectedKeys ?? [])
      : (options.defaultSelectedKeys ?? []),
  );
  let anchorKey: TKey | null = selectedKeys[0] ?? null;
  let revision = 0;
  let snapshot: SelectionSnapshot<TKey>;

  const snapshotChannel =
    createBehaviorSnapshotChannel<SelectionSnapshot<TKey>>();
  const eventChannel = createBehaviorEventChannel<SelectionChangeEvent<TKey>>();

  function createSnapshot(): SelectionSnapshot<TKey> {
    return Object.freeze({
      selectedKeys,
      anchorKey,
      isControlled,
      revision,
    });
  }

  function publishSnapshot(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshotChannel.publish(snapshot);
  }

  function resolveOrderedKeys(): readonly TKey[] {
    const value =
      typeof options.orderedKeys === "function"
        ? options.orderedKeys()
        : (options.orderedKeys ?? []);
    return uniqueKeys(value).filter((key) => !isDisabled(key));
  }

  function commitSelection(
    nextKeysInput: readonly TKey[],
    operation: SelectionOperation,
    reason: BehaviorChangeReason,
    nextAnchorKey: TKey | null,
  ): boolean {
    const previousSelectedKeys = selectedKeys;
    const nextKeys = normalize(nextKeysInput);
    if (sameKeys(previousSelectedKeys, nextKeys)) {
      if (anchorKey !== nextAnchorKey) {
        anchorKey = nextAnchorKey;
        publishSnapshot();
      }
      return false;
    }

    if (!isControlled) {
      selectedKeys = nextKeys;
    }
    anchorKey = nextAnchorKey;
    if (!isControlled || snapshot.anchorKey !== anchorKey) {
      publishSnapshot();
    }

    const event = createBehaviorEvent(
      "selection-change",
      Object.freeze({
        operation,
        selectedKeys: nextKeys,
        previousSelectedKeys,
        addedKeys: Object.freeze(difference(nextKeys, previousSelectedKeys)),
        removedKeys: Object.freeze(difference(previousSelectedKeys, nextKeys)),
        anchorKey,
        isControlled,
      }),
      reason,
    );
    eventChannel.emit(event);
    options.onSelectionChange?.(event);
    return true;
  }

  snapshot = createSnapshot();

  const controller: SelectionController<TKey> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<SelectionSnapshot<TKey>>) {
      return snapshotChannel.subscribe(listener);
    },
    subscribeEvent(listener) {
      return eventChannel.subscribe(listener);
    },
    isSelected(key) {
      return selectedKeys.includes(key);
    },
    setAnchorKey(key) {
      if (key !== null && isDisabled(key)) return false;
      if (anchorKey === key) return false;
      anchorKey = key;
      publishSnapshot();
      return true;
    },
    select(key, reason = "selection") {
      if (isDisabled(key)) return false;
      const nextKeys =
        mode === "single"
          ? [key]
          : selectedKeys.includes(key)
            ? selectedKeys
            : [...selectedKeys, key];
      return commitSelection(nextKeys, "select", reason, key);
    },
    deselect(key, reason = "selection") {
      if (!selectedKeys.includes(key)) return false;
      if (!allowEmpty && selectedKeys.length === 1) return false;

      const nextKeys = selectedKeys.filter(
        (selectedKey) => selectedKey !== key,
      );
      const nextAnchorKey =
        anchorKey === key ? (nextKeys[nextKeys.length - 1] ?? null) : anchorKey;
      return commitSelection(nextKeys, "deselect", reason, nextAnchorKey);
    },
    toggle(key, reason = "selection") {
      if (isDisabled(key)) return false;
      if (selectedKeys.includes(key)) {
        if (!allowEmpty && selectedKeys.length === 1) return false;
        const nextKeys = selectedKeys.filter(
          (selectedKey) => selectedKey !== key,
        );
        return commitSelection(
          nextKeys,
          "toggle",
          reason,
          nextKeys[nextKeys.length - 1] ?? null,
        );
      }

      const nextKeys = mode === "single" ? [key] : [...selectedKeys, key];
      return commitSelection(nextKeys, "toggle", reason, key);
    },
    selectRange(key, rangeOptions = {}) {
      if (isDisabled(key)) return false;
      if (mode === "single") {
        return commitSelection(
          [key],
          "range",
          rangeOptions.reason ?? "selection",
          key,
        );
      }

      const orderedKeys = resolveOrderedKeys();
      const rangeAnchor =
        anchorKey !== null && orderedKeys.includes(anchorKey) ? anchorKey : key;
      const anchorIndex = orderedKeys.indexOf(rangeAnchor);
      const targetIndex = orderedKeys.indexOf(key);
      const rangeKeys =
        anchorIndex >= 0 && targetIndex >= 0
          ? orderedKeys.slice(
              Math.min(anchorIndex, targetIndex),
              Math.max(anchorIndex, targetIndex) + 1,
            )
          : [key];
      const nextKeys = rangeOptions.additive
        ? uniqueKeys([...selectedKeys, ...rangeKeys])
        : rangeKeys;

      return commitSelection(
        nextKeys,
        "range",
        rangeOptions.reason ?? "selection",
        rangeAnchor,
      );
    },
    replace(keys, reason = "programmatic") {
      const nextKeys = normalize(keys);
      if (!allowEmpty && selectedKeys.length > 0 && nextKeys.length === 0) {
        return false;
      }
      return commitSelection(nextKeys, "replace", reason, nextKeys[0] ?? null);
    },
    clear(reason = "clear") {
      if (selectedKeys.length === 0 || !allowEmpty) return false;
      return commitSelection([], "clear", reason, null);
    },
    syncSelectedKeys(keys) {
      const nextKeys = normalize(keys);
      if (sameKeys(selectedKeys, nextKeys)) return false;
      selectedKeys = nextKeys;
      if (anchorKey !== null && !selectedKeys.includes(anchorKey)) {
        anchorKey = selectedKeys[0] ?? null;
      }
      publishSnapshot();
      return true;
    },
    dispatch(command) {
      if (command.type === "select") {
        controller.select(command.key, command.reason);
        return;
      }
      if (command.type === "deselect") {
        controller.deselect(command.key, command.reason);
        return;
      }
      if (command.type === "toggle") {
        controller.toggle(command.key, command.reason);
        return;
      }
      if (command.type === "range") {
        controller.selectRange(command.key, {
          additive: command.additive,
          reason: command.reason,
        });
        return;
      }
      if (command.type === "replace") {
        controller.replace(command.keys, command.reason);
        return;
      }
      if (command.type === "clear") {
        controller.clear(command.reason);
        return;
      }
      if (command.type === "sync") {
        controller.syncSelectedKeys(command.keys);
        return;
      }
      controller.setAnchorKey(command.key);
    },
  };

  return controller;
}
