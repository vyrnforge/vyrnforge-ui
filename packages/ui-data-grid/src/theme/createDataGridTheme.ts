import type {
  DataGridThemePreset,
  DataGridThemeStyle,
  DataGridThemeVars
} from "./dataGridTheme.types";

export function createDataGridTheme(
  vars: DataGridThemeVars
): DataGridThemeVars {
  return vars;
}

export function mergeDataGridTheme(
  ...themes: Array<DataGridThemeVars | DataGridThemePreset | undefined>
): DataGridThemeVars {
  return themes.reduce<DataGridThemeVars>((mergedTheme, theme) => {
    if (!theme) {
      return mergedTheme;
    }

    return {
      ...mergedTheme,
      ...("vars" in theme ? theme.vars : theme)
    };
  }, {});
}

export function toDataGridThemeStyle(
  vars?: DataGridThemeVars
): DataGridThemeStyle | undefined {
  if (!vars) {
    return undefined;
  }

  return vars as DataGridThemeStyle;
}
