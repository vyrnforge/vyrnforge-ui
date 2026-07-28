import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export type VyrnForgeAppShellScrollMode = "page" | "content" | "split";
export type VyrnForgeAppShellHeaderPosition = "static" | "sticky" | "fixed";
export type VyrnForgeAppShellSidebarPosition = "static" | "sticky" | "fixed";
export type VyrnForgePageToolbarDensity =
  "compact" | "standard" | "comfortable";

function assignedSlot(node: Node): string {
  return node instanceof Element ? (node.getAttribute("slot") ?? "") : "";
}

function externalNodes(element: HTMLElement, marker: string): Node[] {
  return [...element.childNodes].filter(
    (node) => !(node instanceof Element && node.hasAttribute(marker)),
  );
}

export class VyrnForgeAppShellElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      collapsedSidebarWidth: {
        attribute: "collapsed-sidebar-width",
        reflect: true,
        type: "string",
      },
      fullHeight: {
        attribute: "full-height",
        reflect: true,
        type: "boolean",
      },
      headerHeight: {
        attribute: "header-height",
        reflect: true,
        type: "string",
      },
      headerPosition: {
        attribute: "header-position",
        reflect: true,
        type: "string",
      },
      minHeight: {
        attribute: "min-height",
        reflect: true,
        type: "string",
      },
      scrollMode: {
        attribute: "scroll-mode",
        reflect: true,
        type: "string",
      },
      sidebarCollapsed: {
        attribute: "sidebar-collapsed",
        reflect: true,
        type: "boolean",
      },
      sidebarPosition: {
        attribute: "sidebar-position",
        reflect: true,
        type: "string",
      },
      sidebarWidth: {
        attribute: "sidebar-width",
        reflect: true,
        type: "string",
      },
    });

  get collapsedSidebarWidth(): string {
    return this.getPropertyValue("collapsedSidebarWidth", "64px");
  }
  set collapsedSidebarWidth(value: string | number) {
    this.setPropertyValue(
      "collapsedSidebarWidth",
      typeof value === "number" ? `${value}px` : String(value),
    );
  }
  get fullHeight(): boolean {
    return this.getPropertyValue("fullHeight", true);
  }
  set fullHeight(value: boolean) {
    this.setPropertyValue("fullHeight", Boolean(value));
  }
  get headerHeight(): string {
    return this.getPropertyValue("headerHeight", "64px");
  }
  set headerHeight(value: string | number) {
    this.setPropertyValue(
      "headerHeight",
      typeof value === "number" ? `${value}px` : String(value),
    );
  }
  get headerPosition(): VyrnForgeAppShellHeaderPosition {
    return this.getPropertyValue("headerPosition", "sticky");
  }
  set headerPosition(value: VyrnForgeAppShellHeaderPosition) {
    this.setPropertyValue("headerPosition", value);
  }
  get minHeight(): string {
    return this.getPropertyValue("minHeight", "100dvh");
  }
  set minHeight(value: string | number) {
    this.setPropertyValue(
      "minHeight",
      typeof value === "number" ? `${value}px` : String(value),
    );
  }
  get scrollMode(): VyrnForgeAppShellScrollMode {
    return this.getPropertyValue("scrollMode", "content");
  }
  set scrollMode(value: VyrnForgeAppShellScrollMode) {
    this.setPropertyValue("scrollMode", value);
  }
  get sidebarCollapsed(): boolean {
    return this.getPropertyValue("sidebarCollapsed", false);
  }
  set sidebarCollapsed(value: boolean) {
    this.setPropertyValue("sidebarCollapsed", Boolean(value));
  }
  get sidebarPosition(): VyrnForgeAppShellSidebarPosition {
    return this.getPropertyValue("sidebarPosition", "sticky");
  }
  set sidebarPosition(value: VyrnForgeAppShellSidebarPosition) {
    this.setPropertyValue("sidebarPosition", value);
  }
  get sidebarWidth(): string {
    return this.getPropertyValue("sidebarWidth", "280px");
  }
  set sidebarWidth(value: string | number) {
    this.setPropertyValue(
      "sidebarWidth",
      typeof value === "number" ? `${value}px` : String(value),
    );
  }

  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;
    const nodes = externalNodes(this, "data-vf-app-shell-internal");
    const headerNodes = nodes.filter((node) => assignedSlot(node) === "header");
    const sidebarNodes = nodes.filter(
      (node) => assignedSlot(node) === "sidebar",
    );
    const footerNodes = nodes.filter((node) => assignedSlot(node) === "footer");
    const contentNodes = nodes.filter((node) => assignedSlot(node) === "");
    for (const node of nodes) {
      if (node instanceof Element) node.removeAttribute("slot");
    }

    this.applyManagedClasses([
      "vf-app-shell",
      headerNodes.length > 0 && "vf-app-shell--with-header",
      sidebarNodes.length > 0 && "vf-app-shell--with-sidebar",
      footerNodes.length > 0 && "vf-app-shell--with-footer",
      this.fullHeight && "vf-app-shell--full-height",
      `vf-app-shell--scroll-${this.scrollMode}`,
      `vf-app-shell--header-${this.headerPosition}`,
      `vf-app-shell--sidebar-${this.sidebarPosition}`,
      this.sidebarCollapsed && "vf-app-shell--sidebar-collapsed",
    ]);
    this.style.setProperty("--vf-app-shell-header-height", this.headerHeight);
    this.style.setProperty("--vf-app-shell-sidebar-width", this.sidebarWidth);
    this.style.setProperty(
      "--vf-app-shell-sidebar-collapsed-width",
      this.collapsedSidebarWidth,
    );
    this.style.setProperty("--vf-app-shell-min-height", this.minHeight);

    const output: Node[] = [];
    if (headerNodes.length > 0) {
      const header = document.createElement("header");
      header.className = "vf-app-shell__header";
      header.dataset.vfAppShellInternal = "";
      header.append(...headerNodes);
      output.push(header);
    }
    const body = document.createElement("div");
    body.className = "vf-app-shell__body";
    body.dataset.vfAppShellInternal = "";
    if (sidebarNodes.length > 0) {
      const sidebar = document.createElement("aside");
      sidebar.className = "vf-app-shell__sidebar";
      const scroll = document.createElement("div");
      scroll.className = "vf-app-shell__sidebar-scroll";
      scroll.append(...sidebarNodes);
      sidebar.append(scroll);
      body.append(sidebar);
    }
    const main = document.createElement("main");
    main.className = "vf-app-shell__main";
    const content = document.createElement("div");
    content.className = "vf-app-shell__content";
    content.append(...contentNodes);
    main.append(content);
    body.append(main);
    output.push(body);
    if (footerNodes.length > 0) {
      const footer = document.createElement("footer");
      footer.className = "vf-app-shell__footer";
      footer.dataset.vfAppShellInternal = "";
      footer.append(...footerNodes);
      output.push(footer);
    }
    this.replaceChildren(...output);
    this.setAttribute("data-vf-element", "");
  }
}

export class VyrnForgePageHeaderElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      description: { reflect: true, type: "string" },
      eyebrow: { reflect: true, type: "string" },
      title: { reflect: true, type: "string" },
    });

  get description(): string {
    return this.getPropertyValue("description", "");
  }
  set description(value: string) {
    this.setPropertyValue("description", String(value));
  }
  get eyebrow(): string {
    return this.getPropertyValue("eyebrow", "");
  }
  set eyebrow(value: string) {
    this.setPropertyValue("eyebrow", String(value));
  }
  get title(): string {
    return this.getPropertyValue("title", "");
  }
  set title(value: string) {
    this.setPropertyValue("title", String(value));
  }

  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;
    const nodes = externalNodes(this, "data-vf-page-header-internal");
    const take = (slot: string) =>
      nodes.filter((node) => assignedSlot(node) === slot);
    const breadcrumbs = take("breadcrumbs");
    const status = take("status");
    const metadata = take("metadata");
    const actions = take("actions");
    for (const node of nodes) {
      if (node instanceof Element) node.removeAttribute("slot");
    }
    this.applyManagedClasses(["vf-page-header"]);
    const output: Node[] = [];
    if (breadcrumbs.length > 0) {
      const region = document.createElement("div");
      region.className = "vf-page-header__breadcrumbs";
      region.dataset.vfPageHeaderInternal = "";
      region.append(...breadcrumbs);
      output.push(region);
    }
    const row = document.createElement("div");
    row.className = "vf-page-header__row";
    row.dataset.vfPageHeaderInternal = "";
    const main = document.createElement("div");
    main.className = "vf-page-header__main";
    if (this.eyebrow) {
      const eyebrow = document.createElement("div");
      eyebrow.className = "vf-page-header__eyebrow";
      eyebrow.textContent = this.eyebrow;
      main.append(eyebrow);
    }
    const titleRow = document.createElement("div");
    titleRow.className = "vf-page-header__title-row";
    const title = document.createElement("h1");
    title.className = "vf-page-header__title";
    title.textContent = this.title;
    titleRow.append(title);
    if (status.length > 0) {
      const region = document.createElement("div");
      region.className = "vf-page-header__status";
      region.append(...status);
      titleRow.append(region);
    }
    main.append(titleRow);
    if (this.description) {
      const description = document.createElement("div");
      description.className = "vf-page-header__description";
      description.textContent = this.description;
      main.append(description);
    }
    if (metadata.length > 0) {
      const region = document.createElement("div");
      region.className = "vf-page-header__metadata";
      region.append(...metadata);
      main.append(region);
    }
    row.append(main);
    if (actions.length > 0) {
      const region = document.createElement("div");
      region.className = "vf-page-header__actions";
      region.append(...actions);
      row.append(region);
    }
    output.push(row);
    this.replaceChildren(...output);
    this.setAttribute("data-vf-element", "");
  }
}

export class VyrnForgePageToolbarElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      density: { reflect: true, type: "string" },
      label: { reflect: true, type: "string" },
      sticky: { reflect: true, type: "boolean" },
    });

  get density(): VyrnForgePageToolbarDensity {
    return this.getPropertyValue("density", "standard");
  }
  set density(value: VyrnForgePageToolbarDensity) {
    this.setPropertyValue("density", value);
  }
  get label(): string {
    return this.getPropertyValue("label", "Page controls");
  }
  set label(value: string) {
    this.setPropertyValue("label", String(value));
  }
  get sticky(): boolean {
    return this.getPropertyValue("sticky", false);
  }
  set sticky(value: boolean) {
    this.setPropertyValue("sticky", Boolean(value));
  }

  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;
    const nodes = externalNodes(this, "data-vf-page-toolbar-internal");
    const rightNodes = nodes.filter((node) => assignedSlot(node) === "right");
    const leftNodes = nodes.filter((node) => assignedSlot(node) !== "right");
    for (const node of nodes) {
      if (node instanceof Element) node.removeAttribute("slot");
    }
    this.applyManagedClasses([
      "vf-page-toolbar",
      `vf-page-toolbar--${this.density}`,
      this.sticky && "vf-page-toolbar--sticky",
    ]);
    this.setAttribute("role", "toolbar");
    this.setAttribute("aria-label", this.label);
    const left = document.createElement("div");
    left.className = "vf-page-toolbar__left";
    left.dataset.vfPageToolbarInternal = "";
    left.append(...leftNodes);
    const output: Node[] = [left];
    if (rightNodes.length > 0) {
      const right = document.createElement("div");
      right.className = "vf-page-toolbar__right";
      right.dataset.vfPageToolbarInternal = "";
      right.append(...rightNodes);
      output.push(right);
    }
    this.replaceChildren(...output);
    this.setAttribute("data-vf-element", "");
  }
}
