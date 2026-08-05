import { describe, expect, it, vi } from "vitest";

import {
  VyrnForgeElement,
  type VyrnForgeChangedProperties,
  type VyrnForgePropertyDeclarations,
} from "./VyrnForgeElement";

class ProbeElement extends VyrnForgeElement {
  static override readonly properties = Object.freeze({
    active: { type: "boolean", reflect: true },
    ariaLabel: { attribute: "aria-label", type: "string", reflect: true },
    config: { attribute: false },
    count: { type: "number", reflect: true },
    label: { type: "string", reflect: true },
  }) satisfies VyrnForgePropertyDeclarations;

  readonly attributeValues = new Map<string, string>();
  readonly updates: Array<Map<string, unknown>> = [];
  connectedCount = 0;
  disconnectedCount = 0;
  allowUpdate = true;

  get active(): boolean {
    return this.getPropertyValue("active", false);
  }
  set active(value: boolean) {
    this.setPropertyValue("active", value);
  }

  get ariaLabel(): string | null {
    return this.getPropertyValue<string | null>("ariaLabel", null);
  }
  set ariaLabel(value: string | null) {
    this.setPropertyValue("ariaLabel", value);
  }

  get config(): Readonly<Record<string, unknown>> | null {
    return this.getPropertyValue<Readonly<Record<string, unknown>> | null>(
      "config",
      null,
    );
  }
  set config(value: Readonly<Record<string, unknown>> | null) {
    this.setPropertyValue("config", value);
  }

  get count(): number | null {
    return this.getPropertyValue<number | null>("count", null);
  }
  set count(value: number | null) {
    this.setPropertyValue("count", value);
  }

  get label(): string | null {
    return this.getPropertyValue<string | null>("label", null);
  }
  set label(value: string | null) {
    this.setPropertyValue("label", value);
  }

  override setAttribute(name: string, value: string): void {
    this.attributeValues.set(name, value);
  }

  override removeAttribute(name: string): void {
    this.attributeValues.delete(name);
  }

  override getAttribute(name: string): string | null {
    return this.attributeValues.get(name) ?? null;
  }

  override hasAttribute(name: string): boolean {
    return this.attributeValues.has(name);
  }

  protected override connected(): void {
    this.connectedCount += 1;
  }

  protected override disconnected(): void {
    this.disconnectedCount += 1;
  }

  protected override shouldUpdate(
    _changedProperties: VyrnForgeChangedProperties,
  ): boolean {
    return this.allowUpdate;
  }

  protected override update(
    changedProperties: VyrnForgeChangedProperties,
  ): void {
    this.updates.push(new Map(changedProperties));
  }
}

class DefaultHooksElement extends VyrnForgeElement {}

describe("VyrnForgeElement", () => {
  it("derives deterministic observed attributes", () => {
    expect(ProbeElement.observedAttributes).toEqual([
      "active",
      "aria-label",
      "count",
      "label",
    ]);
  });

  it("supports the default lifecycle and update hooks", async () => {
    const element = new DefaultHooksElement();

    element.connectedCallback();
    await expect(element.updateComplete).resolves.toBeUndefined();

    element.disconnectedCallback();
  });

  it("upgrades pre-definition properties and batches connected updates", async () => {
    const probe = new ProbeElement();
    Object.defineProperty(probe, "label", {
      configurable: true,
      writable: true,
      value: "before-definition",
    });

    probe.connectedCallback();
    await probe.updateComplete;

    expect(probe.label).toBe("before-definition");
    expect(probe.connectedCount).toBe(1);
    expect(probe.updates).toHaveLength(1);

    probe.count = 2;
    probe.label = "ready";
    probe.label = "ready";
    await probe.updateComplete;

    expect(probe.updates).toHaveLength(2);
    expect(probe.updates[1]).toEqual(
      new Map<string, unknown>([
        ["count", undefined],
        ["label", "before-definition"],
      ]),
    );
    expect(probe.getAttribute("count")).toBe("2");
    expect(probe.getAttribute("label")).toBe("ready");
  });

  it("parses observed attributes and reflects primitive properties", async () => {
    const probe = new ProbeElement();
    probe.connectedCallback();
    await probe.updateComplete;

    probe.attributeChangedCallback("active", null, "");
    probe.attributeChangedCallback("count", null, "4.5");
    probe.attributeChangedCallback("aria-label", null, "Account menu");
    probe.attributeChangedCallback("label", null, "Account");
    probe.attributeChangedCallback("unknown", null, "ignored");
    await probe.updateComplete;

    expect(probe.active).toBe(true);
    expect(probe.count).toBe(4.5);
    expect(probe.ariaLabel).toBe("Account menu");
    expect(probe.label).toBe("Account");

    probe.active = false;
    probe.count = Number.NaN;
    probe.ariaLabel = null;
    await probe.updateComplete;

    expect(probe.hasAttribute("active")).toBe(false);
    expect(probe.hasAttribute("count")).toBe(false);
    expect(probe.hasAttribute("aria-label")).toBe(false);

    probe.attributeChangedCallback("count", "4.5", "not-a-number");
    probe.attributeChangedCallback("active", "", null);
    await probe.updateComplete;

    expect(probe.count).toBeNull();
    expect(probe.active).toBe(false);
  });

  it("keeps object values property-only", async () => {
    const probe = new ProbeElement();
    const config = Object.freeze({ density: "compact" });
    probe.connectedCallback();
    await probe.updateComplete;

    probe.config = config;
    await probe.updateComplete;

    expect(probe.config).toBe(config);
    expect(probe.attributeValues.size).toBe(0);
  });

  it("defers disconnected work until reconnect", async () => {
    const probe = new ProbeElement();
    probe.connectedCallback();
    await probe.updateComplete;
    probe.disconnectedCallback();
    probe.disconnectedCallback();

    probe.label = "offline";
    await Promise.resolve();
    expect(probe.updates).toHaveLength(1);
    expect(probe.disconnectedCount).toBe(1);

    probe.connectedCallback();
    probe.connectedCallback();
    await probe.updateComplete;

    expect(probe.connectedCount).toBe(2);
    expect(probe.updates).toHaveLength(2);
    expect(probe.updates[1]?.get("label")).toBeUndefined();
    expect(probe.label).toBe("offline");
  });

  it("supports shouldUpdate without dropping update completion", async () => {
    const probe = new ProbeElement();
    probe.connectedCallback();
    await probe.updateComplete;
    probe.allowUpdate = false;

    probe.label = "suppressed";
    await expect(probe.updateComplete).resolves.toBeUndefined();

    expect(probe.updates).toHaveLength(1);
    expect(probe.label).toBe("suppressed");
  });

  it("ignores reflected attribute callbacks and equal attribute values", async () => {
    const probe = new ProbeElement();
    const callback = vi.spyOn(probe, "attributeChangedCallback");
    probe.connectedCallback();
    await probe.updateComplete;

    probe.label = "reflected";
    probe.attributeChangedCallback("label", "reflected", "reflected");
    await probe.updateComplete;

    expect(callback).toHaveBeenCalledOnce();
    expect(probe.label).toBe("reflected");
  });
});
