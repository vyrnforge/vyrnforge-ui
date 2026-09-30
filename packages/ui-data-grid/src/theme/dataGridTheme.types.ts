import type { CSSProperties } from "react";

export type {
  DataGridCssVar,
  DataGridThemePreset,
  DataGridThemeVars,
} from "../foundation/theme.types";

export type DataGridThemeStyle = CSSProperties & Record<string, string>;
