import {
  createNavigationController,
  createTabsController,
  type NavigationController,
  type TabsController,
} from "@vyrnforge/ui-behaviors";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

let tabsSequence = 0;

export interface VyrnForgeTabItem {
  readonly badge?: string;
  readonly content?: Node | string;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
}

export class VyrnForgeTabsElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      activationMode: {
        attribute: "activation-mode",
        reflect: true,
        type: "string",
      },
      items: { attribute: false },
      size: { reflect: true, type: "string" },
      value: { reflect: true, type: "string" },
      variant: { reflect: true, type: "string" },
    });

  #controller: TabsController | null = null;
  readonly #id = `vf-tabs-${++tabsSequence}`;

  get activationMode(): "automatic" | "manual" {
    return this.getPropertyValue("activationMode", "automatic");
  }
  set activationMode(value: "automatic" | "manual") {
    this.setPropertyValue("activationMode", value);
  }

  get items(): readonly VyrnForgeTabItem[] {
    return this.getPropertyValue<readonly VyrnForgeTabItem[]>("items", []);
  }
  set items(value: readonly VyrnForgeTabItem[]) {
    this.setPropertyValue("items", Object.freeze([...value]));
  }

  get size(): "sm" | "md" {
    return this.getPropertyValue("size", "md");
  }
  set size(value: "sm" | "md") {
    this.setPropertyValue("size", value);
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    this.setPropertyValue("value", value);
  }

  get variant(): "contained" | "line" | "pills" {
    return this.getPropertyValue("variant", "line");
  }
  set variant(value: "contained" | "line" | "pills") {
    this.setPropertyValue("variant", value);
  }

  protected override connected(): void {
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  protected override update(): void {
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;
    this.#controller = createTabsController({
      activationMode: this.activationMode,
      items: this.items.map((item) => ({
        id: item.id,
        disabled: item.disabled,
      })),
      ...(this.value ? { value: this.value } : {}),
      defaultValue: this.value || this.items.find((item) => !item.disabled)?.id,
    });
    const snapshot = this.#controller.getSnapshot();
    if (!this.value && snapshot.selectedValue)
      this.value = snapshot.selectedValue;

    this.className = `vf-tabs vf-tabs--${this.variant} vf-tabs--${this.size}`;
    const list = document.createElement("div");
    list.className = "vf-tabs__list";
    list.setAttribute("role", "tablist");

    for (const item of this.items) {
      const selected = item.id === this.value;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = ["vf-tabs__tab", selected && "vf-tabs__tab--selected"]
        .filter(Boolean)
        .join(" ");
      tab.dataset.tabId = item.id;
      tab.id = `${this.#id}-tab-${item.id}`;
      tab.disabled = item.disabled === true;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(selected));
      tab.setAttribute("aria-controls", `${this.#id}-panel-${item.id}`);
      tab.tabIndex = selected ? 0 : -1;
      const label = document.createElement("span");
      label.className = "vf-tabs__label";
      label.textContent = item.label;
      tab.append(label);
      if (item.badge) {
        const badge = document.createElement("span");
        badge.className = "vf-tabs__badge";
        badge.textContent = item.badge;
        tab.append(badge);
      }
      list.append(tab);
    }

    const panel = document.createElement("div");
    panel.className = "vf-tabs__panel";
    panel.id = `${this.#id}-panel-${this.value}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `${this.#id}-tab-${this.value}`);
    const selected = this.items.find((item) => item.id === this.value);
    if (selected?.content instanceof Node)
      panel.append(selected.content.cloneNode(true));
    else
      panel.textContent =
        selected?.content === undefined ? "" : String(selected.content);

    this.replaceChildren(list, panel);
    this.setAttribute("data-vf-element", "");
  }

  private select(id: string, reason: "keyboard" | "pointer"): void {
    if (!this.#controller?.select(id, reason)) return;
    const previousValue = this.value;
    this.value = this.#controller.getSnapshot().selectedValue;
    if (previousValue === this.value) return;
    this.dispatchTypedEvent("vf-value-change", {
      previousValue,
      reason,
      value: this.value,
    });
  }

  private readonly handleClick = (event: Event) => {
    const tab = (event.target as Element).closest<HTMLButtonElement>(
      "[data-tab-id]",
    );
    if (tab && !tab.disabled) this.select(tab.dataset.tabId ?? "", "pointer");
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    const tab = (event.target as Element).closest<HTMLButtonElement>(
      "[data-tab-id]",
    );
    if (!tab || !this.#controller) return;
    this.#controller.setFocusedValue(tab.dataset.tabId ?? null, "keyboard");
    let intent: "first" | "last" | "next" | "previous" | null = null;
    if (event.key === "ArrowRight") intent = "next";
    else if (event.key === "ArrowLeft") intent = "previous";
    else if (event.key === "Home") intent = "first";
    else if (event.key === "End") intent = "last";
    else if (
      (event.key === "Enter" || event.key === " ") &&
      this.activationMode === "manual"
    ) {
      event.preventDefault();
      this.select(tab.dataset.tabId ?? "", "keyboard");
      return;
    }
    if (!intent) return;
    event.preventDefault();
    const next = this.#controller.moveFocus(intent, "keyboard");
    if (!next) return;
    this.querySelector<HTMLButtonElement>(
      `[data-tab-id="${CSS.escape(next)}"]`,
    )?.focus();
    if (this.activationMode === "automatic") this.select(next, "keyboard");
  };
}

export interface VyrnForgeBreadcrumbItem {
  readonly current?: boolean;
  readonly href?: string;
  readonly id?: string;
  readonly label: string;
}

export class VyrnForgeBreadcrumbsElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      items: { attribute: false },
      label: { reflect: true, type: "string" },
      separator: { reflect: true, type: "string" },
    });

  get items(): readonly VyrnForgeBreadcrumbItem[] {
    return this.getPropertyValue<readonly VyrnForgeBreadcrumbItem[]>(
      "items",
      [],
    );
  }
  set items(value: readonly VyrnForgeBreadcrumbItem[]) {
    this.setPropertyValue("items", Object.freeze([...value]));
  }

  get label(): string {
    return this.getPropertyValue("label", "Breadcrumb");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  get separator(): string {
    return this.getPropertyValue("separator", "/");
  }
  set separator(value: string) {
    this.setPropertyValue("separator", value);
  }

  protected override connected(): void {
    this.addEventListener("click", this.handleClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.handleClick);
  }

  protected override update(): void {
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;
    this.className = "vf-breadcrumbs";
    this.setAttribute("role", "navigation");
    this.setAttribute("aria-label", this.label);
    const list = document.createElement("ol");
    list.className = "vf-breadcrumbs__list";
    this.items.forEach((item, index) => {
      const current = item.current === true || index === this.items.length - 1;
      const entry = document.createElement("li");
      entry.className = "vf-breadcrumbs__item";
      if (index > 0) {
        const separator = document.createElement("span");
        separator.className = "vf-breadcrumbs__separator";
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = this.separator;
        entry.append(separator);
      }
      const content =
        item.href && !current
          ? document.createElement("a")
          : current
            ? document.createElement("span")
            : document.createElement("button");
      content.className = current
        ? "vf-breadcrumbs__current"
        : "vf-breadcrumbs__link";
      content.textContent = item.label;
      content.dataset.breadcrumbId = item.id ?? String(index);
      if (content instanceof HTMLAnchorElement) content.href = item.href ?? "";
      if (content instanceof HTMLButtonElement) content.type = "button";
      if (current) content.setAttribute("aria-current", "page");
      entry.append(content);
      list.append(entry);
    });
    this.replaceChildren(list);
    this.setAttribute("data-vf-element", "");
  }

  private readonly handleClick = (event: Event) => {
    const item = (event.target as Element).closest<HTMLElement>(
      "[data-breadcrumb-id]",
    );
    if (!item || item.getAttribute("aria-current") === "page") return;
    this.dispatchTypedEvent("vf-action", {
      action: "navigate",
      reason: "pointer",
      value: item.dataset.breadcrumbId,
    });
  };
}

export interface VyrnForgeSideNavItem {
  readonly active?: boolean;
  readonly children?: readonly VyrnForgeSideNavItem[];
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id: string;
  readonly label: string;
}

export class VyrnForgeSideNavElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      activeId: { attribute: "active-id", reflect: true, type: "string" },
      collapsed: { reflect: true, type: "boolean" },
      items: { attribute: false },
      label: { reflect: true, type: "string" },
    });

  #controller: NavigationController | null = null;

  get activeId(): string {
    return this.getPropertyValue("activeId", "");
  }
  set activeId(value: string) {
    this.setPropertyValue("activeId", value);
  }

  get collapsed(): boolean {
    return this.getPropertyValue("collapsed", false);
  }
  set collapsed(value: boolean) {
    this.setPropertyValue("collapsed", Boolean(value));
  }

  get items(): readonly VyrnForgeSideNavItem[] {
    return this.getPropertyValue<readonly VyrnForgeSideNavItem[]>("items", []);
  }
  set items(value: readonly VyrnForgeSideNavItem[]) {
    this.setPropertyValue("items", Object.freeze([...value]));
  }

  get label(): string {
    return this.getPropertyValue("label", "Primary navigation");
  }
  set label(value: string) {
    this.setPropertyValue("label", value);
  }

  protected override connected(): void {
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  protected override update(): void {
    const document = this.ownerDocument ?? globalThis.document;
    if (!document) return;
    const flattened = this.flattenItems(this.items);
    const selected =
      this.activeId || flattened.find((item) => item.active)?.id || "";
    this.#controller = createNavigationController({
      items: flattened.map((item, order) => ({
        id: item.id,
        disabled: item.disabled,
        order,
      })),
      activeId: selected || null,
      selectedId: selected || null,
    });
    this.className = ["vf-side-nav", this.collapsed && "vf-side-nav--collapsed"]
      .filter(Boolean)
      .join(" ");
    this.setAttribute("role", "navigation");
    this.setAttribute("aria-label", this.label);
    const list = document.createElement("ul");
    list.className = "vf-side-nav__list";
    for (const item of this.items)
      list.append(this.renderItem(document, item, 1, selected));
    this.replaceChildren(list);
    this.setAttribute("data-vf-element", "");
  }

  private flattenItems(
    items: readonly VyrnForgeSideNavItem[],
  ): VyrnForgeSideNavItem[] {
    return items.flatMap((item) => [
      item,
      ...(this.collapsed ? [] : this.flattenItems(item.children ?? [])),
    ]);
  }

  private renderItem(
    document: Document,
    item: VyrnForgeSideNavItem,
    level: 1 | 2,
    selected: string,
  ): HTMLLIElement {
    const entry = document.createElement("li");
    entry.className = "vf-side-nav__entry";
    const control =
      item.href && !item.disabled
        ? document.createElement("a")
        : document.createElement("button");
    const active = item.id === selected || item.active === true;
    control.className = [
      "vf-side-nav__item",
      `vf-side-nav__item--level-${level}`,
      active && "vf-side-nav__item--active",
    ]
      .filter(Boolean)
      .join(" ");
    control.dataset.navId = item.id;
    control.textContent = item.label;
    control.tabIndex =
      this.#controller?.getSnapshot().activeId === item.id ? 0 : -1;
    if (control instanceof HTMLAnchorElement) control.href = item.href ?? "";
    else {
      control.type = "button";
      control.disabled = item.disabled === true;
    }
    if (active) control.setAttribute("aria-current", "page");
    entry.append(control);
    if (!this.collapsed && item.children?.length) {
      const children = document.createElement("ul");
      children.className = "vf-side-nav__children";
      for (const child of item.children)
        children.append(this.renderItem(document, child, 2, selected));
      entry.append(children);
    }
    return entry;
  }

  private select(id: string, reason: "keyboard" | "pointer"): void {
    if (!this.#controller?.select(id, reason)) return;
    const previousValue = this.activeId;
    this.activeId = id;
    this.dispatchTypedEvent("vf-value-change", {
      previousValue,
      reason,
      value: id,
    });
  }

  private readonly handleClick = (event: Event) => {
    const item = (event.target as Element).closest<HTMLElement>(
      "[data-nav-id]",
    );
    if (item) this.select(item.dataset.navId ?? "", "pointer");
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    const item = (event.target as Element).closest<HTMLElement>(
      "[data-nav-id]",
    );
    if (!item || !this.#controller) return;
    this.#controller.setActiveId(item.dataset.navId ?? null, "keyboard");
    let intent: "first" | "last" | "next" | "previous" | null = null;
    if (event.key === "ArrowDown") intent = "next";
    else if (event.key === "ArrowUp") intent = "previous";
    else if (event.key === "Home") intent = "first";
    else if (event.key === "End") intent = "last";
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select(item.dataset.navId ?? "", "keyboard");
      return;
    }
    if (!intent) return;
    event.preventDefault();
    const next = this.#controller.moveActive(intent, "keyboard");
    if (next)
      this.querySelector<HTMLElement>(
        `[data-nav-id="${CSS.escape(next)}"]`,
      )?.focus();
  };
}
