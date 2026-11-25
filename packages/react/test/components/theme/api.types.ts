import type { ColorRole, TextTone, ThemeColorOverrides, ThemeMotionOverrides, ThemeName, ThemeScopeProps } from '@vyrnforge/react';
import { colors, tokens, ThemeScope } from '@vyrnforge/react';
import type { TextProps } from '@vyrnforge/react/text';
import type { IconProps, SvgIconProps } from '@vyrnforge/react/icon';

const role: ColorRole = 'primary';
const tone: TextTone = 'danger';
const brand: ThemeName = 'acme';
const overrides: ThemeColorOverrides = { primary: '#123456', onAccent: '#fff', danger: 'tomato' };
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
