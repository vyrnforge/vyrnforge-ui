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
import type { CollectionMoveIntent } from "./collection";

export type ChoiceKey = string | number;

export interface ChoiceItem<TKey extends ChoiceKey = ChoiceKey> {
  readonly value: TKey;
  readonly disabled?: boolean;
  readonly order?: number;
}

export interface ChoiceSnapshot<TKey extends ChoiceKey> {
  readonly items: readonly ChoiceItem<TKey>[];
  readonly enabledValues: readonly TKey[];
  readonly value: TKey | null;
  readonly activeValue: TKey | null;
  readonly isControlled: boolean;
  readonly revision: number;
}

export interface ChoiceChangeDetail<TKey extends ChoiceKey> {
  readonly value: TKey | null;
  readonly previousValue: TKey | null;
  readonly isControlled: boolean;
}

export interface ChoiceActiveChangeDetail<TKey extends ChoiceKey> {
  readonly activeValue: TKey | null;
  readonly previousActiveValue: TKey | null;
}

export type ChoiceControllerEvent<TKey extends ChoiceKey> =
  | BehaviorEvent<"value-change", ChoiceChangeDetail<TKey>>
  | BehaviorEvent<"active-change", ChoiceActiveChangeDetail<TKey>>
  | BehaviorEvent<
      "items-change",
      { readonly items: readonly ChoiceItem<TKey>[] }
    >;

export interface ChoiceControllerOptions<TKey extends ChoiceKey> {
  readonly items?: readonly ChoiceItem<TKey>[];
  readonly value?: TKey | null;
  readonly defaultValue?: TKey | null;
  readonly activeValue?: TKey | null;
  readonly allowEmpty?: boolean;
  readonly loop?: boolean;
  readonly onEvent?: BehaviorEventListener<ChoiceControllerEvent<TKey>>;
}

export type ChoiceCommand<TKey extends ChoiceKey> =
  | {
      readonly type: "select";
      readonly value: TKey;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "clear";
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "sync"; readonly value: TKey | null }
  | {
      readonly type: "replace-items";
      readonly items: readonly ChoiceItem<TKey>[];
    }
  | {
      readonly type: "set-active";
      readonly value: TKey | null;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-active";
      readonly intent: CollectionMoveIntent;
      readonly select?: boolean;
      readonly loop?: boolean;
      readonly reason?: BehaviorChangeReason;
    };

export interface ChoiceController<
  TKey extends ChoiceKey,
> extends BehaviorController<ChoiceSnapshot<TKey>, ChoiceCommand<TKey>> {
  select(value: TKey, reason?: BehaviorChangeReason): boolean;
  clear(reason?: BehaviorChangeReason): boolean;
  syncValue(value: TKey | null): boolean;
  replaceItems(items: readonly ChoiceItem<TKey>[]): boolean;
  setActiveValue(value: TKey | null, reason?: BehaviorChangeReason): boolean;
  moveActive(
    intent: CollectionMoveIntent,
    options?: {
      readonly select?: boolean;
      readonly loop?: boolean;
      readonly reason?: BehaviorChangeReason;
    },
  ): TKey | null;
  isSelected(value: TKey): boolean;
  isDisabled(value: TKey): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<ChoiceControllerEvent<TKey>>,
  ): BehaviorUnsubscribe;
}

function normalizeItems<TKey extends ChoiceKey>(
  input: readonly ChoiceItem<TKey>[],
): readonly ChoiceItem<TKey>[] {
  const seen = new Set<TKey>();
  return Object.freeze(
    input
      .map((item, sequence) => ({ item, sequence }))
      .filter(({ item }) => {
        if (seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      })
      .sort((left, right) => {
        const leftOrder = left.item.order ?? left.sequence;
        const rightOrder = right.item.order ?? right.sequence;
        return leftOrder === rightOrder
          ? left.sequence - right.sequence
          : leftOrder - rightOrder;
      })
      .map(({ item }) =>
        Object.freeze({
          value: item.value,
          disabled: item.disabled === true,
          ...(item.order === undefined ? {} : { order: item.order }),
        }),
      ),
  );
}

function sameItems<TKey extends ChoiceKey>(
  left: readonly ChoiceItem<TKey>[],
  right: readonly ChoiceItem<TKey>[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.value === right[index]?.value &&
        item.disabled === right[index]?.disabled &&
        item.order === right[index]?.order,
    )
  );
}

export function createChoiceController<TKey extends ChoiceKey>(
  options: ChoiceControllerOptions<TKey> = {},
): ChoiceController<TKey> {
  const isControlled = Object.prototype.hasOwnProperty.call(options, "value");
  const allowEmpty = options.allowEmpty ?? true;
  const defaultLoop = options.loop ?? true;
  let items = normalizeItems(options.items ?? []);
  let value = isControlled
    ? (options.value ?? null)
    : (options.defaultValue ?? null);
  let activeValue = options.activeValue ?? value;
  let revision = 0;

  const snapshots = createBehaviorSnapshotChannel<ChoiceSnapshot<TKey>>();
  const events = createBehaviorEventChannel<ChoiceControllerEvent<TKey>>();
  let snapshot: ChoiceSnapshot<TKey>;

  function isDisabled(valueToCheck: TKey): boolean {
    const item = items.find((candidate) => candidate.value === valueToCheck);
    return !item || item.disabled === true;
  }

  function enabledValues(): readonly TKey[] {
    return Object.freeze(
      items.filter((item) => item.disabled !== true).map((item) => item.value),
    );
  }

  function normalizeValue(candidate: TKey | null): TKey | null {
    if (candidate === null) return null;
    return isDisabled(candidate) ? null : candidate;
  }

  function createSnapshot(): ChoiceSnapshot<TKey> {
    return Object.freeze({
      items,
      enabledValues: enabledValues(),
      value,
      activeValue,
      isControlled,
      revision,
    });
  }

  function publish(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: ChoiceControllerEvent<TKey>): void {
    events.emit(event);
    options.onEvent?.(event);
  }

  function emitActiveChange(
    previousActiveValue: TKey | null,
    reason: BehaviorChangeReason,
  ): void {
    emit(
      createBehaviorEvent(
        "active-change",
        Object.freeze({ activeValue, previousActiveValue }),
        reason,
      ),
    );
  }

  value = normalizeValue(value);
  activeValue = normalizeValue(activeValue);
  snapshot = createSnapshot();

  const controller: ChoiceController<TKey> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<ChoiceSnapshot<TKey>>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    isSelected(candidate) {
      return value === candidate;
    },
    isDisabled,
    select(candidate, reason = "selection") {
      if (isDisabled(candidate)) return false;
      const previousValue = value;
      if (previousValue === candidate) {
        if (activeValue !== candidate) {
          const previousActiveValue = activeValue;
          activeValue = candidate;
          publish();
          emitActiveChange(previousActiveValue, reason);
        }
        return false;
      }

      if (!isControlled) value = candidate;
      const previousActiveValue = activeValue;
      activeValue = candidate;
      publish();
      emit(
        createBehaviorEvent(
          "value-change",
          Object.freeze({
            value: candidate,
            previousValue,
            isControlled,
          }),
          reason,
        ),
      );
      if (previousActiveValue !== activeValue) {
        emitActiveChange(previousActiveValue, reason);
      }
      return true;
    },
    clear(reason = "clear") {
      if (!allowEmpty || value === null) return false;
      const previousValue = value;
      if (!isControlled) value = null;
      publish();
      emit(
        createBehaviorEvent(
          "value-change",
          Object.freeze({ value: null, previousValue, isControlled }),
          reason,
        ),
      );
      return true;
    },
    syncValue(nextValue) {
      const normalized = normalizeValue(nextValue);
      if (value === normalized) return false;
      value = normalized;
      if (activeValue === null && normalized !== null) activeValue = normalized;
      publish();
      return true;
    },
    replaceItems(nextItems) {
      const normalized = normalizeItems(nextItems);
      if (sameItems(items, normalized)) return false;
      items = normalized;
      const previousValue = value;
      const previousActiveValue = activeValue;
      value = normalizeValue(value);
      activeValue = normalizeValue(activeValue);
      if (activeValue === null)
        activeValue = value ?? enabledValues()[0] ?? null;
      publish();
      emit(
        createBehaviorEvent(
          "items-change",
          Object.freeze({ items }),
          "collection-change",
        ),
      );
      if (previousValue !== value) {
        emit(
          createBehaviorEvent(
            "value-change",
            Object.freeze({ value, previousValue, isControlled }),
            "collection-change",
          ),
        );
      }
      if (previousActiveValue !== activeValue) {
        emitActiveChange(previousActiveValue, "collection-change");
      }
      return true;
    },
    setActiveValue(nextActiveValue, reason = "programmatic") {
      const normalized = normalizeValue(nextActiveValue);
      if (activeValue === normalized) return false;
      const previousActiveValue = activeValue;
      activeValue = normalized;
      publish();
      emitActiveChange(previousActiveValue, reason);
      return true;
    },
    moveActive(intent, moveOptions = {}) {
      const enabled = enabledValues();
      if (enabled.length === 0) return null;
      const loop = moveOptions.loop ?? defaultLoop;
      const currentIndex =
        activeValue === null ? -1 : enabled.indexOf(activeValue);
      let nextIndex: number;
      if (intent === "first") nextIndex = 0;
      else if (intent === "last") nextIndex = enabled.length - 1;
      else if (intent === "next")
        nextIndex = currentIndex < 0 ? 0 : currentIndex + 1;
      else nextIndex = currentIndex < 0 ? enabled.length - 1 : currentIndex - 1;

      if (loop) {
        nextIndex = (nextIndex + enabled.length) % enabled.length;
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), enabled.length - 1);
      }

      const nextValue = enabled[nextIndex] ?? null;
      controller.setActiveValue(nextValue, moveOptions.reason ?? "keyboard");
      if (nextValue !== null && moveOptions.select === true) {
        controller.select(nextValue, moveOptions.reason ?? "keyboard");
      }
      return nextValue;
    },
    dispatch(command) {
      if (command.type === "select") {
        controller.select(command.value, command.reason);
      } else if (command.type === "clear") {
        controller.clear(command.reason);
      } else if (command.type === "sync") {
        controller.syncValue(command.value);
      } else if (command.type === "replace-items") {
        controller.replaceItems(command.items);
      } else if (command.type === "set-active") {
        controller.setActiveValue(command.value, command.reason);
      } else {
        controller.moveActive(command.intent, {
          select: command.select,
          loop: command.loop,
          reason: command.reason,
        });
      }
    },
  };

  return controller;
}
