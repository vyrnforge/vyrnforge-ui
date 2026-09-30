import type { BehaviorListener } from "./controller";
import type {
  BehaviorEventListener,
  BehaviorUnsubscribe,
} from "./events";
import {
  createToastController,
  type ToastBehaviorAddOptions,
  type ToastBehaviorController,
  type ToastBehaviorControllerOptions,
  type ToastBehaviorEvent,
  type ToastBehaviorSnapshot,
  type ToastBehaviorUpdateOptions,
  type ToastDismissReason,
  type ToastPauseReason,
} from "./toast";

export interface ToastServiceScheduler {
  now(): number;
  setTimeout(callback: () => void, delay: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface ToastServiceOptions<TPayload = unknown>
  extends ToastBehaviorControllerOptions<TPayload> {
  readonly createId?: () => string;
  readonly scheduler?: ToastServiceScheduler;
}

export interface ToastServiceAddOptions<TPayload = unknown>
  extends Omit<ToastBehaviorAddOptions<TPayload>, "id"> {
  readonly id?: string;
}

export interface ToastService<TPayload = unknown> {
  readonly controller: ToastBehaviorController<TPayload>;
  getSnapshot(): ToastBehaviorSnapshot<TPayload>;
  subscribe(
    listener: BehaviorListener<ToastBehaviorSnapshot<TPayload>>,
  ): BehaviorUnsubscribe;
  subscribeEvent(
    listener: BehaviorEventListener<ToastBehaviorEvent<TPayload>>,
  ): BehaviorUnsubscribe;
  add(options: ToastServiceAddOptions<TPayload>): string;
  update(id: string, options: ToastBehaviorUpdateOptions<TPayload>): boolean;
  dismiss(id: string, reason?: ToastDismissReason): boolean;
  dismissAll(): boolean;
  pause(id: string, reason?: ToastPauseReason): boolean;
  resume(id: string, reason?: ToastPauseReason): boolean;
  triggerAction(id: string): boolean;
  setMaxVisible(maxVisible: number): boolean;
  setNewestOnTop(newestOnTop: boolean): boolean;
  start(): void;
  stop(): void;
  destroy(): void;
}

interface TimerState {
  readonly handle: unknown;
  readonly startedAt: number;
  readonly remaining: number;
}

function createDefaultScheduler(): ToastServiceScheduler {
  const runtime = globalThis as unknown as {
    setTimeout?: (callback: () => void, delay: number) => unknown;
    clearTimeout?: (handle: unknown) => void;
  };
  if (!runtime.setTimeout || !runtime.clearTimeout) {
    throw new Error("Toast service requires timer scheduling support.");
  }
  return {
    now: () => Date.now(),
    setTimeout: runtime.setTimeout.bind(globalThis),
    clearTimeout: runtime.clearTimeout.bind(globalThis),
  };
}

let generatedToastId = 0;

function createDefaultToastId(): string {
  generatedToastId += 1;
  return `toast-${Date.now()}-${generatedToastId}`;
}

export function createToastService<TPayload = unknown>(
  options: ToastServiceOptions<TPayload> = {},
): ToastService<TPayload> {
  const scheduler = options.scheduler ?? createDefaultScheduler();
  const createId = options.createId ?? createDefaultToastId;
  const controller = createToastController<TPayload>({
    defaultDuration: options.defaultDuration,
    maxVisible: options.maxVisible,
    newestOnTop: options.newestOnTop,
    onEvent: options.onEvent,
  });
  const timers = new Map<string, TimerState>();
  const pausedRemaining = new Map<string, number>();
  let active = true;
  let destroyed = false;

  function clearTimer(id: string): void {
    const timer = timers.get(id);
    if (timer) scheduler.clearTimeout(timer.handle);
    timers.delete(id);
  }

  function remainingForTimer(timer: TimerState): number {
    return Math.max(
      0,
      timer.remaining - (scheduler.now() - timer.startedAt),
    );
  }

  function schedule(id: string, remaining: number): void {
    clearTimer(id);
    if (remaining <= 0) {
      controller.dismiss(id, "timeout");
      return;
    }
    const handle = scheduler.setTimeout(() => {
      timers.delete(id);
      pausedRemaining.delete(id);
      controller.dismiss(id, "timeout");
    }, remaining);
    timers.set(id, {
      handle,
      remaining,
      startedAt: scheduler.now(),
    });
  }

  function reconcileTimers(snapshot: ToastBehaviorSnapshot<TPayload>): void {
    if (destroyed || !active) return;
    const visibleIds = new Set(
      snapshot.visibleRecords.map((record) => record.id),
    );

    for (const id of timers.keys()) {
      if (!visibleIds.has(id)) clearTimer(id);
    }
    for (const id of pausedRemaining.keys()) {
      if (!snapshot.records.some((record) => record.id === id)) {
        pausedRemaining.delete(id);
      }
    }

    for (const record of snapshot.visibleRecords) {
      if (
        record.duration === null ||
        record.duration <= 0 ||
        record.paused ||
        timers.has(record.id) ||
        pausedRemaining.has(record.id)
      ) {
        continue;
      }
      schedule(record.id, record.duration);
    }
  }

  const unsubscribeSnapshot = controller.subscribe(reconcileTimers);

  const service: ToastService<TPayload> = {
    controller,
    getSnapshot: () => controller.getSnapshot(),
    subscribe: (listener) => controller.subscribe(listener),
    subscribeEvent: (listener) => controller.subscribeEvent(listener),
    add(addOptions) {
      const id = addOptions.id ?? createId();
      controller.add({
        ...addOptions,
        id,
        createdAt: addOptions.createdAt ?? scheduler.now(),
      });
      reconcileTimers(controller.getSnapshot());
      return id;
    },
    update(id, updateOptions) {
      const changed = controller.update(id, {
        ...updateOptions,
        createdAt: updateOptions.createdAt ?? scheduler.now(),
      });
      if (!changed) return false;
      clearTimer(id);
      pausedRemaining.delete(id);
      reconcileTimers(controller.getSnapshot());
      return true;
    },
    dismiss(id, reason = "programmatic") {
      clearTimer(id);
      pausedRemaining.delete(id);
      const changed = controller.dismiss(id, reason);
      if (changed) reconcileTimers(controller.getSnapshot());
      return changed;
    },
    dismissAll() {
      for (const id of timers.keys()) clearTimer(id);
      pausedRemaining.clear();
      return controller.dismissAll();
    },
    pause(id, reason = "programmatic") {
      const timer = timers.get(id);
      if (timer) {
        pausedRemaining.set(id, remainingForTimer(timer));
        clearTimer(id);
      }
      return controller.pause(id, reason);
    },
    resume(id, reason = "programmatic") {
      const changed = controller.resume(id, reason);
      if (!changed) return false;
      const remaining = pausedRemaining.get(id);
      pausedRemaining.delete(id);
      if (remaining !== undefined) {
        schedule(id, remaining);
      } else {
        reconcileTimers(controller.getSnapshot());
      }
      return true;
    },
    triggerAction: (id) => controller.triggerAction(id),
    setMaxVisible(maxVisible) {
      const changed = controller.setMaxVisible(maxVisible);
      if (changed) reconcileTimers(controller.getSnapshot());
      return changed;
    },
    setNewestOnTop(newestOnTop) {
      const changed = controller.setNewestOnTop(newestOnTop);
      if (changed) reconcileTimers(controller.getSnapshot());
      return changed;
    },
    start() {
      if (destroyed || active) return;
      active = true;
      reconcileTimers(controller.getSnapshot());
    },
    stop() {
      if (destroyed || !active) return;
      active = false;
      for (const id of timers.keys()) clearTimer(id);
    },
    destroy() {
      if (destroyed) return;
      service.stop();
      destroyed = true;
      unsubscribeSnapshot();
      pausedRemaining.clear();
    },
  };

  reconcileTimers(controller.getSnapshot());
  return service;
}
