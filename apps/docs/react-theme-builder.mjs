import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Code, CodeBlock } from '@vyrnforge/react/code';
import { Link } from '@vyrnforge/react/link';
import { createElement as h, useEffect, useState } from 'react';
import { createTheme, renderThemeCss, colors } from '@vyrnforge/react';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Slider } from '@vyrnforge/react/slider';
import { Text } from '@vyrnforge/react/text';
import { presets, buildTheme, Segment, Picker, PreviewScene, contrast, themeValue } from './react-theme-studio.mjs';

const themeableColorRoles = Object.keys(colors).filter(role => !['primary', 'secondary', 'background'].includes(role));
const groups = ['All', 'Accent', 'Surfaces', 'Text', 'Borders', 'Feedback', 'Danger', 'Focus', 'Disabled'];
const groupFor = (role) => (role.startsWith('accent') || role === 'onAccent') ? 'Accent' :
  role.startsWith('surface') ? 'Surfaces' : ['text', 'muted', 'subtle'].includes(role) ? 'Text' :
  role.startsWith('border') ? 'Borders' : role.startsWith('danger') ? 'Danger' :
  /^(success|warning|info)/.test(role) ? 'Feedback' :
  role.startsWith('focus') ? 'Focus' : 'Disabled';
const validSlug = (name) => /^[a-z][a-z0-9-]*$/.test(name) &&
  !['light', 'dark', 'system'].includes(name);
const validHex = (text) => typeof text === 'string' && /^#[0-9a-f]{6}$/i.test(text);
function readDraft(search) {
  const raw = new URLSearchParams(search).get('draft');
  if (!raw || raw.length > 1600) return null;
  try {
    const x = JSON.parse(raw);
    if (!x || !presets.some((p) => p.id === x.palette) ||
      !['light', 'dark'].includes(x.appearance) ||
      !Object.hasOwn(presets[0].shades, x.shade) ||
      !Number.isInteger(x.radius) || x.radius < 0 || x.radius > 24 ||
      !x.custom || typeof x.custom !== 'object' || Array.isArray(x.custom)) return null;
    const custom = Object.fromEntries(Object.entries(x.custom)
      .filter(([key, color]) => Object.hasOwn(presets[0].shades, key) && validHex(color))
      .map(([key, color]) => [key, color.toLowerCase()]));
    return { palette: x.palette, appearance: x.appearance, shade: x.shade,
      radius: x.radius, custom };
  } catch { return null; }
}
const friendly = (role) => role === 'onAccent' ? 'accent foreground' : role.replace(/[A-Z]/g, letter => ' ' + letter.toLowerCase());
function TokenList({ roles, selected, onSelect, theme }) {
  return h('div', { className: 'vf-docs-builder-role-list', 'data-vf-docs-builder-roles': '',
    'aria-label': 'Semantic color roles' },
    roles.length ? roles.map((role) => h(ToggleButton, {
      type: 'button', key: role, className: 'vf-docs-studio-token',
      pressed: selected === role, onClick: () => onSelect(role),
    },
    h('span', { className: 'vf-docs-studio-token-swatch',
      style: { backgroundColor: themeValue(theme, role) },
      'aria-hidden': 'true' }),
    h(Text, { as: 'span' }, h(Text, { as: 'strong', variant: 'label-md' }, friendly(role)),
      h(Code, null, themeValue(theme, role))))) :
      h(Text, { as: 'p', className: 'vf-docs-builder-empty' }, 'No matching tokens. Clear a filter to see more.'));
}
function AccentContrast({ theme }) {
  const foreground = themeValue(theme, 'onAccent');
  const background = themeValue(theme, 'accent');
  const ratio = contrast(foreground, background);
  return h('div', { className: 'vf-docs-studio-contrast',
    'data-vf-docs-builder-contrast': theme.appearance },
    h('span', { className: 'vf-docs-studio-contrast-dot',
      style: { backgroundColor: background }, 'aria-hidden': 'true' }),
    h('div', null, h(Text, { as: 'strong', variant: 'label-md' }, theme.appearance + ' accent · ' + ratio.toFixed(2) + ':1'),
      h(Text, { as: 'p' }, ratio >= 4.5 ? 'Contrast ratio meets 4.5:1 for this pair' :
        'Below 4.5:1 for normal text; review the foreground and background')),
    h(Text, { as: 'span', className: 'vf-docs-studio-contrast-state' }, ratio >= 4.5 ? 'Pass' : 'Review'));
}
export function ThemeBuilder({ links }) {
  const [name, setName] = useState('my-brand');
  const [palette, setPalette] = useState('blue');
  const [appearance, setAppearance] = useState('light');
  const [shade, setShade] = useState('600');
  const [custom, setCustom] = useState({});
  const [radius, setRadius] = useState(12);
  const [roleEdits, setRoleEdits] = useState({});
  const [role, setRole] = useState('accent');
  const [group, setGroup] = useState('All');
  const [query, setQuery] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);
  const [scene, setScene] = useState('dashboard');
  const [format, setFormat] = useState('function');
  const [status, setStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  useEffect(() => {
    const draft = readDraft(window.location.search);
    if (!draft) return;
    setPalette(draft.palette);
    setAppearance(draft.appearance);
    setShade(draft.shade);
    setRadius(draft.radius);
    setCustom(draft.custom);
    setStatus('Palette imported from Theme Studio. Continue customizing semantic roles.');
  }, []);
  const preset = presets.find((p) => p.id === palette) ?? presets[0];
  const shades = { ...preset.shades, ...custom };
  const safeName = validSlug(name) ? name : 'my-brand';
  const modes = ['light', 'dark'];
  const definitions = Object.fromEntries(modes.map((mode) => {
    const modeShade = mode === appearance ? shade : mode === 'dark' ? '300' : '600';
    const base = buildTheme({ palette, shades, shade: modeShade, appearance: mode, roleEdits, radius });
    const options = { ...base.options, name: safeName + '-' + mode };
    return [mode, { options, theme: createTheme(options) }];
  }));
  const current = definitions[appearance].theme;
  const key = appearance + ':' + role;
  const overridden = Object.hasOwn(roleEdits, key);
  const value = themeValue(current, role);
  const visible = themeableColorRoles.filter((item) =>
    (group === 'All' || groupFor(item) === group) &&
    friendly(item).includes(query.trim().toLowerCase()) &&
    (!changedOnly || Object.hasOwn(roleEdits, appearance + ':' + item)));
  const overrideCount = Object.keys(roleEdits).length;
  const valid = validSlug(name);
  const ts = "import { createTheme, renderThemeCss } from '@vyrnforge/react';\n\n" +
    modes.map((mode) => 'export const ' + mode + 'Theme = createTheme(' +
      JSON.stringify(definitions[mode].options, null, 2) + ');').join('\n\n') +
    "\n\nexport const themeCss = [lightTheme, darkTheme].map(renderThemeCss).join('\\n');";
  const css = modes.map((mode) => renderThemeCss(definitions[mode].theme)).join('\n');
  const source = format === 'function' ? ts : css;
  const editRole = (color) => {
    setRoleEdits((previous) => ({ ...previous, [key]: color }));
    setStatus(friendly(role) + ' overridden for ' + appearance);
  };
  const restoreRole = () => {
    setRoleEdits((previous) => {
      const next = { ...previous }; delete next[key]; return next;
    });
    setStatus(friendly(role) + ' restored for ' + appearance);
  };
  const reset = () => {
    setName('my-brand'); setPalette('blue'); setAppearance('light'); setShade('600');
    setCustom({}); setRadius(12); setRoleEdits({}); setRole('accent');
    setGroup('All'); setQuery(''); setChangedOnly(false); setScene('dashboard');
    setFormat('function'); setExportStatus(''); setStatus('Theme Builder restored to defaults');
  };
  const copy = async () => {
    if (!valid) return;
    try {
      await navigator.clipboard.writeText(source);
      setExportStatus(format === 'css' ? 'CSS copied' : 'TypeScript copied');
    } catch { setExportStatus('Clipboard unavailable; copy from the code block manually'); }
  };
  const download = () => {
    if (!valid) return;
    const url = URL.createObjectURL(new Blob([css], { type: 'text/css;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name + '-themes.css';
    document.body.append(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setExportStatus('CSS download requested');
  };
  return h('article', { className: 'vf-docs-article vf-docs-theme-studio vf-docs-theme-builder',
    'data-vf-docs-theme-builder': '' },
    h('header', { className: 'vf-docs-studio-heading' },
      h(Text, { as: 'p', className: 'vf-docs-eyebrow' }, 'Customization / Theme creation'),
      h(Text, { as: 'h1', variant: 'heading-lg' }, 'Theme Builder'),
      h(Text, { as: 'p', variant: 'body-lg' },
        'Create a branded light and dark theme by editing semantic tokens. Explore real component previews, inspect your overrides and export reusable styles.'),
      h('nav', { 'aria-label': 'Theme Builder sections', className: 'vf-docs-studio-jump' },
        ...[['vf-builder-design', 'Design'], ['vf-builder-roles', 'Tokens'],
          ['vf-builder-preview', 'Preview'], ['vf-builder-export', 'Export']].map(([id, label]) =>
          h(Link, { key: id, href: '#' + id }, label)))),
    h('div', { className: 'vf-docs-studio-bar' },
      h('div', { className: 'vf-docs-studio-bar-group' },
        h(Text, { as: 'strong', variant: 'label-md' }, 'Build your theme'),
        h(Text, { as: 'span', className: 'vf-docs-studio-bar-description' },
          overrideCount + ' semantic override' + (overrideCount === 1 ? '' : 's') +
          ' · light and dark stylesheets')),
      h('div', { className: 'vf-docs-studio-inline-actions' },
        h(Link, { className: 'vf-docs-studio-next-link', href: links.color }, 'Back to Theme Studio'),
        h(Button, { type: 'button', size: 'sm', variant: 'secondary',
          onClick: reset, 'data-vf-docs-builder-reset': '' }, 'Reset builder'))),
    h('div', { className: 'vf-docs-builder-workspace' },
      h('section', { className: 'vf-docs-studio-section', id: 'vf-builder-design',
        'aria-labelledby': 'vf-builder-design-title' },
        h(Text, { as: 'h2', variant: 'heading-md', id: 'vf-builder-design-title' }, '1 · Theme identity'),
        h('label', { className: 'vf-docs-studio-field', htmlFor: 'vf-builder-name' },
          h(Text, { as: 'span' }, 'Theme name'),
          h(Input, { id: 'vf-builder-name', value: name, onChange: (e) => setName(e.target.value),
            'aria-invalid': !valid, 'aria-describedby': valid ? undefined : 'vf-builder-name-error',
            'data-vf-docs-builder-name': '' })),
        !valid ? h(Text, { as: 'p', id: 'vf-builder-name-error', role: 'alert' },
          'Use a lowercase slug starting with a letter; light, dark and system are reserved.') : null,
        h('label', { className: 'vf-docs-studio-field', htmlFor: 'vf-builder-palette' },
          h(Text, { as: 'span' }, 'Palette family'),
          h(NativeSelect, { id: 'vf-builder-palette', value: palette,
            'data-vf-docs-builder-palette': '', onChange: (e) => {
              setPalette(e.target.value); setCustom({}); setStatus('Palette family updated');
            } },
            ...presets.map((p) => h('option', { key: p.id, value: p.id }, p.label)))),
        h('div', { className: 'vf-docs-builder-palette-preview',
          'aria-label': 'Palette shade preview' },
          ...Object.entries(shades).map(([level, color]) =>
            h('span', { key: level, title: level + ' · ' + color,
              'aria-hidden': 'true', style: { backgroundColor: color } }))),
        h('label', { className: 'vf-docs-studio-field', htmlFor: 'vf-builder-shade' },
          h(Text, { as: 'span' }, 'Primary shade'),
          h(NativeSelect, { id: 'vf-builder-shade', value: shade,
            onChange: (e) => setShade(e.target.value) },
            ...Object.keys(shades).map((v) => h('option', { key: v, value: v }, v)))),
        h(Picker, { value: shades[shade], onValueChange: (color) => {
          setCustom((prev) => ({ ...prev, [shade]: color })); setStatus('Shade updated');
        }, label: 'Builder shade hex', testId: 'builder-shade' }),
        h('label', { className: 'vf-docs-studio-field-label', htmlFor: 'vf-builder-radius' },
          'Surface radius · ' + radius + 'px'),
        h(Slider, { id: 'vf-builder-radius', min: 0, max: 24, step: 2, value: radius,
          onChange: (e) => setRadius(Number(e.target.value)) })),
      h('section', { className: 'vf-docs-studio-section', id: 'vf-builder-roles',
        'aria-labelledby': 'vf-builder-roles-title' },
        h(Text, { as: 'h2', variant: 'heading-md', id: 'vf-builder-roles-title' }, '2 · Semantic token editor'),
        h(Text, { as: 'p' }, 'Switch appearances and change only the React color roles your brand needs. CSS output is available separately for portable delivery.'),
        h(Segment, { label: 'Builder editing appearance', value: appearance,
          testId: 'builder-appearance', onChange: (next) => {
            setAppearance(next); setShade(next === 'dark' ? '300' : '600');
          }, items: [['light', 'Light'], ['dark', 'Dark']] }),
        h('div', { className: 'vf-docs-builder-filter-row' },
          h('label', { className: 'vf-docs-studio-field', htmlFor: 'vf-builder-filter' },
            h(Text, { as: 'span' }, 'Search tokens'),
            h(Input, { type: 'search', id: 'vf-builder-filter', value: query,
              onChange: (e) => setQuery(e.target.value), 'data-vf-docs-builder-filter': '' })),
          h('label', { className: 'vf-docs-studio-field', htmlFor: 'vf-builder-group' },
            h(Text, { as: 'span' }, 'Category'),
            h(NativeSelect, { id: 'vf-builder-group', value: group,
              onChange: (e) => setGroup(e.target.value) },
              ...groups.map((g) => h('option', { key: g, value: g }, g))))),
        h('label', { className: 'vf-docs-studio-check' },
          h(Checkbox, { checked: changedOnly, onChange: (e) => setChangedOnly(e.target.checked),
            'data-vf-docs-builder-changed-only': '' }),
          h(Text, { as: 'span' }, 'Only changed roles')),
        h('div', { className: 'vf-docs-builder-role-workspace' },
          h(TokenList, { roles: visible, selected: role, onSelect: setRole, theme: current }),
          h('div', { className: 'vf-docs-builder-role-detail',
            'data-vf-docs-builder-role-detail': '' },
            h(Text, { as: 'h3', variant: 'heading-sm' }, friendly(role)),
            h(Code, null, 'colors.' + role),
            h(Picker, { value, onValueChange: editRole,
              label: 'Builder role hex', testId: 'builder-role' }),
            h(Text, { as: 'p' }, overridden ? 'Custom override for ' + appearance :
              'Using generated ' + appearance + ' color'),
            h(Button, { type: 'button', size: 'sm', variant: 'secondary',
              onClick: restoreRole, disabled: !overridden,
              'data-vf-docs-builder-restore-role': '' }, 'Restore role'))),
        h(Text, { as: 'p', role: 'status', 'aria-live': 'polite',
          'data-vf-docs-builder-notice': '' }, status))),
    h('section', { className: 'vf-docs-studio-section', id: 'vf-builder-preview',
      'aria-labelledby': 'vf-builder-preview-title' },
      h('div', { className: 'vf-docs-studio-panel-head' },
        h('div', null, h(Text, { as: 'h2', variant: 'heading-md', id: 'vf-builder-preview-title' }, '3 · Live preview'),
          h(Text, { as: 'p' }, 'Both appearances are rendered with real VyrnForge controls.')),
        h(Segment, { label: 'Builder preview scene', value: scene, onChange: setScene,
          testId: 'builder-preview', items: [['dashboard', 'Dashboard'], ['form', 'Form']] })),
      h('div', { className: 'vf-docs-studio-scene-grid vf-docs-builder-preview-grid' },
        h(PreviewScene, { key: 'light', theme: definitions.light.theme, view: scene }),
        h(PreviewScene, { key: 'dark', theme: definitions.dark.theme, view: scene })),
      h('div', { className: 'vf-docs-builder-contrasts' },
        h(AccentContrast, { theme: definitions.light.theme }),
        h(AccentContrast, { theme: definitions.dark.theme }))),
    h('section', { className: 'vf-docs-studio-section', id: 'vf-builder-export',
      'aria-labelledby': 'vf-builder-export-title' },
      h('div', { className: 'vf-docs-studio-panel-head' },
        h('div', null, h(Text, { as: 'h2', variant: 'heading-md', id: 'vf-builder-export-title' }, '4 · Export your theme'),
          h(Text, { as: 'p' }, 'Copy the authoring functions or the complete generated CSS.')),
        h(Segment, { label: 'Builder export format', value: format, onChange: (next) => {
          setFormat(next); setExportStatus('');
        }, testId: 'builder-export', items: [['function', 'TypeScript'], ['css', 'CSS']] })),
      h('div', { className: 'vf-docs-customization-code' },
        h(CodeBlock, { tabIndex: 0, 'data-vf-docs-builder-code': format }, source)),
      h('div', { className: 'vf-docs-studio-inline-actions' },
        h(Button, { type: 'button', variant: 'primary', onClick: copy, disabled: !valid,
          'data-vf-docs-builder-copy': '' }, 'Copy ' + (format === 'css' ? 'CSS' : 'TypeScript')),
        h(Button, { type: 'button', variant: 'secondary', onClick: download,
          disabled: !valid, 'data-vf-docs-builder-download': '' }, 'Download CSS')),
      h(Text, { as: 'p', role: 'status', 'aria-live': 'polite',
        'data-vf-docs-builder-export-status': '' }, exportStatus),
      h(Text, { as: 'p' }, 'Load generated CSS after canonical Web styles and apply data-vf-theme to a scope. ' +
        'Theme authoring does not guarantee accessibility; review interaction states and contrast.')),
    h('footer', { className: 'vf-docs-studio-footer' },
      h(Link, { href: links.color }, 'Theme Studio'),
      h(Link, { href: links.themes }, 'Theming'),
      h(Link, { href: links.tokens }, 'Design tokens')));
}
