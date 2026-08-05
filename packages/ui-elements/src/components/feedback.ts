import {
  createConfirmDialogController,
  createToastController,
  type ConfirmDialogController,
  type ToastBehaviorController,
} from "@vyrnforge/ui-behaviors";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";
import type { VyrnForgeDialogElement } from "./overlays";

export type VyrnForgeToastTone =
  "neutral" | "info" | "success" | "warning" | "error";
export type VyrnForgeToastPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";
export type VyrnForgeConfirmDialogVariant = "default" | "danger";

export interface VyrnForgeToastRecord {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly tone?: VyrnForgeToastTone;
  readonly duration?: number | null;
  readonly dismissible?: boolean;
  readonly actionLabel?: string;
  readonly createdAt?: number;
}

interface ToastPayload {
  readonly title?: string;
  readonly description?: string;
  readonly tone: VyrnForgeToastTone;
  readonly actionLabel?: string;
}

export class VyrnForgeToastElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      actionLabel: {
        attribute: "action-label",
        reflect: true,
        type: "string",
      },
      description: { reflect: true, type: "string" },
      dismissible: { reflect: true, type: "boolean" },
      toastId: { attribute: "toast-id", reflect: true, type: "string" },
      title: { reflect: true, type: "string" },
      tone: { reflect: true, type: "string" },
    });

  get actionLabel(): string {
    return this.getPropertyValue("actionLabel", "");
  }
  set actionLabel(value: string) {
    this.setPropertyValue("actionLabel", String(value));
  }
  get description(): string {
    return this.getPropertyValue("description", "");
  }
  set description(value: string) {
    this.setPropertyValue("description", String(value));
  }
  get dismissible(): boolean {
    return this.getPropertyValue("dismissible", true);
  }
  set dismissible(value: boolean) {
    this.setPropertyValue("dismissible", Boolean(value));
  }
  get toastId(): string {
    return this.getPropertyValue("toastId", "");
  }
  set toastId(value: string) {
    this.setPropertyValue("toastId", String(value));
  }
  get title(): string {
    return this.getPropertyValue("title", "");
  }
  set title(value: string) {
    this.setPropertyValue("title", String(value));
  }
  get tone(): VyrnForgeToastTone {
    return this.getPropertyValue("tone", "neutral");
  }
  set tone(value: VyrnForgeToastTone) {
    this.setPropertyValue("tone", value);
  }

  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;
    this.applyManagedClasses(["vf-toast", `vf-toast--${this.tone}`]);
    this.setAttribute("role", this.tone === "error" ? "alert" : "status");
    this.setAttribute(
      "aria-live",
      this.tone === "error" ? "assertive" : "polite",
    );
    const icon = document.createElement("span");
    icon.className = "vf-toast__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = this.resolveIcon();
    const content = document.createElement("div");
    content.className = "vf-toast__content";
    if (this.title) {
      const title = document.createElement("div");
      title.className = "vf-toast__title";
      title.textContent = this.title;
      content.append(title);
    }
    if (this.description) {
      const description = document.createElement("div");
      description.className = "vf-toast__description";
      description.textContent = this.description;
      content.append(description);
    }
    const nodes: Node[] = [icon, content];
    if (this.actionLabel) {
      const action = document.createElement("button");
      action.type = "button";
      action.className =
        "vf-toast__action vf-button vf-button--subtle vf-button--sm";
      action.textContent = this.actionLabel;
      action.addEventListener("click", () => {
        this.dispatchTypedEvent("vf-action", {
          action: "toast-action",
          id: this.toastId,
          reason: "action",
        });
      });
      nodes.push(action);
    }
    if (this.dismissible) {
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "vf-toast__dismiss vf-icon-button";
      dismiss.setAttribute("aria-label", "Dismiss notification");
      dismiss.textContent = "×";
      dismiss.addEventListener("click", () => {
        this.dispatchTypedEvent("vf-dismiss", {
          id: this.toastId,
          reason: "close-button",
        });
      });
      nodes.push(dismiss);
    }
    this.replaceChildren(...nodes);
    this.setAttribute("data-vf-element", "");
  }

  private resolveIcon(): string {
    if (this.tone === "success") return "✓";
    if (this.tone === "warning") return "!";
    if (this.tone === "error") return "×";
    if (this.tone === "info") return "i";
    return "•";
  }
}

export class VyrnForgeToastViewportElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      defaultDuration: {
        attribute: "default-duration",
        reflect: true,
        type: "number",
      },
      label: { reflect: true, type: "string" },
      maxVisible: {
        attribute: "max-visible",
        reflect: true,
        type: "number",
      },
      newestOnTop: {
        attribute: "newest-on-top",
        reflect: true,
        type: "boolean",
      },
      position: { reflect: true, type: "string" },
      records: { attribute: false },
    });

  #controller: ToastBehaviorController<ToastPayload> = this.createController();
  readonly #timers = new Map<string, ReturnType<typeof setTimeout>>();

  get defaultDuration(): number {
    return this.getPropertyValue("defaultDuration", 5000);
  }
  set defaultDuration(value: number) {
    this.setPropertyValue("defaultDuration", Math.max(0, Number(value)));
  }
  get label(): string {
    return this.getPropertyValue("label", "Notifications");
  }
  set label(value: string) {
    this.setPropertyValue("label", String(value));
  }
  get maxVisible(): number {
    return this.getPropertyValue("maxVisible", 5);
  }
  set maxVisible(value: number) {
    const normalized = Math.max(0, Math.trunc(Number(value)));
    this.#controller.setMaxVisible(normalized);
    this.setPropertyValue("maxVisible", normalized);
  }
  get newestOnTop(): boolean {
    return this.getPropertyValue("newestOnTop", false);
  }
  set newestOnTop(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.setNewestOnTop(normalized);
    this.setPropertyValue("newestOnTop", normalized);
  }
  get position(): VyrnForgeToastPosition {
    return this.getPropertyValue("position", "bottom-end");
  }
  set position(value: VyrnForgeToastPosition) {
    this.setPropertyValue("position", value);
  }
  get records(): readonly VyrnForgeToastRecord[] {
    return this.getPropertyValue("records", Object.freeze([]));
  }
  set records(value: readonly VyrnForgeToastRecord[]) {
    const normalized = Object.freeze([...(value ?? [])]);
    this.#controller.dismissAll();
    for (const record of normalized) this.add(record);
    this.setPropertyValue("records", normalized);
  }

  add(record: VyrnForgeToastRecord): string {
    const id =
      record.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.#controller.add({
      id,
      payload: {
        actionLabel: record.actionLabel,
        description: record.description,
        title: record.title,
        tone: record.tone ?? "neutral",
      },
      duration: record.duration,
      dismissible: record.dismissible,
      createdAt: record.createdAt,
    });
    this.scheduleDismiss(id);
    this.syncRecords();
    this.dispatchTypedEvent("vf-toast-change", { action: "add", id });
    return id;
  }

  dismiss(id: string, reason = "programmatic"): boolean {
    this.clearTimer(id);
    const changed = this.#controller.dismiss(id, reason as "programmatic");
    if (!changed) return false;
    this.syncRecords();
    this.dispatchTypedEvent("vf-dismiss", { id, reason });
    return true;
  }

  dismissAll(): void {
    for (const id of this.#timers.keys()) this.clearTimer(id);
    if (this.#controller.dismissAll()) {
      this.syncRecords();
      this.dispatchTypedEvent("vf-toast-change", { action: "dismiss-all" });
    }
  }

  updateToast(id: string, update: Partial<VyrnForgeToastRecord>): boolean {
    const current = this.#controller
      .getSnapshot()
      .records.find((record) => record.id === id);
    if (!current) return false;
    const changed = this.#controller.update(id, {
      payload: {
        ...current.payload,
        ...(update.actionLabel === undefined
          ? {}
          : { actionLabel: update.actionLabel }),
        ...(update.description === undefined
          ? {}
          : { description: update.description }),
        ...(update.title === undefined ? {} : { title: update.title }),
        ...(update.tone === undefined ? {} : { tone: update.tone }),
      },
      duration: update.duration,
      dismissible: update.dismissible,
      createdAt: update.createdAt,
    });
    if (changed) {
      this.scheduleDismiss(id);
      this.syncRecords();
      this.dispatchTypedEvent("vf-toast-change", { action: "update", id });
    }
    return changed;
  }

  protected override disconnected(): void {
    for (const id of this.#timers.keys()) this.clearTimer(id);
  }

  protected override update(): void {
    this.#controller.setMaxVisible(this.maxVisible);
    this.#controller.setNewestOnTop(this.newestOnTop);
    this.applyManagedClasses([
      "vf-toast-viewport",
      `vf-toast-viewport--${this.position}`,
    ]);
    this.setAttribute("aria-label", this.label);
    const document = this.resolveDocument();
    if (!document) return;
    const nodes = this.#controller
      .getSnapshot()
      .visibleRecords.map((record) => {
        const toast = document.createElement(
          "vf-toast",
        ) as VyrnForgeToastElement;
        toast.toastId = record.id;
        toast.title = record.payload.title ?? "";
        toast.description = record.payload.description ?? "";
        toast.tone = record.payload.tone;
        toast.actionLabel = record.payload.actionLabel ?? "";
        toast.dismissible = record.dismissible;
        toast.addEventListener("vf-dismiss", () =>
          this.dismiss(record.id, "close-button"),
        );
        toast.addEventListener("vf-action", () => {
          this.#controller.triggerAction(record.id);
          this.dispatchTypedEvent("vf-action", {
            action: "toast-action",
            id: record.id,
          });
        });
        toast.addEventListener("mouseenter", () => {
          this.clearTimer(record.id);
          this.#controller.pause(record.id, "hover");
        });
        toast.addEventListener("mouseleave", () => {
          this.#controller.resume(record.id, "hover");
          this.scheduleDismiss(record.id);
        });
        return toast;
      });
    this.replaceChildren(...nodes);
    this.hidden = nodes.length === 0;
    this.setAttribute("data-vf-element", "");
  }

  private createController(): ToastBehaviorController<ToastPayload> {
    return createToastController<ToastPayload>({
      defaultDuration: this.defaultDuration,
      maxVisible: this.maxVisible,
      newestOnTop: this.newestOnTop,
    });
  }

  private scheduleDismiss(id: string): void {
    this.clearTimer(id);
    const record = this.#controller
      .getSnapshot()
      .records.find((item) => item.id === id);
    if (!record || record.duration === null || record.paused) return;
    this.#timers.set(
      id,
      setTimeout(() => this.dismiss(id, "timeout"), record.duration),
    );
  }

  private clearTimer(id: string): void {
    const timer = this.#timers.get(id);
    if (timer) clearTimeout(timer);
    this.#timers.delete(id);
  }

  private syncRecords(): void {
    const records = Object.freeze(
      this.#controller.getSnapshot().records.map((record) =>
        Object.freeze({
          id: record.id,
          ...record.payload,
          createdAt: record.createdAt,
          dismissible: record.dismissible,
          duration: record.duration,
        }),
      ),
    );
    this.setPropertyValue("records", records);
    this.requestUpdate();
  }
}

export class VyrnForgeConfirmDialogElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      cancelLabel: {
        attribute: "cancel-label",
        reflect: true,
        type: "string",
      },
      confirmLabel: {
        attribute: "confirm-label",
        reflect: true,
        type: "string",
      },
      description: { reflect: true, type: "string" },
      disabled: { reflect: true, type: "boolean" },
      loading: { reflect: true, type: "boolean" },
      open: { reflect: true, type: "boolean" },
      title: { reflect: true, type: "string" },
      variant: { reflect: true, type: "string" },
    });

  readonly #controller: ConfirmDialogController =
    createConfirmDialogController();

  get cancelLabel(): string {
    return this.getPropertyValue("cancelLabel", "Cancel");
  }
  set cancelLabel(value: string) {
    this.setPropertyValue("cancelLabel", String(value));
  }
  get confirmLabel(): string {
    return this.getPropertyValue("confirmLabel", "Confirm");
  }
  set confirmLabel(value: string) {
    this.setPropertyValue("confirmLabel", String(value));
  }
  get description(): string {
    return this.getPropertyValue("description", "");
  }
  set description(value: string) {
    this.setPropertyValue("description", String(value));
  }
  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    this.setPropertyValue("disabled", Boolean(value));
  }
  get loading(): boolean {
    return this.getPropertyValue("loading", false);
  }
  set loading(value: boolean) {
    this.setPropertyValue("loading", Boolean(value));
  }
  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.syncOpen(normalized);
    this.setPropertyValue("open", normalized);
  }
  get title(): string {
    return this.getPropertyValue("title", "");
  }
  set title(value: string) {
    this.setPropertyValue("title", String(value));
  }
  get variant(): VyrnForgeConfirmDialogVariant {
    return this.getPropertyValue("variant", "default");
  }
  set variant(value: VyrnForgeConfirmDialogVariant) {
    this.setPropertyValue("variant", value);
  }

  cancel(): void {
    this.#controller.setState(this.loading, this.disabled);
    if (!this.#controller.cancel()) return;
    this.open = false;
    this.dispatchTypedEvent("vf-cancel", { reason: "cancel" });
    this.dispatchTypedEvent("vf-open-change", {
      open: false,
      reason: "cancel",
    });
  }

  confirm(): void {
    this.#controller.setState(this.loading, this.disabled);
    if (!this.#controller.confirm()) return;
    this.dispatchTypedEvent("vf-confirm", { reason: "confirm" });
  }

  protected override update(): void {
    this.#controller.setState(this.loading, this.disabled);
    this.#controller.syncOpen(this.open);
    const document = this.resolveDocument();
    if (!document) return;
    const dialog = document.createElement(
      "vf-dialog",
    ) as VyrnForgeDialogElement;
    dialog.classList.add("vf-confirm-dialog");
    dialog.open = this.open;
    dialog.title = this.title;
    dialog.description = this.description;
    dialog.size = "sm";
    dialog.closeOnEscape = !this.loading;
    dialog.closeOnOutsidePointer = !this.loading;
    dialog.addEventListener("vf-open-change", (event) => {
      const detail = (event as CustomEvent<{ open: boolean; reason?: string }>)
        .detail;
      if (!detail.open && this.open) {
        this.open = false;
        this.dispatchTypedEvent("vf-open-change", detail);
      }
    });
    const actions = document.createElement("div");
    actions.className = "vf-confirm-dialog__actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "vf-button vf-button--subtle vf-button--md";
    cancel.textContent = this.cancelLabel;
    cancel.disabled = this.loading || this.disabled;
    cancel.addEventListener("click", () => this.cancel());
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = `vf-button vf-button--${this.variant === "danger" ? "danger" : "primary"} vf-button--md`;
    confirm.textContent = this.loading ? "Working..." : this.confirmLabel;
    confirm.disabled = this.loading || this.disabled;
    confirm.addEventListener("click", () => this.confirm());
    actions.append(cancel, confirm);
    dialog.append(actions);
    this.replaceChildren(dialog);
    this.setAttribute("data-vf-element", "");
  }
}
