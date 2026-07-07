import { describe, expect, it } from "vitest";
import {
  createDataGridTheme,
  mergeDataGridTheme,
  toDataGridThemeStyle
} from "./createDataGridTheme";

describe("data grid theme helpers", () => {
  it("creates and merges theme variable objects", () => {
    const baseTheme = createDataGridTheme({
      "--udg-primary": "#003b71",
      "--udg-radius-md": "10px"
    });
    const overrideTheme = createDataGridTheme({
      "--udg-primary": "#1d4ed8"
    });

    expect(mergeDataGridTheme(baseTheme, overrideTheme)).toEqual({
      "--udg-primary": "#1d4ed8",
      "--udg-radius-md": "10px"
    });
  });

  it("returns CSSProperties-compatible inline vars", () => {
    expect(
      toDataGridThemeStyle({
        "--udg-primary": "#003b71"
      })
    ).toEqual({
      "--udg-primary": "#003b71"
    });
  });
});
