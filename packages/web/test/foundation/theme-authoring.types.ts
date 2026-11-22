import { createTheme, renderThemeCss } from '@vyrnforge/web/theme';
import type { CreateThemeOptions, ThemeColorRole, ThemeDefinition } from '@vyrnforge/web/theme';

const role: ThemeColorRole = 'accent-background-hover';
const options: CreateThemeOptions = {
  name: 'demo',
  palette: { brand: { 50: '#f8fafc', 600: '#2563eb' } },
  colors: { [role]: '{brand.600}' },
  tokens: { '--vf-radius-surface': '0.75rem' },
};
const authored: ThemeDefinition = createTheme(options);
const css: string = renderThemeCss(authored);
void css;
// @ts-expect-error undocumented role
const unsupportedRole: ThemeColorRole = 'success-background';
void unsupportedRole;
