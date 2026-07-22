import { describe, expect, it, vi } from "vitest";

import {
  VyrnForgeElement,
  createVyrnForgeEvent,
  defineVyrnForgeElement,
  dispatchVyrnForgeEvent,
  registerVyrnForgeElements,
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
    expect(vyrnForgeUiElementsVersion).toBe("0.1.0-alpha.1");
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

  it("keeps register-all idempotent while no public elements are implemented", () => {
    expect(registerVyrnForgeElements(createRegistry())).toEqual([]);
    expect(Object.isFrozen(registerVyrnForgeElements(createRegistry()))).toBe(
      true,
    );
  });
});
