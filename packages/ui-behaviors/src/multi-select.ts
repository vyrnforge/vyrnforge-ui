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
import type { CollectionMoveIntent } from "./collection";

export interface MultiSelectItem<TKey extends string = string> {
  readonly value: TKey;
  readonly text: string;
  readonly disabled?: boolean;
  readonly order?: number;
}

export type MultiSelectFilterFunction<
  TItem extends MultiSelectItem = MultiSelectItem,
> = (items: readonly TItem[], query: string) => readonly TItem[];

export interface MultiSelectSnapshot<
  TItem extends MultiSelectItem = MultiSelectItem,
> {
  readonly items: readonly TItem[];
  readonly filteredItems: readonly TItem[];
  readonly selectedValues: readonly TItem["value"][];
  readonly query: string;
  readonly open: boolean;
  readonly activeValue: TItem["value"] | null;
  readonly isControlled: boolean;
  readonly revision: number;
}

export type MultiSelectControllerEvent<
  TItem extends MultiSelectItem = MultiSelectItem,
> =
  | BehaviorEvent<
      "selection-change",
      {
        readonly selectedValues: readonly TItem["value"][];
        readonly previousSelectedValues: readonly TItem["value"][];
        readonly isControlled: boolean;
      }
    >
  | BehaviorEvent<
      "query-change",
      { readonly query: string; readonly previousQuery: string }
    >
  | BehaviorEvent<
      "open-change",
      { readonly open: boolean; readonly previousOpen: boolean }
    >
  | BehaviorEvent<
      "active-change",
      {
        readonly activeValue: TItem["value"] | null;
        readonly previousActiveValue: TItem["value"] | null;
      }
    >;

export interface MultiSelectControllerOptions<
  TItem extends MultiSelectItem = MultiSelectItem,
> {
  readonly items?: readonly TItem[];
  readonly values?: readonly TItem["value"][];
  readonly defaultValues?: readonly TItem["value"][];
  readonly filter?: MultiSelectFilterFunction<TItem>;
  readonly onEvent?: BehaviorEventListener<MultiSelectControllerEvent<TItem>>;
}

export type MultiSelectCommand<
  TItem extends MultiSelectItem = MultiSelectItem,
> =
  | {
      readonly type: "toggle";
      readonly value: TItem["value"];
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "clear"; readonly reason?: BehaviorChangeReason }
  | { readonly type: "set-query"; readonly query: string }
  | {
      readonly type: "set-open";
      readonly open: boolean;
      readonly direction?: 1 | -1;
    }
  | {
      readonly type: "set-active";
      readonly value: TItem["value"] | null;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-active";
      readonly intent: CollectionMoveIntent;
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "replace-items"; readonly items: readonly TItem[] }
  | {
      readonly type: "sync-values";
      readonly values: readonly TItem["value"][];
    };

export interface MultiSelectController<
  TItem extends MultiSelectItem = MultiSelectItem,
> extends BehaviorController<
  MultiSelectSnapshot<TItem>,
  MultiSelectCommand<TItem>
> {
  toggle(value: TItem["value"], reason?: BehaviorChangeReason): boolean;
  clear(reason?: BehaviorChangeReason): boolean;
  setQuery(query: string, reason?: BehaviorChangeReason): boolean;
  setOpen(
    open: boolean,
    options?: {
      readonly direction?: 1 | -1;
      readonly reason?: BehaviorChangeReason;
    },
  ): boolean;
  setActiveValue(
    value: TItem["value"] | null,
    reason?: BehaviorChangeReason,
  ): boolean;
  moveActive(
    intent: CollectionMoveIntent,
    reason?: BehaviorChangeReason,
  ): TItem["value"] | null;
  replaceItems(items: readonly TItem[]): boolean;
  setFilter(filter: MultiSelectFilterFunction<TItem>): boolean;
  syncValues(values: readonly TItem["value"][]): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<MultiSelectControllerEvent<TItem>>,
  ): BehaviorUnsubscribe;
}

export function defaultMultiSelectBehaviorFilter<TItem extends MultiSelectItem>(
  items: readonly TItem[],
  query: string,
): readonly TItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return items;
  return items.filter((item) =>
    item.text.toLocaleLowerCase().includes(normalizedQuery),
  );
}

function normalizeItems<TItem extends MultiSelectItem>(
  items: readonly TItem[],
): readonly TItem[] {
  const seen = new Set<TItem["value"]>();
  return Object.freeze(
    items
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
      .map(({ item }) => item),
  );
}

function uniqueValues<TKey extends string>(values: readonly TKey[]) {
  return Object.freeze([...new Set(values)]);
}

function sameValues<TKey extends string>(
  left: readonly TKey[],
  right: readonly TKey[],
) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function createMultiSelectController<TItem extends MultiSelectItem>(
  options: MultiSelectControllerOptions<TItem> = {},
): MultiSelectController<TItem> {
  const isControlled = Object.prototype.hasOwnProperty.call(options, "values");
  let items = normalizeItems(options.items ?? []);
  let selectedValues = uniqueValues(
    isControlled ? (options.values ?? []) : (options.defaultValues ?? []),
  );
  let filter: MultiSelectFilterFunction<TItem> =
    options.filter ?? defaultMultiSelectBehaviorFilter;
  let query = "";
  let open = false;
  let activeValue: TItem["value"] | null = null;
  let revision = 0;
  let snapshot: MultiSelectSnapshot<TItem>;

  const snapshots = createBehaviorSnapshotChannel<MultiSelectSnapshot<TItem>>();
  const events =
    createBehaviorEventChannel<MultiSelectControllerEvent<TItem>>();

  function filteredItems() {
    return Object.freeze([...filter(items, query)]);
  }

  function reconcileActive(currentFilteredItems: readonly TItem[]) {
    if (!open) {
      activeValue = null;
      return;
    }
    const enabled = currentFilteredItems.filter((item) => !item.disabled);
    if (
      activeValue !== null &&
      enabled.some((item) => item.value === activeValue)
    ) {
      return;
    }
    activeValue = enabled[0]?.value ?? null;
  }

  function createSnapshot(): MultiSelectSnapshot<TItem> {
    const currentFilteredItems = filteredItems();
    reconcileActive(currentFilteredItems);
    return Object.freeze({
      items,
      filteredItems: currentFilteredItems,
      selectedValues,
      query,
      open,
      activeValue,
      isControlled,
      revision,
    });
  }

  function publish() {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: MultiSelectControllerEvent<TItem>) {
    events.emit(event);
    options.onEvent?.(event);
  }

  function setActive(
    nextValue: TItem["value"] | null,
    reason: BehaviorChangeReason,
  ) {
    if (nextValue !== null) {
      const item = snapshot.filteredItems.find(
        (candidate) => candidate.value === nextValue,
      );
      if (!item || item.disabled) return false;
    }
    const previousActiveValue = activeValue;
    if (previousActiveValue === nextValue) return false;
    activeValue = nextValue;
    publish();
    emit(
      createBehaviorEvent(
        "active-change",
        Object.freeze({ activeValue, previousActiveValue }),
        reason,
      ),
    );
    return true;
  }

  function requestSelection(
    nextValuesInput: readonly TItem["value"][],
    reason: BehaviorChangeReason,
  ) {
    const nextValues = uniqueValues(nextValuesInput);
    const previousSelectedValues = selectedValues;
    if (sameValues(previousSelectedValues, nextValues)) return false;
    if (!isControlled) selectedValues = nextValues;
    publish();
    emit(
      createBehaviorEvent(
        "selection-change",
        Object.freeze({
          selectedValues: nextValues,
          previousSelectedValues,
          isControlled,
        }),
        reason,
      ),
    );
    return true;
  }

  snapshot = createSnapshot();

  const controller: MultiSelectController<TItem> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<MultiSelectSnapshot<TItem>>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    toggle(value, reason = "selection") {
      const item = items.find((candidate) => candidate.value === value);
      if (!item || item.disabled) return false;
      return requestSelection(
        selectedValues.includes(value)
          ? selectedValues.filter((candidate) => candidate !== value)
          : [...selectedValues, value],
        reason,
      );
    },
    clear(reason = "clear") {
      return requestSelection([], reason);
    },
    setQuery(nextQuery, reason = "user") {
      const previousQuery = query;
      if (previousQuery === nextQuery) return false;
      query = nextQuery;
      publish();
      emit(
        createBehaviorEvent(
          "query-change",
          Object.freeze({ query, previousQuery }),
          reason,
        ),
      );
      return true;
    },
    setOpen(nextOpen, setOpenOptions = {}) {
      const previousOpen = open;
      const reason = setOpenOptions.reason ?? "programmatic";
      if (previousOpen === nextOpen) {
        if (nextOpen && setOpenOptions.direction !== undefined) {
          const enabled = snapshot.filteredItems.filter(
            (item) => !item.disabled,
          );
          return setActive(
            setOpenOptions.direction === -1
              ? (enabled[enabled.length - 1]?.value ?? null)
              : (enabled[0]?.value ?? null),
            reason,
          );
        }
        return false;
      }
      open = nextOpen;
      if (!open) activeValue = null;
      publish();
      emit(
        createBehaviorEvent(
          "open-change",
          Object.freeze({ open, previousOpen }),
          reason,
        ),
      );
      if (open) {
        const enabled = snapshot.filteredItems.filter((item) => !item.disabled);
        setActive(
          setOpenOptions.direction === -1
            ? (enabled[enabled.length - 1]?.value ?? null)
            : (enabled[0]?.value ?? null),
          reason,
        );
      }
      return true;
    },
    setActiveValue(nextValue, reason = "programmatic") {
      return setActive(nextValue, reason);
    },
    moveActive(intent, reason = "keyboard") {
      const enabled = snapshot.filteredItems.filter((item) => !item.disabled);
      if (enabled.length === 0) {
        setActive(null, reason);
        return null;
      }
      let nextIndex = enabled.findIndex((item) => item.value === activeValue);
      if (intent === "first") nextIndex = 0;
      else if (intent === "last") nextIndex = enabled.length - 1;
      else if (intent === "next")
        nextIndex = (Math.max(nextIndex, -1) + 1) % enabled.length;
      else nextIndex = (nextIndex <= 0 ? enabled.length : nextIndex) - 1;
      const nextValue = enabled[nextIndex]?.value ?? null;
      setActive(nextValue, reason);
      return nextValue;
    },
    replaceItems(nextItems) {
      const normalized = normalizeItems(nextItems);
      const same =
        items.length === normalized.length &&
        items.every(
          (item, index) =>
            item.value === normalized[index]?.value &&
            item.text === normalized[index]?.text &&
            item.disabled === normalized[index]?.disabled &&
            item.order === normalized[index]?.order,
        );
      if (same) return false;
      items = normalized;
      publish();
      return true;
    },
    setFilter(nextFilter) {
      if (filter === nextFilter) return false;
      filter = nextFilter;
      publish();
      return true;
    },
    syncValues(nextValues) {
      const normalized = uniqueValues(nextValues);
      if (sameValues(selectedValues, normalized)) return false;
      selectedValues = normalized;
      publish();
      return true;
    },
    dispatch(command) {
      if (command.type === "toggle")
        controller.toggle(command.value, command.reason);
      else if (command.type === "clear") controller.clear(command.reason);
      else if (command.type === "set-query") controller.setQuery(command.query);
      else if (command.type === "set-open")
        controller.setOpen(command.open, { direction: command.direction });
      else if (command.type === "set-active")
        controller.setActiveValue(command.value, command.reason);
      else if (command.type === "move-active")
        controller.moveActive(command.intent, command.reason);
      else if (command.type === "replace-items")
        controller.replaceItems(command.items);
      else controller.syncValues(command.values);
    },
  };

  return controller;
}
