import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } from '@vyrnforge/react/app-shell';
import { SideNav, SideNavGroup, SideNavGroupLabel, SideNavList, SideNavItem, SideNavLink } from '@vyrnforge/react/side-nav';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { SearchFieldRoot, SearchFieldInput, SearchFieldClear } from '@vyrnforge/react/search-field';
import { NativeSelect } from '@vyrnforge/react/native-select';

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function renderInline(value) {
  // The compiler owns authored content; React renders its inline semantics without injecting HTML.
  return String(value).split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`'))
      return h('code', { key: index, 'data-vf-code': '' }, token.slice(1, -1));
    if (token.startsWith('**') && token.endsWith('**'))
      return h('strong', { key: index }, token.slice(2, -2));
    return token;
  });
}
function renderBlocks(blocks = []) {
  return blocks.map((block, i) => {
    if (block.type === 'list') return h('ul', { key: i },
      ...block.items.map((item, j) => h('li', { key: j }, ...renderInline(item))));
    if (block.type === 'code') return h('pre', {
      key: i, 'data-vf-code-block': '', tabIndex: 0,
      'data-vf-docs-code-language': block.language ?? undefined,
    }, h('code', null, block.text));
    if (block.type === 'paragraph') return h('p', { key: i }, ...renderInline(block.text));
    throw new Error('Unsupported documentation block type: ' + block.type);
  });
}
function renderSections(content, prefix, includeIntro = true) {
  if (!content) return null;
  return h('section', { 'aria-label': prefix },
    ...(includeIntro ? renderBlocks(content.intro) : []),
    ...content.sections.map((section, index) => {
      const id = slug(prefix + '-' + section.heading + '-' + index);
      return h('section', { key: id, 'aria-labelledby': id },
        h('h2', { id }, section.heading), ...renderBlocks(section.blocks));
    }));
}
function accessibilityEvidence(references, { compact = false } = {}) {
  if (!references) return null;
  const criteria = references.criteria ?? [];
  const hasBaselineNote = Boolean(references.nativeBaseline && !references.hasNativeReference);
  return h('section', { className: 'vf-docs-standards',
    'data-vf-docs-accessibility': '', 'aria-labelledby': 'react-accessibility-heading' },
    h(compact ? 'h3' : 'h2', { id: 'react-accessibility-heading' },
      compact ? 'Standards and evidence' : 'Accessibility evidence'),
    h('ul', { className: 'vf-docs-standards-primary', 'aria-label': 'Standards' },
      ...references.standards.map((standard, i) => h('li', { key: i },
        standard.url
          ? h('a', { href: standard.url, 'data-vf-link': '' }, standard.label)
          : h('span', null, standard.label)))),
    (criteria.length || hasBaselineNote)
      ? h('details', { className: 'vf-docs-standards-details' },
          h('summary', null, criteria.length
            ? criteria.length + ' WCAG ' + (criteria.length === 1 ? 'criterion' : 'criteria')
            : 'Semantic baseline'),
          criteria.length ? h('ul', { 'aria-label': 'Mapped WCAG criteria' },
            ...criteria.map((criterion, i) =>
              h('li', { key: i }, criterion.url
                ? h('a', { href: criterion.url, 'data-vf-link': '' },
                    h('code', { 'data-vf-code': '' }, criterion.id), ' ', criterion.label)
                : h('span', null, criterion.id)))) : null,
          hasBaselineNote ? h('p', { className: 'vf-docs-standards-baseline' },
            'Semantic baseline: ' + references.nativeBaseline) : null)
      : null,
    h('p', { className: 'vf-docs-standards-note' },
      'Mapping status: ', h('strong', null, references.mappingStatus), '.',
      references.reviewStatus === 'review-required' ? ' Accessibility review required.' : '',
      ' References and evidence mappings only; not a blanket compliance claim.'));
}
function useTheme() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vf-docs-theme');
      if (['light', 'dark', 'system'].includes(stored)) setTheme(stored);
    } catch { /* Optional browser preference. */ }
  }, []);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.vfTheme = theme === 'system'
        ? (media?.matches ? 'dark' : 'light') : theme;
    };
    apply();
    media?.addEventListener('change', apply);
    return () => media?.removeEventListener('change', apply);
  }, [theme]);
  return { theme, change(value) {
    setTheme(value);
    try { localStorage.setItem('vf-docs-theme', value); } catch { /* Optional. */ }
  } };
}
function useNavigation() {
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const mainRef = useRef(null);
  useEffect(() => {
    const media = matchMedia('(max-width: 48rem)');
    const sync = () => {
      if (media.matches) {
        if (navRef.current?.contains(document.activeElement)) menuRef.current?.focus();
        setMobile(true);
        setExpanded(false);
      } else {
        if (document.activeElement === menuRef.current) {
          const target = navRef.current?.querySelector('[aria-current="page"]')
            || navRef.current?.querySelector('a[href]') || mainRef.current;
          target?.focus();
        }
        setMobile(false);
        setExpanded(true);
      }
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!mobile || !expanded) return;
    const dismiss = (event) => {
      if (event.key !== 'Escape') return;
      if (navRef.current?.contains(document.activeElement) || document.activeElement === menuRef.current) {
        setExpanded(false);
        menuRef.current?.focus();
      }
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [mobile, expanded]);
  return { mobile, expanded, setExpanded, navRef, menuRef, mainRef, visible: !mobile || expanded };
}
function navigation(view, links, topic) {
  const selected = topic ? view + ':' + topic : view;
  const groups = [
    { label: 'React', items: [{ id: 'home', title: 'React overview', href: links.home }] },
    { label: 'Components', items: [
      { id: 'guide', title: 'Button guide', href: links.guide },
      { id: 'api', title: 'Button API', href: links.api },
    ] },
    { label: 'Typography', items: ['text', 'code', 'kbd'].flatMap((id) => [
      { id: 'typography:' + id, title: id === 'kbd' ? 'Kbd guide' : id[0].toUpperCase() + id.slice(1) + ' guide',
        href: links.typography[id].guide },
      { id: 'typography-api:' + id, title: id === 'kbd' ? 'Kbd API' : id[0].toUpperCase() + id.slice(1) + ' API',
        href: links.typography[id].api },
    ]) },
    { label: 'Layout & Structure', items: [
      { id: 'layout', title: 'Layout guide', href: links.layout },
      { id: 'layout-api', title: 'Layout API', href: links.layoutApi },
    ] },
  ];
  return h(SideNav, { 'aria-label': 'Documentation' },
    ...groups.map((group) => h(SideNavGroup, { key: group.label },
      h(SideNavGroupLabel, null, group.label),
      h(SideNavList, null, ...group.items.map((entry) =>
        h(SideNavItem, { key: entry.id },
          h(SideNavLink, { current: entry.id === selected, href: entry.href }, entry.title)))))));
}
function example(button, links) {
  const basic = button.examples.find((entry) => entry.id === 'button/basic');
  if (!basic) return null;
  return h('section', { 'aria-labelledby': 'react-example' },
    h('h2', { id: 'react-example' }, 'Checked-in React example'),
    h('p', null, 'The sandbox runs the original product-owned React example, bundled against the public package.'),
    h('iframe', {
      title: 'Checked-in React Button example', className: 'vf-docs-react-example-frame',
      src: links.example, sandbox: 'allow-scripts', loading: 'lazy',
    }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View checked-in React source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, basic.source))));
}
function layoutExample(example, links) {
  const id = example.id.split('/')[1];
  return h('article', { className: 'vf-docs-example', key: example.id,
    'data-vf-docs-react-layout-example': example.id },
    h('header', { className: 'vf-docs-example-header' },
      h('div', null, h('h3', null, example.title), h('p', null, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' example',
      src: links.layoutExampleBase + id + '/',
      sandbox: 'allow-scripts', loading: 'lazy', style: { minBlockSize: '15rem' } }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function layoutGuide(layout, links) {
  if (!layout?.sharedContent || !layout.cssRecipeStyle) return null;
  const sections = layout.sharedContent.sections;
  const contentSections = [
    { id: 'react-layout-setup', heading: 'React setup' },
    { id: 'react-layout-page-composition', heading: 'Page composition' },
    ...sections.map((section) => ({ id: 'react-layout-' + slug(section.heading), heading: section.heading })),
  ];
  const introExample = layout.examples.find((entry) => entry.id === 'layout/basic');
  return h('div', { className: 'vf-docs-content-grid' },
    h('aside', { className: 'vf-docs-toc-region' },
      h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
        h('p', null, 'On this page'),
        h('ol', null, ...contentSections.map(({ id, heading }) =>
          h('li', { key: id }, h('a', { href: '#' + id }, heading)))))),
    h('article', { className: 'vf-docs-article', 'data-vf-docs-react-layout': '' },
      h('header', { className: 'vf-docs-component-header' },
        h('p', { className: 'vf-docs-eyebrow', 'data-vf-text': '', 'data-vf-text-variant': 'overline' },
          'React · Layout & Structure · Flow & AutoGrid'),
        h('h1', null, layout.sharedContent.title),
        h('div', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          ...renderBlocks(layout.sharedContent.intro)),
        accessibilityEvidence(layout.standardReferences)),
      h('section', { 'aria-labelledby': 'react-layout-setup' },
        h('h2', { id: 'react-layout-setup' }, 'React setup'),
        h('p', null, 'Import the real React Flow and AutoGrid components, and load the canonical Web stylesheet once in your app entrypoint.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, "import { Flow, AutoGrid } from '@vyrnforge/react/layout';\nimport '@vyrnforge/web/styles/layout.css';")),
        h('p', null, 'Use direction, wrap, gap, align and justify as Flow props, or minItemSize as an AutoGrid prop. ',
          'Choose a native semantic element with as. React renders these hosts; all styling stays with Web CSS.')),
      h('section', { 'aria-labelledby': 'react-layout-page-composition' },
        h('h2', { id: 'react-layout-page-composition' }, 'Page composition'),
        h('p', null, 'A complete semantic JSX example uses block Flow, wrapping actions and intrinsic AutoGrid together.'),
        introExample ? layoutExample(introExample, links) : null),
      ...sections.map((section) => {
        const id = 'react-layout-' + slug(section.heading);
        const examples = layout.examples.filter((example) => example.documentationSection === section.heading);
        return h('section', { key: id, 'aria-labelledby': id },
          h('h2', { id }, section.heading),
          ...renderBlocks(section.blocks),
          ...examples.map((example) => layoutExample(example, links)));
      }),
      h('section', { 'aria-label': 'Reference' },
        h('h2', null, 'React public API and stylesheet'),
        h('p', null, 'React components come from the real public package; the canonical Web CSS supplies their visuals.'),
        h('p', null, h('code', { 'data-vf-code': '' }, layout.publicEntrypoints[0])),
        h('p', null, h('code', { 'data-vf-code': '' }, layout.cssRecipeStyle)),
        h('p', null, h('a', { 'data-vf-link': '', href: links.layoutApi }, 'View Flow and AutoGrid props')))));
}
// Reusable framework-native usage gallery: all examples and source snippets come
// from the Product Graph/compiler. Rendering owns presentation, not example truth.
function typographyExample(unit, example, links) {
  const slug = example.id.slice(unit.id.length + 1);
  const headingId = 'react-typography-' + unit.id + '-' + slug;
  return h('section', { key: example.id, id: headingId,
    'aria-labelledby': headingId + '-heading',
    className: 'vf-docs-example',
    'data-vf-docs-react-typography-example': example.id },
    h('header', { className: 'vf-docs-example-header' },
      h('div', null,
        h('h3', { id: headingId + '-heading' }, example.title),
        h('p', null, example.description))),
    h('iframe', {
      title: slug === 'basic' ? 'React ' + unit.title + ' example' :
        'React ' + example.title + ' example',
      className: 'vf-docs-react-example-frame',
      'data-vf-docs-example-id': example.id,
      src: links.typography[unit.id].examples[slug],
      sandbox: 'allow-scripts', loading: slug === 'basic' ? 'eager' : 'lazy',
    }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, example.source))));
}
function authoredGuideSection(section, prefix) {
  const id = slug(prefix + '-' + section.heading);
  return h('section', { key: id, id,
    className: 'vf-docs-guidance-item', 'aria-labelledby': id + '-heading' },
    h('h3', { id: id + '-heading' }, section.heading),
    ...renderBlocks(section.blocks));
}
function typographyGuide(unit, links) {
  if (!unit?.sharedContent || !unit?.frameworkContent ||
      !unit?.examples?.length) return null;
  const id = unit.id;
  const shared = unit.sharedContent.sections;
  const native = shared.find((section) => section.heading === 'Native Web');
  const a11y = shared.find((section) => section.heading === 'Accessibility');
  const guidance = shared.filter((section) =>
    !['Native Web', 'Accessibility'].includes(section.heading));
  const framework = unit.frameworkContent.sections;
  const setup = framework.find((section) => section.heading === 'React setup');
  const integration = framework.filter((section) => section !== setup);
  const outline = [
    { id: 'react-typography-setup', label: 'Quick start' },
    { id: 'react-typography-preview', label: 'Examples' },
    { id: 'react-typography-guidelines', label: 'Usage guidelines' },
    { id: 'react-typography-accessibility', label: 'Accessibility' },
    { id: 'react-typography-platform', label: 'Framework details' },
    { id: 'react-typography-reference', label: 'API reference' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-grid' },
    h('aside', { className: 'vf-docs-toc-region' },
      h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
        h('p', null, 'On this page'),
        h('ol', null, ...outline.map((item) =>
          h('li', { key: item.id },
            h('a', { href: '#' + item.id }, item.label)))))),
    h('article', { className: 'vf-docs-article vf-docs-usage-page',
      'data-vf-docs-react-typography': id },
      h('header', { className: 'vf-docs-component-header' },
        h('p', { className: 'vf-docs-eyebrow', 'data-vf-text': '',
          'data-vf-text-variant': 'overline' }, 'React / Typography'),
        h('h1', null, unit.sharedContent.title),
        h('div', { className: 'vf-docs-lede', 'data-vf-text': '',
          'data-vf-text-variant': 'body-lg' }, ...renderBlocks(unit.sharedContent.intro))),
      h('section', { id: 'react-typography-setup',
        'aria-labelledby': 'react-typography-setup-title',
        className: 'vf-docs-guide-section' },
        h('h2', { id: 'react-typography-setup-title' }, 'Quick start'),
        h('p', null, 'Import the public React component and choose the semantic HTML element. In supported browser builds, VyrnForge includes the matching Web CSS automatically.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, unit.id === 'code'
            ? "import { Code, CodeBlock } from '@vyrnforge/react/code';"
            : unit.id === 'kbd'
              ? "import { Kbd } from '@vyrnforge/react/kbd';"
              : "import { Text } from '@vyrnforge/react/text';"))),
      h('section', { id: 'react-typography-preview',
        className: 'vf-docs-guide-section',
        'aria-labelledby': 'react-typography-preview-title',
        'data-vf-docs-react-usage-gallery': id },
        h('h2', { id: 'react-typography-preview-title' }, 'Examples'),
        h('p', { className: 'vf-docs-section-intro' },
          'Explore the live components. Open the source beneath any preview to use the same React example in your project.'),
        h('nav', { className: 'vf-docs-example-jump', 'aria-label': unit.title + ' examples' },
          h('ul', null, ...unit.examples.map((example) => {
            const slug = example.id.slice(unit.id.length + 1);
            return h('li', { key: example.id },
              h('a', { href: '#react-typography-' + id + '-' + slug }, example.title));
          }))),
        ...unit.examples.map((example) => typographyExample(unit, example, links))),
      h('section', { id: 'react-typography-guidelines',
        className: 'vf-docs-guide-section',
        'aria-labelledby': 'react-typography-guidelines-title' },
        h('h2', { id: 'react-typography-guidelines-title' }, 'Usage guidelines'),
        h('p', { className: 'vf-docs-section-intro' },
          'Choose the component and native element based on what the content means. Visual roles control appearance, not semantics.'),
        h('div', { className: 'vf-docs-guidance-grid' },
          ...guidance.map((section) => authoredGuideSection(section, id + '-shared')))),
      h('section', { id: 'react-typography-accessibility',
        className: 'vf-docs-guide-section',
        'aria-labelledby': 'react-typography-accessibility-title' },
        h('h2', { id: 'react-typography-accessibility-title' }, 'Accessibility'),
        ...(a11y ? renderBlocks(a11y.blocks) : []),
        accessibilityEvidence(unit.standardReferences, { compact: true })),
      h('section', { id: 'react-typography-platform',
        className: 'vf-docs-guide-section',
        'aria-labelledby': 'react-typography-platform-title' },
        h('h2', { id: 'react-typography-platform-title' }, 'Framework details'),
        h('p', { className: 'vf-docs-section-intro' },
          'Implementation details for React and the shared Native Web styling foundation.'),
        ...integration.map((section) => authoredGuideSection(section, id + '-react')),
        setup ? h('details', { className: 'vf-docs-guide-disclosure' },
          h('summary', null, 'CSS delivery and server rendering'),
          ...renderBlocks(setup.blocks)) : null,
        native ? h('details', { className: 'vf-docs-guide-disclosure' },
          h('summary', null, 'Native Web equivalent'),
          ...renderBlocks(native.blocks)) : null,
        unit.id === 'text' ? h('div', { className: 'vf-docs-related-components' },
          h('h3', null, 'Related components'),
          h('ul', null,
            h('li', null, h('a', { href: links.typography.code.guide }, 'Code'),
              ' — code snippets and read-only blocks'),
            h('li', null, h('a', { href: links.typography.kbd.guide }, 'Kbd'),
              ' — keyboard-input notation'))) : null),
      h('section', { id: 'react-typography-reference',
        className: 'vf-docs-guide-section vf-docs-reference-panel',
        'aria-labelledby': 'react-typography-reference-title' },
        h('h2', { id: 'react-typography-reference-title' }, 'API reference'),
        h('p', null, 'Review the public React entrypoint, component props, and TypeScript definitions.'),
        h('a', { href: links.typography[id].api, 'data-vf-link': '' },
          'Open ' + unit.title + ' API reference'))));
}
function typographyApi(unit, links) {
  if (!unit?.publicSource || !unit?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article',
    'data-vf-docs-react-api': unit.id },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, unit.title + ' API'),
      h('p', { className: 'vf-docs-lede' },
        'Public React entrypoints and real product-owned TypeScript source, not an invented prop table.'),
      accessibilityEvidence(unit.standardReferences)),
    h('section', { 'aria-labelledby': 'react-typography-api-entrypoints' },
      h('h2', { id: 'react-typography-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...unit.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h('code', { 'data-vf-code': '' }, entry)))),
      h('p', null, 'In supported CSS-aware browser bundles, canonical Web CSS is automatically delivered with the component. Direct server imports remain CSS-free.')),
    h('section', { 'aria-labelledby': 'react-typography-api-types' },
      h('h2', { id: 'react-typography-api-types' }, 'Source-backed React types and exports'),
      h('p', null, 'The following source comes from the component-owned React public implementation.'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, unit.publicSource))),
    renderSections(unit.frameworkContent, 'React ' + unit.title + ' integration'),
    h('a', { href: links.typography[unit.id].guide, 'data-vf-link': '' },
      'Open ' + unit.title + ' React guide and live example'));
}
function body(view, links, button, layout, typography, message, setMessage, requestedTopic) {
  if (view === 'unavailable') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-unavailable': '' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'React documentation unavailable'),
        h('p', { className: 'vf-docs-lede' },
          'The React documentation view for ', h('strong', null, requestedTopic ?? 'this topic'),
          ' is not part of the currently documented React routes. This does not claim the React package lacks that capability.')),
      h('p', null, h('a', { href: links.native, 'data-vf-link': '' }, 'Return to Native Web topic')),
      h('p', null, h('a', { href: links.guide, 'data-vf-link': '' }, 'Browse available React Button guide')),
      h('p', null, h('a', { href: links.layout, 'data-vf-link': '' }, 'Browse React Layout guide')));
  }
  if (view === 'home') {
    return h('article', { className: 'vf-docs-article' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'VyrnForge React'),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'React guides and runnable examples for Button, Flow, AutoGrid, Text, Code and Kbd. Their shared design language and styling come from the Web foundation.')),
      h('section', null, h('h2', null, 'Getting started'),
        h('p', null, 'Import React components from their public entrypoints. Supported CSS-aware browser builds automatically include canonical Web component styles; server-rendered apps must also deliver extracted client CSS.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, "import { Button } from '@vyrnforge/react/button';")),
        h('p', null, 'React owns component state, rendering, event handlers, and hydration; VyrnForge supplies shared semantics and presentation.')),
      h('section', null, h('h2', null, 'Verified routes'),
        h('ul', null,
          h('li', null, h('a', { 'data-vf-link': '', href: links.guide }, 'React Button guide')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.api }, 'React Button API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.layout }, 'React Layout guide')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.layoutApi }, 'React Layout API')),
          ...['text', 'code', 'kbd'].flatMap((id) => [
            h('li', { key: id + '-guide' }, h('a', { 'data-vf-link': '',
              href: links.typography[id].guide }, 'React ' + id + ' guide')),
            h('li', { key: id + '-api' }, h('a', { 'data-vf-link': '',
              href: links.typography[id].api }, 'React ' + id + ' API')),
          ]))));
  }
  if (view === 'typography') return typographyGuide(typography, links);
  if (view === 'typography-api') return typographyApi(typography, links);
  if (view === 'layout') return layoutGuide(layout, links);
  if (view === 'layout-api') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'layout' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'Flow & AutoGrid API'),
        h('p', { className: 'vf-docs-lede' },
          'Real React components using the canonical Web CSS, with native semantic hosts and forwarded refs.'),
        accessibilityEvidence(layout.standardReferences)),
      h('section', { 'aria-labelledby': 'react-layout-api-exports' },
        h('h2', { id: 'react-layout-api-exports' }, 'Public entrypoint and CSS'),
        h('ul', null,
          ...layout.publicEntrypoints.map((name) => h('li', { key: name }, h('code', { 'data-vf-code': '' }, name))),
          h('li', null, h('code', { 'data-vf-code': '' }, layout.cssRecipeStyle)))),
      h('section', { 'aria-labelledby': 'react-layout-api-types' },
        h('h2', { id: 'react-layout-api-types' }, 'Public TypeScript props'),
        h('p', null, 'These declarations are derived from the checked-in React Layout implementation. ',
          'Flow and AutoGrid accept as for native semantic HTML, ordinary attributes and host refs.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, layout.publicLayoutTypes))),
      renderSections(layout.frameworkContent, 'React Layout integration'),
      h('p', null, h('a', { href: links.layout, 'data-vf-link': '' }, 'Open runnable React Layout examples')));
  }
  if (view === 'api') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'button' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'Button API'),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'Public React entrypoints are derived from the Product Graph; other APIs are not inferred.'),
        accessibilityEvidence(button.standardReferences)),
      h('section', null, h('h2', null, 'Public entrypoints'),
        h('ul', null, ...button.publicEntrypoints.map((name) =>
          h('li', { key: name }, h('code', { 'data-vf-code': '' }, name))))),
      h('section', { 'aria-labelledby': 'react-public-types' },
        h('h2', { id: 'react-public-types' }, 'Public TypeScript types'),
        h('p', null, 'The following declarations are read from the checked-in React Button source. ',
          'ButtonProps extends React native button attributes, and its ref targets HTMLButtonElement.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, button.publicButtonTypes))),
      renderSections(button.frameworkContent, 'React integration'),
      h('p', null, h('a', { 'data-vf-link': '', href: links.guide }, 'Open Button guide')));
  }
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-component': 'button' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, button.sharedContent?.title || 'Button'),
      h('div', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
        ...renderBlocks(button.sharedContent?.intro)),
      accessibilityEvidence(button.standardReferences)),
    h('section', { 'aria-labelledby': 'react-setup' },
      h('h2', { id: 'react-setup' }, 'React setup'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, "import { Button } from '@vyrnforge/react/button';"))),
    h('section', { 'aria-labelledby': 'react-usage' },
      h('h2', { id: 'react-usage' }, 'Usage preview'),
      h(Flow, { className: 'vf-docs-preview', direction: 'inline', wrap: 'wrap', gap: 'md' },
        h(Button, { type: 'button', onClick: () => setMessage('Save changes activated') }, 'Save changes'),
        h('span', { role: 'status', 'aria-live': 'polite', 'data-vf-docs-react-feedback': '' }, message))),
    example(button, links),
    renderSections(button.sharedContent, 'Shared semantics'),
    renderSections(button.frameworkContent, 'React integration'),
    h('section', { 'aria-labelledby': 'react-reference' },
      h('h2', { id: 'react-reference' }, 'Reference'),
      h('a', { 'data-vf-link': '', href: links.api }, 'Button API reference')));
}
export function ReactReferencePage({ view, links, button, layout, typography, requestedTopic }) {
  const nav = useNavigation();
  const { theme, change } = useTheme();
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { document.documentElement.dataset.vfReactHydrated = 'true'; }, []);
  const pages = [
    { title: 'React overview', href: links.home, keywords: 'getting started setup' },
    { title: 'Button guide', href: links.guide, keywords: 'button usage accessibility examples state' },
    { title: 'Button API', href: links.api, keywords: 'button props reference public' },
    { title: 'Layout guide', href: links.layout, keywords: 'flow autogrid grid responsive spacing layout wrap inline block JSX' },
    { title: 'Layout API', href: links.layoutApi, keywords: 'flowprops autogridprops as minitemsize ref gap' },
    ...['text', 'code', 'kbd'].flatMap((id) => [
      { title: (id === 'kbd' ? 'Kbd' : id[0].toUpperCase() + id.slice(1)) + ' guide',
        href: links.typography[id].guide,
        keywords: 'react typography ' + id + ' live JSX preview example semantics' },
      { title: (id === 'kbd' ? 'Kbd' : id[0].toUpperCase() + id.slice(1)) + ' API',
        href: links.typography[id].api, keywords: 'react ' + id + ' props types public entrypoint' },
    ]),
  ];
  const matches = search.trim() ? pages.filter((item) =>
    (item.title + ' ' + item.keywords).toLowerCase().includes(search.toLowerCase().trim())) : [];
  return h(Fragment, null,
    h('a', { className: 'vf-docs-skip', href: '#main' }, 'Skip to content'),
    h(AppShell, { 'data-vf-docs-shell': '', 'data-vf-docs-react': view },
    h(AppShellHeader, { className: 'vf-docs-header' },
      h('div', { className: 'vf-docs-header-inner' },
        h('div', { className: 'vf-docs-brand-row' },
          h(Button, { ref: nav.menuRef, type: 'button', variant: 'ghost', size: 'sm',
            className: 'vf-docs-menu-toggle', hidden: !nav.mobile,
            'aria-controls': 'vf-docs-navigation', 'aria-expanded': nav.visible,
            onClick: () => {
              if (nav.visible) nav.menuRef.current?.focus();
              nav.setExpanded(!nav.expanded);
            },
          }, 'Menu'),
          h('a', { className: 'vf-docs-brand', href: links.home },
            h('span', { className: 'vf-docs-brand-full' }, 'VyrnForge ', h('span', null, 'Docs')),
            h('span', { className: 'vf-docs-brand-compact' }, 'VF Docs ',
              h('span', { 'data-vf-visually-hidden': '' }, 'VyrnForge'))),
          h('span', { className: 'vf-docs-surface' }, 'React · ' + links.channel)),
        h('div', { className: 'vf-docs-header-tools' },
          h(SearchFieldRoot, { className: 'vf-docs-search',
            'aria-label': 'React documentation search', value: search, onValueChange: setSearch },
            h('label', { htmlFor: 'vf-react-search', 'data-vf-visually-hidden': '' }, 'Search React documentation'),
            h(SearchFieldInput, { id: 'vf-react-search', 'data-vf-input': '',
              placeholder: 'Search docs', 'aria-controls': 'vf-react-results',
              onKeyDown: (event) => {
                if (event.key === 'Escape' && search) setSearch('');
              } }),
            h(SearchFieldClear, { 'aria-label': 'Clear search' }, '×'),
            h('span', { 'data-vf-visually-hidden': '', role: 'status', 'aria-live': 'polite' },
              search ? matches.length + ' React documentation results' : ''),
            h('div', { id: 'vf-react-results', className: 'vf-docs-search-panel',
              'data-vf-docs-react-results': '', hidden: !search },
              h('p', { className: 'vf-docs-search-label' }, 'React documentation results'),
              matches.length
                ? h('ul', null, ...matches.map((item) =>
                    h('li', { key: item.title }, h('a', { href: item.href }, item.title))))
                : h('p', null, 'No matching React documentation.'))),
          h('div', { className: 'vf-docs-framework-control' },
            h('label', { htmlFor: 'vf-react-framework' }, 'Framework'),
            h(NativeSelect, { id: 'vf-react-framework', value: links.self,
              onChange: (event) => {
                const destination = event.currentTarget.value;
                if (destination !== links.self) window.location.assign(destination);
              } },
              h('option', { value: links.native }, 'Native Web'),
              h('option', { value: links.self }, 'React (pilot)'))),
          h('div', { className: 'vf-docs-version-control' },
            h('label', { htmlFor: 'vf-react-version' }, 'Version'),
            h(NativeSelect, { id: 'vf-react-version', defaultValue: links.channel },
              h('option', { value: links.channel }, links.channel))),
          h('div', { className: 'vf-docs-theme-control' },
            h('label', { htmlFor: 'vf-react-theme' }, 'Theme'),
            h(NativeSelect, { id: 'vf-react-theme', value: theme,
              onChange: (event) => change(event.target.value) },
              h('option', { value: 'light' }, 'Light'),
              h('option', { value: 'dark' }, 'Dark'),
              h('option', { value: 'system' }, 'System')))))),
    h(AppShellBody, { className: 'vf-docs-app-body' },
      h(AppShellNavigation, { id: 'vf-docs-navigation', ref: nav.navRef,
        hidden: !nav.visible, className: 'vf-docs-navigation-region' },
        h('div', { className: 'vf-docs-navigation-scroll' }, navigation(view, links, typography?.id))),
      h(AppShellMain, { id: 'main', ref: nav.mainRef, tabIndex: -1, className: 'vf-docs-main' },
        h('nav', { className: 'vf-docs-breadcrumbs', 'aria-label': 'Documentation framework' },
          h('a', { 'data-vf-link': '', href: links.native }, 'Native Web'),
          h('span', { 'aria-hidden': 'true' }, ' / '),
          h('span', { 'aria-current': 'page' }, 'React')),
        body(view, links, button, layout, typography, message, setMessage, requestedTopic))),
    h(AppShellFooter, { className: 'vf-docs-footer' },
      h('span', null, 'VyrnForge React documentation'),
      h('span', null, links.channel + ' channel'))));
}
