import { describe, expect, it, vi } from "vitest";

import {
  VyrnForgeElement,
  createVyrnForgeEvent,
  defineVyrnForgeElement,
  dispatchVyrnForgeEvent,
  registerVyrnForgeElements,
  vyrnForgeElementDefinitions,
  vyrnForgeElementRegistrations,
  vyrnForgeUiElementsVersion,
  type VyrnForgeElementConstructor,
  type VyrnForgeElementRegistry,
} from "./index";

function createRegistry(): VyrnForgeElementRegistry {
  const entries = new Map<string, VyrnForgeElementConstructor>();
  return {
    define(name, constructor) {
      entries.set(name, constructor);
    },
    get(name) {
      return entries.get(name);
    },
  };
}

class ProbeElement extends VyrnForgeElement {
  value = "default";
  upgradeValue() {
    this.upgradeProperty("value");
  }
}

describe("ui-elements foundation", () => {
  it("exposes the coordinated package version", () => {
    expect(vyrnForgeUiElementsVersion).toBe("0.2.0-beta.1");
  });

  it("registers tags idempotently", () => {
    const registry = createRegistry();
    expect(
      defineVyrnForgeElement("vf-contract-probe", ProbeElement, registry),
    ).toBe(true);
    expect(
      defineVyrnForgeElement("vf-contract-probe", ProbeElement, registry),
    ).toBe(false);
    expect(() =>
      defineVyrnForgeElement(
        "vf-Bad" as `vf-${string}`,
        ProbeElement,
        registry,
      ),
    ).toThrow(TypeError);
    expect(
      defineVyrnForgeElement("vf-no-registry", ProbeElement, undefined),
    ).toBe(false);
  });

  it("preserves pre-upgrade properties", () => {
    const probe = new ProbeElement();
    Object.defineProperty(probe, "value", {
      configurable: true,
      writable: true,
      value: "before-definition",
    });
    probe.upgradeValue();
    expect(probe.value).toBe("before-definition");
    probe.upgradeValue();
    expect(probe.value).toBe("before-definition");
  });

  it("creates and dispatches canonical DOM events", () => {
    const target = new EventTarget();
    const listener = vi.fn();
    target.addEventListener("vf-value-change", listener);
    const event = createVyrnForgeEvent(
      "vf-value-change",
      { value: "ready" },
      { cancelable: true },
    );
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.cancelable).toBe(true);
    expect(event.detail).toEqual({ value: "ready" });
    expect(
      dispatchVyrnForgeEvent(target, "vf-value-change", { value: "ready" }),
    ).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("registers the native public catalog idempotently", () => {
    const registry = createRegistry();
    const first = registerVyrnForgeElements(registry);
    const second = registerVyrnForgeElements(registry);

    expect(first).toHaveLength(58);
    expect(first[0]).toBe("vf-text");
    expect(first[first.length - 1]).toBe("vf-top-nav");
    expect(second).toEqual([]);
    expect(Object.isFrozen(first)).toBe(true);
    expect(vyrnForgeElementDefinitions).toHaveLength(58);
    expect(Object.keys(vyrnForgeElementRegistrations)).toHaveLength(58);
  });
});
