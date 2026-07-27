import {
  createBehaviorSnapshotChannel,
  type BehaviorController,
  type BehaviorListener,
} from "./controller";
import {
  createBehaviorEvent,
  createBehaviorEventChannel,
  type BehaviorEvent,
  type BehaviorEventListener,
  type BehaviorUnsubscribe,
} from "./events";

export type ToastDismissReason =
  "timeout" | "close-button" | "action" | "programmatic" | "dismiss-all";

export type ToastPauseReason = "hover" | "focus" | "programmatic";

export interface ToastBehaviorRecord<TPayload = unknown> {
  readonly id: string;
  readonly payload: TPayload;
  readonly duration: number | null;
  readonly dismissible: boolean;
  readonly createdAt: number;
  readonly paused: boolean;
}

export interface ToastBehaviorSnapshot<TPayload = unknown> {
  readonly records: readonly ToastBehaviorRecord<TPayload>[];
  readonly visibleRecords: readonly ToastBehaviorRecord<TPayload>[];
  readonly maxVisible: number;
  readonly newestOnTop: boolean;
  readonly revision: number;
}

export interface ToastBehaviorAddOptions<TPayload = unknown> {
  readonly id: string;
  readonly payload: TPayload;
  readonly duration?: number | null;
  readonly dismissible?: boolean;
  readonly createdAt?: number;
}

export interface ToastBehaviorUpdateOptions<TPayload = unknown> {
  readonly payload?: TPayload;
  readonly duration?: number | null;
  readonly dismissible?: boolean;
  readonly createdAt?: number;
}

export interface ToastBehaviorChangeDetail<TPayload = unknown> {
  readonly record: ToastBehaviorRecord<TPayload>;
}

export interface ToastBehaviorDismissDetail<TPayload = unknown> {
  readonly record: ToastBehaviorRecord<TPayload>;
}

export interface ToastBehaviorPauseDetail<TPayload = unknown> {
  readonly record: ToastBehaviorRecord<TPayload>;
  readonly paused: boolean;
}

export type ToastBehaviorEvent<TPayload = unknown> =
  | BehaviorEvent<"add", ToastBehaviorChangeDetail<TPayload>, "programmatic">
  | BehaviorEvent<"update", ToastBehaviorChangeDetail<TPayload>, "programmatic">
  | BehaviorEvent<
      "dismiss",
      ToastBehaviorDismissDetail<TPayload>,
      ToastDismissReason
    >
  | BehaviorEvent<"action", ToastBehaviorChangeDetail<TPayload>, "action">
  | BehaviorEvent<
      "pause-change",
      ToastBehaviorPauseDetail<TPayload>,
      ToastPauseReason
    >;

export interface ToastBehaviorControllerOptions<TPayload = unknown> {
  readonly defaultDuration?: number;
  readonly maxVisible?: number;
  readonly newestOnTop?: boolean;
  readonly onEvent?: BehaviorEventListener<ToastBehaviorEvent<TPayload>>;
}

export type ToastBehaviorCommand<TPayload = unknown> =
  | { readonly type: "add"; readonly toast: ToastBehaviorAddOptions<TPayload> }
  | {
      readonly type: "update";
      readonly id: string;
      readonly toast: ToastBehaviorUpdateOptions<TPayload>;
    }
  | {
      readonly type: "dismiss";
      readonly id: string;
      readonly reason?: ToastDismissReason;
    }
  | { readonly type: "dismiss-all" }
  | {
      readonly type: "pause";
      readonly id: string;
      readonly reason?: ToastPauseReason;
    }
  | {
      readonly type: "resume";
      readonly id: string;
      readonly reason?: ToastPauseReason;
    }
  | { readonly type: "action"; readonly id: string }
  | { readonly type: "set-max-visible"; readonly maxVisible: number }
  | { readonly type: "set-newest-on-top"; readonly newestOnTop: boolean };

export interface ToastBehaviorController<
  TPayload = unknown,
> extends BehaviorController<
  ToastBehaviorSnapshot<TPayload>,
  ToastBehaviorCommand<TPayload>
> {
  add(options: ToastBehaviorAddOptions<TPayload>): string;
  update(id: string, options: ToastBehaviorUpdateOptions<TPayload>): boolean;
  dismiss(id: string, reason?: ToastDismissReason): boolean;
  dismissAll(): boolean;
  pause(id: string, reason?: ToastPauseReason): boolean;
  resume(id: string, reason?: ToastPauseReason): boolean;
  triggerAction(id: string): boolean;
  setMaxVisible(maxVisible: number): boolean;
  setNewestOnTop(newestOnTop: boolean): boolean;
  subscribeEvent(
    listener: BehaviorEventListener<ToastBehaviorEvent<TPayload>>,
  ): BehaviorUnsubscribe;
}

export function resolveToastBehaviorDuration(
  duration: number | null | undefined,
  defaultDuration: number,
): number | null {
  return duration === undefined ? defaultDuration : duration;
}

export function getVisibleToastBehaviorRecords<TPayload>(
  records: readonly ToastBehaviorRecord<TPayload>[],
  maxVisible: number,
  newestOnTop: boolean,
): readonly ToastBehaviorRecord<TPayload>[] {
  const visible = records.slice(0, Math.max(0, maxVisible));
  return Object.freeze(newestOnTop ? [...visible].reverse() : [...visible]);
}

function freezeRecord<TPayload>(
  record: ToastBehaviorRecord<TPayload>,
): ToastBehaviorRecord<TPayload> {
  return Object.freeze({ ...record });
}

export function createToastController<TPayload = unknown>(
  options: ToastBehaviorControllerOptions<TPayload> = {},
): ToastBehaviorController<TPayload> {
  const defaultDuration = options.defaultDuration ?? 5000;
  let maxVisible = Math.max(0, options.maxVisible ?? 5);
  let newestOnTop = options.newestOnTop ?? false;
  let records: readonly ToastBehaviorRecord<TPayload>[] = Object.freeze([]);
  let revision = 0;
  let snapshot: ToastBehaviorSnapshot<TPayload>;

  const snapshots =
    createBehaviorSnapshotChannel<ToastBehaviorSnapshot<TPayload>>();
  const events = createBehaviorEventChannel<ToastBehaviorEvent<TPayload>>();

  function createSnapshot(): ToastBehaviorSnapshot<TPayload> {
    return Object.freeze({
      records,
      visibleRecords: getVisibleToastBehaviorRecords(
        records,
        maxVisible,
        newestOnTop,
      ),
      maxVisible,
      newestOnTop,
      revision,
    });
  }

  function publish(): void {
    revision += 1;
    snapshot = createSnapshot();
    snapshots.publish(snapshot);
  }

  function emit(event: ToastBehaviorEvent<TPayload>): void {
    events.emit(event);
    options.onEvent?.(event);
  }

  function findRecord(id: string): ToastBehaviorRecord<TPayload> | undefined {
    return records.find((record) => record.id === id);
  }

  snapshot = createSnapshot();

  const controller: ToastBehaviorController<TPayload> = {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: BehaviorListener<ToastBehaviorSnapshot<TPayload>>) {
      return snapshots.subscribe(listener);
    },
    subscribeEvent(listener) {
      return events.subscribe(listener);
    },
    add(addOptions) {
      const nextRecord = freezeRecord<TPayload>({
        id: addOptions.id,
        payload: addOptions.payload,
        duration: resolveToastBehaviorDuration(
          addOptions.duration,
          defaultDuration,
        ),
        dismissible: addOptions.dismissible ?? true,
        createdAt: addOptions.createdAt ?? Date.now(),
        paused: false,
      });
      const existingIndex = records.findIndex(
        (record) => record.id === addOptions.id,
      );
      records = Object.freeze(
        existingIndex < 0
          ? [...records, nextRecord]
          : records.map((record, index) =>
              index === existingIndex ? nextRecord : record,
            ),
      );
      publish();
      emit(
        createBehaviorEvent(
          existingIndex < 0 ? "add" : "update",
          Object.freeze({ record: nextRecord }),
          "programmatic",
        ) as ToastBehaviorEvent<TPayload>,
      );
      return addOptions.id;
    },
    update(id, updateOptions) {
      const current = findRecord(id);
      if (!current) return false;

      const nextRecord = freezeRecord<TPayload>({
        ...current,
        ...(updateOptions.payload === undefined
          ? {}
          : { payload: updateOptions.payload }),
        ...(updateOptions.duration === undefined
          ? {}
          : { duration: updateOptions.duration }),
        ...(updateOptions.dismissible === undefined
          ? {}
          : { dismissible: updateOptions.dismissible }),
        createdAt: updateOptions.createdAt ?? Date.now(),
      });
      records = Object.freeze(
        records.map((record) => (record.id === id ? nextRecord : record)),
      );
      publish();
      emit(
        createBehaviorEvent(
          "update",
          Object.freeze({ record: nextRecord }),
          "programmatic",
        ),
      );
      return true;
    },
    dismiss(id, reason = "programmatic") {
      const record = findRecord(id);
      if (!record) return false;

      records = Object.freeze(records.filter((item) => item.id !== id));
      publish();
      emit(createBehaviorEvent("dismiss", Object.freeze({ record }), reason));
      return true;
    },
    dismissAll() {
      if (records.length === 0) return false;
      const dismissed = records;
      records = Object.freeze([]);
      publish();
      for (const record of dismissed) {
        emit(
          createBehaviorEvent(
            "dismiss",
            Object.freeze({ record }),
            "dismiss-all",
          ),
        );
      }
      return true;
    },
    pause(id, reason = "programmatic") {
      const current = findRecord(id);
      if (!current || current.paused) return false;
      const record = freezeRecord({ ...current, paused: true });
      records = Object.freeze(
        records.map((item) => (item.id === id ? record : item)),
      );
      publish();
      emit(
        createBehaviorEvent(
          "pause-change",
          Object.freeze({ record, paused: true }),
          reason,
        ),
      );
      return true;
    },
    resume(id, reason = "programmatic") {
      const current = findRecord(id);
      if (!current || !current.paused) return false;
      const record = freezeRecord({ ...current, paused: false });
      records = Object.freeze(
        records.map((item) => (item.id === id ? record : item)),
      );
      publish();
      emit(
        createBehaviorEvent(
          "pause-change",
          Object.freeze({ record, paused: false }),
          reason,
        ),
      );
      return true;
    },
    triggerAction(id) {
      const record = findRecord(id);
      if (!record) return false;
      emit(createBehaviorEvent("action", Object.freeze({ record }), "action"));
      return true;
    },
    setMaxVisible(nextMaxVisible) {
      const normalized = Math.max(0, Math.trunc(nextMaxVisible));
      if (maxVisible === normalized) return false;
      maxVisible = normalized;
      publish();
      return true;
    },
    setNewestOnTop(nextNewestOnTop) {
      if (newestOnTop === nextNewestOnTop) return false;
      newestOnTop = nextNewestOnTop;
      publish();
      return true;
    },
    dispatch(command) {
      switch (command.type) {
        case "add":
          controller.add(command.toast);
          return;
        case "update":
          controller.update(command.id, command.toast);
          return;
        case "dismiss":
          controller.dismiss(command.id, command.reason);
          return;
        case "dismiss-all":
          controller.dismissAll();
          return;
        case "pause":
          controller.pause(command.id, command.reason);
          return;
        case "resume":
          controller.resume(command.id, command.reason);
          return;
        case "action":
          controller.triggerAction(command.id);
          return;
        case "set-max-visible":
          controller.setMaxVisible(command.maxVisible);
          return;
        case "set-newest-on-top":
          controller.setNewestOnTop(command.newestOnTop);
      }
    },
  };

  return controller;
}
