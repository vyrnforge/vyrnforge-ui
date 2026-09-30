import {
  createToastService,
  type ToastBehaviorSnapshot,
  type ToastDismissReason,
  type ToastPauseReason,
  type ToastService,
  type ToastServiceOptions,
} from "@vyrnforge/ui-behaviors";

export type VyrnForgeToastServiceTone =
  "neutral" | "info" | "success" | "warning" | "error";

export interface VyrnForgeToastServicePayload {
  readonly title?: string;
  readonly description?: string;
  readonly tone: VyrnForgeToastServiceTone;
  readonly actionLabel?: string;
}

export interface VyrnForgeToastServiceOptions extends Omit<
  ToastServiceOptions<VyrnForgeToastServicePayload>,
  "createId"
> {
  readonly createId?: () => string;
}

export interface VyrnForgeToastServiceRecord {
  readonly id?: string;
  readonly title?: string;
  readonly description?: string;
  readonly tone?: VyrnForgeToastServiceTone;
  readonly duration?: number | null;
  readonly dismissible?: boolean;
  readonly actionLabel?: string;
  readonly createdAt?: number;
}

export type VyrnForgeToastShortcutRecord = Omit<
  VyrnForgeToastServiceRecord,
  "tone"
>;

export interface VyrnForgeToastService {
  readonly behavior: ToastService<VyrnForgeToastServicePayload>;
  getSnapshot(): ToastBehaviorSnapshot<VyrnForgeToastServicePayload>;
  toast(record: VyrnForgeToastServiceRecord): string;
  success(record: VyrnForgeToastShortcutRecord): string;
  error(record: VyrnForgeToastShortcutRecord): string;
  warning(record: VyrnForgeToastShortcutRecord): string;
  info(record: VyrnForgeToastShortcutRecord): string;
  update(id: string, record: Partial<VyrnForgeToastServiceRecord>): boolean;
  dismiss(id: string, reason?: ToastDismissReason): boolean;
  dismissAll(): boolean;
  pause(id: string, reason?: ToastPauseReason): boolean;
  resume(id: string, reason?: ToastPauseReason): boolean;
  triggerAction(id: string): boolean;
  start(): void;
  stop(): void;
  destroy(): void;
}

let toastServiceId = 0;

function createDefaultId(): string {
  toastServiceId += 1;
  return `vf-toast-${toastServiceId}`;
}

export function createVyrnForgeToastService(
  options: VyrnForgeToastServiceOptions = {},
): VyrnForgeToastService {
  const behavior = createToastService<VyrnForgeToastServicePayload>({
    ...options,
    createId: options.createId ?? createDefaultId,
  });

  function toast(record: VyrnForgeToastServiceRecord): string {
    return behavior.add({
      id: record.id,
      payload: {
        actionLabel: record.actionLabel,
        description: record.description,
        title: record.title,
        tone: record.tone ?? "neutral",
      },
      createdAt: record.createdAt,
      dismissible: record.dismissible,
      duration: record.duration,
    });
  }

  function shortcut(
    tone: VyrnForgeToastServiceTone,
    record: VyrnForgeToastShortcutRecord,
  ): string {
    return toast({ ...record, tone });
  }

  return Object.freeze({
    behavior,
    getSnapshot: () => behavior.getSnapshot(),
    toast,
    success: (record: VyrnForgeToastShortcutRecord) =>
      shortcut("success", record),
    error: (record: VyrnForgeToastShortcutRecord) =>
      shortcut("error", record),
    warning: (record: VyrnForgeToastShortcutRecord) =>
      shortcut("warning", record),
    info: (record: VyrnForgeToastShortcutRecord) =>
      shortcut("info", record),
    update(id: string, record: Partial<VyrnForgeToastServiceRecord>) {
      const current = behavior
        .getSnapshot()
        .records.find((item) => item.id === id);
      if (!current) return false;
      return behavior.update(id, {
        payload: {
          ...current.payload,
          ...(record.actionLabel === undefined
            ? {}
            : { actionLabel: record.actionLabel }),
          ...(record.description === undefined
            ? {}
            : { description: record.description }),
          ...(record.title === undefined ? {} : { title: record.title }),
          ...(record.tone === undefined ? {} : { tone: record.tone }),
        },
        createdAt: record.createdAt,
        dismissible: record.dismissible,
        duration: record.duration,
      });
    },
    dismiss: (id: string, reason?: ToastDismissReason) =>
      behavior.dismiss(id, reason),
    dismissAll: () => behavior.dismissAll(),
    pause: (id: string, reason?: ToastPauseReason) =>
      behavior.pause(id, reason),
    resume: (id: string, reason?: ToastPauseReason) =>
      behavior.resume(id, reason),
    triggerAction: (id: string) => behavior.triggerAction(id),
    start: () => behavior.start(),
    stop: () => behavior.stop(),
    destroy: () => behavior.destroy(),
  });
}

export {
  createToastService,
  type ToastService,
  type ToastServiceOptions,
  type ToastServiceScheduler,
} from "@vyrnforge/ui-behaviors";
