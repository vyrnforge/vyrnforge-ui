import type { ColorRole, TextTone, ThemeColorOverrides, ThemeMotionOverrides, ThemeName, ThemeScopeProps } from '@vyrnforge/react';
import { colors, tokens, ThemeScope } from '@vyrnforge/react';
import type { TextProps } from '@vyrnforge/react/text';
import type { IconProps, SvgIconProps } from '@vyrnforge/react/icon';

const role: ColorRole = 'primary';
const tone: TextTone = 'danger';
const brand: ThemeName = 'acme';
const overrides: ThemeColorOverrides = { primary: '#123456', onAccent: '#fff', danger: 'tomato', successForeground: '#166534', warningBorder: '#b45309', infoBackground: '#f0f9ff' };
const motion: ThemeMotionOverrides = { controlDuration: '80ms', entranceDuration: '480ms', standardEasing: 'linear' };
const props: ThemeScopeProps = { as: 'section', theme: brand, colors: overrides, motion, 'aria-label': 'Brand section' };
// @ts-expect-error unknown motion token roles must be rejected
const invalidMotion: ThemeMotionOverrides = { speed: 'slow' };
void invalidMotion;
const heading: TextProps<'h2'> = { as: 'h2', tone: 'secondary', variant: 'heading-md' };
const icon: SvgIconProps = { tone: 'accent', size: 'lg' };
const catalogIcon: IconProps = { icon: { name: 'a', viewBox: '0 0 24 24', variants: {} } as IconProps['icon'], tone: 'danger' };
// @ts-expect-error unknown semantic color roles must be rejected
const invalid: ColorRole = 'rainbow';
// @ts-expect-error text tones cannot be arbitrary CSS strings
const invalidTone: TextTone = '#ff0011';
// @ts-expect-error ThemeScope is deliberately not a React context provider
const invalidOverrides: ThemeColorOverrides = { cobalt600: '#245edb' };

void [role, tone, brand, props, heading, icon, catalogIcon, invalid, invalidTone, invalidOverrides, colors, tokens, ThemeScope];

import { createTheme, renderThemeCss, tokenStyle } from '@vyrnforge/react';
import type { CreateThemeOptions, ThemeTokenOverrides } from '@vyrnforge/react';
const named: ThemeTokenOverrides = { skeleton: { duration: '2s' }, radius: { control: '12px' }, textField: { labelFont: '600 1rem sans-serif' } };
const options: CreateThemeOptions = { name: 'brand', colors: { accent: '#123456' }, tokens: named };
void [renderThemeCss(createTheme(options)), tokenStyle(named)];
// @ts-expect-error CSS variable names are not React token groups
const raw: ThemeTokenOverrides = { '--vf-control-radius': '12px' };
// @ts-expect-error unknown component token
const bad: ThemeTokenOverrides = { skeleton: { secret: 'red' } };
void [raw, bad];

const tooltipTokens: ThemeTokenOverrides = { tooltip: { background: '#1e3a8a', foreground: '#fff', radius: '8px', font: '400 14px/1.5 sans-serif', maxWidth: '14rem', offset: '6px' } };
void [tokens.tooltip.background, createTheme({ name: 'tooltip-brand', tokens: tooltipTokens }), tokenStyle(tooltipTokens)];
// @ts-expect-error unknown Tooltip token role
const badTooltip: ThemeTokenOverrides = { tooltip: { color: '#fff' } };
void badTooltip;
