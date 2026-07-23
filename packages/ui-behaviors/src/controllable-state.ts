import {
  createBehaviorEvent,
  createBehaviorEventChannel,
  type BehaviorChangeReason,
  type BehaviorEvent,
  type BehaviorEventChannel,
  type BehaviorEventListener,
  type BehaviorUnsubscribe,
} from "./events";
import {
  createBehaviorSnapshotChannel,
  type BehaviorController,
  type BehaviorListener,
} from "./controller";

export type StateUpdater<TValue> = TValue | ((previousValue: TValue) => TValue);

export interface ControllableStateSnapshot<TValue> {
  readonly value: TValue;
  readonly isControlled: boolean;
  readonly revision: number;
}

export interface ControllableStateChangeDetail<TValue> {
  readonly value: TValue;
  readonly previousValue: TValue;
  readonly isControlled: boolean;
}

export type ControllableStateChangeEvent<TValue> = BehaviorEvent<
  "value-change",
  ControllableStateChangeDetail<TValue>
>;

export interface ControllableStateOptions<TValue> {
  readonly defaultValue: TValue;
  readonly value?: TValue;
  readonly equals?: (left: TValue, right: TValue) => boolean;
  readonly onChange?: BehaviorEventListener<
    ControllableStateChangeEvent<TValue>
  >;
}

export type ControllableStateCommand<TValue> =
  | {
      readonly type: "set";
      readonly value: StateUpdater<TValue>;
      readonly reason?: BehaviorChangeReason;
    }
  | {
      readonly type: "sync";
      readonly value: TValue;
    }
  | {
      readonly type: "reset";
      readonly reason?: BehaviorChangeReason;
    };

export interface ControllableStateController<TValue> extends BehaviorController<
  ControllableStateSnapshot<TValue>,
  ControllableStateCommand<TValue>
> {
  setValue(value: StateUpdater<TValue>, reason?: BehaviorChangeReason): boolean;
  syncValue(value: TValue): boolean;
  reset(reason?: BehaviorChangeReason): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<ControllableStateChangeEvent<TValue>>,
  ): BehaviorUnsubscribe;
}

function resolveUpdater<TValue>(
  updater: StateUpdater<TValue>,
  previousValue: TValue,
): TValue {
  return typeof updater === "function"
    ? (updater as (value: TValue) => TValue)(previousValue)
    : updater;
}

function freezeSnapshot<TValue>(
  value: TValue,
  isControlled: boolean,
  revision: number,
): ControllableStateSnapshot<TValue> {
  return Object.freeze({ value, isControlled, revision });
}

export function createControllableState<TValue>(
  options: ControllableStateOptions<TValue>,
): ControllableStateController<TValue> {
  const isControlled = Object.prototype.hasOwnProperty.call(options, "value");
  const equals = options.equals ?? Object.is;
  const initialValue = isControlled
    ? (options.value as TValue)
    : options.defaultValue;

  let snapshot = freezeSnapshot(initialValue, isControlled, 0);
  const snapshotChannel =
    createBehaviorSnapshotChannel<ControllableStateSnapshot<TValue>>();
  const eventChannel: BehaviorEventChannel<
    ControllableStateChangeEvent<TValue>
  > = createBehaviorEventChannel();

  function publishSnapshot(value: TValue): void {
    snapshot = freezeSnapshot(value, isControlled, snapshot.revision + 1);
    snapshotChannel.publish(snapshot);
  }

  function requestValue(
    updater: StateUpdater<TValue>,
    reason: BehaviorChangeReason,
  ): boolean {
    const previousValue = snapshot.value;
    const nextValue = resolveUpdater(updater, previousValue);
    if (equals(previousValue, nextValue)) return false;

    if (!isControlled) {
      publishSnapshot(nextValue);
    }

    const event = createBehaviorEvent(
      "value-change",
      Object.freeze({
        value: nextValue,
        previousValue,
        isControlled,
      }),
      reason,
    );
    eventChannel.emit(event);
    options.onChange?.(event);
    return true;
  }

  const controller: ControllableStateController<TValue> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<ControllableStateSnapshot<TValue>>) {
      return snapshotChannel.subscribe(listener);
    },
    subscribeEvent(listener) {
      return eventChannel.subscribe(listener);
    },
    setValue(value, reason = "programmatic") {
      return requestValue(value, reason);
    },
    syncValue(value) {
      if (equals(snapshot.value, value)) return false;
      publishSnapshot(value);
      return true;
    },
    reset(reason = "reset") {
      return requestValue(options.defaultValue, reason);
    },
    dispatch(command) {
      if (command.type === "set") {
        controller.setValue(command.value, command.reason);
        return;
      }
      if (command.type === "sync") {
        controller.syncValue(command.value);
        return;
      }
      controller.reset(command.reason);
    },
  };

  return controller;
}
