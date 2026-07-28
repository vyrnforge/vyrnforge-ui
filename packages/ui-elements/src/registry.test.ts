import { describe, expect, it } from "vitest";

import { VyrnForgeElement } from "./base/VyrnForgeElement";
import {
  assertVyrnForgeElementTagName,
  createVyrnForgeElementRegistration,
  defineVyrnForgeElement,
  registerVyrnForgeElement,
  registerVyrnForgeElementDefinitions,
  registerVyrnForgeElements,
  vyrnForgeElementDefinitions,
  vyrnForgeElementRegistrations,
  type VyrnForgeElementConstructor,
  type VyrnForgeElementRegistry,
} from "./registry";

class FirstElement extends VyrnForgeElement {}
class SecondElement extends VyrnForgeElement {}

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

describe("VyrnForge element registration", () => {
  it("validates the vf-* tag namespace", () => {
    expect(() =>
      assertVyrnForgeElementTagName("vf-account-menu"),
    ).not.toThrow();
    expect(() => assertVyrnForgeElementTagName("account-menu")).toThrow(
      TypeError,
    );
    expect(() => assertVyrnForgeElementTagName("vf-Account")).toThrow(
      TypeError,
    );
  });

  it("defines one element idempotently", () => {
    const registry = createRegistry();
    expect(defineVyrnForgeElement("vf-first", FirstElement, registry)).toBe(
      true,
    );
    expect(defineVyrnForgeElement("vf-first", FirstElement, registry)).toBe(
      false,
    );
    expect(defineVyrnForgeElement("vf-missing", FirstElement, undefined)).toBe(
      false,
    );
  });

  it("registers definition lists in deterministic order", () => {
    const registry = createRegistry();
    const definitions = Object.freeze([
      { tagName: "vf-first" as const, constructor: FirstElement },
      { tagName: "vf-second" as const, constructor: SecondElement },
    ]);

    const first = registerVyrnForgeElementDefinitions(definitions, registry);
    const second = registerVyrnForgeElementDefinitions(definitions, registry);

    expect(first).toEqual(["vf-first", "vf-second"]);
    expect(Object.isFrozen(first)).toBe(true);
    expect(second).toEqual([]);
    expect(registerVyrnForgeElementDefinitions(definitions, undefined)).toEqual(
      [],
    );
  });

  it("creates reusable per-element registration functions", () => {
    const registry = createRegistry();
    const registerFirst = createVyrnForgeElementRegistration({
      tagName: "vf-first",
      constructor: FirstElement,
    });

    expect(registerFirst(registry)).toBe(true);
    expect(registerFirst(registry)).toBe(false);
    expect(
      registerVyrnForgeElement(
        { tagName: "vf-second", constructor: SecondElement },
        registry,
      ),
    ).toBe(true);
  });

  it("registers the frozen native public catalog and per-element entry points", () => {
    expect(vyrnForgeElementDefinitions).toHaveLength(54);
    expect(Object.isFrozen(vyrnForgeElementDefinitions)).toBe(true);
    expect(Object.keys(vyrnForgeElementRegistrations)).toHaveLength(54);

    const registry = createRegistry();
    const registered = registerVyrnForgeElements(registry);
    expect(registered).toEqual(
      vyrnForgeElementDefinitions.map(({ tagName }) => tagName),
    );
    expect(Object.isFrozen(registered)).toBe(true);
    expect(registerVyrnForgeElements(registry)).toEqual([]);
  });
});
