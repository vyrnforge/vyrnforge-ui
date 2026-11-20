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
      block.items.map((item, j) => h('li', { key: j }, ...renderInline(item))));
    if (block.type === 'code') return h('pre', { key: i, 'data-vf-code-block': '', tabIndex: 0 },
      h('code', null, block.text));
    return h('p', { key: i }, ...renderInline(block.text));
  });
}
function accessibilityEvidence(references, headingTag = 'h2') {
  if (!references) return null;
  const criteria = references.criteria ?? [];
  const hasBaselineNote = Boolean(references.nativeBaseline && !references.hasNativeReference);
  return h('section', { className: 'vf-docs-standards',
    'data-vf-docs-accessibility': '', 'aria-labelledby': 'react-accessibility-heading' },
    h(headingTag, { id: 'react-accessibility-heading' }, 'Accessibility evidence'),
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
    { label: 'Components', items: [{ id: 'guide', title: 'Button guide', href: links.guide }] },
    { label: 'Typography', items: ['text', 'code', 'kbd'].map((id) => ({
      id: 'typography:' + id,
      title: id === 'kbd' ? 'Kbd guide' : id[0].toUpperCase() + id.slice(1) + ' guide',
      href: links.typography[id].guide,
    })) },
    { label: 'Layout & Structure', items: [{ id: 'layout', title: 'Layout guide', href: links.layout }] },
    // API destinations remain working, but reference material is no longer
    // interleaved with consumer guides. A dedicated API catalog can follow.
    { label: 'API Reference', items: [
      { id: 'api', title: 'Button API', href: links.api },
      { id: 'layout-api', title: 'Layout API', href: links.layoutApi },
      ...['text', 'code', 'kbd'].map((id) => ({
        id: 'typography-api:' + id,
        title: id === 'kbd' ? 'Kbd API' : id[0].toUpperCase() + id.slice(1) + ' API',
        href: links.typography[id].api,
      })),
    ] },
  ];
  return h(SideNav, { 'aria-label': 'Documentation' },
    ...groups.map((group) => h(SideNavGroup, { key: group.label },
      h(SideNavGroupLabel, null, group.label),
      h(SideNavList, null, ...group.items.map((entry) =>
        h(SideNavItem, { key: entry.id },
          h(SideNavLink, { current: entry.id === selected, href: entry.href }, entry.title)))))));
}
function layoutExample(example, links) {
  const id = example.id.split('/')[1];
  return h('article', { className: 'vf-docs-example', key: example.id,
    id: 'react-layout-example-' + id,
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
  if (!layout?.sharedContent || !layout?.frameworkContent || !layout.examples?.length) return null;
  const content = layout.sharedContent;
  // The introductory composition must precede the specialized recipes in
  // reading order, anchor navigation and no-JavaScript source inspection.
  const examples = [
    ...layout.examples.filter((example) => example.id === 'layout/basic'),
    ...layout.examples.filter((example) => example.id !== 'layout/basic'),
  ];
  const sections = [
    { id: 'react-layout-setup', heading: 'Get started' },
    { id: 'react-layout-examples', heading: 'Examples' },
    { id: 'react-layout-guidelines', heading: 'Usage guidelines' },
    { id: 'react-layout-accessibility', heading: 'Accessibility' },
    { id: 'react-layout-reference', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h('article', { className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-layout': '' },
      guideHeader(content, 'React · Layout & Structure · Flow & AutoGrid'),
      guidePart(sections[0], [
        ...guideBlocks(layout.frameworkContent, 'React installation and first use'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        h('p', { key: 'intro' }, 'These six examples run product-owned React TSX. Each preview keeps its source available.'),
        exampleJumpLinks('Layout', examples,
          (example) => 'react-layout-example-' + example.id.split('/')[1]),
        ...examples.map((example) => layoutExample(example, links)),
      ]),
      guidePart(sections[2], guideSubsections(content, [
        'Choose a layout', 'Flow: vertical rhythm', 'Flow: one inline row',
        'Flow: wrapping peers', 'AutoGrid: intrinsic equal tracks',
        'Semantic groups and forms', 'Density and centralized defaults',
        'Width, surfaces, and other non-layout responsibilities',
        'Migration from older layout names',
      ], 'react-layout')),
      guidePart(sections[3], [
        ...guideBlocks(content, 'Accessibility, responsive behavior, and evidence'),
        ...guideBlocks(layout.frameworkContent, 'Semantic layout and accessibility'),
        evidenceDisclosure(layout.standardReferences),
      ]),
      guidePart(sections[4], [
        h('p', { key: 'intro' }, 'Find Flow and AutoGrid props, CSS attributes, spacing values and public types in the API reference.'),
        h('ul', { key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h('a', { href: links.layoutApi, 'data-vf-link': '' }, 'View Flow and AutoGrid React API')),
          h('li', null, h('a', { href: links.guide, 'data-vf-link': '' }, 'Button usage guide'))),
      ])));
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
// These presentation slots select existing Product Graph Markdown sections; they
// never copy component guidance into a docs-owned registry or change its owner.
function guideSection(content, heading) {
  return content?.sections.find((section) => section.heading === heading);
}
function guideBlocks(content, heading) {
  return renderBlocks(guideSection(content, heading)?.blocks);
}
function guideSubsections(content, headings, prefix) {
  return headings.flatMap((heading) => {
    const section = guideSection(content, heading);
    if (!section) return [];
    const id = prefix + '-' + slug(heading);
    return [h('section', { key: id, className: 'vf-docs-guide-subsection', 'aria-labelledby': id },
      h('h3', { id }, heading), ...renderBlocks(section.blocks))];
  });
}
function guideToc(sections) {
  return h('aside', { className: 'vf-docs-toc-region' },
    h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
      h('p', null, 'On this page'),
      h('ol', null, ...sections.map(({ id, heading }) =>
        h('li', { key: id }, h('a', { href: '#' + id }, heading))))));
}
function guideHeader(content, eyebrow) {
  return h('header', { className: 'vf-docs-component-header' },
    h('p', { className: 'vf-docs-eyebrow', 'data-vf-text': '',
      'data-vf-text-variant': 'overline' }, eyebrow),
    h('h1', null, content.title),
    h('div', { className: 'vf-docs-lede', 'data-vf-text': '',
      'data-vf-text-variant': 'body-lg' }, ...renderBlocks(content.intro)));
}
function guidePart(section, children, extra = {}) {
  return h('section', { key: section.id, 'aria-labelledby': section.id, ...extra },
    h('h2', { id: section.id }, section.heading), ...children);
}
function evidenceDisclosure(references) {
  return h('details', { key: 'evidence', className: 'vf-docs-reference-details' },
    h('summary', null, 'Standards and evidence mapping'),
    accessibilityEvidence(references, 'h3'));
}
function exampleJumpLinks(label, examples, getId) {
  return h('nav', { key: 'jump-links', className: 'vf-docs-example-links',
    'aria-label': label + ' examples' },
    h('ul', null, ...examples.map((example) =>
      h('li', { key: example.id },
        h('a', { href: '#' + getId(example) }, example.title)))));
}
function typographyUsageGuide(unit, links) {
  const id = unit.id;
  const sections = [
    { id: 'react-typography-setup', heading: 'Get started' },
    { id: 'react-typography-preview', heading: 'Examples' },
    { id: 'react-typography-guidelines', heading: 'Usage guidelines' },
    { id: 'react-typography-accessibility', heading: 'Accessibility' },
    { id: 'react-typography-reference', heading: 'Related components and API' },
  ];
  const guidance = id === 'text'
    ? ['When to use', 'When not to use', 'Native baseline', 'Visual roles']
    : ['When to use', 'When not to use', 'Native baseline', 'Visual styling'];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h('article', { className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-typography': id },
      guideHeader(unit.sharedContent, 'React · Typography'),
      guidePart(sections[0], [
        ...guideBlocks(unit.frameworkContent, 'React setup'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        h('p', { key: 'intro' },
          'Each preview runs checked-in React TSX. Open the source beneath an example to see how it is built.'),
        exampleJumpLinks(unit.title, unit.examples, (example) =>
          'react-typography-' + id + '-' + example.id.slice(id.length + 1)),
        ...unit.examples.map((example) => typographyExample(unit, example, links)),
      ], { 'data-vf-docs-react-usage-gallery': id }),
      guidePart(sections[2], [
        ...guideSubsections(unit.sharedContent, guidance, 'react-' + id + '-guidance'),
        ...guideSubsections(unit.frameworkContent,
          id === 'text' ? ['Choosing a semantic host'] : id === 'code' ? ['Semantic authoring'] : [],
          'react-' + id + '-authoring'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(unit.sharedContent, 'Accessibility'),
        evidenceDisclosure(unit.standardReferences),
      ]),
      guidePart(sections[4], [
        h('p', { key: 'intro' },
          'Public React props and types belong in the API reference; use the adjacent typography guides for related semantics.'),
        h('ul', { key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h('a', { 'data-vf-link': '', href: links.typography[id].api },
            'View ' + unit.title + ' public React API')),
          ...['text', 'code', 'kbd'].filter((other) => other !== id).map((other) =>
            h('li', { key: other },
              h('a', { 'data-vf-link': '', href: links.typography[other].guide },
                (other === 'kbd' ? 'Kbd' : other[0].toUpperCase() + other.slice(1)) + ' usage guide')))),
      ])));
}
function typographyGuide(unit, links) {
  if (!unit?.sharedContent || !unit?.frameworkContent || !unit?.examples?.length) return null;
  return typographyUsageGuide(unit, links);
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
      h('p', null, 'See ', h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'),
        ' for shared stylesheet and server-rendering setup.')),
    h('section', { 'aria-labelledby': 'react-typography-api-types' },
      h('h2', { id: 'react-typography-api-types' }, 'Source-backed React types and exports'),
      h('p', null, 'The following source comes from the component-owned React public implementation.'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, unit.publicSource))),
    h('a', { href: links.typography[unit.id].guide, 'data-vf-link': '' },
      'Open ' + unit.title + ' React guide and live example'));
}
function buttonExample(example, links) {
  const id = example.id.slice('button/'.length);
  return h('article', { key: example.id, id: 'react-button-example-' + id,
    className: 'vf-docs-example', 'data-vf-docs-react-button-example': example.id },
    h('header', { className: 'vf-docs-example-header' },
      h('div', null, h('h3', null, example.title), h('p', null, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: id === 'basic' ? 'Checked-in React Button example' : 'React ' + example.title + ' example',
      src: links.buttonExamples[id], sandbox: 'allow-scripts',
      loading: id === 'basic' ? 'eager' : 'lazy' }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, id === 'basic' ? 'View checked-in React source' : 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, example.source))));
}
function buttonUsageGuide(button, links, message, setMessage) {
  if (!button?.sharedContent || !button?.frameworkContent) return null;
  const sections = [
    { id: 'react-setup', heading: 'Get started' },
    { id: 'react-usage', heading: 'Examples' },
    { id: 'react-button-guidelines', heading: 'Usage guidelines' },
    { id: 'react-button-accessibility', heading: 'Accessibility' },
    { id: 'react-reference', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h('article', { className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-component': 'button' },
      guideHeader(button.sharedContent, 'React · Components · Actions'),
      guidePart(sections[0], [
        ...guideBlocks(button.frameworkContent, 'React setup'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        h('p', { key: 'intro' },
          'Try the hydrated Button below, then explore the runnable, checked-in React examples and their source.'),
        h(Flow, { key: 'live', className: 'vf-docs-preview',
          direction: 'inline', wrap: 'wrap', gap: 'md' },
          h(Button, { type: 'button', onClick: () => setMessage('Save changes activated') },
            'Save changes'),
          h('span', { role: 'status', 'aria-live': 'polite',
            'data-vf-docs-react-feedback': '' }, message)),
        exampleJumpLinks('Button', button.examples, (ex) =>
          'react-button-example-' + ex.id.slice('button/'.length)),
        ...button.examples.map((ex) => buttonExample(ex, links)),
      ]),
      guidePart(sections[2], guideSubsections(button.sharedContent, [
        'When to use', 'Native baseline', 'Variants', 'Sizes',
        'States and async work', 'Forms', 'Styling and adaptation',
      ], 'react-button-guide')),
      guidePart(sections[3], [
        ...guideBlocks(button.sharedContent, 'Interaction and focus'),
        ...guideBlocks(button.sharedContent, 'Accessibility'),
        evidenceDisclosure(button.standardReferences),
      ]),
      guidePart(sections[4], [
        h('p', { key: 'intro' },
          'Find public props, types, and entrypoints in the API reference, separate from this usage guide.'),
        h('ul', { key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h('a', { 'data-vf-link': '', href: links.api },
            'View Button public React API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.layout },
            'Layout usage guide'))),
      ])));
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
        h('p', null, 'Use the public React components with meaningful native HTML elements.')),
      h('section', null, h('h2', null, 'Styling, SSR and hydration'),
        h('p', null, 'React components share the canonical Web tokens and styles; they do not have a separate React theme. CSS-aware browser builds that resolve supported browser entrypoints can extract component CSS. The consuming app must ensure those styles reach the client HTML.'),
        h('p', null, 'If your build does not extract component styles, load the public Web aggregate once at app startup:'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, "import '@vyrnforge/web/styles.css';")),
        h('p', null, 'Node/SSR imports do not install client styles. Deliver the extracted or explicitly imported CSS alongside the server-rendered HTML before hydration. The optional Web reset is not loaded automatically.')),
      h('section', null, h('h2', null, 'React state and native semantics'),
        h('p', null, 'React owns component state, event handlers, refs, effects and hydration. VyrnForge components preserve native HTML semantics and shared interaction contracts; consuming applications own data, actions, async feedback and routing. Avoid adding custom keyboard handlers for behavior native elements already provide.')),
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
      h('section', { 'aria-labelledby': 'react-layout-api-css' },
        h('h2', { id: 'react-layout-api-css' }, 'CSS attributes and spacing'),
        ...guideBlocks(layout.sharedContent, 'Attributes and spacing')),
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
      h('p', null, h('a', { 'data-vf-link': '', href: links.guide }, 'Open Button guide')));
  }
  return buttonUsageGuide(button, links, message, setMessage);
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
