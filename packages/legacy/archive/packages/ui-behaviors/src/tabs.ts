import {
  createChoiceController,
  type ChoiceController,
  type ChoiceControllerEvent,
  type ChoiceItem,
  type ChoiceSnapshot,
} from "./choice";
import type {
  BehaviorChangeReason,
  BehaviorEventListener,
  BehaviorUnsubscribe,
} from "./events";
import type { CollectionMoveIntent } from "./collection";

export interface TabsItem {
  readonly id: string;
  readonly disabled?: boolean;
}

export interface TabsControllerOptions {
  readonly items: readonly TabsItem[];
  readonly value?: string;
  readonly defaultValue?: string;
  readonly activationMode?: "automatic" | "manual";
  readonly loop?: boolean;
  readonly onEvent?: BehaviorEventListener<ChoiceControllerEvent<string>>;
}

export interface TabsSnapshot extends ChoiceSnapshot<string> {
  readonly selectedValue: string;
  readonly focusedValue: string | null;
  readonly activationMode: "automatic" | "manual";
}

export type TabsCommand =
  | {
      readonly type: "select";
      readonly value: string;
      readonly reason?: BehaviorChangeReason;
    }
  | { readonly type: "sync"; readonly value: string }
  | { readonly type: "replace-items"; readonly items: readonly TabsItem[] }
  | {
      readonly type: "set-focused";
      readonly value: string | null;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "move-focus";
      readonly intent: CollectionMoveIntent;
      readonly reason?: BehaviorChangeReason;
    };

export interface TabsController {
  getSnapshot(): TabsSnapshot;
  subscribe(listener: (snapshot: TabsSnapshot) => void): BehaviorUnsubscribe;
  subscribeEvent(
    listener: BehaviorEventListener<ChoiceControllerEvent<string>>,
  ): BehaviorUnsubscribe;
  select(value: string, reason?: BehaviorChangeReason): boolean;
  syncValue(value: string): boolean;
  replaceItems(items: readonly TabsItem[]): boolean;
  setFocusedValue(value: string | null, reason?: BehaviorChangeReason): boolean;
  moveFocus(
    intent: CollectionMoveIntent,
    reason?: BehaviorChangeReason,
  ): string | null;
  isDisabled(value: string): boolean;
  dispatch(command: TabsCommand): void;
}

function toChoiceItems(
  items: readonly TabsItem[],
): readonly ChoiceItem<string>[] {
  return items.map((item, order) => ({
    value: item.id,
    disabled: item.disabled,
    order,
  }));
}

function firstEnabled(items: readonly TabsItem[]): string {
  return items.find((item) => item.disabled !== true)?.id ?? "";
}

export function createTabsController(
  options: TabsControllerOptions,
): TabsController {
  const activationMode = options.activationMode ?? "automatic";
  const initialValue = options.defaultValue ?? firstEnabled(options.items);
  const choice: ChoiceController<string> = createChoiceController({
    items: toChoiceItems(options.items),
    defaultValue: initialValue,
    ...(Object.prototype.hasOwnProperty.call(options, "value")
      ? { value: options.value as string }
      : {}),
    activeValue:
      (Object.prototype.hasOwnProperty.call(options, "value")
        ? options.value
        : initialValue) ?? null,
    loop: options.loop ?? true,
    allowEmpty: false,
    onEvent: options.onEvent,
  });

  let sourceSnapshot: ChoiceSnapshot<string> | null = null;
  let tabsSnapshot: TabsSnapshot | null = null;

  function mapSnapshot(): TabsSnapshot {
    const nextSourceSnapshot = choice.getSnapshot();

    if (sourceSnapshot === nextSourceSnapshot && tabsSnapshot !== null) {
      return tabsSnapshot;
    }

    sourceSnapshot = nextSourceSnapshot;
    tabsSnapshot = Object.freeze({
      ...nextSourceSnapshot,
      selectedValue: nextSourceSnapshot.value ?? "",
      focusedValue: nextSourceSnapshot.activeValue,
      activationMode,
    });

    return tabsSnapshot;
  }

  return {
    getSnapshot: mapSnapshot,
    subscribe(listener) {
      return choice.subscribe(() => listener(mapSnapshot()));
    },
    subscribeEvent(listener) {
      return choice.subscribeEvent(listener);
    },
    select(value, reason = "selection") {
      return choice.select(value, reason);
    },
    syncValue(value) {
      return choice.syncValue(value);
    },
    replaceItems(items) {
      return choice.replaceItems(toChoiceItems(items));
    },
    setFocusedValue(value, reason = "programmatic") {
      return choice.setActiveValue(value, reason);
    },
    moveFocus(intent, reason = "keyboard") {
      return choice.moveActive(intent, {
        select: activationMode === "automatic",
        reason,
      });
    },
    isDisabled(value) {
      return choice.isDisabled(value);
    },
    dispatch(command) {
      if (command.type === "select") {
        choice.select(command.value, command.reason);
        return;
      }
      if (command.type === "sync") {
        choice.syncValue(command.value);
        return;
      }
      if (command.type === "replace-items") {
        choice.replaceItems(toChoiceItems(command.items));
        return;
      }
      if (command.type === "set-focused") {
        choice.setActiveValue(command.value, command.reason);
        return;
      }
      choice.moveActive(command.intent, {
        select: activationMode === "automatic",
        reason: command.reason,
      });
    },
  };
}
