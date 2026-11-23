import { createElement as h, useState } from 'react';
import * as catalog from '@vyrnforge/icons';
import { Icon } from '@vyrnforge/react/icon';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { AutoGrid, Flow } from '@vyrnforge/react/layout';

// Documentation-only groupings, not an icon registry. Actual names, artwork and
// supported treatment/shape combinations always come from public catalog exports.
const groups = {
  'Actions & editing': [
    'add', 'check', 'close', 'copy', 'download', 'edit', 'filter', 'minus',
    'more-horizontal', 'more-vertical', 'print', 'redo', 'refresh', 'save',
    'search', 'send', 'share', 'trash', 'undo', 'upload',
  ],
  'Navigation & layout': [
    'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up',
    'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up',
    'external-link', 'home', 'link', 'location', 'maximize', 'menu',
    'minimize', 'pin',
  ],
  'Communication & sound': [
    'bell', 'mail', 'message', 'microphone', 'microphone-off',
    'phone', 'volume', 'volume-off',
  ],
  'Files & data': [
    'attachment', 'chart-bar', 'chart-line', 'cloud', 'code',
    'database', 'file', 'file-text', 'folder', 'folder-open', 'grid',
    'image', 'list', 'table', 'terminal',
  ],
  'Status & security': [
    'check-circle', 'error-circle', 'help-circle', 'info', 'key',
    'lock', 'shield', 'shield-check', 'unlock', 'warning',
  ],
  'People & commerce': ['cart', 'credit-card', 'tag', 'user', 'users'],
  'Media & favorites': [
    'camera', 'heart', 'lightning', 'pause', 'play', 'sparkles',
    'star', 'stop',
  ],
  'General & settings': [
    'bookmark', 'calendar', 'clock', 'eye', 'eye-off', 'globe',
    'moon', 'settings', 'sun', 'wifi',
  ],
};
const categoryOf = new Map(
  Object.entries(groups).flatMap(([category, names]) => names.map((name) => [name, category])),
);
export const iconEntries = Object.entries(catalog)
  .filter(([exportName, definition]) => exportName.endsWith('Icon') &&
    definition && typeof definition.name === 'string' && definition.variants)
  .map(([exportName, definition]) => ({
    name: definition.name,
    exportName,
    definition,
    category: categoryOf.get(definition.name) ?? 'Other',
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

const options = (values) => values.map(([value, label]) =>
  h('option', { value, key: value }, label));
const variants = [['outlined', 'Outlined'], ['filled', 'Filled']];
const shapes = [['rounded', 'Rounded'], ['sharp', 'Sharp']];
const sizes = [['sm', 'Small · 16px'], ['md', 'Medium · 20px'], ['lg', 'Large · 24px']];
const tones = [
  ['text', 'Default text'], ['primary', 'Primary / accent'],
  ['secondary', 'Secondary / muted'], ['danger', 'Danger'],
  ['subtle', 'Subtle'],
];

function chooser(id, title, value, setValue, choices) {
  return h('div', { key: id, className: 'vf-docs-icon-control' },
    h('label', { htmlFor: id }, title),
    h(NativeSelect, { id, value, onChange: (event) => setValue(event.target.value) },
      ...options(choices)));
}

function codeFor(entry, variant, shape, size, tone) {
  return "import { Icon } from '@vyrnforge/react/icon';\n" +
    "import { " + entry.exportName + " } from '@vyrnforge/icons/" + entry.name + "';\n" +
    "import '@vyrnforge/web/styles/icon.css';\n\n" +
    '<Icon icon={' + entry.exportName + '} variant="' + variant +
    '" shape="' + shape + '" size="' + size + '" tone="' + tone + '" />';
}

export function IconExplorer() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [variant, setVariant] = useState('outlined');
  const [shape, setShape] = useState('rounded');
  const [size, setSize] = useState('md');
  const [tone, setTone] = useState('text');
  const [selectedName, setSelectedName] = useState('search');
  const [copyStatus, setCopyStatus] = useState('');

  const matches = iconEntries.filter((entry) => {
    const glyph = entry.definition.variants?.[variant]?.[shape];
    return (category === 'All' || entry.category === category) &&
      entry.name.includes(query.trim().toLowerCase()) &&
      Boolean(glyph?.paths?.length);
  });
  const selected = iconEntries.find((entry) => entry.name === selectedName) ?? iconEntries[0];
  const glyph = selected?.definition.variants?.[variant]?.[shape];
  const strokes = [...new Set((glyph?.paths ?? []).map((path) => path.strokeWidth)
    .filter((width) => width !== undefined))];
  const snippet = selected ? codeFor(selected, variant, shape, size, tone) : '';
  const categories = ['All', ...new Set(iconEntries.map((entry) => entry.category))];

  async function copy(value, message) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setCopyStatus(message + ' copied');
    } catch {
      setCopyStatus('Clipboard unavailable. Select and copy the code manually.');
    }
  }

  return h(Flow, { as: 'section', gap: 'lg', className: 'vf-docs-icon-explorer',
    'aria-labelledby': 'react-icon-explorer-heading',
    'data-vf-docs-react-icon-explorer': '' },
    h('header', null,
      h('h3', { id: 'react-icon-explorer-heading' }, 'VyrnForge Icon Explorer'),
      h('p', null, 'Browse the actual @vyrnforge/icons exports. Every preview uses the public React Icon renderer.'),
      h('p', null, 'Outlined/filled and rounded/sharp are authored artwork slots; some shapes intentionally share paths, so visual differences vary by icon.')),
    h(AutoGrid, { gap: 'sm', minItemSize: '10rem', className: 'vf-docs-icon-controls' },
      h('div', { className: 'vf-docs-icon-control' },
        h('label', { htmlFor: 'vf-icon-search' }, 'Search icons'),
        h(Input, { id: 'vf-icon-search', type: 'search', value: query,
          placeholder: 'Search by official name',
          onChange: (event) => setQuery(event.target.value) })),
      chooser('vf-icon-category', 'Category', category, setCategory,
        categories.map((name) => [name, name === 'All' ? 'All categories' : name])),
      chooser('vf-icon-variant', 'Variant', variant, setVariant, variants),
      chooser('vf-icon-shape', 'Shape', shape, setShape, shapes),
      chooser('vf-icon-size', 'Size', size, setSize, sizes),
      chooser('vf-icon-tone', 'Semantic color', tone, setTone, tones)),
    h('p', { role: 'status', 'aria-live': 'polite', className: 'vf-docs-icon-count',
      'data-vf-docs-icon-count': '' },
      matches.length + ' of ' + iconEntries.length + ' icons shown'),
    h('div', { className: 'vf-docs-icon-workspace' },
      h(Flow, { gap: 'sm', className: 'vf-docs-icon-results' },
        matches.length
          ? h(AutoGrid, { as: 'ul', gap: 'sm', minItemSize: '7rem',
              className: 'vf-docs-icon-grid' },
              ...matches.map((entry) =>
                h('li', { key: entry.name },
                  h(Button, { type: 'button', variant: 'ghost', size: 'md',
                    'aria-pressed': selected?.name === entry.name,
                    'data-vf-docs-icon-card': entry.name,
                    onClick: () => { setSelectedName(entry.name); setCopyStatus(''); } },
                    h(Icon, { icon: entry.definition, variant, shape, size, tone }),
                    h('span', null, entry.name)))))
          : h('p', { className: 'vf-docs-icon-empty' },
              'No implemented icons match those filters. Try another name or category.')),
      selected && h(Flow, { as: 'aside', gap: 'md', className: 'vf-docs-icon-inspector',
        'aria-label': 'Selected icon details', 'data-vf-docs-icon-inspector': '' },
        h('div', { className: 'vf-docs-icon-inspector-heading' },
          h('h4', null, selected.name),
          h('p', null, selected.category)),
        h('div', { className: 'vf-docs-icon-preview', 'aria-label': 'Selected icon preview' },
          h(Icon, { icon: selected.definition, variant, shape, size, tone,
            label: selected.name + ' preview' })),
        h('dl', { className: 'vf-docs-icon-facts' },
          h('div', null, h('dt', null, 'Official name'), h('dd', null, selected.name)),
          h('div', null, h('dt', null, 'ViewBox'), h('dd', null, selected.definition.viewBox)),
          h('div', null, h('dt', null, 'Artwork'), h('dd', null, variant + ' / ' + shape)),
          h('div', null, h('dt', null, 'Authored paths'),
            h('dd', null, String(glyph?.paths?.length ?? 0))),
          h('div', null, h('dt', null, 'Path stroke width'),
            h('dd', null, strokes.length ? strokes.join(', ') : 'None (filled paths)'))),
        h('p', { className: 'vf-docs-icon-help' },
          'Stroke widths and geometry belong to the authored glyph, not a public Icon stroke prop. For custom geometry, use defineIcon; React-only SVG artwork can use SvgIcon or createSvgIcon.'),
        h('div', { className: 'vf-docs-icon-copy' },
          h(Button, { type: 'button', size: 'sm', variant: 'secondary',
            onClick: () => copy(selected.name, 'Icon name') }, 'Copy name'),
          h(Button, { type: 'button', size: 'sm', variant: 'secondary',
            onClick: () => copy(snippet, 'Usage code') }, 'Copy usage')),
        h('p', { role: 'status', 'aria-live': 'polite', className: 'vf-docs-icon-copy-status' },
          copyStatus),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, snippet)),
        h('p', { className: 'vf-docs-icon-help' },
          'Gallery previews are explicitly labeled; application icons are decorative by default. Use label only for standalone meaning, or name the owning Button or Link instead.'))),
    h('p', { className: 'vf-docs-icon-help' },
      'All entries here are implemented catalog exports. Duotone, additional weights, animation, automatic RTL artwork mirroring, and remote icon delivery are not supported catalog variants. A renderer does not become an interactive control by adding an Icon.'));
}
