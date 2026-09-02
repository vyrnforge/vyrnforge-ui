import { VyrnForgeElement } from "@vyrnforge/ui-elements";
import { createElement, forwardRef, useMemo } from "react";
import { render, screen } from "../../../../tests/dom";
import { describe, expect, it, vi } from "vitest";
import {
  assignCanonicalProperties,
  ensureCanonicalElementRegistered,
  subscribeCanonicalEvents,
  useCanonicalElementBridge,
} from "../internal/react-native-bridge";

class BridgeTestElement extends HTMLElement {
  value = "";
}

function defineBridgeTestElement(tagName: string): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, class extends BridgeTestElement {});
  }
}

describe("MFD-1403 React canonical element bridge", () => {
  it("assigns canonical properties without attribute coercion", () => {
    const element = document.createElement("div");
    assignCanonicalProperties(element, {
      value: "alpha",
      disabled: false,
      selection: ["one", "two"],
      nullable: null,
    });

    const target = element as unknown as Record<string, unknown>;
    expect(target.value).toBe("alpha");
    expect(target.disabled).toBe(false);
    expect(target.selection).toEqual(["one", "two"]);
    expect(target.nullable).toBeNull();
  });

  it("subscribes canonical CustomEvents and removes listeners", () => {
    const element = document.createElement("div");
    const handler = vi.fn();
    const cleanup = subscribeCanonicalEvents(element, {
      "vf-change": handler,
    });

    element.dispatchEvent(
      new CustomEvent("vf-change", { detail: { value: "next" } }),
    );
    expect(handler).toHaveBeenCalledWith(
      { value: "next" },
      expect.objectContaining({ type: "vf-change" }),
    );

    cleanup();
    element.dispatchEvent(
      new CustomEvent("vf-change", { detail: { value: "ignored" } }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("registers a missing canonical element once", () => {
    const tagName = "vf-react-bridge-registration-test";
    const register = vi.fn(() => defineBridgeTestElement(tagName));

    expect(ensureCanonicalElementRegistered(tagName, register)).toBe(true);
    expect(ensureCanonicalElementRegistered(tagName, register)).toBe(true);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it("bridges lifecycle, forwarded refs, properties, and events", async () => {
    const tagName = "vf-react-bridge-lifecycle-test";
    defineBridgeTestElement(tagName);
    const onChange = vi.fn();

    const Fixture = forwardRef<BridgeTestElement>(function Fixture(_, ref) {
      const properties = useMemo(() => ({ value: "controlled" }), []);
      const events = useMemo(() => ({ "vf-change": onChange }), []);
      const elementRef = useCanonicalElementBridge(ref, {
        tagName,
        properties,
        events,
      });

      return <div data-testid="host" ref={elementRef as never} />;
    });

    const ref = { current: null as BridgeTestElement | null };
    render(<Fixture ref={ref} />);
    const host = screen.getByTestId("host") as unknown as BridgeTestElement;

    expect(ref.current).toBe(host);
    expect(host.value).toBe("controlled");

    host.dispatchEvent(
      new CustomEvent("vf-change", { detail: { value: "next" } }),
    );
    expect(onChange).toHaveBeenCalledWith(
      { value: "next" },
      expect.objectContaining({ type: "vf-change" }),
    );
  });

  it("seeds VyrnForge properties before custom-element upgrade captures state", () => {
    const tagName = "vf-react-bridge-preupgrade-test";

    class PreUpgradeElement extends VyrnForgeElement {
      static override readonly properties = Object.freeze({
        value: { reflect: true, type: "string" as const },
      });

      connectedValue = "";

      get value(): string {
        return this.getPropertyValue("value", "");
      }

      set value(value: string) {
        this.setPropertyValue("value", value);
      }

      protected override connected(): void {
        this.connectedValue = this.value;
      }
    }

    const register = vi.fn(() => {
      customElements.define(tagName, PreUpgradeElement);
    });

    function Fixture() {
      const properties = useMemo(() => ({ value: "seeded" }), []);
      const elementRef = useCanonicalElementBridge<PreUpgradeElement>(null, {
        tagName,
        register,
        properties,
      });

      return createElement(tagName, {
        "data-testid": "preupgrade-host",
        ref: elementRef,
      });
    }

    render(<Fixture />);
    const host = screen.getByTestId("preupgrade-host") as PreUpgradeElement;

    expect(register).toHaveBeenCalledTimes(1);
    expect(host.value).toBe("seeded");
    expect(host.connectedValue).toBe("seeded");
  });
});
