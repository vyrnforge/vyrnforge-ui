import { act, createElement, forwardRef, useMemo } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { useCanonicalElementBridge } from "../internal/react-native-bridge";

class HydrationTestElement extends HTMLElement {
  value = "";
}

function createFixture(tagName: string, register: () => void) {
  return forwardRef<HTMLElement>(function Fixture(_, ref) {
    const properties = useMemo(() => ({ value: "hydrated" }), []);
    const events = useMemo(() => ({}), []);
    const elementRef = useCanonicalElementBridge(ref, {
      tagName,
      register,
      properties,
      events,
    });

    return createElement(tagName, {
      ref: elementRef as never,
      "data-vf-hydration-test": "true",
    });
  });
}

describe("MFD-1408 React SSR and hydration contract", () => {
  it("server renders without executing browser lifecycle side effects", () => {
    const tagName = "vf-react-ssr-test";
    const register = vi.fn();
    const Fixture = createFixture(tagName, register);

    const markup = renderToString(<Fixture />);

    expect(markup).toContain(tagName);
    expect(markup).toContain('data-vf-hydration-test="true"');
    expect(register).not.toHaveBeenCalled();
  });

  it("hydrates existing server markup and applies bridge state once mounted", async () => {
    const tagName = "vf-react-hydration-test";
    const register = vi.fn(() => {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, HydrationTestElement);
      }
    });
    const Fixture = createFixture(tagName, register);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Fixture />);

    await act(async () => {
      hydrateRoot(container, <Fixture />);
    });

    const element = container.querySelector(tagName) as HydrationTestElement;
    expect(element).toBeTruthy();
    expect(element.value).toBe("hydrated");
    expect(register).toHaveBeenCalledTimes(1);
  });
});
