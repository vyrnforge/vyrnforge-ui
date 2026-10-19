import {
  createSelectionController,
  type SelectionChangeEvent,
  type SelectionController,
  type SelectionMode,
} from "./selection";
import type { BehaviorEventListener } from "./events";

export type ToggleGroupValue<TKey extends string = string> =
  TKey | readonly TKey[];

export interface ToggleGroupControllerOptions<TKey extends string = string> {
  readonly type?: "single" | "multiple";
  readonly value?: ToggleGroupValue<TKey>;
  readonly defaultValue?: ToggleGroupValue<TKey>;
  readonly allowEmpty?: boolean;
  readonly onValueChange?: BehaviorEventListener<SelectionChangeEvent<TKey>>;
}

export interface ToggleGroupController<
  TKey extends string = string,
> extends SelectionController<TKey> {
  getValue(): TKey | readonly TKey[];
  syncValue(value: ToggleGroupValue<TKey>): boolean;
}

function normalizeValue<TKey extends string>(
  value: ToggleGroupValue<TKey> | undefined,
  mode: SelectionMode,
): readonly TKey[] {
  if (Array.isArray(value)) {
    return mode === "single" ? value.slice(0, 1) : value;
  }
  return value === undefined || value === "" ? [] : [value as TKey];
}

export function createToggleGroupController<TKey extends string = string>(
  options: ToggleGroupControllerOptions<TKey> = {},
): ToggleGroupController<TKey> {
  const mode: SelectionMode =
    options.type === "multiple" ? "multiple" : "single";
  const controller = createSelectionController<TKey>({
    mode,
    allowEmpty: options.allowEmpty ?? true,
    defaultSelectedKeys: normalizeValue(options.defaultValue, mode),
    ...(Object.prototype.hasOwnProperty.call(options, "value")
      ? { selectedKeys: normalizeValue(options.value, mode) }
      : {}),
    onSelectionChange: options.onValueChange,
  });

  return Object.assign(controller, {
    getValue() {
      const keys = controller.getSnapshot().selectedKeys;
      return mode === "multiple" ? keys : (keys[0] ?? "");
    },
    syncValue(value: ToggleGroupValue<TKey>) {
      return controller.syncSelectedKeys(normalizeValue(value, mode));
    },
  });
}
