import { CodeBlock } from '@vyrnforge/react/code';
import { Link } from '@vyrnforge/react/link';
import { createElement as h, useEffect, useState } from 'react';
import { ThemeScope } from '@vyrnforge/react';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { ThemeStudio } from './react-theme-studio.mjs';

function GuideLayout({ children, sections }) {
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    children,
    h('aside', { className: 'vf-docs-toc-region' },
      h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
        h(Text, { as: 'p' }, 'On this page'),
        h('ol', null, ...sections.map((entry) => h('li', { key: entry.id },
          h(Link, { href: '#' + entry.id }, entry.title)))))));
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
  return h(Link, { href }, children);
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
    h(CodeBlock, { tabIndex: 0 }, source),
    h(Text, { as: 'span', role: 'status', className: 'vf-docs-customization-copy-status', 'aria-live': 'polite' },
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
    h(Text, { as: 'p', role: 'status', 'aria-live': 'polite', 'data-vf-docs-preview-feedback': '' }, status));
}

export function ColorGuide({ links }) {
  return h(ThemeStudio, { links });
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
          h(Text, { as: 'p', role: 'status', 'aria-live': 'polite', 'data-vf-docs-rtl-feedback': '' },
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

