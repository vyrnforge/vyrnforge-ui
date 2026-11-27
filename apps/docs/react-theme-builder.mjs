import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Code, CodeBlock } from '@vyrnforge/react/code';
import { Link } from '@vyrnforge/react/link';
import { createElement as h, useEffect, useReducer, useState } from 'react';
import { createTheme, renderThemeCss, colors, tokens } from '@vyrnforge/react';
import { Textarea } from '@vyrnforge/react/textarea';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Slider } from '@vyrnforge/react/slider';
import { Text } from '@vyrnforge/react/text';
import { buildTheme, Segment, Picker, PreviewScene, contrast, themeValue } from './react-theme-studio.mjs';
import { presets, modes, defaultDraft, validSlug, validHex, safeTokenValue, historyReducer, importLegacyDraft, parseDraft, serializeDraft, draftSchema } from './theme-studio-model.mjs';

const themeableColorRoles = Object.keys(colors).filter(role => !['primary', 'secondary', 'background'].includes(role));
const groups = ['All', 'Accent', 'Surfaces', 'Text', 'Borders', 'Feedback', 'Danger', 'Focus', 'Disabled'];
const groupFor = (role) => (role.startsWith('accent') || role === 'onAccent') ? 'Accent' :
  role.startsWith('surface') ? 'Surfaces' : ['text', 'muted', 'subtle'].includes(role) ? 'Text' :
  role.startsWith('border') ? 'Borders' : role.startsWith('danger') ? 'Danger' :
  /^(success|warning|info)/.test(role) ? 'Feedback' :
  role.startsWith('focus') ? 'Focus' : 'Disabled';
const friendly = (role) => role === 'onAccent' ? 'accent foreground' : role.replace(/[A-Z]/g, letter => ' ' + letter.toLowerCase());
const tokenId = reference => reference.slice(9, -1);
// Adapter only: portable identifiers derive from the canonical shared token
// identity; typed React aliases drive every createTheme call.
const catalog = Object.fromEntries([
  ...themeableColorRoles.map(role => [tokenId(colors[role]), { color: true, role, description: friendly(role) + ' semantic color (#RRGGBB)' }]),
  ...Object.entries(tokens).filter(([group]) => group !== 'color').flatMap(([group, entries]) =>
    Object.entries(entries).map(([key, ref]) => [tokenId(ref), {
      group, key, description: friendly(group) + ' / ' + friendly(key) + ' (public token override; omitted values inherit the baseline)',
    }])),
]);
const foundationEntries = Object.entries(catalog).filter(([, entry]) => !entry.color);
function overridesFor(draft, mode) {
  const roleEdits = {};
  const groups = {};
  for (const [id, value] of Object.entries(draft.overrides[mode])) {
    const entry = catalog[id];
    if (entry.color) roleEdits[mode + ':' + entry.role] = value;
    else (groups[entry.group] ??= {})[entry.key] = value;
  }
  return { roleEdits, groups };
}
const storageKey = 'vyrnforge.docs.theme-studio.v1';
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
  const [history, dispatch] = useReducer(historyReducer, null, () => ({ past: [], present: defaultDraft(), future: [] }));
  const draft = history.present;
  const edit = update => dispatch({ type: 'edit', update });
  const [appearance, setAppearance] = useState('light');
  const [advanced, setAdvanced] = useState(false);
  const [direction, setDirection] = useState('ltr');
  const [density, setDensity] = useState('comfortable');
  const [viewport, setViewport] = useState('auto');
  const [foundationQuery, setFoundationQuery] = useState('');
  const [foundationId, setFoundationId] = useState(foundationEntries[0][0]);
  const [foundationValue, setFoundationValue] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [role, setRole] = useState('accent');
  const [group, setGroup] = useState('All');
  const [query, setQuery] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);
  const [scene, setScene] = useState('dashboard');
  const [format, setFormat] = useState('function');
  const [status, setStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const { name, preset: palette, radius, paletteOverrides: custom } = draft;
  const shade = draft.shades[appearance];
  const setName = value => edit(previous => ({ ...previous, name: value }));
  const setPalette = value => edit(previous => ({ ...previous, preset: value, paletteOverrides: {} }));
  const setShade = value => edit(previous => ({ ...previous, shades: { ...previous.shades, [appearance]: value } }));
  const setRadius = value => edit(previous => ({ ...previous, radius: value }));
  const setOverride = (id, value) => edit(previous => {
    const entries = { ...previous.overrides[appearance] };
    if (value === undefined) delete entries[id];
    else entries[id] = value;
    return { ...previous, overrides: { ...previous.overrides, [appearance]: entries } };
  });
  useEffect(() => {
    const imported = importLegacyDraft(new URLSearchParams(window.location.search).get('draft'), catalog);
    if (imported) {
      dispatch({ type: 'replace', draft: imported });
      setStatus('Palette imported from the previous Theme Studio.');
    }
  }, []);
  const preset = presets.find(p => p.id === palette) ?? presets[0];
  const shades = { ...preset.shades, ...custom };
  const safeName = validSlug(name) ? name : 'my-brand';
  const definitions = Object.fromEntries(modes.map(mode => {
    const { roleEdits, groups } = overridesFor(draft, mode);
    const base = buildTheme({ palette, shades, shade: draft.shades[mode], appearance: mode, roleEdits, radius });
    const options = { ...base.options, name: safeName + '-' + mode,
      tokens: { ...groups, radius: { ...base.options.tokens.radius, ...groups.radius } } };
    return [mode, { options, theme: createTheme(options) }];
  }));
  const current = definitions[appearance].theme;
  const key = tokenId(colors[role]);
  const overridden = Object.hasOwn(draft.overrides[appearance], key);
  const value = themeValue(current, role);
  const foundFoundation = catalog[foundationId];
  const shownFoundation = foundationEntries.filter(([id, entry]) =>
    (id + ' ' + entry.description).toLowerCase().includes(foundationQuery.trim().toLowerCase()));
  const existingFoundation = draft.overrides[appearance][foundationId];
  const currentFoundation = current.variables[tokens[foundFoundation.group][foundFoundation.key].slice(4, -1)];
  const visible = themeableColorRoles.filter((item) =>
    (group === 'All' || groupFor(item) === group) &&
    friendly(item).includes(query.trim().toLowerCase()) &&
    (!changedOnly || Object.hasOwn(draft.overrides[appearance], tokenId(colors[item]))));
  const overrideCount = modes.reduce((count, mode) => count + Object.keys(draft.overrides[mode]).length, 0);
  const valid = validSlug(name);
  const ts = "import { createTheme, renderThemeCss } from '@vyrnforge/react';\n\n" +
    modes.map((mode) => 'export const ' + mode + 'Theme = createTheme(' +
      JSON.stringify(definitions[mode].options, null, 2) + ');').join('\n\n') +
    "\n\nexport const themeCss = [lightTheme, darkTheme].map(renderThemeCss).join('\\n');";
  const css = modes.map((mode) => renderThemeCss(definitions[mode].theme)).join('\n');
  const json = valid ? serializeDraft(draft, catalog) : '';
  const schema = JSON.stringify(draftSchema(catalog), null, 2);
  const ai = 'Customize this VyrnForge Theme Studio v1 draft. Return JSON only, preserve schemaVersion, use only listed token IDs, keep light and dark independent, and check contrast. Do not add CSS variables or preview settings.\n\nSCHEMA\n' + schema + '\n\nDRAFT\n' + json;
  const source = { function: ts, css, json, schema, ai }[format];
  const editRole = color => {
    if (validHex(color)) setOverride(key, color);
    setStatus(friendly(role) + ' overridden for ' + appearance);
  };
  const restoreRole = () => {
    setOverride(key, undefined);
    setStatus(friendly(role) + ' restored for ' + appearance);
  };
  const reset = () => {
    edit(() => defaultDraft());
    setAppearance('light'); setRole('accent'); setGroup('All'); setQuery('');
    setChangedOnly(false); setScene('dashboard'); setFormat('function');
    setExportStatus(''); setStatus('Theme Studio restored to defaults; Undo restores your draft');
  };
  const importDraft = text => {
    try {
      const next = parseDraft(text, catalog);
      edit(() => next); setImportError(''); setImportText('');
      setStatus('Theme imported. Undo restores the previous draft.');
    } catch (error) { setImportError(error.message); }
  };
  const saveDraft = () => {
    try { localStorage.setItem(storageKey, serializeDraft(draft, catalog)); setStatus('Draft saved on this browser'); }
    catch (error) { setStatus('Draft could not be saved: ' + error.message); }
  };
  const loadDraft = () => {
    try {
      const text = localStorage.getItem(storageKey);
      if (!text) { setStatus('No local draft saved'); return; }
      importDraft(text);
    } catch (error) { setImportError(error.message); }
  };
  const formatLabel = { function: 'TypeScript', css: 'CSS', json: 'JSON', schema: 'JSON Schema', ai: 'AI prompt' }[format];
  const copy = async () => {
    if (!valid) return;
    try {
      await navigator.clipboard.writeText(source);
      setExportStatus(formatLabel + ' copied');
    } catch { setExportStatus('Clipboard unavailable; copy from the code block manually'); }
  };
  const download = () => {
    if (!valid) return;
    const isJson = format === 'json' || format === 'schema';
    const payload = isJson ? source : css;
    const url = URL.createObjectURL(new Blob([payload], { type: isJson ? 'application/json' : 'text/css;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name + (isJson ? (format === 'schema' ? '-schema.json' : '-theme.json') : '-themes.css');
    document.body.append(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setExportStatus('Download requested');
  };
  return h('article', { className: 'vf-docs-article vf-docs-theme-studio vf-docs-theme-builder',
    'data-vf-docs-theme-builder': '' },
    h('header', { className: 'vf-docs-studio-heading' },
      h(Text, { as: 'p', className: 'vf-docs-eyebrow' }, 'Customization / Theme creation'),
      h(Text, { as: 'h1', variant: 'heading-lg' }, 'Theme Studio'),
      h(Text, { as: 'p', variant: 'body-lg' },
        'Start with a palette, customize your design, preview real components, and export a reusable light and dark theme.'),
      h('nav', { 'aria-label': 'Theme Studio sections', className: 'vf-docs-studio-jump' },
        ...[['vf-builder-design', 'Design'], ['vf-builder-roles', 'Tokens'],
          ['vf-builder-preview', 'Preview'], ['vf-builder-export', 'Export']].map(([id, label]) =>
          h(Link, { key: id, href: '#' + id }, label)))),
    h('div', { className: 'vf-docs-studio-bar' },
      h('div', { className: 'vf-docs-studio-bar-group' },
        h(Text, { as: 'strong', variant: 'label-md' }, 'Build your theme'),
        h(Text, { as: 'span', className: 'vf-docs-studio-bar-description' },
          overrideCount + ' token override' + (overrideCount === 1 ? '' : 's') +
          ' · light and dark stylesheets')),
      h('div', { className: 'vf-docs-studio-inline-actions' },
        h(Button, { type: 'button', size: 'sm', variant: 'secondary', disabled: !history.past.length, onClick: () => dispatch({ type: 'undo' }) }, 'Undo'),
        h(Button, { type: 'button', size: 'sm', variant: 'secondary', disabled: !history.future.length, onClick: () => dispatch({ type: 'redo' }) }, 'Redo'),
        h(Button, { type: 'button', size: 'sm', variant: 'secondary', disabled: !valid || name.length > 75, onClick: () => setName(name + '-copy') }, 'Duplicate'),
        h(Button, { type: 'button', size: 'sm', variant: 'secondary',
          onClick: reset, 'data-vf-docs-builder-reset': '' }, 'Reset theme'))),
    h(Segment, { label: 'Customization mode', value: advanced ? 'advanced' : 'simple', onChange: next => setAdvanced(next === 'advanced'), items: [['simple', 'Simple'], ['advanced', 'Advanced']], testId: 'studio-mode' }),
    h(Segment, { label: 'Builder editing appearance', value: appearance, testId: 'builder-appearance', onChange: setAppearance, items: [['light','Light'],['dark','Dark']] }),
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
              setPalette(e.target.value); setStatus('Palette family updated');
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
          if (validHex(color)) edit(previous => ({ ...previous, paletteOverrides: { ...previous.paletteOverrides, [shade]: color } })); setStatus('Shade updated');
        }, label: 'Builder shade hex', testId: 'builder-shade' }),
        h('label', { className: 'vf-docs-studio-field-label', htmlFor: 'vf-builder-radius' },
          'Surface radius · ' + radius + 'px'),
        h(Slider, { id: 'vf-builder-radius', min: 0, max: 24, step: 2, value: radius,
          onChange: (e) => setRadius(Number(e.target.value)) })),
      h('section', { className: 'vf-docs-studio-section', id: 'vf-builder-roles', hidden: !advanced,
        'aria-labelledby': 'vf-builder-roles-title' },
        h(Text, { as: 'h2', variant: 'heading-md', id: 'vf-builder-roles-title' }, '2 · Semantic token editor'),
        h(Text, { as: 'p' }, 'Switch appearances and change only the React color roles your brand needs. CSS output is available separately for portable delivery.'),
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
        h(Text, { as: 'h3', variant: 'heading-sm' }, 'Foundation and component tokens'),
        h('label', { className: 'vf-docs-studio-field' },
          h(Text, { as: 'span' }, 'Search foundation and component tokens'),
          h(Input, { type: 'search', value: foundationQuery, onChange: e => setFoundationQuery(e.target.value) })),
        h('label', { className: 'vf-docs-studio-field' },
          h(Text, { as: 'span' }, 'Token'),
          h(NativeSelect, { value: foundationId, onChange: e => { setFoundationId(e.target.value); setFoundationValue(''); } },
            ...[...shownFoundation, ...(!shownFoundation.some(([id]) => id === foundationId) ? [[foundationId, foundFoundation]] : [])]
              .map(([id, entry]) => h('option', { key: id, value: id }, entry.description)))),
        h(Text, { as: 'p' }, foundFoundation.description + '. Current value: ' + (currentFoundation ?? 'Inherited CSS default')),
        h('label', { className: 'vf-docs-studio-field' },
          h(Text, { as: 'span' }, 'New token value (for example 1rem, 500, 120ms)'),
          h(Input, { value: foundationValue, onChange: e => setFoundationValue(e.target.value) })),
        h('div', { className: 'vf-docs-studio-inline-actions' },
          h(Button, { type: 'button', disabled: !safeTokenValue(foundationValue), onClick: () => { setOverride(foundationId, foundationValue.trim()); setFoundationValue(''); setStatus('Token updated'); } }, 'Apply token'),
          h(Button, { type: 'button', variant: 'secondary', disabled: existingFoundation === undefined, onClick: () => setOverride(foundationId, undefined) }, 'Restore token')))),
    h(Text, { as: 'p', role: 'status', 'aria-live': 'polite', 'data-vf-docs-builder-notice': '' }, status),
    h('section', { className: 'vf-docs-studio-section', id: 'vf-builder-preview',
      'aria-labelledby': 'vf-builder-preview-title' },
      h('div', { className: 'vf-docs-studio-panel-head' },
        h('div', null, h(Text, { as: 'h2', variant: 'heading-md', id: 'vf-builder-preview-title' }, '3 · Live preview'),
          h(Text, { as: 'p' }, 'Both appearances are rendered with real VyrnForge controls.')),
        h(Segment, { label: 'Builder preview scene', value: scene, onChange: setScene,
          testId: 'builder-preview', items: [['dashboard', 'Dashboard'], ['form', 'Form']] })),
      h(Segment, { label: 'Preview direction', value: direction, onChange: setDirection, items: [['ltr','LTR'],['rtl','RTL']], testId: 'preview-direction' }),
      h(Segment, { label: 'Preview density', value: density, onChange: setDensity, items: [['comfortable','Comfortable'],['compact','Compact']], testId: 'preview-density' }),
      h(Segment, { label: 'Preview viewport', value: viewport, onChange: setViewport, items: [['auto','Flexible'],['mobile','320px']], testId: 'preview-viewport' }),
      h('div', { className: 'vf-docs-studio-scene-grid vf-docs-builder-preview-grid' },
        h(PreviewScene, { key: 'light', theme: definitions.light.theme, view: scene, direction, density, viewport }),
        h(PreviewScene, { key: 'dark', theme: definitions.dark.theme, view: scene, direction, density, viewport })),
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
        }, testId: 'builder-export', items: [['function', 'TypeScript'], ['css', 'CSS'], ['json','JSON'], ['schema','Schema'], ['ai','AI prompt']] })),
      h('div', { className: 'vf-docs-customization-code' },
        h(CodeBlock, { tabIndex: 0, 'data-vf-docs-builder-code': format }, source)),
      h('div', { className: 'vf-docs-studio-inline-actions' },
        h(Button, { type: 'button', variant: 'primary', onClick: copy, disabled: !valid,
          'data-vf-docs-builder-copy': '' }, 'Copy ' + formatLabel),
        h(Button, { type: 'button', variant: 'secondary', onClick: download,
          disabled: !valid, 'data-vf-docs-builder-download': '' }, format === 'json' || format === 'schema' ? 'Download JSON' : 'Download CSS')),
      h(Text, { as: 'p', role: 'status', 'aria-live': 'polite',
        'data-vf-docs-builder-export-status': '' }, exportStatus),
      h(Text, { as: 'p' }, 'Load generated CSS after canonical Web styles and apply data-vf-theme to a scope. ' +
        'Theme authoring does not guarantee accessibility; review interaction states and contrast.')),
    h('section', { className: 'vf-docs-studio-section', 'aria-labelledby': 'vf-studio-import' },
      h(Text, { as: 'h2', id: 'vf-studio-import', variant: 'heading-md' }, 'Import and reuse'),
      h(Text, { as: 'p' }, 'Paste a Theme Studio v1 JSON draft. Import validates the version, known token identities and safe values before replacing your current work. Preview preferences are not exported.'),
      h('label', { className: 'vf-docs-studio-field' },
        h(Text, { as: 'span' }, 'Theme JSON'),
        h(Textarea, { value: importText, onChange: e => setImportText(e.target.value), rows: 5, 'aria-invalid': !!importError })),
      importError ? h(Text, { as: 'p', role: 'alert' }, importError) : null,
      h('div', { className: 'vf-docs-studio-inline-actions' },
        h(Button, { type: 'button', disabled: !importText.trim(), onClick: () => importDraft(importText) }, 'Import JSON'),
        h(Button, { type: 'button', variant: 'secondary', disabled: !valid, onClick: saveDraft }, 'Save local draft'),
        h(Button, { type: 'button', variant: 'secondary', onClick: loadDraft }, 'Load local draft'))),
    h('footer', { className: 'vf-docs-studio-footer' },
      h(Link, { href: links.themes }, 'Theming'),
      h(Link, { href: links.tokens }, 'Design tokens')));
}
