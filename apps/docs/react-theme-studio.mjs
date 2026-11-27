import { createElement as h, useState } from 'react';
import { ThemeScope, createTheme, colors } from '@vyrnforge/react';
import { Button } from '@vyrnforge/react/button';
import { ColorPickerRoot, ColorPickerInput, ColorPickerTextInput, ColorPickerSwatch } from '@vyrnforge/react/color-picker';
import { SegmentedControlRoot, SegmentedControlItem } from '@vyrnforge/react/segmented-control';
import { Input } from '@vyrnforge/react/input';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Slider } from '@vyrnforge/react/slider';
import { Text } from '@vyrnforge/react/text';

export const themeValue = (theme, role) => theme.variables[colors[role].slice(4, -1)];

export { presets } from './theme-studio-model.mjs';

function luminance(hex) {
  const rgb = [1, 3, 5].map((at) => {
    const x = parseInt(hex.slice(at, at + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function readableOn(background) {
  return contrast('#ffffff', background) >= contrast('#0b1220', background)
    ? '#ffffff' : '#0b1220';
}
export function buildTheme({ palette, shades, shade, appearance, roleEdits, radius }) {
  const levels = Object.keys(shades);
  const at = levels.indexOf(shade);
  const direction = appearance === 'light' ? 1 : -1;
  const directionFits = at + 2 * direction >= 0 && at + 2 * direction < levels.length;
  const offset = directionFits ? direction : -direction;
  const hover = levels[at + offset];
  const pressed = levels[at + 2 * offset];
  const base = {
    accent: '{brand.' + shade + '}',
    accentHover: '{brand.' + hover + '}',
    accentPressed: '{brand.' + pressed + '}',
    onAccent: readableOn(shades[shade]),
    accentSubtle: '{brand.' + (appearance === 'light' ? '50' : '900') + '}',
    accentSubtleHover: '{brand.' + (appearance === 'light' ? '100' : '800') + '}',
    focus: '{brand.' + (appearance === 'light' ? '600' : '300') + '}',
  };
  const edits = Object.fromEntries(
    Object.entries(roleEdits).filter(([name]) => name.startsWith(appearance + ':'))
      .map(([name, value]) => [name.slice(appearance.length + 1), value]),
  );
  const options = {
    name: palette + '-' + appearance + '-studio',
    appearance,
    palette: { brand: shades },
    colors: { ...base, ...edits },
    tokens: {
      radius: { surface: radius + 'px', control: Math.max(0, radius - 4) + 'px' },
    },
  };
  return { options, theme: createTheme(options) };
}
export function Segment({ label, value, onChange, items, testId }) {
  return h(SegmentedControlRoot, { 'aria-label': label, value, onValueChange: onChange,
    'data-vf-docs-studio-segment': testId },
    ...items.map(([id, title]) => h(SegmentedControlItem, { key: id, value: id }, title)));
}
export function Picker({ value, onValueChange, label, testId }) {
  return h(ColorPickerRoot, { value, onValueChange, className: 'vf-docs-studio-picker',
    'data-vf-docs-studio-picker': testId },
    h(ColorPickerInput, { 'aria-label': 'Choose ' + label }),
    h(ColorPickerTextInput, { 'aria-label': label, spellCheck: false }),
    h(ColorPickerSwatch, null));
}
export function PreviewScene({ theme, view, direction = 'ltr', density = 'comfortable', viewport = 'auto' }) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('hello@example.com');
  const [optedIn, setOptedIn] = useState(true);
  const [amount, setAmount] = useState(72);
  return h(ThemeScope, { as: 'section', theme: theme.appearance, style: { ...theme.variables, ...(viewport === 'mobile' ? { maxInlineSize: '320px', inlineSize: '100%', justifySelf: 'center' } : {}) },
    dir: direction, 'data-vf-density': density,
    className: 'vf-docs-studio-scene', 'aria-label': theme.appearance + ' theme preview',
    'data-vf-docs-theme-preview': theme.appearance },
    h('div', { className: 'vf-docs-studio-scene-header' },
      h('span', { className: 'vf-docs-studio-scene-mark', 'aria-hidden': 'true' }, 'V'),
      h(Text, { as: 'strong', variant: 'label-md' }, 'VyrnForge'),
      h(Text, { as: 'span', className: 'vf-docs-studio-scene-meta' }, theme.appearance + ' appearance')),
    view === 'dashboard'
      ? h('div', { className: 'vf-docs-studio-scene-body' },
          h(Text, { as: 'p', variant: 'body-sm', tone: 'secondary' }, 'Overview / This month'),
          h(Text, { as: 'h3', variant: 'heading-md' }, 'Design with confidence'),
          h(Text, { as: 'p', tone: 'secondary' },
            'The same tokens style actions, surfaces, text and focus states.'),
          h('div', { className: 'vf-docs-studio-stats' },
            h('div', { className: 'vf-docs-studio-stat' },
              h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'Projects'),
              h(Text, { as: 'strong', variant: 'heading-md' }, '24'),
              h(Text, { as: 'span', className: 'vf-docs-studio-stat-accent' }, '+12.8% this month')),
            h('div', { className: 'vf-docs-studio-stat' },
              h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'Completed'),
              h(Text, { as: 'strong', variant: 'heading-md' }, '86%'),
              h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'On schedule'))),
          h('div', { className: 'vf-docs-studio-inline-actions' },
            h(Button, { type: 'button', variant: 'primary',
              onClick: () => setFeedback('Primary preview action activated') }, 'Save changes'),
            h(Button, { type: 'button', variant: 'secondary',
              onClick: () => setFeedback('Secondary preview action activated') }, 'Secondary action'),
            h(Button, { type: 'button', variant: 'ghost',
              onClick: () => setFeedback('Ghost preview action activated') }, 'More')))
      : h('div', { className: 'vf-docs-studio-scene-body' },
          h(Text, { as: 'h3', variant: 'heading-md' }, 'Account preferences'),
          h(Text, { as: 'p', tone: 'secondary' },
            'A real input, checkbox and slider in the current theme.'),
          h('label', { className: 'vf-docs-studio-field' },
            h(Text, { as: 'span' }, 'Contact email'),
            h(Input, { type: 'email', value: email, onChange: (e) => setEmail(e.target.value) })),
          h('label', { className: 'vf-docs-studio-check' },
            h(Checkbox, { checked: optedIn, onChange: (e) => setOptedIn(e.target.checked) }),
            h(Text, { as: 'span' }, 'Send product updates')),
          h('label', { className: 'vf-docs-studio-field' },
            h(Text, { as: 'span' }, 'Preview amount: ' + amount + '%'),
            h(Slider, { min: 0, max: 100, step: 1, value: amount,
              onChange: (e) => setAmount(Number(e.target.value)) })),
          h('div', { className: 'vf-docs-studio-inline-actions' },
            h(Button, { type: 'button', variant: 'primary',
              onClick: () => setFeedback('Preferences saved in preview') }, 'Save changes'),
            h(Button, { type: 'button', variant: 'secondary',
              onClick: () => { setEmail('hello@example.com'); setOptedIn(true); setAmount(72);
                setFeedback('Preview fields reset'); } }, 'Reset fields'))),
    h(Text, { as: 'p', role: 'status', 'aria-live': 'polite',
      'data-vf-docs-preview-feedback': '', className: 'vf-docs-studio-scene-status' }, feedback));
}

