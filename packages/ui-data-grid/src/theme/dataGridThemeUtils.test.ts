import { vyrnForgeDarkTheme, vyrnForgeLightTheme } from "@vyrnforge/ui-core";
import { describe, expect, it } from "vitest";
import {
  createDataGridTheme,
  mergeDataGridTheme,
  toDataGridThemeStyle,
} from "./createDataGridTheme";
import {
  createDataGridThemeFromVyrnForgeTheme,
  dataGridDarkTheme,
  dataGridLightTheme,
} from "./dataGridThemes";

describe("data grid theme helpers", () => {
  it("creates and merges theme variable objects", () => {
    const baseTheme = createDataGridTheme({
      "--udg-primary": "#003b71",
      "--udg-radius-md": "10px",
    });
    const overrideTheme = createDataGridTheme({
      "--udg-primary": "#1d4ed8",
    });

    expect(mergeDataGridTheme(baseTheme, overrideTheme)).toEqual({
      "--udg-primary": "#1d4ed8",
      "--udg-radius-md": "10px",
    });
  });

  it("returns CSSProperties-compatible inline vars", () => {
    expect(
      toDataGridThemeStyle({
        "--udg-primary": "#003b71",
      }),
    ).toEqual({
      "--udg-primary": "#003b71",
    });
  });
  it("derives grid presets from the shared semantic theme source", () => {
    expect(dataGridLightTheme.vars["--udg-bg"]).toBe(
      vyrnForgeLightTheme["--vf-bg"],
    );
    expect(dataGridDarkTheme.vars["--udg-bg"]).toBe(
      vyrnForgeDarkTheme["--vf-bg"],
    );
    expect(dataGridDarkTheme.vars["--udg-primary-text"]).toBe(
      vyrnForgeDarkTheme["--vf-interactive-primary-text"],
    );
  });

  it("keeps unresolved shared primitives as CSS variable references", () => {
    const preset = createDataGridThemeFromVyrnForgeTheme("custom", {
      "--vf-bg": "#010203",
      "--vf-surface-page": "var(--vf-bg)",
    });

    expect(preset.vars["--udg-bg"]).toBe("#010203");
    expect(preset.vars["--udg-shadow-md"]).toBe("var(--vf-shadow-md)");
  });
});
