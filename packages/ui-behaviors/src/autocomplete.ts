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

export interface AutocompleteItem<TKey extends string = string> {
  readonly value: TKey;
  readonly label: string;
  readonly keywords?: readonly string[];
  readonly disabled?: boolean;
  readonly order?: number;
}

export type AutocompleteFilterFunction<
  TItem extends AutocompleteItem = AutocompleteItem,
> = (items: readonly TItem[], query: string) => readonly TItem[];

export interface AutocompleteSnapshot<
  TItem extends AutocompleteItem = AutocompleteItem,
> {
  readonly items: readonly TItem[];
  readonly filteredItems: readonly TItem[];
  readonly value: TItem["value"] | null;
  readonly inputValue: string;
  readonly open: boolean;
  readonly activeValue: TItem["value"] | null;
  readonly isValueControlled: boolean;
  readonly isInputControlled: boolean;
  readonly isOpenControlled: boolean;
  readonly revision: number;
}

export type AutocompleteControllerEvent<
  TItem extends AutocompleteItem = AutocompleteItem,
> =
  | BehaviorEvent<
      "value-change",
      {
        readonly value: TItem["value"] | null;
        readonly previousValue: TItem["value"] | null;
        readonly item: TItem | null;
        readonly isControlled: boolean;
      }
    >
  | BehaviorEvent<
      "input-value-change",
      {
        readonly value: string;
        readonly previousValue: string;
        readonly isControlled: boolean;
      }
    >
  | BehaviorEvent<
      "open-change",
      {
        readonly open: boolean;
        readonly previousOpen: boolean;
        readonly isControlled: boolean;
      }
    >
  | BehaviorEvent<
      "active-change",
      {
        readonly activeValue: TItem["value"] | null;
        readonly previousActiveValue: TItem["value"] | null;
      }
    >
  | BehaviorEvent<
      "items-change",
      { readonly items: readonly TItem[] },
      "collection-change"
    >;

export interface AutocompleteControllerOptions<
  TItem extends AutocompleteItem = AutocompleteItem,
> {
  readonly items?: readonly TItem[];
  readonly value?: TItem["value"] | null;
  readonly defaultValue?: TItem["value"] | null;
  readonly inputValue?: string;
  readonly defaultInputValue?: string;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly autoHighlight?: boolean;
  readonly filter?: AutocompleteFilterFunction<TItem>;
  readonly onEvent?: BehaviorEventListener<AutocompleteControllerEvent<TItem>>;
}

export type AutocompleteCommand<
  TItem extends AutocompleteItem = AutocompleteItem,
> =
  | {
      readonly type: "set-input";
      readonly value: string;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "set-open";
      readonly open: boolean;
      readonly reason?: BehaviorChangeReason;
      readonly direction?: 1 | -1;
    }
  | {
      readonly type: "select";
      readonly value: TItem["value"];
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "clear"; readonly reason?: BehaviorChangeReason }
  | {
      readonly type: "move-active";
      readonly intent: CollectionMoveIntent;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "set-active";
      readonly value: TItem["value"] | null;
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "replace-items"; readonly items: readonly TItem[] }
  | { readonly type: "sync-value"; readonly value: TItem["value"] | null }
  | { readonly type: "sync-input"; readonly value: string }
  | { readonly type: "sync-open"; readonly open: boolean };

export interface AutocompleteController<
  TItem extends AutocompleteItem = AutocompleteItem,
> extends BehaviorController<
  AutocompleteSnapshot<TItem>,
  AutocompleteCommand<TItem>
> {
  setInputValue(value: string, reason?: BehaviorChangeReason): boolean;
  setOpen(
    open: boolean,
    options?: {
      readonly direction?: 1 | -1;
      readonly reason?: BehaviorChangeReason;
    },
  ): boolean;
  select(value: TItem["value"], reason?: BehaviorChangeReason): boolean;
  clear(reason?: BehaviorChangeReason): boolean;
  restoreInputValue(reason?: BehaviorChangeReason): boolean;
  setActiveValue(
    value: TItem["value"] | null,
    reason?: BehaviorChangeReason,
  ): boolean;
  moveActive(
    intent: CollectionMoveIntent,
    reason?: BehaviorChangeReason,
  ): TItem["value"] | null;
  replaceItems(items: readonly TItem[]): boolean;
  setFilter(filter: AutocompleteFilterFunction<TItem>): boolean;
  syncValue(value: TItem["value"] | null): boolean;
  syncInputValue(value: string): boolean;
  syncOpen(open: boolean): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<AutocompleteControllerEvent<TItem>>,
  ): BehaviorUnsubscribe;
}

export function defaultAutocompleteBehaviorFilter<
  TItem extends AutocompleteItem,
>(items: readonly TItem[], query: string): readonly TItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return items;

  return items.filter(
    (item) =>
      item.label.toLocaleLowerCase().includes(normalizedQuery) ||
      item.keywords?.some((keyword) =>
        keyword.toLocaleLowerCase().includes(normalizedQuery),
      ),
  );
}

function normalizeItems<TItem extends AutocompleteItem>(
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

function sameItems<TItem extends AutocompleteItem>(
  left: readonly TItem[],
  right: readonly TItem[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.value === right[index]?.value &&
        item.label === right[index]?.label &&
        item.disabled === right[index]?.disabled &&
        item.order === right[index]?.order &&
        item.keywords === right[index]?.keywords,
    )
  );
}

export function getFirstEnabledAutocompleteIndex(
  items: readonly AutocompleteItem[],
): number {
  return items.findIndex((item) => !item.disabled);
}

export function getLastEnabledAutocompleteIndex(
  items: readonly AutocompleteItem[],
): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) return index;
  }
  return -1;
}

export function getNextEnabledAutocompleteIndex(
  items: readonly AutocompleteItem[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (items.length === 0) return -1;
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index =
      (currentIndex + direction * offset + items.length) % items.length;
    if (!items[index]?.disabled) return index;
  }
  return -1;
}

export function createAutocompleteController<TItem extends AutocompleteItem>(
  options: AutocompleteControllerOptions<TItem> = {},
): AutocompleteController<TItem> {
  const isValueControlled = Object.prototype.hasOwnProperty.call(
    options,
    "value",
  );
  const isInputControlled = Object.prototype.hasOwnProperty.call(
    options,
    "inputValue",
  );
  const isOpenControlled = Object.prototype.hasOwnProperty.call(
    options,
    "open",
  );
  const autoHighlight = options.autoHighlight ?? true;

  let items = normalizeItems(options.items ?? []);
  let filter: AutocompleteFilterFunction<TItem> =
    options.filter ?? defaultAutocompleteBehaviorFilter;
  let value = isValueControlled
    ? (options.value ?? null)
    : (options.defaultValue ?? null);
  const selectedItem = items.find((item) => item.value === value) ?? null;
  let inputValue = isInputControlled
    ? (options.inputValue ?? "")
    : (options.defaultInputValue ?? selectedItem?.label ?? "");
  let open = isOpenControlled
    ? (options.open ?? false)
    : (options.defaultOpen ?? false);
  let activeValue: TItem["value"] | null = null;
  let revision = 0;
  let snapshot: AutocompleteSnapshot<TItem>;

  const snapshots =
    createBehaviorSnapshotChannel<AutocompleteSnapshot<TItem>>();
  const events =
    createBehaviorEventChannel<AutocompleteControllerEvent<TItem>>();

  function filteredItems(): readonly TItem[] {
    return Object.freeze([...filter(items, inputValue)]);
  }

  function enabledFilteredValues(currentFilteredItems: readonly TItem[]) {
    return currentFilteredItems
      .filter((item) => !item.disabled)
      .map((item) => item.value);
  }

  function reconcileActive(currentFilteredItems: readonly TItem[]): void {
    if (!open) {
      activeValue = null;
      return;
    }
    const enabledValues = enabledFilteredValues(currentFilteredItems);
    if (activeValue !== null && enabledValues.includes(activeValue)) return;
    activeValue = autoHighlight ? (enabledValues[0] ?? null) : null;
  }

  function createSnapshot(): AutocompleteSnapshot<TItem> {
    const currentFilteredItems = filteredItems();
    reconcileActive(currentFilteredItems);
    return Object.freeze({
      items,
      filteredItems: currentFilteredItems,
      value,
      inputValue,
      open,
      activeValue,
      isValueControlled,
      isInputControlled,
      isOpenControlled,
      revision,
    });
  }

  function publish(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: AutocompleteControllerEvent<TItem>): void {
    events.emit(event);
    options.onEvent?.(event);
  }

  function findItem(candidate: TItem["value"] | null): TItem | null {
    if (candidate === null) return null;
    return items.find((item) => item.value === candidate) ?? null;
  }

  function requestInput(
    nextValue: string,
    reason: BehaviorChangeReason,
  ): boolean {
    const previousValue = inputValue;
    if (previousValue === nextValue) return false;
    if (!isInputControlled) inputValue = nextValue;
    publish();
    emit(
      createBehaviorEvent(
        "input-value-change",
        Object.freeze({
          value: nextValue,
          previousValue,
          isControlled: isInputControlled,
        }),
        reason,
      ),
    );
    return true;
  }

  function requestOpen(
    nextOpen: boolean,
    reason: BehaviorChangeReason,
  ): boolean {
    const previousOpen = open;
    if (previousOpen === nextOpen) return false;
    if (!isOpenControlled) open = nextOpen;
    if (!nextOpen) activeValue = null;
    publish();
    emit(
      createBehaviorEvent(
        "open-change",
        Object.freeze({
          open: nextOpen,
          previousOpen,
          isControlled: isOpenControlled,
        }),
        reason,
      ),
    );
    return true;
  }

  function setActive(
    nextActiveValue: TItem["value"] | null,
    reason: BehaviorChangeReason,
  ): boolean {
    if (nextActiveValue !== null) {
      const item = snapshot.filteredItems.find(
        (candidate) => candidate.value === nextActiveValue,
      );
      if (!item || item.disabled) return false;
    }
    const previousActiveValue = activeValue;
    if (previousActiveValue === nextActiveValue) return false;
    activeValue = nextActiveValue;
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

  snapshot = createSnapshot();

  const controller: AutocompleteController<TItem> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<AutocompleteSnapshot<TItem>>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    setInputValue(nextValue, reason = "user") {
      const changed = requestInput(nextValue, reason);
      if (changed && open && autoHighlight) {
        const first = snapshot.filteredItems.find((item) => !item.disabled);
        setActive(first?.value ?? null, reason);
      }
      return changed;
    },
    setOpen(nextOpen, setOpenOptions = {}) {
      const reason = setOpenOptions.reason ?? "programmatic";
      const changed = requestOpen(nextOpen, reason);
      if (nextOpen) {
        const enabled = snapshot.filteredItems.filter((item) => !item.disabled);
        const target =
          setOpenOptions.direction === -1
            ? enabled[enabled.length - 1]
            : enabled[0];
        if (autoHighlight || setOpenOptions.direction !== undefined) {
          setActive(target?.value ?? null, reason);
        }
      }
      return changed;
    },
    select(nextValue, reason = "selection") {
      const item = findItem(nextValue);
      if (!item || item.disabled) return false;
      const previousValue = value;
      const changed = previousValue !== nextValue;
      if (changed) {
        if (!isValueControlled) value = nextValue;
        publish();
        emit(
          createBehaviorEvent(
            "value-change",
            Object.freeze({
              value: nextValue,
              previousValue,
              item,
              isControlled: isValueControlled,
            }),
            reason,
          ),
        );
      }
      requestInput(item.label, reason);
      requestOpen(false, reason);
      return changed;
    },
    clear(reason = "clear") {
      const previousValue = value;
      const changed = previousValue !== null;
      if (changed) {
        if (!isValueControlled) value = null;
        publish();
        emit(
          createBehaviorEvent(
            "value-change",
            Object.freeze({
              value: null,
              previousValue,
              item: null,
              isControlled: isValueControlled,
            }),
            reason,
          ),
        );
      }
      requestInput("", reason);
      requestOpen(false, reason);
      return changed;
    },
    restoreInputValue(reason = "restore") {
      return requestInput(findItem(value)?.label ?? "", reason);
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
      if (sameItems(items, normalized)) return false;
      items = normalized;
      publish();
      emit(
        createBehaviorEvent(
          "items-change",
          Object.freeze({ items }),
          "collection-change",
        ),
      );
      return true;
    },
    setFilter(nextFilter) {
      if (filter === nextFilter) return false;
      filter = nextFilter;
      publish();
      return true;
    },
    syncValue(nextValue) {
      if (value === nextValue) return false;
      value = nextValue;
      publish();
      return true;
    },
    syncInputValue(nextValue) {
      if (inputValue === nextValue) return false;
      inputValue = nextValue;
      publish();
      return true;
    },
    syncOpen(nextOpen) {
      if (open === nextOpen) return false;
      open = nextOpen;
      publish();
      return true;
    },
    dispatch(command) {
      if (command.type === "set-input")
        controller.setInputValue(command.value, command.reason);
      else if (command.type === "set-open")
        controller.setOpen(command.open, {
          direction: command.direction,
          reason: command.reason,
        });
      else if (command.type === "select")
        controller.select(command.value, command.reason);
      else if (command.type === "clear") controller.clear(command.reason);
      else if (command.type === "move-active")
        controller.moveActive(command.intent, command.reason);
      else if (command.type === "set-active")
        controller.setActiveValue(command.value, command.reason);
      else if (command.type === "replace-items")
        controller.replaceItems(command.items);
      else if (command.type === "sync-value")
        controller.syncValue(command.value);
      else if (command.type === "sync-input")
        controller.syncInputValue(command.value);
      else controller.syncOpen(command.open);
    },
  };

  return controller;
}
