import { createElement as h, useEffect, useState } from 'react';
import { ThemeScope } from '@vyrnforge/react';
import { createTheme, renderThemeCss, themeableColorRoles } from '@vyrnforge/web/theme';
import { Button } from '@vyrnforge/react/button';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

// Palette scales are authoring inputs; public components still use semantic Web tokens.
const accentRecipes = [
  { id: 'blue', name: 'Blue', shades: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#245edb', 700: '#1c4fb8',
    800: '#173f8f', 900: '#0b1f4d', 950: '#07142e',
  } },
  { id: 'teal', name: 'Teal', shades: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
    400: '#2dd4bf', 500: '#14b8a6', 600: '#0f766e', 700: '#115e59',
    800: '#134e4a', 900: '#083c38', 950: '#042f2e',
  } },
  { id: 'violet', name: 'Violet', shades: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#8b5cf6', 600: '#6d28d9', 700: '#5b21b6',
    800: '#4c1d95', 900: '#2e1065', 950: '#1e0c43',
  } },
  { id: 'rose', name: 'Rose', shades: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#be123c', 700: '#9f1239',
    800: '#881337', 900: '#4c0519', 950: '#2b0310',
  } },
  { id: 'amber', name: 'Amber', shades: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#b45309', 700: '#92400e',
    800: '#78350f', 900: '#451a03', 950: '#301202',
  } },
];

const semanticSwatches = themeableColorRoles.map((name) => ({
  label: name.replaceAll('-', ' '), role: '--vf-color-' + name,
}));

function contrastRatio(foreground, background) {
  const luminosity = (hex) => {
    const parts = hex.slice(1).match(/.{2}/g) ?? ['00', '00', '00'];
    const [r, g, b] = parts.map((part) => {
      const value = parseInt(part, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const first = luminosity(foreground);
  const second = luminosity(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function readableOn(color) {
  return contrastRatio('#ffffff', color) >= contrastRatio('#0b1220', color)
    ? '#ffffff' : '#0b1220';
}

function GuideLayout({ children, sections }) {
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    children,
    h('aside', { className: 'vf-docs-toc-region' },
      h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
        h('p', null, 'On this page'),
        h('ol', null, ...sections.map((entry) => h('li', { key: entry.id },
          h('a', { href: '#' + entry.id }, entry.title)))))));
}

function GuideHeader({ title, description }) {
  return h('header', { className: 'vf-docs-component-header' },
    h(Text, { as: 'p', className: 'vf-docs-eyebrow' }, 'Foundations / Customization'),
    h(Text, { as: 'h1', variant: 'heading-lg' }, title),
    h(Text, { as: 'p', variant: 'body-lg' }, description));
}

function GuideSection({ id, title, children }) {
  return h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': id },
    h(Text, { as: 'h2', variant: 'heading-md', id }, title), children);
}

function GuideLink({ href, children }) {
  return h('a', { href, 'data-vf-link': '' }, children);
}

function CodeExample({ source, label = 'Example source' }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCopied(false); }, [source]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return h('div', { className: 'vf-docs-customization-code' },
    h(Flow, { direction: 'inline', wrap: 'wrap', justify: 'space-between', align: 'center', gap: 'sm' },
      h(Text, { as: 'span', variant: 'body-sm' }, label),
      h(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: copy }, copied ? 'Copied' : 'Copy code')),
    h('pre', { tabIndex: 0, 'data-vf-code-block': '' }, h('code', null, source)),
    h('span', { role: 'status', className: 'vf-docs-customization-copy-status', 'aria-live': 'polite' },
      copied ? 'Code copied to clipboard' : ''));
}

function Preview({ theme = 'light', customColors, variables, label, children }) {
  return h(ThemeScope, { as: 'section', theme, colors: customColors,
    style: variables, className: 'vf-docs-customization-preview', 'aria-label': label },
  h(Flow, { gap: 'md' }, children));
}

function DemoContent({ heading, action = 'Save changes' }) {
  const [status, setStatus] = useState('');
  return h(Flow, { gap: 'sm' },
    h(Text, { as: 'h3', variant: 'heading-sm' }, heading),
    h(Text, { as: 'p' }, 'Readable text and interactive controls share the same semantic colors.'),
    h(Text, { as: 'p', tone: 'secondary' }, 'Secondary text uses the muted foreground role.'),
    h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm' },
      h(Button, { type: 'button', variant: 'primary',
        onClick: () => setStatus('Primary preview action activated') }, action),
      h(Button, { type: 'button', variant: 'secondary',
        onClick: () => setStatus('Secondary preview action activated') }, 'Secondary action')),
    h('p', { role: 'status', 'aria-live': 'polite', 'data-vf-docs-preview-feedback': '' }, status));
}

export function ColorGuide({ links }) {
  const [id, setId] = useState('blue');
  const [appearance, setAppearance] = useState('light');
  const [shade, setShade] = useState('600');
  const recipe = accentRecipes.find((entry) => entry.id === id) ?? accentRecipes[0];
  const levels = Object.keys(recipe.shades);
  const position = levels.indexOf(shade);
  const hoverShade = levels[Math.max(0, Math.min(levels.length - 1,
    position + (appearance === 'light' ? 1 : -1)))];
  const pressedShade = levels[Math.max(0, Math.min(levels.length - 1,
    position + (appearance === 'light' ? 2 : 1)))];
  const foreground = readableOn(recipe.shades[shade]);
  const roleOverrides = {
    'accent-background': '{brand.' + shade + '}',
    'accent-background-hover': '{brand.' + hoverShade + '}',
    'accent-background-pressed': '{brand.' + pressedShade + '}',
    'accent-foreground': foreground,
    'accent-subtle': '{brand.' + (appearance === 'light' ? '50' : '900') + '}',
    'accent-subtle-hover': '{brand.' + (appearance === 'light' ? '100' : '800') + '}',
    'focus-ring': '{brand.' + (appearance === 'light' ? '600' : '300') + '}',
  };
  const definition = createTheme({
    name: recipe.id + '-' + appearance + '-preview',
    appearance,
    palette: { brand: recipe.shades },
    colors: roleOverrides,
    tokens: { '--vf-radius-surface': '0.75rem' },
  });
  const sample = "import { createTheme, renderThemeCss } from '@vyrnforge/web/theme';\n\n" +
    'const theme = createTheme({\n' +
    '  name: "' + definition.name + '",\n' +
    '  appearance: "' + appearance + '",\n' +
    '  palette: { brand: ' + JSON.stringify(recipe.shades, null, 2).replaceAll('\n', '\n  ') + ' },\n' +
    '  colors: ' + JSON.stringify(roleOverrides, null, 2).replaceAll('\n', '\n  ') + ',\n' +
    '  tokens: { "--vf-radius-surface": "0.75rem" },\n' +
    '});\n\nconst stylesheet = renderThemeCss(theme);';
  const shades = Object.entries(recipe.shades);
  const contrast = contrastRatio(foreground, recipe.shades[shade]).toFixed(2);
  return h(GuideLayout, { sections: [
    { id: 'vf-docs-color-picker', title: 'Palette families' },
    { id: 'vf-docs-color-roles', title: 'Semantic roles' },
    { id: 'vf-docs-color-function', title: 'Theme function' },
    { id: 'vf-docs-color-guidance', title: 'Accessibility' },
  ] },
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article',
      'data-vf-docs-react-color': '' },
      h(GuideHeader, { title: 'Color', description:
        'Explore complete shade scales, configure light or dark accents, and compile semantic brand themes with a reusable function.' }),
      h(GuideSection, { id: 'vf-docs-color-picker', title: 'Choose a color family and shade' },
        h(Text, { as: 'p' },
          'Select an authoring palette, shade and appearance. Only semantic roles reach components; numeric shades are inputs, not required public CSS variables.'),
        h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm', role: 'group',
          'aria-label': 'Accent color recipes', 'data-vf-docs-color-picker': '' },
          ...accentRecipes.map((entry) => h(Button, {
            key: entry.id, type: 'button', variant: entry.id === id ? 'primary' : 'secondary',
            'aria-pressed': entry.id === id, onClick: () => setId(entry.id),
          }, entry.name))),
        h(Flow, { as: 'div', direction: 'inline', wrap: 'wrap', gap: 'sm', role: 'group',
          'aria-label': 'Palette appearance', 'data-vf-docs-color-appearance': '' },
          ...['light', 'dark'].map((value) => h(Button, {
            key: value, type: 'button', variant: appearance === value ? 'primary' : 'secondary',
            'aria-pressed': appearance === value,
            onClick: () => { setAppearance(value); setShade(value === 'dark' ? '300' : '600'); },
          }, value === 'light' ? 'Light palette' : 'Dark palette'))),
        h(AutoGrid, { as: 'div', minItemSize: '7.5rem', gap: 'sm',
          'data-vf-docs-color-shades': '' },
          ...shades.map(([level, value]) => h(Button, { key: level, type: 'button',
            variant: level === shade ? 'primary' : 'secondary',
            'aria-pressed': level === shade,
            onClick: () => setShade(level),
            'aria-label': 'Shade ' + level + ', ' + value,
            className: 'vf-docs-palette-shade-option',
          },
          h('span', { className: 'vf-docs-palette-shade-chip',
            style: { backgroundColor: value }, 'aria-hidden': 'true' }),
          h('span', null, level + ' · ' + value)))),
        h('div', { 'data-vf-docs-color-selected': recipe.id,
          'data-vf-docs-color-shade': shade, 'data-vf-docs-color-scheme': appearance },
          h(Preview, { theme: appearance, variables: definition.variables,
            label: recipe.name + ' ' + appearance + ' color preview' },
            h(DemoContent, { heading: recipe.name + ' / ' + shade + ' · ' + appearance }))),
        h(Text, { as: 'p' },
          'Chosen accent foreground: ', h('code', { 'data-vf-code': '' }, foreground),
          '. Computed contrast against the selected accent: ', contrast, ':1. ' +
          'This preview calculation does not replace accessibility testing of all states.')),
      h(GuideSection, { id: 'vf-docs-color-roles', title: 'Semantic roles in this theme' },
        h(Text, { as: 'p' },
          'The generated theme starts with all canonical ' + themeableColorRoles.length +
          ' semantic color roles for its appearance. Changing a family remaps accent and focus roles while preserving surface, text, border, danger and disabled defaults.'),
        h(AutoGrid, { as: 'ul', minItemSize: '11rem', gap: 'sm',
          className: 'vf-docs-customization-swatches', 'data-vf-docs-color-roles': '' },
          ...semanticSwatches.map((entry) => h('li', { key: entry.role },
            h('span', { className: 'vf-docs-customization-swatch',
              style: { backgroundColor: definition.variables[entry.role] }, 'aria-hidden': 'true' }),
            h(Text, { as: 'strong' }, entry.label),
            h('code', { 'data-vf-code': '' }, entry.role),
            h(Text, { as: 'small' }, definition.variables[entry.role]))))),
      h(GuideSection, { id: 'vf-docs-color-function', title: 'Build your own theme with a function' },
        h(Text, { as: 'p' },
          'Use the framework-neutral @vyrnforge/web/theme authoring utility. It accepts your own shade scales, full semantic overrides and other public CSS tokens; output is an ordinary scoped stylesheet.'),
        h(CodeExample, { source: sample, label: 'Function-based theme definition' }),
        h(CodeExample, { source: renderThemeCss(definition),
          label: 'Generated CSS for the selected palette' }),
        h(Text, { as: 'p' },
          'Save generated CSS during your application build and load it after the canonical Web styles. For this live preview, the exact generated variables are applied directly to a local ThemeScope. No theme registration or provider is used.')),
      h(GuideSection, { id: 'vf-docs-color-guidance', title: 'Contrast, states and accessibility' },
        h(Text, { as: 'p' },
          'A valid accent family includes background, hover, pressed, contrasting foreground, subtle surfaces and focus. Check disabled states, focus visibility, forced-colors, light/dark contrast and composed components before production use.'),
        h(Text, { as: 'p' },
          h(GuideLink, { href: links.tokens }, 'Design tokens'), ' · ',
          h(GuideLink, { href: links.themes }, 'Theming'), ' · ',
          h(GuideLink, { href: links.darkMode }, 'Dark mode')))));
}

export function DarkModeGuide({ links }) {
  const [mode, setMode] = useState('light');
  const source = "import { ThemeScope, Text, Button } from '@vyrnforge/react';\n\n" +
    '<ThemeScope theme="' + mode + '">\n' +
    '  <Text as="p">Theme-aware content</Text>\n' +
    '  <Button variant="primary">Continue</Button>\n' +
    '</ThemeScope>';
  return h(GuideLayout, { sections: [{"id":"vf-docs-dark-modes","title":"Built-in modes"},{"id":"vf-docs-dark-system","title":"System preference"},{"id":"vf-docs-dark-ssr","title":"Server rendering"}] },
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article',
    'data-vf-docs-react-dark-mode': '' },
    h(GuideHeader, { title: 'Dark mode', description:
      'Switch light, dark and system appearances without a JavaScript palette or mandatory theme provider.' }),
    h(GuideSection, { id: 'vf-docs-dark-modes', title: 'Try the built-in modes' },
      h(Text, { as: 'p' }, 'The selected mode is applied directly to this preview, not to the entire documentation app.'),
      h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm', role: 'group',
        'aria-label': 'Preview appearance', 'data-vf-docs-dark-controls': '' },
        ...['light', 'dark', 'system'].map((value) => h(Button, {
          key: value, type: 'button', variant: mode === value ? 'primary' : 'secondary',
          'aria-pressed': mode === value, onClick: () => setMode(value),
        }, value[0].toUpperCase() + value.slice(1)))),
      h('div', { 'data-vf-docs-dark-selected': mode },
        h(Preview, { theme: mode, label: mode + ' mode preview' },
          h(DemoContent, { heading: mode === 'system' ? 'System preference' :
            mode === 'dark' ? 'Dark appearance' : 'Light appearance' }))),
      h(CodeExample, { source, label: 'React theme scope' })),
    h(GuideSection, { id: 'vf-docs-dark-system', title: 'Follow system preference' },
      h(Text, { as: 'p' }, 'Light is deterministic by default. Use theme="system" to opt into the browser prefers-color-scheme media query. A nested system region also resets correctly inside a different parent theme.'),
      h(CodeExample, { source: '[data-vf-theme="system"] { color-scheme: light; }\n' +
        '@media (prefers-color-scheme: dark) {\n' +
        '  [data-vf-theme="system"] { color-scheme: dark; }\n' +
        '}\n\n/* VyrnForge supplies the actual semantic token mappings. */',
      label: 'Conceptual browser behavior' })),
    h(GuideSection, { id: 'vf-docs-dark-ssr', title: 'Server rendering and application preference' },
      h(Text, { as: 'p' },
        'The framework-neutral theme attribute works before React hydration when server markup and the Web stylesheet are present. If an application adds a persisted user preference, the application owns its storage, first-paint synchronization and policy. VyrnForge does not require a theme manager.'),
      h(Text, { as: 'p' },
        'Use color-scheme so native form controls follow the appearance. Test focus, contrast and forced-colors behavior for custom palettes.'),
      h(Text, { as: 'p' },
        h(GuideLink, { href: links.themes }, 'Theming and custom brand scopes'), ' · ',
        h(GuideLink, { href: links.color }, 'Color roles')))));
}

export function RtlGuide({ links }) {
  const [direction, setDirection] = useState('rtl');
  const [saved, setSaved] = useState(false);
  const rtl = direction === 'rtl';
  const source = 'import { Button, Text } from \'@vyrnforge/react\';\n\n' +
    '<section lang="' + (rtl ? 'ar' : 'en') + '" dir="' + direction + '">\n' +
    '  <Text as="p">' + (rtl ? 'مرحبا بك' : 'Welcome') + '</Text>\n' +
    '  <Text as="p">ID: <bdi dir="ltr">VF-2048</bdi></Text>\n' +
    '  <Button type="button">' + (rtl ? 'حفظ' : 'Save') + '</Button>\n' +
    '</section>';
  return h(GuideLayout, { sections: [{"id":"vf-docs-rtl-preview-section","title":"Writing direction"},{"id":"vf-docs-rtl-integration","title":"Global and local direction"},{"id":"vf-docs-rtl-boundary","title":"Direction and themes"}] },
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article',
    'data-vf-docs-react-rtl': '' },
    h(GuideHeader, { title: 'Right-to-left', description:
      'Support Arabic, Hebrew and other RTL contexts through native lang and dir attributes and logical CSS.' }),
    h(GuideSection, { id: 'vf-docs-rtl-preview-section', title: 'Preview writing direction' },
      h(Text, { as: 'p' }, 'Change direction without changing the theme. The same components and shared stylesheet are used in both cases.'),
      h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm', role: 'group',
        'aria-label': 'Writing direction', 'data-vf-docs-rtl-controls': '' },
        ...[{ value: 'ltr', label: 'Left-to-right' }, { value: 'rtl', label: 'Right-to-left' }]
          .map((item) => h(Button, { key: item.value, type: 'button',
            variant: direction === item.value ? 'primary' : 'secondary',
            'aria-pressed': direction === item.value,
            onClick: () => { setDirection(item.value); setSaved(false); } }, item.label))),
      h('section', { lang: rtl ? 'ar' : 'en', dir: direction,
        className: 'vf-docs-customization-preview', 'data-vf-docs-rtl-preview': '' },
        h(Flow, { gap: 'sm' },
          h(Text, { as: 'h3', variant: 'heading-sm' }, rtl ? 'إعدادات الحساب' : 'Account settings'),
          h(Text, { as: 'p' }, rtl ? 'مرحباً بك في واجهة المستخدم.' : 'Welcome to the interface.'),
          h(Text, { as: 'p' }, rtl ? 'رقم المرجع: ' : 'Reference number: ',
            h('bdi', { dir: 'ltr' }, 'VF-2048')),
          h(Button, { type: 'button', variant: 'primary',
            onClick: () => setSaved(true) }, rtl ? 'حفظ' : 'Save'),
          h('p', { role: 'status', 'aria-live': 'polite', 'data-vf-docs-rtl-feedback': '' },
            saved ? (rtl ? 'تم الحفظ' : 'Saved') : ''))),
      h(CodeExample, { source, label: 'Native language and direction semantics' })),
    h(GuideSection, { id: 'vf-docs-rtl-integration', title: 'Global and local direction' },
      h(Text, { as: 'p' }, 'Set dir="rtl" and the correct lang on the document root for an RTL application, or on a nested region for a localized preview. Use dir="auto" and bdi to isolate user-supplied mixed-direction fragments when appropriate.'),
      h(CodeExample, { source: '<html lang="ar" dir="rtl">\n  <!-- Application markup -->\n</html>\n\n' +
        '<section lang="en" dir="ltr">English subsection</section>',
      label: 'Global and nested direction' })),
    h(GuideSection, { id: 'vf-docs-rtl-boundary', title: 'Direction is not a theme' },
      h(Text, { as: 'p' },
        'VyrnForge uses CSS logical properties and normal browser bidirectional layout. Do not create an RTL theme, reverse source arrays or install a framework-specific style-flipping runtime for the shared CSS.'),
      h(Text, { as: 'p' },
        'Portals moved outside their original DOM ancestry need an explicit direction bridge. Native dialog top-layer behavior generally retains DOM ancestry. Applications own translated content and locale policy.'),
      h(Text, { as: 'p' },
        h(GuideLink, { href: links.styling }, 'Styling & CSS'), ' · ',
        h(GuideLink, { href: links.themes }, 'Theming')))));
}

