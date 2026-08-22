import {
  createDialogController,
  createDrawerController,
  createNavigationController,
  createPopoverController,
  createTooltipController,
  type NavigationController,
  type OverlayComponentController,
  type OverlayDismissReason,
  type OverlayPlacement,
} from "@vyrnforge/ui-behaviors";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

let overlaySequence = 0;

export type VyrnForgeDialogSize = "sm" | "md" | "lg" | "xl";
export type VyrnForgeDrawerSide = "left" | "right" | "top" | "bottom";
export type VyrnForgeDrawerSize = "sm" | "md" | "lg";
export type VyrnForgePopoverAlign = "start" | "center" | "end";
export type VyrnForgeMenuSize = "sm" | "md" | "lg";
export type VyrnForgeTooltipPlacement = "top" | "bottom" | "left" | "right";

export interface VyrnForgeMenuItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly danger?: boolean;
  readonly selected?: boolean;
  readonly shortcut?: string;
}

interface OverlayElementConfig {
  readonly baseClass: "vf-dialog" | "vf-drawer";
  readonly createController: () => OverlayComponentController;
  readonly modal: boolean;
}

abstract class VyrnForgeModalOverlayElement extends VyrnForgeDomElement {
  static readonly overlayConfig: OverlayElementConfig = {
    baseClass: "vf-dialog",
    createController: () => createDialogController(),
    modal: true,
  };
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      closeOnEscape: {
        attribute: "close-on-escape",
        reflect: true,
        type: "boolean",
      },
      closeOnOutsidePointer: {
        attribute: "close-on-outside-pointer",
        reflect: true,
        type: "boolean",
      },
      description: { reflect: true, type: "string" },
      disabled: { reflect: true, type: "boolean" },
      modal: { reflect: true, type: "boolean" },
      open: { reflect: true, type: "boolean" },
      size: { reflect: true, type: "string" },
      title: { reflect: true, type: "string" },
    });

  readonly #contentId = `vf-overlay-content-${++overlaySequence}`;
  readonly #descriptionId = `${this.#contentId}-description`;
  readonly #titleId = `${this.#contentId}-title`;
  readonly #controller = this.overlayConfig.createController();
  #backdrop: HTMLDivElement | null = null;
  #body: HTMLDivElement | null = null;
  #surface: HTMLDivElement | null = null;
  #trigger: HTMLElement | null = null;
  #childObserver: MutationObserver | null = null;
  #previousFocus: HTMLElement | null = null;

  get closeOnEscape(): boolean {
    return this.getPropertyValue("closeOnEscape", true);
  }
  set closeOnEscape(value: boolean) {
    this.setPropertyValue("closeOnEscape", Boolean(value));
  }

  get closeOnOutsidePointer(): boolean {
    return this.getPropertyValue("closeOnOutsidePointer", true);
  }
  set closeOnOutsidePointer(value: boolean) {
    this.setPropertyValue("closeOnOutsidePointer", Boolean(value));
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
    this.#controller.setDisabled(Boolean(value));
    this.setPropertyValue("disabled", Boolean(value));
  }

  get modal(): boolean {
    return this.getPropertyValue("modal", this.overlayConfig.modal);
  }
  set modal(value: boolean) {
    const normalized = this.overlayConfig.modal ? true : Boolean(value);
    this.#controller.setModal(normalized);
    this.setPropertyValue("modal", normalized);
  }

  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.syncOpen(normalized);
    this.setPropertyValue("open", normalized);
  }

  get size(): string {
    return this.getPropertyValue("size", "md");
  }
  set size(value: string) {
    this.setPropertyValue("size", String(value));
  }

  get title(): string {
    return this.getPropertyValue("title", "");
  }
  set title(value: string) {
    this.setPropertyValue("title", String(value));
  }

  close(reason: OverlayDismissReason = "programmatic"): void {
    this.requestOpen(false, reason);
  }

  show(): void {
    this.requestOpen(true, "programmatic");
  }

  override focus(options?: FocusOptions): void {
    this.#surface?.focus(options);
  }

  protected override connected(): void {
    this.ensureScaffold();
    this.#childObserver = new MutationObserver(() => this.requestUpdate());
    this.#childObserver.observe(this, { childList: true });
    this.addEventListener("keydown", this.handleKeyDown);
  }

  protected override disconnected(): void {
    this.#childObserver?.disconnect();
    this.#childObserver = null;
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  protected override update(): void {
    const scaffold = this.ensureScaffold();
    if (!scaffold) return;
    this.reconcileExternalNodes(scaffold);
    this.#controller.setDisabled(this.disabled);
    this.#controller.setModal(this.modal);
    this.#controller.syncOpen(this.open);
    const config = this.overlayConfig;
    this.applyManagedClasses([
      `${config.baseClass}-root`,
      this.open && `${config.baseClass}-root--open`,
    ]);
    scaffold.backdrop.hidden = !this.open;
    scaffold.surface.className = [
      config.baseClass,
      `${config.baseClass}--${this.size}`,
      this.overlayModifierClass(),
    ]
      .filter(Boolean)
      .join(" ");
    scaffold.surface.id = this.#contentId;
    scaffold.surface.setAttribute("role", "dialog");
    scaffold.surface.setAttribute("aria-modal", String(this.modal));
    scaffold.surface.tabIndex = -1;
    scaffold.title.textContent = this.title;
    scaffold.title.hidden = !this.title;
    scaffold.description.textContent = this.description;
    scaffold.description.hidden = !this.description;
    if (this.title)
      scaffold.surface.setAttribute("aria-labelledby", this.#titleId);
    else scaffold.surface.removeAttribute("aria-labelledby");
    if (this.description)
      scaffold.surface.setAttribute("aria-describedby", this.#descriptionId);
    else scaffold.surface.removeAttribute("aria-describedby");
    scaffold.backdrop.setAttribute("aria-hidden", String(!this.open));
    const triggerControl = this.resolveTriggerControl();
    this.#trigger?.removeAttribute("aria-controls");
    this.#trigger?.removeAttribute("aria-expanded");
    this.#trigger?.removeAttribute("aria-haspopup");
    triggerControl?.setAttribute("aria-controls", this.#contentId);
    triggerControl?.setAttribute("aria-expanded", String(this.open));
    triggerControl?.setAttribute("aria-haspopup", "dialog");
    this.setAttribute("data-vf-element", "");

    if (this.open && !this.#previousFocus) {
      this.#previousFocus = this.resolveDocument()
        ?.activeElement as HTMLElement | null;
      queueMicrotask(() => this.focusFirst());
    } else if (!this.open && this.#previousFocus) {
      const previous = this.#previousFocus;
      this.#previousFocus = null;
      queueMicrotask(() => previous.focus());
    }
  }

  protected overlayModifierClass(): string {
    return "";
  }

  private get overlayConfig(): OverlayElementConfig {
    return (this.constructor as typeof VyrnForgeModalOverlayElement)
      .overlayConfig;
  }

  private reconcileExternalNodes(scaffold: {
    backdrop: HTMLDivElement;
    body: HTMLDivElement;
    description: HTMLParagraphElement;
    surface: HTMLDivElement;
    title: HTMLHeadingElement;
  }): void {
    const externalNodes = [...this.childNodes].filter(
      (node) =>
        !(
          node instanceof Element &&
          node.hasAttribute("data-vf-overlay-internal")
        ),
    );
    if (externalNodes.length === 0) return;

    const triggerContainer = this.querySelector<HTMLElement>(
      `:scope > .${this.overlayConfig.baseClass}__trigger`,
    );
    const header = scaffold.surface.querySelector<HTMLElement>(
      `.${this.overlayConfig.baseClass}__header`,
    );
    const actions = scaffold.surface.querySelector<HTMLElement>(
      `.${this.overlayConfig.baseClass}__actions`,
    );
    const footer = scaffold.surface.querySelector<HTMLElement>(
      `.${this.overlayConfig.baseClass}__footer`,
    );
    const close = scaffold.surface.querySelector<HTMLElement>(
      `.${this.overlayConfig.baseClass}__close`,
    );

    for (const node of externalNodes) {
      const slot = node instanceof Element ? node.getAttribute("slot") : null;
      if (node instanceof Element) node.removeAttribute("slot");

      if (
        slot === "trigger" &&
        node instanceof HTMLElement &&
        triggerContainer
      ) {
        this.#trigger?.removeEventListener("click", this.handleTriggerClick);
        this.#trigger = node;
        this.#trigger.addEventListener("click", this.handleTriggerClick);
        triggerContainer.replaceChildren(node);
      } else if (slot === "header" && header) {
        if (close) header.insertBefore(node, close);
        else header.append(node);
      } else if (slot === "actions" && actions) {
        actions.hidden = false;
        actions.append(node);
      } else if (slot === "footer" && footer) {
        footer.hidden = false;
        footer.append(node);
      } else {
        scaffold.body.append(node);
      }
    }
  }

  private ensureScaffold(): {
    backdrop: HTMLDivElement;
    body: HTMLDivElement;
    description: HTMLParagraphElement;
    surface: HTMLDivElement;
    title: HTMLHeadingElement;
  } | null {
    if (
      this.#backdrop?.isConnected &&
      this.#surface?.isConnected &&
      this.#body?.isConnected
    ) {
      const title = this.#surface.querySelector<HTMLHeadingElement>(
        "[data-vf-overlay-title]",
      );
      const description = this.#surface.querySelector<HTMLParagraphElement>(
        "[data-vf-overlay-description]",
      );
      if (title && description) {
        return {
          backdrop: this.#backdrop,
          body: this.#body,
          description,
          surface: this.#surface,
          title,
        };
      }
    }
    const document = this.resolveDocument();
    if (!document) return null;
    const externalNodes = [...this.childNodes].filter(
      (node) =>
        !(
          node instanceof Element &&
          node.hasAttribute("data-vf-overlay-internal")
        ),
    );
    const trigger = externalNodes.find(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node.getAttribute("slot") === "trigger",
    );
    const headerNodes: Node[] = [];
    const contentNodes: Node[] = [];
    const actionNodes: Node[] = [];
    const footerNodes: Node[] = [];
    for (const node of externalNodes) {
      if (node === trigger) continue;
      const slot =
        node instanceof Element ? node.getAttribute("slot") : undefined;
      if (slot === "header") headerNodes.push(node);
      else if (slot === "actions") actionNodes.push(node);
      else if (slot === "footer") footerNodes.push(node);
      else contentNodes.push(node);
    }
    const clearSlot = (node: Node) => {
      if (node instanceof Element) node.removeAttribute("slot");
      return node;
    };
    const triggerContainer = document.createElement("span");
    triggerContainer.className = `${this.overlayConfig.baseClass}__trigger`;
    triggerContainer.dataset.vfOverlayInternal = "";
    if (trigger) {
      trigger.removeAttribute("slot");
      trigger.addEventListener("click", this.handleTriggerClick);
      triggerContainer.append(trigger);
    }
    const backdrop = document.createElement("div");
    backdrop.className = `${this.overlayConfig.baseClass}__backdrop`;
    backdrop.dataset.vfOverlayInternal = "";
    backdrop.addEventListener("pointerdown", this.handleBackdropPointer);
    const surface = document.createElement("div");
    surface.dataset.vfOverlayInternal = "";
    const header = document.createElement("header");
    header.className = `${this.overlayConfig.baseClass}__header`;
    const title = document.createElement("h2");
    title.id = this.#titleId;
    title.className = `${this.overlayConfig.baseClass}__title`;
    title.dataset.vfOverlayTitle = "";
    const close = document.createElement("button");
    close.type = "button";
    close.className = `${this.overlayConfig.baseClass}__close vf-icon-button`;
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    close.addEventListener("click", () => this.close("close-button"));
    header.append(title);
    for (const node of headerNodes) header.append(clearSlot(node));
    header.append(close);
    const description = document.createElement("p");
    description.id = this.#descriptionId;
    description.className = `${this.overlayConfig.baseClass}__description`;
    description.dataset.vfOverlayDescription = "";
    const body = document.createElement("div");
    body.className = `${this.overlayConfig.baseClass}__body`;
    body.dataset.vfOverlayBody = "";
    for (const node of contentNodes) body.append(clearSlot(node));
    const actions = document.createElement("div");
    actions.className = `${this.overlayConfig.baseClass}__actions`;
    actions.dataset.vfOverlayInternal = "";
    for (const node of actionNodes) actions.append(clearSlot(node));
    actions.hidden = actionNodes.length === 0;
    const footer = document.createElement("footer");
    footer.className = `${this.overlayConfig.baseClass}__footer`;
    footer.dataset.vfOverlayInternal = "";
    for (const node of footerNodes) footer.append(clearSlot(node));
    footer.hidden = footerNodes.length === 0;
    surface.append(header, description, body, actions, footer);
    backdrop.append(surface);
    this.replaceChildren(triggerContainer, backdrop);
    this.#backdrop = backdrop;
    this.#surface = surface;
    this.#body = body;
    this.#trigger = trigger ?? null;
    return { backdrop, body, description, surface, title };
  }

  private requestOpen(nextOpen: boolean, reason: string): void {
    const previousOpen = this.open;
    if (
      !nextOpen &&
      previousOpen &&
      reason !== "programmatic" &&
      !this.dispatchTypedEvent(
        "vf-dismiss",
        {
          id: this.id || undefined,
          reason: reason as OverlayDismissReason,
        },
        { cancelable: true },
      )
    ) {
      return;
    }
    const changed = nextOpen
      ? this.#controller.setOpen(true, reason as "programmatic")
      : this.#controller.dismiss(reason as OverlayDismissReason);
    if (!changed && previousOpen === nextOpen) return;
    this.setPropertyValue("open", nextOpen);
    this.dispatchTypedEvent("vf-open-change", {
      open: nextOpen,
      previousOpen,
      reason,
    });
  }

  private focusFirst(): void {
    if (!this.open) return;
    const focusable = this.#surface?.querySelector<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? this.#surface)?.focus();
  }

  private resolveTriggerControl(): HTMLElement | null {
    const trigger = this.#trigger;
    if (!trigger) return null;
    if (
      trigger.matches(
        'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]',
      )
    ) {
      return trigger;
    }
    return trigger.querySelector<HTMLElement>(
      'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]',
    );
  }

  private readonly handleTriggerClick = () => {
    if (!this.disabled) this.show();
  };

  private readonly handleBackdropPointer = (event: PointerEvent) => {
    if (event.target !== this.#backdrop || !this.closeOnOutsidePointer) return;
    this.close("outside-pointer");
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.open) return;
    if (event.key === "Escape" && this.closeOnEscape) {
      event.preventDefault();
      this.close("escape-key");
      return;
    }
    if (event.key !== "Tab" || !this.modal || !this.#surface) return;
    const focusable = [
      ...this.#surface.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (focusable.length === 0) {
      event.preventDefault();
      this.#surface.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && this.resolveDocument()?.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      this.resolveDocument()?.activeElement === last
    ) {
      event.preventDefault();
      first?.focus();
    }
  };
}

export class VyrnForgeDialogElement extends VyrnForgeModalOverlayElement {
  static override readonly overlayConfig: OverlayElementConfig = {
    baseClass: "vf-dialog",
    createController: () => createDialogController(),
    modal: true,
  };

  get size(): VyrnForgeDialogSize {
    return super.size as VyrnForgeDialogSize;
  }
  set size(value: VyrnForgeDialogSize) {
    super.size = value;
  }
}

export class VyrnForgeDrawerElement extends VyrnForgeModalOverlayElement {
  static override readonly overlayConfig: OverlayElementConfig = {
    baseClass: "vf-drawer",
    createController: () => createDrawerController(),
    modal: true,
  };
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      side: { reflect: true, type: "string" },
    });

  get side(): VyrnForgeDrawerSide {
    return this.getPropertyValue("side", "right");
  }
  set side(value: VyrnForgeDrawerSide) {
    this.setPropertyValue("side", value);
  }
  get size(): VyrnForgeDrawerSize {
    return super.size as VyrnForgeDrawerSize;
  }
  set size(value: VyrnForgeDrawerSize) {
    super.size = value;
  }

  protected override overlayModifierClass(): string {
    return `vf-drawer--${this.side}`;
  }
}

export class VyrnForgePopoverElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      align: { reflect: true, type: "string" },
      closeOnEscape: {
        attribute: "close-on-escape",
        reflect: true,
        type: "boolean",
      },
      closeOnOutsidePointer: {
        attribute: "close-on-outside-pointer",
        reflect: true,
        type: "boolean",
      },
      disabled: { reflect: true, type: "boolean" },
      matchTriggerWidth: {
        attribute: "match-trigger-width",
        reflect: true,
        type: "boolean",
      },
      modal: { reflect: true, type: "boolean" },
      offset: { reflect: true, type: "number" },
      open: { reflect: true, type: "boolean" },
      placement: { reflect: true, type: "string" },
    });

  readonly #controller = createPopoverController();
  #content: HTMLDivElement | null = null;
  #trigger: HTMLElement | null = null;

  get align(): VyrnForgePopoverAlign {
    return this.getPropertyValue("align", "start");
  }
  set align(value: VyrnForgePopoverAlign) {
    this.setPropertyValue("align", value);
  }
  get closeOnEscape(): boolean {
    return this.getPropertyValue("closeOnEscape", true);
  }
  set closeOnEscape(value: boolean) {
    this.setPropertyValue("closeOnEscape", Boolean(value));
  }
  get closeOnOutsidePointer(): boolean {
    return this.getPropertyValue("closeOnOutsidePointer", true);
  }
  set closeOnOutsidePointer(value: boolean) {
    this.setPropertyValue("closeOnOutsidePointer", Boolean(value));
  }
  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    this.#controller.setDisabled(Boolean(value));
    this.setPropertyValue("disabled", Boolean(value));
  }
  get matchTriggerWidth(): boolean {
    return this.getPropertyValue("matchTriggerWidth", false);
  }
  set matchTriggerWidth(value: boolean) {
    this.setPropertyValue("matchTriggerWidth", Boolean(value));
  }
  get modal(): boolean {
    return this.getPropertyValue("modal", false);
  }
  set modal(value: boolean) {
    this.#controller.setModal(Boolean(value));
    this.setPropertyValue("modal", Boolean(value));
  }
  get offset(): number {
    return this.getPropertyValue("offset", 6);
  }
  set offset(value: number) {
    this.setPropertyValue("offset", Number(value));
  }
  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.syncOpen(normalized);
    this.setPropertyValue("open", normalized);
  }
  get placement(): OverlayPlacement {
    return this.getPropertyValue("placement", "bottom-start");
  }
  set placement(value: OverlayPlacement) {
    this.setPropertyValue("placement", value);
  }

  show(): void {
    this.requestOpen(true, "programmatic");
  }
  close(reason: OverlayDismissReason = "programmatic"): void {
    this.requestOpen(false, reason);
  }
  toggle(): void {
    this.requestOpen(!this.open, "trigger");
  }

  protected override connected(): void {
    this.ensureScaffold();
    this.resolveDocument()?.addEventListener(
      "pointerdown",
      this.handleDocumentPointer,
      true,
    );
    this.addEventListener("keydown", this.handleKeyDown);
  }
  protected override disconnected(): void {
    this.resolveDocument()?.removeEventListener(
      "pointerdown",
      this.handleDocumentPointer,
      true,
    );
    this.removeEventListener("keydown", this.handleKeyDown);
  }
  protected override update(): void {
    const scaffold = this.ensureScaffold();
    if (!scaffold) return;
    this.#controller.setDisabled(this.disabled);
    this.#controller.setModal(this.modal);
    this.#controller.syncOpen(this.open);
    this.applyManagedClasses([
      "vf-popover-root",
      this.open && "vf-popover-root--open",
    ]);
    scaffold.content.hidden = !this.open;
    scaffold.content.className = `vf-popover vf-popover--${this.placement} vf-popover--align-${this.align}`;
    scaffold.content.setAttribute("role", "dialog");
    scaffold.content.style.setProperty(
      "--vf-popover-offset",
      `${this.offset}px`,
    );
    if (this.matchTriggerWidth && scaffold.trigger) {
      scaffold.content.style.minWidth = `${scaffold.trigger.getBoundingClientRect().width}px`;
    } else scaffold.content.style.removeProperty("min-width");
    scaffold.trigger?.setAttribute("aria-expanded", String(this.open));
    scaffold.trigger?.setAttribute("aria-haspopup", "dialog");
    this.setAttribute("data-vf-element", "");
  }

  protected get popoverContent(): HTMLDivElement | null {
    return this.#content;
  }
  protected get popoverTrigger(): HTMLElement | null {
    return this.#trigger;
  }

  private ensureScaffold(): {
    content: HTMLDivElement;
    trigger: HTMLElement | null;
  } | null {
    if (this.#content?.isConnected)
      return { content: this.#content, trigger: this.#trigger };
    const document = this.resolveDocument();
    if (!document) return null;
    const trigger = this.querySelector<HTMLElement>('[slot="trigger"]');
    const contentNodes = [...this.childNodes].filter(
      (node) => node !== trigger,
    );
    const triggerContainer = document.createElement("span");
    triggerContainer.className = "vf-popover__trigger";
    triggerContainer.dataset.vfPopoverInternal = "";
    if (trigger) {
      trigger.removeAttribute("slot");
      trigger.addEventListener("click", this.handleTriggerClick);
      triggerContainer.append(trigger);
    }
    const content = document.createElement("div");
    content.dataset.vfPopoverInternal = "";
    for (const node of contentNodes) {
      if (node !== triggerContainer) content.append(node);
    }
    this.replaceChildren(triggerContainer, content);
    this.#trigger = trigger;
    this.#content = content;
    return { content, trigger };
  }

  private requestOpen(nextOpen: boolean, reason: string): void {
    if (nextOpen && this.disabled) return;
    const previousOpen = this.open;
    const changed = nextOpen
      ? this.#controller.setOpen(true, reason as "programmatic")
      : this.#controller.dismiss(reason as OverlayDismissReason);
    if (!changed && previousOpen === nextOpen) return;
    this.setPropertyValue("open", nextOpen);
    this.dispatchTypedEvent("vf-open-change", {
      open: nextOpen,
      previousOpen,
      reason,
    });
  }

  private readonly handleTriggerClick = () => this.toggle();
  private readonly handleDocumentPointer = (event: PointerEvent) => {
    if (
      !this.open ||
      !this.closeOnOutsidePointer ||
      this.contains(event.target as Node)
    )
      return;
    this.close("outside-pointer");
  };
  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (this.open && event.key === "Escape" && this.closeOnEscape) {
      event.preventDefault();
      this.close("escape-key");
      this.#trigger?.focus();
    }
  };
}

export class VyrnForgeMenuElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      items: { attribute: false },
      open: { reflect: true, type: "boolean" },
      placement: { reflect: true, type: "string" },
      size: { reflect: true, type: "string" },
    });

  readonly #overlay = createPopoverController();
  readonly #navigation: NavigationController = createNavigationController({
    dismissOnSelect: true,
  });
  #trigger: HTMLElement | null = null;

  get items(): readonly VyrnForgeMenuItem[] {
    return this.getPropertyValue("items", Object.freeze([]));
  }
  set items(value: readonly VyrnForgeMenuItem[]) {
    const normalized = Object.freeze([...(value ?? [])]);
    this.setPropertyValue("items", normalized);
  }
  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#overlay.syncOpen(normalized);
    this.setPropertyValue("open", normalized);
  }
  get placement(): OverlayPlacement {
    return this.getPropertyValue("placement", "bottom-start");
  }
  set placement(value: OverlayPlacement) {
    this.setPropertyValue("placement", value);
  }
  get size(): VyrnForgeMenuSize {
    return this.getPropertyValue("size", "md");
  }
  set size(value: VyrnForgeMenuSize) {
    this.setPropertyValue("size", value);
  }

  protected override connected(): void {
    this.addEventListener("keydown", this.handleKeyDown);
  }
  protected override disconnected(): void {
    this.removeEventListener("keydown", this.handleKeyDown);
  }
  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;
    this.#navigation.replaceItems(
      this.items.map((item, order) => ({
        id: item.id,
        disabled: item.disabled,
        order,
      })),
    );
    const trigger =
      this.querySelector<HTMLElement>('[slot="trigger"]') ?? this.#trigger;
    const triggerContainer = document.createElement("span");
    triggerContainer.className = "vf-menu__trigger";
    if (trigger) {
      trigger.removeAttribute("slot");
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", String(this.open));
      trigger.onclick = () => {
        this.open = !this.open;
        this.dispatchTypedEvent("vf-open-change", { open: this.open });
      };
      triggerContainer.append(trigger);
      this.#trigger = trigger;
    }
    const menu = document.createElement("div");
    menu.className = `vf-menu vf-menu--${this.size} vf-menu--${this.placement}`;
    menu.hidden = !this.open;
    menu.setAttribute("role", "menu");
    const snapshot = this.#navigation.getSnapshot();
    for (const item of this.items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = [
        "vf-menu__item",
        item.danger && "vf-menu__item--danger",
        item.selected && "vf-menu__item--selected",
      ]
        .filter(Boolean)
        .join(" ");
      button.disabled = item.disabled === true;
      button.dataset.menuId = item.id;
      button.setAttribute("role", "menuitem");
      button.tabIndex = snapshot.activeId === item.id ? 0 : -1;
      const label = document.createElement("span");
      label.className = "vf-menu__item-label";
      label.textContent = item.label;
      button.append(label);
      if (item.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "vf-menu__shortcut";
        shortcut.textContent = item.shortcut;
        button.append(shortcut);
      }
      button.addEventListener("focus", () =>
        this.#navigation.setActiveId(item.id, "keyboard"),
      );
      button.addEventListener("click", () => this.selectItem(item.id));
      menu.append(button);
    }
    this.replaceChildren(triggerContainer, menu);
    this.applyManagedClasses(["vf-menu-root"]);
    this.setAttribute("data-vf-element", "");
  }

  private selectItem(id: string): void {
    if (!this.#navigation.select(id, "selection")) return;
    this.dispatchTypedEvent("vf-action", {
      action: id,
      reason: "selection",
      value: id,
    });
    this.open = false;
    this.dispatchTypedEvent("vf-open-change", {
      open: false,
      reason: "selection",
    });
    this.#trigger?.focus();
  }

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.open) return;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const intent =
        event.key === "ArrowDown"
          ? "next"
          : event.key === "ArrowUp"
            ? "previous"
            : event.key === "Home"
              ? "first"
              : "last";
      const next = this.#navigation.moveActive(intent, "keyboard");
      this.requestUpdate();
      queueMicrotask(() =>
        this.querySelector<HTMLElement>(`[data-menu-id="${next}"]`)?.focus(),
      );
    } else if (event.key === "Enter" || event.key === " ") {
      const active = this.#navigation.getSnapshot().activeId;
      if (active) {
        event.preventDefault();
        this.selectItem(active);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.open = false;
      this.dispatchTypedEvent("vf-open-change", {
        open: false,
        reason: "escape-key",
      });
      this.#trigger?.focus();
    }
  };
}

export class VyrnForgeTooltipElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      content: { reflect: true, type: "string" },
      delayMs: { attribute: "delay-ms", reflect: true, type: "number" },
      disabled: { reflect: true, type: "boolean" },
      offset: { reflect: true, type: "number" },
      open: { reflect: true, type: "boolean" },
      placement: { reflect: true, type: "string" },
    });

  readonly #controller = createTooltipController();
  readonly #tooltipId = `vf-tooltip-${++overlaySequence}`;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #tooltip: HTMLDivElement | null = null;
  #trigger: HTMLElement | null = null;
  #triggerContainer: HTMLSpanElement | null = null;

  get content(): string {
    return this.getPropertyValue("content", "");
  }
  set content(value: string) {
    this.setPropertyValue("content", String(value));
  }

  get delayMs(): number {
    return this.getPropertyValue("delayMs", 300);
  }
  set delayMs(value: number) {
    this.setPropertyValue("delayMs", Math.max(0, Number(value)));
  }

  get disabled(): boolean {
    return this.getPropertyValue("disabled", false);
  }
  set disabled(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.setDisabled(normalized);
    this.setPropertyValue("disabled", normalized);
  }

  get offset(): number {
    return this.getPropertyValue("offset", 6);
  }
  set offset(value: number) {
    this.setPropertyValue("offset", Number(value));
  }

  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.syncOpen(normalized);
    this.setPropertyValue("open", normalized);
  }

  get placement(): VyrnForgeTooltipPlacement {
    return this.getPropertyValue("placement", "top");
  }
  set placement(value: VyrnForgeTooltipPlacement) {
    this.setPropertyValue("placement", value);
  }

  protected override disconnected(): void {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
  }

  protected override update(): void {
    const scaffold = this.ensureScaffold();
    if (!scaffold) return;

    this.#controller.setDisabled(this.disabled);
    this.#controller.syncOpen(this.open);

    const { tooltip, trigger } = scaffold;
    trigger.setAttribute("aria-describedby", this.#tooltipId);
    trigger.onmouseenter = () => this.scheduleOpen();
    trigger.onmouseleave = () => this.hide("outside-pointer");
    trigger.onfocus = () => this.scheduleOpen();
    trigger.onblur = () => this.hide("outside-focus");

    tooltip.id = this.#tooltipId;
    tooltip.className = `vf-tooltip vf-tooltip--${this.placement}`;
    tooltip.hidden = !this.open || this.disabled;
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = this.content;
    tooltip.style.setProperty("--vf-tooltip-offset", `${this.offset}px`);

    this.applyManagedClasses(["vf-tooltip-root"]);
    this.setAttribute("data-vf-element", "");
  }

  private ensureScaffold(): {
    tooltip: HTMLDivElement;
    trigger: HTMLElement;
    triggerContainer: HTMLSpanElement;
  } | null {
    const document = this.resolveDocument();
    if (!document) return null;

    const trigger =
      this.querySelector<HTMLElement>('[slot="trigger"]') ?? this.#trigger;
    if (!trigger) return null;

    const triggerContainer =
      this.#triggerContainer ?? document.createElement("span");
    const tooltip = this.#tooltip ?? document.createElement("div");

    if (this.#trigger && this.#trigger !== trigger) {
      this.#trigger.onmouseenter = null;
      this.#trigger.onmouseleave = null;
      this.#trigger.onfocus = null;
      this.#trigger.onblur = null;
      this.#trigger.removeAttribute("aria-describedby");
    }

    trigger.removeAttribute("slot");
    triggerContainer.className = "vf-tooltip__trigger";

    if (trigger.parentElement !== triggerContainer) {
      triggerContainer.replaceChildren(trigger);
    }

    if (
      triggerContainer.parentElement !== this ||
      tooltip.parentElement !== this
    ) {
      this.replaceChildren(triggerContainer, tooltip);
    }

    this.#trigger = trigger;
    this.#triggerContainer = triggerContainer;
    this.#tooltip = tooltip;

    return { tooltip, trigger, triggerContainer };
  }

  private scheduleOpen(): void {
    if (this.disabled || this.open) return;
    if (this.#timer) clearTimeout(this.#timer);

    this.#timer = setTimeout(() => {
      this.#timer = null;
      if (this.disabled || this.open) return;

      this.#controller.setOpen(true, "trigger");
      this.open = true;
      this.dispatchTypedEvent("vf-open-change", {
        open: true,
        reason: "trigger",
      });
    }, this.delayMs);
  }

  private hide(reason: OverlayDismissReason): void {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    if (!this.open) return;

    this.#controller.dismiss(reason);
    this.open = false;
    this.dispatchTypedEvent("vf-open-change", {
      open: false,
      reason,
    });
  }
}
