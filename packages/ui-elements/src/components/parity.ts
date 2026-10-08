import {
  getVyrnForgeIconMarkup,
  resolveVyrnForgeIconSize,
  type VyrnForgeIconName,
  type VyrnForgeIconSize,
} from "@vyrnforge/ui-core";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export type { VyrnForgeIconName, VyrnForgeIconSize } from "@vyrnforge/ui-core";
export type VyrnForgeInlineMessageVariant =
  "neutral" | "info" | "success" | "warning" | "danger";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

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
    svg.innerHTML = getVyrnForgeIconMarkup(this.name);

    if (svg.parentElement !== this) this.replaceChildren(svg);
    this.#svg = svg;

    this.style.setProperty(
      "--vf-icon-size",
      `${resolveVyrnForgeIconSize(this.size)}px`,
    );
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
