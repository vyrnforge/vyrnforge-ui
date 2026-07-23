export type BehaviorListener<TSnapshot> = (snapshot: TSnapshot) => void;
export type BehaviorUnsubscribe = () => void;

export interface BehaviorController<TSnapshot, TCommand = never> {
  getSnapshot(): TSnapshot;
  subscribe(listener: BehaviorListener<TSnapshot>): BehaviorUnsubscribe;
  dispatch(command: TCommand): void;
}

export interface BehaviorSnapshotChannel<TSnapshot> {
  subscribe(listener: BehaviorListener<TSnapshot>): BehaviorUnsubscribe;
  publish(snapshot: TSnapshot): void;
  clear(): void;
  listenerCount(): number;
}

export function createBehaviorSnapshotChannel<
  TSnapshot,
>(): BehaviorSnapshotChannel<TSnapshot> {
  const listeners = new Set<BehaviorListener<TSnapshot>>();

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
    publish(snapshot) {
      for (const listener of [...listeners]) {
        listener(snapshot);
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
