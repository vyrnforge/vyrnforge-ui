export const behaviorChangeReasons = [
  "user",
  "programmatic",
  "keyboard",
  "pointer",
  "selection",
  "collection-change",
  "clear",
  "reset",
  "restore",
] as const;

export type BehaviorChangeReason = (typeof behaviorChangeReasons)[number];

export interface BehaviorEvent<
  TType extends string = string,
  TDetail = unknown,
  TReason extends string = BehaviorChangeReason,
> {
  readonly type: TType;
  readonly detail: TDetail;
  readonly reason: TReason;
}

export type BehaviorEventListener<TEvent extends BehaviorEvent> = (
  event: TEvent,
) => void;

export interface BehaviorEventChannel<TEvent extends BehaviorEvent> {
  subscribe(listener: BehaviorEventListener<TEvent>): BehaviorUnsubscribe;
  emit(event: TEvent): void;
  clear(): void;
  listenerCount(): number;
}

export type BehaviorUnsubscribe = () => void;

export function createBehaviorEvent<
  TType extends string,
  TDetail,
  TReason extends string = BehaviorChangeReason,
>(
  type: TType,
  detail: TDetail,
  reason: TReason,
): BehaviorEvent<TType, TDetail, TReason> {
  return Object.freeze({ type, detail, reason });
}

export function createBehaviorEventChannel<
  TEvent extends BehaviorEvent,
>(): BehaviorEventChannel<TEvent> {
  const listeners = new Set<BehaviorEventListener<TEvent>>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      let active = true;

      return () => {
        if (!active) return;
        active = false;
        listeners.delete(listener);
      };
    },
    emit(event) {
      for (const listener of [...listeners]) {
        listener(event);
      }
    },
    clear() {
      listeners.clear();
    },
    listenerCount() {
      return listeners.size;
    },
  };
}
