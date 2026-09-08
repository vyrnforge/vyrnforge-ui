import { describe, expect, it } from "vitest";
import type {
  VyrnForgeElementConstructor,
  VyrnForgeElementRegistry,
} from "@vyrnforge/ui-elements";
import type { App, Component } from "vue";

import {
  createVyrnForgeVue,
  installVyrnForgeVue,
  VyrnForgeVue,
  vyrnForgeVueComponents,
} from "./plugin";

function createRegistry(): VyrnForgeElementRegistry {
  const definitions = new Map<string, VyrnForgeElementConstructor>();
  return {
    define(name, constructor) {
      definitions.set(name, constructor);
    },
    get(name) {
      return definitions.get(name);
    },
  };
}

function createAppStub(registrations: Map<string, Component>): App {
  return {
    component(name: string, component?: Component) {
      if (component) registrations.set(name, component);
      return this;
    },
  } as unknown as App;
}

describe("VyrnForge Vue setup", () => {
  it("registers canonical elements and every public facade component", () => {
    const registrations = new Map<string, Component>();
    const app = createAppStub(registrations);
    const registry = createRegistry();

    expect(installVyrnForgeVue(app, { elementRegistry: registry })).toBe(app);
    expect(registry.get("vf-button")).toBeDefined();
    expect(registry.get("vf-dialog")).toBeDefined();
    expect(registry.get("vf-tabs")).toBeDefined();
    expect(registry.get("vf-text-input")).toBeDefined();
    expect([...registrations.keys()]).toEqual(
      vyrnForgeVueComponents.map((component) =>
        String((component as { name?: string }).name),
      ),
    );
  });

  it("provides a structurally portable standard Vue plugin", () => {
    const registrations = new Map<string, Component>();
    const app = createAppStub(registrations);
    const plugin = createVyrnForgeVue({ elementRegistry: createRegistry() });

    expect(typeof plugin).toBe("object");
    expect(typeof plugin.install).toBe("function");
    expect(typeof VyrnForgeVue.install).toBe("function");
    plugin.install(app);
    expect(registrations.size).toBe(vyrnForgeVueComponents.length);
  });

  it("rejects values that do not implement the Vue application contract", () => {
    expect(() => installVyrnForgeVue({})).toThrow(
      "VyrnForge Vue setup requires a Vue application instance",
    );
  });
});
