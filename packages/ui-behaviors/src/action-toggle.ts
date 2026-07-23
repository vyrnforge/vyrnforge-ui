import {
  createControllableState,
  type ControllableStateChangeEvent,
  type ControllableStateController,
} from "./controllable-state";
import type { BehaviorChangeReason, BehaviorEventListener } from "./events";

export interface ActionStateOptions {
  readonly disabled?: boolean;
  readonly loading?: boolean;
}

export interface ActionState {
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly interactive: boolean;
  readonly ariaBusy: true | undefined;
}

export function resolveActionState(
  options: ActionStateOptions = {},
): ActionState {
  const loading = options.loading === true;
  const disabled = options.disabled === true || loading;

  return Object.freeze({
    disabled,
    loading,
    interactive: !disabled,
    ariaBusy: loading ? true : undefined,
  });
}

export interface ToggleChangeDetail {
  readonly pressed: boolean;
  readonly previousPressed: boolean;
  readonly isControlled: boolean;
}

export interface ToggleControllerOptions {
  readonly defaultPressed?: boolean;
  readonly pressed?: boolean;
  readonly onPressedChange?: BehaviorEventListener<
    ControllableStateChangeEvent<boolean>
  >;
}

export interface ToggleController extends ControllableStateController<boolean> {
  isPressed(): boolean;
  setPressed(pressed: boolean, reason?: BehaviorChangeReason): boolean;
  toggle(reason?: BehaviorChangeReason): boolean;
  syncPressed(pressed: boolean): boolean;
}

export function createToggleController(
  options: ToggleControllerOptions = {},
): ToggleController {
  const state = createControllableState<boolean>({
    defaultValue: options.defaultPressed ?? false,
    ...(Object.prototype.hasOwnProperty.call(options, "pressed")
      ? { value: options.pressed as boolean }
      : {}),
    onChange: options.onPressedChange,
  });

  return Object.assign(state, {
    isPressed() {
      return state.getSnapshot().value;
    },
    setPressed(
      pressed: boolean,
      reason: BehaviorChangeReason = "programmatic",
    ) {
      return state.setValue(pressed, reason);
    },
    toggle(reason: BehaviorChangeReason = "user") {
      return state.setValue((pressed) => !pressed, reason);
    },
    syncPressed(pressed: boolean) {
      return state.syncValue(pressed);
    },
  });
}

export interface ToggleInputStateOptions {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
}

export interface ToggleInputState {
  readonly checked: boolean | undefined;
  readonly disabled: boolean;
  readonly interactive: boolean;
}

export function resolveToggleInputState(
  options: ToggleInputStateOptions = {},
): ToggleInputState {
  const disabled = options.disabled === true;
  return Object.freeze({
    checked: options.checked ?? options.defaultChecked,
    disabled,
    interactive: !disabled && options.readOnly !== true,
  });
}
