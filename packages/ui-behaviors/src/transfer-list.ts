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

export type TransferListPanel = "source" | "target";

export interface TransferListItem<TKey extends string = string> {
  readonly value: TKey;
  readonly label: string;
  readonly keywords?: readonly string[];
  readonly disabled?: boolean;
  readonly order?: number;
}

export type TransferListFilterFunction<
  TItem extends TransferListItem = TransferListItem,
> = (
  items: readonly TItem[],
  query: string,
  panel: TransferListPanel,
) => readonly TItem[];

export interface TransferListSnapshot<
  TItem extends TransferListItem = TransferListItem,
> {
  readonly items: readonly TItem[];
  readonly sourceItems: readonly TItem[];
  readonly targetItems: readonly TItem[];
  readonly visibleSourceItems: readonly TItem[];
  readonly visibleTargetItems: readonly TItem[];
  readonly targetValues: readonly TItem["value"][];
  readonly sourceSelectedValues: readonly TItem["value"][];
  readonly targetSelectedValues: readonly TItem["value"][];
  readonly sourceActiveValue: TItem["value"] | null;
  readonly targetActiveValue: TItem["value"] | null;
  readonly sourceQuery: string;
  readonly targetQuery: string;
  readonly isControlled: boolean;
  readonly revision: number;
}

export type TransferListControllerEvent<
  TItem extends TransferListItem = TransferListItem,
> =
  | BehaviorEvent<
      "value-change",
      {
        readonly targetValues: readonly TItem["value"][];
        readonly previousTargetValues: readonly TItem["value"][];
        readonly targetItems: readonly TItem[];
        readonly isControlled: boolean;
      }
    >
  | BehaviorEvent<
      "selection-change",
      {
        readonly source: readonly TItem["value"][];
        readonly target: readonly TItem["value"][];
      }
    >
  | BehaviorEvent<
      "query-change",
      {
        readonly panel: TransferListPanel;
        readonly query: string;
        readonly previousQuery: string;
      }
    >
  | BehaviorEvent<
      "active-change",
      {
        readonly panel: TransferListPanel;
        readonly activeValue: TItem["value"] | null;
        readonly previousActiveValue: TItem["value"] | null;
      }
    >;

export interface TransferListControllerOptions<
  TItem extends TransferListItem = TransferListItem,
> {
  readonly items?: readonly TItem[];
  readonly value?: readonly TItem["value"][];
  readonly defaultValue?: readonly TItem["value"][];
  readonly clearSelectionAfterMove?: boolean;
  readonly filter?: TransferListFilterFunction<TItem>;
  readonly onEvent?: BehaviorEventListener<TransferListControllerEvent<TItem>>;
}

export type TransferListCommand<
  TItem extends TransferListItem = TransferListItem,
> =
  | {
      readonly type: "toggle-selection";
      readonly panel: TransferListPanel;
      readonly value: TItem["value"];
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "select-visible";
      readonly panel: TransferListPanel;
      readonly selected: boolean;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-selected";
      readonly to: TransferListPanel;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-all";
      readonly to: TransferListPanel;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "set-query";
      readonly panel: TransferListPanel;
      readonly query: string;
    }
  | {
      readonly type: "set-active";
      readonly panel: TransferListPanel;
      readonly value: TItem["value"] | null;
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "replace-items"; readonly items: readonly TItem[] }
  | { readonly type: "set-clear-selection-after-move"; readonly clear: boolean }
  | { readonly type: "sync-value"; readonly value: readonly TItem["value"][] };

export interface TransferListController<
  TItem extends TransferListItem = TransferListItem,
> extends BehaviorController<
  TransferListSnapshot<TItem>,
  TransferListCommand<TItem>
> {
  toggleSelection(
    panel: TransferListPanel,
    value: TItem["value"],
    reason?: BehaviorChangeReason,
  ): boolean;
  setVisibleSelected(
    panel: TransferListPanel,
    selected: boolean,
    reason?: BehaviorChangeReason,
  ): boolean;
  moveSelected(to: TransferListPanel, reason?: BehaviorChangeReason): boolean;
  moveAll(to: TransferListPanel, reason?: BehaviorChangeReason): boolean;
  setQuery(panel: TransferListPanel, query: string): boolean;
  setActiveValue(
    panel: TransferListPanel,
    value: TItem["value"] | null,
    reason?: BehaviorChangeReason,
  ): boolean;
  replaceItems(items: readonly TItem[]): boolean;
  setFilter(filter: TransferListFilterFunction<TItem>): boolean;
  setClearSelectionAfterMove(clear: boolean): boolean;
  syncValue(value: readonly TItem["value"][]): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<TransferListControllerEvent<TItem>>,
  ): BehaviorUnsubscribe;
}

export function defaultTransferListBehaviorFilter<
  TItem extends TransferListItem,
>(
  items: readonly TItem[],
  query: string,
  _panel: TransferListPanel,
): readonly TItem[] {
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

export function uniqueTransferListItems<TItem extends TransferListItem>(
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

export function normalizeTransferListValues<TItem extends TransferListItem>(
  values: readonly TItem["value"][] | undefined,
  items: readonly TItem[],
): readonly TItem["value"][] {
  if (!values || values.length === 0) return Object.freeze([]);
  const requested = new Set(values);
  return Object.freeze(
    items.filter((item) => requested.has(item.value)).map((item) => item.value),
  );
}

export function partitionTransferListItems<TItem extends TransferListItem>(
  items: readonly TItem[],
  targetValues: readonly TItem["value"][],
) {
  const target = new Set(targetValues);
  return Object.freeze({
    sourceItems: Object.freeze(items.filter((item) => !target.has(item.value))),
    targetItems: Object.freeze(items.filter((item) => target.has(item.value))),
  });
}

export function enabledTransferListValues<TItem extends TransferListItem>(
  items: readonly TItem[],
): readonly TItem["value"][] {
  return Object.freeze(
    items.filter((item) => !item.disabled).map((item) => item.value),
  );
}

export function selectedEnabledTransferListValues<
  TItem extends TransferListItem,
>(
  selectedValues: readonly TItem["value"][],
  items: readonly TItem[],
): readonly TItem["value"][] {
  const enabled = new Set(enabledTransferListValues(items));
  return Object.freeze(selectedValues.filter((value) => enabled.has(value)));
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

function panelValues<TItem extends TransferListItem>(
  values: readonly TItem["value"][],
  items: readonly TItem[],
) {
  const available = new Set(items.map((item) => item.value));
  return Object.freeze(values.filter((value) => available.has(value)));
}

export function createTransferListController<TItem extends TransferListItem>(
  options: TransferListControllerOptions<TItem> = {},
): TransferListController<TItem> {
  const isControlled = Object.prototype.hasOwnProperty.call(options, "value");
  let clearSelectionAfterMove = options.clearSelectionAfterMove ?? true;
  let items = uniqueTransferListItems(options.items ?? []);
  let targetValues = normalizeTransferListValues(
    isControlled ? options.value : options.defaultValue,
    items,
  );
  let sourceSelectedValues: readonly TItem["value"][] = Object.freeze([]);
  let targetSelectedValues: readonly TItem["value"][] = Object.freeze([]);
  let sourceActiveValue: TItem["value"] | null = null;
  let targetActiveValue: TItem["value"] | null = null;
  let sourceQuery = "";
  let targetQuery = "";
  let filter: TransferListFilterFunction<TItem> =
    options.filter ?? defaultTransferListBehaviorFilter;
  let revision = 0;
  let snapshot: TransferListSnapshot<TItem>;

  const snapshots =
    createBehaviorSnapshotChannel<TransferListSnapshot<TItem>>();
  const events =
    createBehaviorEventChannel<TransferListControllerEvent<TItem>>();

  function partitions() {
    return partitionTransferListItems(items, targetValues);
  }

  function createSnapshot(): TransferListSnapshot<TItem> {
    const { sourceItems, targetItems } = partitions();
    sourceSelectedValues = panelValues(sourceSelectedValues, sourceItems);
    targetSelectedValues = panelValues(targetSelectedValues, targetItems);
    if (!sourceItems.some((item) => item.value === sourceActiveValue)) {
      sourceActiveValue = null;
    }
    if (!targetItems.some((item) => item.value === targetActiveValue)) {
      targetActiveValue = null;
    }

    return Object.freeze({
      items,
      sourceItems,
      targetItems,
      visibleSourceItems: Object.freeze([
        ...filter(sourceItems, sourceQuery, "source"),
      ]),
      visibleTargetItems: Object.freeze([
        ...filter(targetItems, targetQuery, "target"),
      ]),
      targetValues,
      sourceSelectedValues,
      targetSelectedValues,
      sourceActiveValue,
      targetActiveValue,
      sourceQuery,
      targetQuery,
      isControlled,
      revision,
    });
  }

  function publish() {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: TransferListControllerEvent<TItem>) {
    events.emit(event);
    options.onEvent?.(event);
  }

  function emitSelection(reason: BehaviorChangeReason) {
    emit(
      createBehaviorEvent(
        "selection-change",
        Object.freeze({
          source: sourceSelectedValues,
          target: targetSelectedValues,
        }),
        reason,
      ),
    );
  }

  function requestTargetValues(
    nextValuesInput: readonly TItem["value"][],
    reason: BehaviorChangeReason,
  ) {
    const nextValues = normalizeTransferListValues(nextValuesInput, items);
    const previousTargetValues = targetValues;
    if (sameValues(previousTargetValues, nextValues)) return false;
    if (!isControlled) targetValues = nextValues;
    publish();
    const nextTargetItems = items.filter((item) =>
      nextValues.includes(item.value),
    );
    emit(
      createBehaviorEvent(
        "value-change",
        Object.freeze({
          targetValues: nextValues,
          previousTargetValues,
          targetItems: Object.freeze(nextTargetItems),
          isControlled,
        }),
        reason,
      ),
    );
    return true;
  }

  function setSelection(
    panel: TransferListPanel,
    nextValues: readonly TItem["value"][],
    reason: BehaviorChangeReason,
  ) {
    const normalized = Object.freeze([...new Set(nextValues)]);
    const current =
      panel === "source" ? sourceSelectedValues : targetSelectedValues;
    if (sameValues(current, normalized)) return false;
    if (panel === "source") sourceSelectedValues = normalized;
    else targetSelectedValues = normalized;
    publish();
    emitSelection(reason);
    return true;
  }

  snapshot = createSnapshot();

  const controller: TransferListController<TItem> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<TransferListSnapshot<TItem>>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    toggleSelection(panel, value, reason = "selection") {
      const panelItems =
        panel === "source" ? snapshot.sourceItems : snapshot.targetItems;
      const item = panelItems.find((candidate) => candidate.value === value);
      if (!item || item.disabled) return false;
      const current =
        panel === "source" ? sourceSelectedValues : targetSelectedValues;
      return setSelection(
        panel,
        current.includes(value)
          ? current.filter((candidate) => candidate !== value)
          : [...current, value],
        reason,
      );
    },
    setVisibleSelected(panel, selected, reason = "selection") {
      const visible =
        panel === "source"
          ? snapshot.visibleSourceItems
          : snapshot.visibleTargetItems;
      const visibleValues = enabledTransferListValues(visible);
      const visibleSet = new Set(visibleValues);
      const current =
        panel === "source" ? sourceSelectedValues : targetSelectedValues;
      const nextValues = selected
        ? [...new Set([...current, ...visibleValues])]
        : current.filter((value) => !visibleSet.has(value));
      return setSelection(panel, nextValues, reason);
    },
    moveSelected(to, reason = "selection") {
      const from = to === "target" ? "source" : "target";
      const fromItems =
        from === "source" ? snapshot.sourceItems : snapshot.targetItems;
      const fromSelected =
        from === "source" ? sourceSelectedValues : targetSelectedValues;
      const moving = selectedEnabledTransferListValues(fromSelected, fromItems);
      if (moving.length === 0) return false;
      const movingSet = new Set(moving);
      const nextTargetValues =
        to === "target"
          ? normalizeTransferListValues([...targetValues, ...moving], items)
          : normalizeTransferListValues(
              targetValues.filter((value) => !movingSet.has(value)),
              items,
            );
      const changed = requestTargetValues(nextTargetValues, reason);
      if (changed && clearSelectionAfterMove) {
        if (from === "source") {
          sourceSelectedValues = Object.freeze(
            sourceSelectedValues.filter((value) => !movingSet.has(value)),
          );
        } else {
          targetSelectedValues = Object.freeze(
            targetSelectedValues.filter((value) => !movingSet.has(value)),
          );
        }
        publish();
        emitSelection(reason);
      }
      return changed;
    },
    moveAll(to, reason = "selection") {
      const fromItems =
        to === "target" ? snapshot.sourceItems : snapshot.targetItems;
      const moving = enabledTransferListValues(fromItems);
      if (moving.length === 0) return false;
      const movingSet = new Set(moving);
      const nextTargetValues =
        to === "target"
          ? normalizeTransferListValues([...targetValues, ...moving], items)
          : normalizeTransferListValues(
              targetValues.filter((value) => !movingSet.has(value)),
              items,
            );
      const changed = requestTargetValues(nextTargetValues, reason);
      if (changed) {
        if (to === "target") {
          sourceSelectedValues = Object.freeze(
            sourceSelectedValues.filter((value) => !movingSet.has(value)),
          );
        } else {
          targetSelectedValues = Object.freeze(
            targetSelectedValues.filter((value) => !movingSet.has(value)),
          );
        }
        publish();
        emitSelection(reason);
      }
      return changed;
    },
    setQuery(panel, nextQuery) {
      const previousQuery = panel === "source" ? sourceQuery : targetQuery;
      if (previousQuery === nextQuery) return false;
      if (panel === "source") sourceQuery = nextQuery;
      else targetQuery = nextQuery;
      publish();
      emit(
        createBehaviorEvent(
          "query-change",
          Object.freeze({ panel, query: nextQuery, previousQuery }),
          "user",
        ),
      );
      return true;
    },
    setActiveValue(panel, nextValue, reason = "programmatic") {
      if (nextValue !== null) {
        const panelItems =
          panel === "source" ? snapshot.sourceItems : snapshot.targetItems;
        const item = panelItems.find(
          (candidate) => candidate.value === nextValue,
        );
        if (!item || item.disabled) return false;
      }
      const previousActiveValue =
        panel === "source" ? sourceActiveValue : targetActiveValue;
      if (previousActiveValue === nextValue) return false;
      if (panel === "source") sourceActiveValue = nextValue;
      else targetActiveValue = nextValue;
      publish();
      emit(
        createBehaviorEvent(
          "active-change",
          Object.freeze({
            panel,
            activeValue: nextValue,
            previousActiveValue,
          }),
          reason,
        ),
      );
      return true;
    },
    replaceItems(nextItems) {
      const normalized = uniqueTransferListItems(nextItems);
      const same =
        items.length === normalized.length &&
        items.every(
          (item, index) =>
            item.value === normalized[index]?.value &&
            item.label === normalized[index]?.label &&
            item.disabled === normalized[index]?.disabled &&
            item.order === normalized[index]?.order &&
            item.keywords === normalized[index]?.keywords,
        );
      if (same) return false;
      items = normalized;
      targetValues = normalizeTransferListValues(targetValues, items);
      publish();
      return true;
    },
    setFilter(nextFilter) {
      if (filter === nextFilter) return false;
      filter = nextFilter;
      publish();
      return true;
    },
    setClearSelectionAfterMove(clear) {
      if (clearSelectionAfterMove === clear) return false;
      clearSelectionAfterMove = clear;
      return true;
    },
    syncValue(nextValue) {
      const normalized = normalizeTransferListValues(nextValue, items);
      if (sameValues(targetValues, normalized)) return false;
      targetValues = normalized;
      publish();
      return true;
    },
    dispatch(command) {
      if (command.type === "toggle-selection")
        controller.toggleSelection(
          command.panel,
          command.value,
          command.reason,
        );
      else if (command.type === "select-visible")
        controller.setVisibleSelected(
          command.panel,
          command.selected,
          command.reason,
        );
      else if (command.type === "move-selected")
        controller.moveSelected(command.to, command.reason);
      else if (command.type === "move-all")
        controller.moveAll(command.to, command.reason);
      else if (command.type === "set-query")
        controller.setQuery(command.panel, command.query);
      else if (command.type === "set-active")
        controller.setActiveValue(command.panel, command.value, command.reason);
      else if (command.type === "replace-items")
        controller.replaceItems(command.items);
      else if (command.type === "set-clear-selection-after-move")
        controller.setClearSelectionAfterMove(command.clear);
      else controller.syncValue(command.value);
    },
  };

  return controller;
}
