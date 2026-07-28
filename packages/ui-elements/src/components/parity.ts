import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export type VyrnForgeIconName =
  | "Search"
  | "Filter"
  | "Columns"
  | "Settings"
  | "Refresh"
  | "Export"
  | "Import"
  | "Download"
  | "Upload"
  | "MoreHorizontal"
  | "MoreVertical"
  | "ChevronDown"
  | "ChevronUp"
  | "ChevronLeft"
  | "ChevronRight"
  | "Close"
  | "Check"
  | "Warning"
  | "Info"
  | "Error"
  | "Success"
  | "Star"
  | "Plus"
  | "Minus"
  | "Edit"
  | "Delete"
  | "Reset"
  | "SortAsc"
  | "SortDesc"
  | "DragHandle"
  | "Resize"
  | "Eye"
  | "EyeOff";
export type VyrnForgeIconSize = "xs" | "sm" | "md" | "lg" | number;
export type VyrnForgeInlineMessageVariant =
  "neutral" | "info" | "success" | "warning" | "danger";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const iconSizes = Object.freeze({ xs: 12, sm: 14, md: 16, lg: 20 });
const iconMarkup: Readonly<Record<VyrnForgeIconName, string>> = Object.freeze({
  Search: '<circle cx="10" cy="10" r="5"/><path d="m14 14 4 4"/>',
  Filter: '<path d="M4 6h16l-6 7v5l-4 2v-7z"/>',
  Columns:
    '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14M15 5v14"/>',
  Settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  Refresh: '<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>',
  Export:
    '<path d="M12 4v10"/><path d="m8 8 4-4 4 4"/><path d="M5 14v4h14v-4"/>',
  Import: '<path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 18h14"/>',
  Download: '<path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 19h14"/>',
  Upload: '<path d="M12 20V10"/><path d="m8 14 4-4 4 4"/><path d="M5 5h14"/>',
  MoreHorizontal:
    '<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',
  MoreVertical:
    '<circle cx="12" cy="6" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="18" r="1"/>',
  ChevronDown: '<path d="m6 9 6 6 6-6"/>',
  ChevronUp: '<path d="m6 15 6-6 6 6"/>',
  ChevronLeft: '<path d="m15 6-6 6 6 6"/>',
  ChevronRight: '<path d="m9 6 6 6-6 6"/>',
  Close: '<path d="m6 6 12 12M18 6 6 18"/>',
  Check: '<path d="m5 12 5 5L19 7"/>',
  Warning: '<path d="M12 4 3 20h18z"/><path d="M12 9v4M12 17h.01"/>',
  Info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  Error: '<circle cx="12" cy="12" r="9"/><path d="m8 8 8 8M16 8l-8 8"/>',
  Success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  Star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
  Plus: '<path d="M12 5v14M5 12h14"/>',
  Minus: '<path d="M5 12h14"/>',
  Edit: '<path d="M5 19h4l10-10-4-4L5 15z"/><path d="m14 6 4 4"/>',
  Delete:
    '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 12h8l1-12"/>',
  Reset: '<path d="M6 8a7 7 0 1 1-1 6"/><path d="M6 4v4h4"/>',
  SortAsc:
    '<path d="M7 17V7"/><path d="m4 10 3-3 3 3"/><path d="M13 9h6M13 13h4M13 17h2"/>',
  SortDesc:
    '<path d="M7 7v10"/><path d="m4 14 3 3 3-3"/><path d="M13 7h2M13 11h4M13 15h6"/>',
  DragHandle:
    '<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"/>',
  Resize: '<path d="M7 17 17 7"/><path d="M10 17h7v-7"/>',
  Eye: '<path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
  EyeOff:
    '<path d="M3 12s3-6 9-6c2 0 3.7.7 5.1 1.6"/><path d="M21 12s-3 6-9 6c-2 0-3.7-.7-5.1-1.6"/><path d="m4 4 16 16"/>',
});

export class VyrnForgeIconElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      decorative: { reflect: true, type: "boolean" },
      name: { reflect: true, type: "string" },
      size: { reflect: true, type: "string" },
      title: { reflect: true, type: "string" },
    });

  #svg: SVGSVGElement | null = null;

  get decorative(): boolean {
    return this.getPropertyValue("decorative", true);
  }
  set decorative(value: boolean) {
    this.setPropertyValue("decorative", Boolean(value));
  }
  get name(): VyrnForgeIconName {
    return this.getPropertyValue("name", "Info");
  }
  set name(value: VyrnForgeIconName) {
    this.setPropertyValue("name", value);
  }
  get size(): VyrnForgeIconSize {
    return this.getPropertyValue<VyrnForgeIconSize>("size", "md");
  }
  set size(value: VyrnForgeIconSize) {
    this.setPropertyValue("size", value);
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

    const svg = this.#svg ?? document.createElementNS(SVG_NAMESPACE, "svg");
    svg.classList.add("vf-icon__svg");
    svg.setAttribute("fill", "none");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.innerHTML = iconMarkup[this.name] ?? iconMarkup.Info;

    if (svg.parentElement !== this) this.replaceChildren(svg);
    this.#svg = svg;

    const resolvedSize =
      typeof this.size === "number"
        ? Math.max(1, this.size)
        : (iconSizes[this.size] ?? iconSizes.md);
    this.style.setProperty("--vf-icon-size", `${resolvedSize}px`);
    this.applyManagedClasses(["vf-icon"]);
    this.setAttribute("data-vf-element", "");

    const isDecorative = this.decorative && !this.title;
    if (isDecorative) {
      this.setAttribute("aria-hidden", "true");
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    } else {
      this.removeAttribute("aria-hidden");
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.title || this.name);
    }
  }
}

export class VyrnForgeInlineMessageElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      title: { reflect: true, type: "string" },
      variant: { reflect: true, type: "string" },
    });

  #content: HTMLDivElement | null = null;
  #titleElement: HTMLElement | null = null;

  get title(): string {
    return this.getPropertyValue("title", "");
  }
  set title(value: string) {
    this.setPropertyValue("title", String(value));
  }
  get variant(): VyrnForgeInlineMessageVariant {
    return this.getPropertyValue("variant", "info");
  }
  set variant(value: VyrnForgeInlineMessageVariant) {
    this.setPropertyValue("variant", value);
  }

  protected override update(): void {
    const scaffold = this.ensureScaffold();
    if (!scaffold) return;

    this.applyManagedClasses([
      "vf-inline-message",
      `vf-inline-message--${this.variant}`,
    ]);
    this.setAttribute("role", this.variant === "danger" ? "alert" : "status");
    this.setAttribute("data-vf-element", "");

    scaffold.title.textContent = this.title;
    scaffold.title.hidden = !this.title;
    scaffold.content.hidden = scaffold.content.childNodes.length === 0;
  }

  private ensureScaffold(): {
    content: HTMLDivElement;
    title: HTMLElement;
  } | null {
    if (this.#content?.isConnected && this.#titleElement?.isConnected) {
      return { content: this.#content, title: this.#titleElement };
    }

    const document = this.resolveDocument();
    if (!document) return null;

    const contentNodes = [...this.childNodes].filter(
      (node) =>
        !(
          node instanceof Element &&
          node.hasAttribute("data-vf-message-internal")
        ),
    );
    const title = document.createElement("strong");
    title.className = "vf-inline-message__title";
    title.dataset.vfMessageInternal = "";
    const content = document.createElement("div");
    content.className = "vf-inline-message__content";
    content.dataset.vfMessageInternal = "";
    content.append(...contentNodes);
    this.replaceChildren(title, content);
    this.#titleElement = title;
    this.#content = content;
    return { content, title };
  }
}

export class VyrnForgeSkeletonElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      animated: { reflect: true, type: "boolean" },
      height: { reflect: true, type: "string" },
      radius: { reflect: true, type: "string" },
      width: { reflect: true, type: "string" },
    });

  get animated(): boolean {
    return this.getPropertyValue("animated", true);
  }
  set animated(value: boolean) {
    this.setPropertyValue("animated", Boolean(value));
  }
  get height(): string {
    return this.getPropertyValue("height", "16px");
  }
  set height(value: string | number) {
    this.setPropertyValue("height", this.toCssLength(value));
  }
  get radius(): string {
    return this.getPropertyValue("radius", "var(--vf-radius-md)");
  }
  set radius(value: string | number) {
    this.setPropertyValue("radius", this.toCssLength(value));
  }
  get width(): string {
    return this.getPropertyValue("width", "100%");
  }
  set width(value: string | number) {
    this.setPropertyValue("width", this.toCssLength(value));
  }

  protected override update(): void {
    this.applyManagedClasses([
      "vf-skeleton",
      !this.animated && "vf-skeleton--static",
    ]);
    this.style.setProperty("--vf-skeleton-height", this.height);
    this.style.setProperty("--vf-skeleton-radius", this.radius);
    this.style.setProperty("--vf-skeleton-width", this.width);
    this.setAttribute("aria-hidden", "true");
    this.setAttribute("data-vf-element", "");
  }

  private toCssLength(value: string | number): string {
    return typeof value === "number" ? `${value}px` : String(value);
  }
}

export class VyrnForgeTopNavElement extends VyrnForgeDomElement {
  protected override update(): void {
    const document = this.resolveDocument();
    if (!document) return;

    const externalNodes = [...this.childNodes].filter(
      (node) =>
        !(
          node instanceof Element &&
          node.hasAttribute("data-vf-top-nav-internal")
        ),
    );
    if (externalNodes.length > 0) {
      const bySlot = (slot: string) =>
        externalNodes.filter(
          (node) =>
            node instanceof Element && node.getAttribute("slot") === slot,
        );
      const brandNodes = bySlot("brand");
      const navigationNodes = bySlot("navigation");
      const actionNodes = bySlot("actions");
      const userNodes = bySlot("user");
      const assigned = new Set([
        ...brandNodes,
        ...navigationNodes,
        ...actionNodes,
        ...userNodes,
      ]);
      navigationNodes.push(
        ...externalNodes.filter((node) => !assigned.has(node)),
      );
      for (const node of externalNodes) {
        if (node instanceof Element) node.removeAttribute("slot");
      }

      const output: Node[] = [];
      if (brandNodes.length > 0) {
        const brand = document.createElement("div");
        brand.className = "vf-top-nav__brand";
        brand.dataset.vfTopNavInternal = "";
        brand.append(...brandNodes);
        output.push(brand);
      }
      if (navigationNodes.length > 0) {
        const navigation = document.createElement("nav");
        navigation.className = "vf-top-nav__navigation";
        navigation.dataset.vfTopNavInternal = "";
        navigation.append(...navigationNodes);
        output.push(navigation);
      }
      if (actionNodes.length > 0 || userNodes.length > 0) {
        const actions = document.createElement("div");
        actions.className = "vf-top-nav__actions";
        actions.dataset.vfTopNavInternal = "";
        actions.append(...actionNodes);
        if (userNodes.length > 0) {
          const user = document.createElement("div");
          user.className = "vf-top-nav__user";
          user.append(...userNodes);
          actions.append(user);
        }
        output.push(actions);
      }
      this.replaceChildren(...output);
    }

    this.applyManagedClasses(["vf-top-nav"]);
    this.setAttribute("role", "banner");
    this.setAttribute("data-vf-element", "");
  }
}
