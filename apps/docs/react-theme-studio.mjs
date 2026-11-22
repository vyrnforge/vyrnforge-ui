import { createElement as h, useState } from 'react';
import { ThemeScope } from '@vyrnforge/react';
import { createTheme, renderThemeCss, themeableColorRoles } from '@vyrnforge/web/theme';
import { Button } from '@vyrnforge/react/button';
import { ColorPickerRoot, ColorPickerInput, ColorPickerTextInput, ColorPickerSwatch } from '@vyrnforge/react/color-picker';
import { SegmentedControlRoot, SegmentedControlItem } from '@vyrnforge/react/segmented-control';
import { Input } from '@vyrnforge/react/input';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

// Documentation presets: palette shades are authoring inputs, never public UI tokens.
const presets = [
  { id: 'blue', label: 'Blue', shades: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#245edb', 700: '#1c4fb8',
    800: '#173f8f', 900: '#0b1f4d', 950: '#07142e',
  } },
  { id: 'teal', label: 'Teal', shades: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
    400: '#2dd4bf', 500: '#14b8a6', 600: '#0f766e', 700: '#115e59',
    800: '#134e4a', 900: '#083c38', 950: '#042f2e',
  } },
  { id: 'violet', label: 'Violet', shades: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#8b5cf6', 600: '#6d28d9', 700: '#5b21b6',
    800: '#4c1d95', 900: '#2e1065', 950: '#1e0c43',
  } },
  { id: 'rose', label: 'Rose', shades: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#be123c', 700: '#9f1239',
    800: '#881337', 900: '#4c0519', 950: '#2b0310',
  } },
  { id: 'amber', label: 'Amber', shades: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#b45309', 700: '#92400e',
    800: '#78350f', 900: '#451a03', 950: '#301202',
  } },
];

function luminance(hex) {
  const rgb = [1, 3, 5].map((at) => {
    const x = parseInt(hex.slice(at, at + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function readableOn(background) {
  return contrast('#ffffff', background) >= contrast('#0b1220', background)
    ? '#ffffff' : '#0b1220';
}
function buildTheme({ palette, shades, shade, appearance, roleEdits, radius }) {
  const levels = Object.keys(shades);
  const at = levels.indexOf(shade);
  const direction = appearance === 'light' ? 1 : -1;
  const directionFits = at + 2 * direction >= 0 && at + 2 * direction < levels.length;
  const offset = directionFits ? direction : -direction;
  const hover = levels[at + offset];
  const pressed = levels[at + 2 * offset];
  const base = {
    'accent-background': '{brand.' + shade + '}',
    'accent-background-hover': '{brand.' + hover + '}',
    'accent-background-pressed': '{brand.' + pressed + '}',
    'accent-foreground': readableOn(shades[shade]),
    'accent-subtle': '{brand.' + (appearance === 'light' ? '50' : '900') + '}',
    'accent-subtle-hover': '{brand.' + (appearance === 'light' ? '100' : '800') + '}',
    'focus-ring': '{brand.' + (appearance === 'light' ? '600' : '300') + '}',
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
      '--vf-radius-surface': radius + 'px',
      '--vf-control-radius': Math.max(0, radius - 4) + 'px',
    },
  };
  return { options, theme: createTheme(options) };
}
function Segment({ label, value, onChange, items, testId }) {
  return h(SegmentedControlRoot, { 'aria-label': label, value, onValueChange: onChange,
    'data-vf-docs-studio-segment': testId },
    ...items.map(([id, title]) => h(SegmentedControlItem, { key: id, value: id }, title)));
}
function Picker({ value, onValueChange, label, testId }) {
  return h(ColorPickerRoot, { value, onValueChange, className: 'vf-docs-studio-picker',
    'data-vf-docs-studio-picker': testId },
    h(ColorPickerInput, { 'aria-label': 'Choose ' + label }),
    h(ColorPickerTextInput, { 'aria-label': label, spellCheck: false }),
    h(ColorPickerSwatch, null));
}
function PreviewScene({ theme, view }) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('hello@example.com');
  const [optedIn, setOptedIn] = useState(true);
  const [amount, setAmount] = useState(72);
  return h(ThemeScope, { as: 'section', theme: theme.appearance, style: theme.variables,
    className: 'vf-docs-studio-scene', 'aria-label': theme.appearance + ' theme preview',
    'data-vf-docs-theme-preview': theme.appearance },
    h('div', { className: 'vf-docs-studio-scene-header' },
      h('span', { className: 'vf-docs-studio-scene-mark', 'aria-hidden': 'true' }, 'V'),
      h('strong', null, 'VyrnForge'),
      h('span', { className: 'vf-docs-studio-scene-meta' }, theme.appearance + ' appearance')),
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
              h('span', { className: 'vf-docs-studio-stat-accent' }, '+12.8% this month')),
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
            h('span', null, 'Contact email'),
            h(Input, { type: 'email', value: email, onChange: (e) => setEmail(e.target.value) })),
          h('label', { className: 'vf-docs-studio-check' },
            h(Checkbox, { checked: optedIn, onChange: (e) => setOptedIn(e.target.checked) }),
            h('span', null, 'Send product updates')),
          h('label', { className: 'vf-docs-studio-field' },
            h('span', null, 'Preview amount: ' + amount + '%'),
            h(Slider, { min: 0, max: 100, step: 1, value: amount,
              onChange: (e) => setAmount(Number(e.target.value)) })),
          h('div', { className: 'vf-docs-studio-inline-actions' },
            h(Button, { type: 'button', variant: 'primary',
              onClick: () => setFeedback('Preferences saved in preview') }, 'Save changes'),
            h(Button, { type: 'button', variant: 'secondary',
              onClick: () => { setEmail('hello@example.com'); setOptedIn(true); setAmount(72);
                setFeedback('Preview fields reset'); } }, 'Reset fields'))),
    h('p', { role: 'status', 'aria-live': 'polite',
      'data-vf-docs-preview-feedback': '', className: 'vf-docs-studio-scene-status' }, feedback));
}

export function ThemeStudio({ links }) {
  const [palette, setPalette] = useState('blue');
  const [appearance, setAppearance] = useState('light');
  const [shade, setShade] = useState('600');
  const [customShades, setCustomShades] = useState({});
  const [roleEdits, setRoleEdits] = useState({});
  const [selectedRole, setSelectedRole] = useState('accent-background');
  const [radius, setRadius] = useState(12);
  const [compare, setCompare] = useState(false);
  const [view, setView] = useState('dashboard');
  const [codeMode, setCodeMode] = useState('function');
  const [notice, setNotice] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const preset = presets.find((p) => p.id === palette) ?? presets[0];
  const shades = { ...preset.shades, ...(customShades[palette] ?? {}) };
  const { theme: current, options } = buildTheme({
    palette, shades, shade, appearance, roleEdits, radius,
  });
  const opposite = appearance === 'light' ? 'dark' : 'light';
  const other = compare ? buildTheme({
    palette, shades, shade: opposite === 'dark' ? '300' : '600',
    appearance: opposite, roleEdits, radius,
  }).theme : null;
  const roleKey = appearance + ':' + selectedRole;
  const roleValue = current.variables['--vf-color-' + selectedRole];
  const hasRoleOverride = Object.hasOwn(roleEdits, roleKey);
  const foreground = current.variables['--vf-color-accent-foreground'];
  const background = current.variables['--vf-color-accent-background'];
  const ratio = contrast(foreground, background);
  const source = "import { createTheme, renderThemeCss } from '@vyrnforge/web/theme';\n\n" +
    'const theme = createTheme(' + JSON.stringify(options, null, 2) + ');\n\n' +
    'const stylesheet = renderThemeCss(theme);\n' +
    '// Write stylesheet to your app CSS during your build.';
  const activeCode = codeMode === 'function' ? source : renderThemeCss(current);

  const reset = () => {
    setPalette('blue'); setAppearance('light'); setShade('600');
    setCustomShades({}); setRoleEdits({}); setSelectedRole('accent-background');
    setRadius(12); setCompare(false); setView('dashboard'); setCodeMode('function');
    setNotice('Theme Studio restored to its initial palette and tokens');
  };
  const setShadeValue = (value) => {
    setCustomShades((all) => ({ ...all, [palette]: { ...(all[palette] ?? {}), [shade]: value } }));
    setNotice('Palette shade ' + shade + ' updated to ' + value);
  };
  const setRoleValue = (value) => {
    setRoleEdits((all) => ({ ...all, [roleKey]: value }));
    setNotice('Semantic role ' + selectedRole + ' updated');
  };
  const restoreRole = () => {
    setRoleEdits((all) => {
      const next = { ...all };
      delete next[roleKey];
      return next;
    });
    setNotice('Default mapping restored for ' + selectedRole);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopyStatus(codeMode === 'function' ? 'Theme function copied' : 'Generated CSS copied');
    } catch {
      setCopyStatus('Clipboard unavailable; select the code block to copy manually');
    }
  };
  return h('article', { className: 'vf-docs-article vf-docs-theme-studio',
    'data-vf-docs-react-color': '' },
    h('header', { className: 'vf-docs-studio-heading' },
      h(Text, { as: 'p', className: 'vf-docs-eyebrow' }, 'Customization / Interactive playground'),
      h(Text, { as: 'h1', variant: 'heading-lg' }, 'Color'),
      h(Text, { as: 'p', variant: 'body-lg' },
        'Create a theme in real time. Change a palette, edit hex values and semantic roles, compare appearances, and copy the resulting theme function or CSS.'),
      h('nav', { 'aria-label': 'Theme Studio sections', className: 'vf-docs-studio-jump' },
        ...[['vf-studio-editor', 'Editor'], ['vf-studio-preview', 'Live preview'],
          ['vf-studio-roles', 'Tokens'], ['vf-studio-code', 'Export']].map(([target, name]) =>
          h('a', { href: '#' + target, key: target }, name)))),
    h('div', { className: 'vf-docs-studio-bar' },
      h('div', { className: 'vf-docs-studio-bar-group' },
        h('strong', null, 'Theme Studio'),
        h('span', { className: 'vf-docs-studio-bar-description' }, 'Changes update the preview instantly')),
      h(Button, { type: 'button', size: 'sm', variant: 'secondary',
        onClick: reset, 'data-vf-docs-studio-reset': '' }, 'Reset all')),
    h('div', { className: 'vf-docs-studio-workspace' },
      h('section', { id: 'vf-studio-editor', className: 'vf-docs-studio-editor',
        'aria-label': 'Theme editor' },
        h('div', { className: 'vf-docs-studio-editor-group' },
          h('h2', null, '01 / Palette'),
          h('p', null, 'Select a starting family'),
          h('div', { className: 'vf-docs-studio-families',
            'data-vf-docs-color-picker': '', role: 'group', 'aria-label': 'Accent color recipes' },
            ...presets.map((entry) => h(Button, { key: entry.id, type: 'button',
              variant: 'ghost', className: 'vf-docs-studio-family',
              'aria-pressed': palette === entry.id,
              onClick: () => { setPalette(entry.id); setNotice(entry.label + ' family selected'); } },
              h('span', { className: 'vf-docs-studio-family-dot',
                style: { backgroundColor: entry.shades[600] }, 'aria-hidden': 'true' }),
              entry.label))),
          h('p', null, 'Choose a shade'),
          h('div', { className: 'vf-docs-studio-shade-strip',
            'data-vf-docs-color-shades': '', role: 'group', 'aria-label': 'Palette shades' },
            ...Object.entries(shades).map(([level, value]) =>
              h('button', { type: 'button', key: level, className: 'vf-docs-studio-shade',
                style: { '--vf-docs-shade': value }, 'aria-pressed': level === shade,
                'aria-label': 'Shade ' + level + ', ' + value,
                onClick: () => { setShade(level); setNotice('Shade ' + level + ' selected'); } },
                h('span', { className: 'vf-docs-studio-shade-chip', 'aria-hidden': 'true' }),
                h('span', null, level)))),
          h('label', { className: 'vf-docs-studio-field-label' }, 'Edit shade ' + shade),
          h(Picker, { value: shades[shade], onValueChange: setShadeValue,
            label: 'Selected shade hex', testId: 'shade' })),
        h('div', { className: 'vf-docs-studio-editor-group' },
          h('h2', null, '02 / Appearance'),
          h(Segment, { label: 'Palette appearance', value: appearance,
            testId: 'appearance', items: [['light', 'Light'], ['dark', 'Dark']],
            onChange: (value) => { setAppearance(value); setShade(value === 'dark' ? '300' : '600');
              setNotice(value + ' palette selected'); } }),
          h('label', { className: 'vf-docs-studio-check' },
            h(Checkbox, { checked: compare, onChange: (e) => setCompare(e.target.checked),
              'data-vf-docs-studio-compare': '' }),
            h('span', null, 'Compare light and dark')),
          h('label', { htmlFor: 'vf-docs-studio-radius', className: 'vf-docs-studio-field-label' },
            'Surface radius · ' + radius + 'px'),
          h(Slider, { id: 'vf-docs-studio-radius', min: 0, max: 24, step: 2, value: radius,
            onChange: (e) => setRadius(Number(e.target.value)),
            'data-vf-docs-studio-radius': '' })),
        h('div', { className: 'vf-docs-studio-editor-group' },
          h('h2', null, '03 / Semantic role'),
          h('label', { htmlFor: 'vf-docs-studio-role', className: 'vf-docs-studio-field-label' },
            'Select a token to override'),
          h('select', { id: 'vf-docs-studio-role', value: selectedRole,
            'data-vf-docs-studio-role': '',
            onChange: (e) => { setSelectedRole(e.target.value);
              setNotice(e.target.value + ' role selected'); } },
            ...themeableColorRoles.map((name) => h('option', { key: name, value: name },
              name.replaceAll('-', ' ')))),
          h(Picker, { value: roleValue, onValueChange: setRoleValue,
            label: 'Semantic role hex', testId: 'role' }),
          h('div', { className: 'vf-docs-studio-role-actions' },
            h('code', null, '--vf-color-' + selectedRole),
            h(Button, { type: 'button', size: 'sm', variant: 'ghost',
              disabled: !hasRoleOverride, onClick: restoreRole,
              'data-vf-docs-studio-restore-role': '' }, 'Restore role'))),
        h('p', { className: 'vf-docs-studio-announcement', role: 'status',
          'aria-live': 'polite', 'data-vf-docs-studio-notice': '' }, notice)),
      h('section', { id: 'vf-studio-preview', className: 'vf-docs-studio-preview',
        'aria-label': 'Theme preview workspace' },
        h('div', { className: 'vf-docs-studio-panel-head' },
          h('div', null, h('h2', null, 'Live preview'),
            h('p', null, 'These are real VyrnForge controls using the selected tokens')),
          h(Segment, { label: 'Preview scene', value: view, onChange: setView,
            testId: 'scene', items: [['dashboard', 'Dashboard'], ['form', 'Form']] })),
        h('div', { className: 'vf-docs-studio-scene-grid',
          'data-vf-docs-color-selected': palette, 'data-vf-docs-color-shade': shade,
          'data-vf-docs-color-scheme': appearance,
          'data-vf-docs-studio-comparing': compare ? 'true' : 'false' },
          h(PreviewScene, { key: 'current', theme: current, view }),
          other ? h(PreviewScene, { key: 'comparison', theme: other, view }) : null),
        h('div', { className: 'vf-docs-studio-contrast',
          'data-vf-docs-studio-contrast': '' },
          h('span', { className: 'vf-docs-studio-contrast-dot',
            style: { backgroundColor: background }, 'aria-hidden': 'true' }),
          h('div', null,
            h('strong', null, 'Accent contrast: ' + ratio.toFixed(2) + ':1'),
            h('p', null, ratio >= 4.5
              ? 'Passes the 4.5:1 contrast ratio for normal text'
              : 'Below 4.5:1 for normal text; review these colors before use')),
          h('span', { className: 'vf-docs-studio-contrast-state' },
            ratio >= 4.5 ? 'AA ratio' : 'Review required')))),
    h('section', { id: 'vf-studio-roles', className: 'vf-docs-studio-section',
      'aria-labelledby': 'vf-docs-studio-roles-title' },
      h('div', { className: 'vf-docs-studio-panel-head' },
        h('div', null,
          h('h2', { id: 'vf-docs-studio-roles-title' }, 'Semantic token inspector'),
          h('p', null, 'Select any role to edit it above. All ' +
            themeableColorRoles.length + ' Web color roles update with your theme.'))),
      h('ul', { className: 'vf-docs-studio-token-grid',
        'data-vf-docs-color-roles': '' },
        ...themeableColorRoles.map((name) => h('li', { key: name },
          h('button', { type: 'button', className: 'vf-docs-studio-token',
            'aria-pressed': name === selectedRole,
            onClick: () => { setSelectedRole(name); setNotice(name + ' role selected'); } },
            h('span', { className: 'vf-docs-studio-token-swatch',
              style: { backgroundColor: current.variables['--vf-color-' + name] },
              'aria-hidden': 'true' }),
            h('span', null,
              h('strong', null, name.replaceAll('-', ' ')),
              h('code', null, current.variables['--vf-color-' + name]))))))),
    h('section', { id: 'vf-studio-code', className: 'vf-docs-studio-section',
      'aria-labelledby': 'vf-docs-studio-code-title' },
      h('div', { className: 'vf-docs-studio-panel-head' },
        h('div', null,
          h('h2', { id: 'vf-docs-studio-code-title' }, 'Export your theme'),
          h('p', null, 'Author with a function or use the generated CSS in any framework.')),
        h('div', { className: 'vf-docs-studio-inline-actions' },
          h(Segment, { label: 'Export format', value: codeMode, onChange: (v) => {
            setCodeMode(v); setCopyStatus(''); }, testId: 'code',
            items: [['function', 'Theme function'], ['css', 'Generated CSS']] }),
          h(Button, { type: 'button', variant: 'secondary', size: 'sm',
            onClick: copy, 'data-vf-docs-studio-copy': '' }, 'Copy code'))),
      h('div', { className: 'vf-docs-customization-code' },
        h('pre', { tabIndex: 0, 'data-vf-code-block': '', 'data-vf-docs-studio-code': codeMode },
          h('code', null, activeCode))),
      h('p', { role: 'status', 'aria-live': 'polite',
        'data-vf-docs-studio-copy-status': '' }, copyStatus),
      h('p', null, 'Theme functions are optional build-time helpers. CSS remains the shared runtime contract; ' +
        'do not assume generated palettes guarantee contrast across every control state.')),
    h('footer', { className: 'vf-docs-studio-footer' },
      h('a', { href: links.tokens, 'data-vf-link': '' }, 'Design tokens'),
      h('a', { href: links.themes, 'data-vf-link': '' }, 'Theming'),
      h('a', { href: links.darkMode, 'data-vf-link': '' }, 'Dark mode'),
      h('a', { href: links.styling, 'data-vf-link': '' }, 'Styling & CSS')));
}
