import { describe, expect, it } from "vitest";
import {
  getVyrnForgeIconDefinition,
  getVyrnForgeIconMarkup,
  getVyrnForgeIconSvg,
  resolveVyrnForgeIconSize,
  vyrnForgeIconDefinitions,
  vyrnForgeIconNames,
} from "./icons";

describe("shared icon foundation", () => {
  it("keeps every public icon name backed by one canonical definition", () => {
    expect(Object.keys(vyrnForgeIconDefinitions)).toEqual([
      ...vyrnForgeIconNames,
    ]);

    for (const name of vyrnForgeIconNames) {
      expect(getVyrnForgeIconDefinition(name).length).toBeGreaterThan(0);
      expect(getVyrnForgeIconMarkup(name)).toMatch(/^<(?:circle|path|rect) /u);
    }
  });

  it("resolves shared named and numeric sizes", () => {
    expect(resolveVyrnForgeIconSize("xs")).toBe(12);
    expect(resolveVyrnForgeIconSize("md")).toBe(16);
    expect(resolveVyrnForgeIconSize("lg")).toBe(20);
    expect(resolveVyrnForgeIconSize(24)).toBe(24);
    expect(resolveVyrnForgeIconSize(0)).toBe(1);
  });

  it("serializes framework-neutral SVG with the shared visual contract", () => {
    const svg = getVyrnForgeIconSvg("Settings", "lg");
    expect(svg).toContain('height="20"');
    expect(svg).toContain('width="20"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('<circle cx="12" cy="12" r="3"/>');
  });
});
