import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } from '@vyrnforge/react/app-shell';
import { SideNav, SideNavGroup, SideNavGroupLabel, SideNavList, SideNavItem, SideNavLink } from '@vyrnforge/react/side-nav';
import { Button } from '@vyrnforge/react/button';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { ThemeScope, colors, tokens } from '@vyrnforge/react';
import { SearchFieldRoot, SearchFieldInput, SearchFieldClear } from '@vyrnforge/react/search-field';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { ColorGuide, DarkModeGuide, RtlGuide } from './react-customization.mjs';
import { ThemeBuilder } from './react-theme-builder.mjs';
import { IconExplorer } from './react-icon-explorer.mjs';

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
function renderBlocks(blocks = [], paragraphVariant = 'body-md') {
  return blocks.map((block, i) => {
    if (block.type === 'list') return h('ul', { key: i },
      block.items.map((item, j) => h('li', { key: j }, ...renderInline(item))));
    if (block.type === 'code') return h('pre', { key: i, 'data-vf-code-block': '', tabIndex: 0 },
      h('code', null, block.text));
    return h(Text, { as: 'p', variant: paragraphVariant, key: i }, ...renderInline(block.text));
  });
}
function accessibilityEvidence(references, headingTag = 'h2') {
  if (!references) return null;
  const criteria = references.criteria ?? [];
  const hasBaselineNote = Boolean(references.nativeBaseline && !references.hasNativeReference);
  return h(Flow, { as: 'section', gap: 'sm', className: 'vf-docs-standards',
    'data-vf-docs-accessibility': '', 'aria-labelledby': 'react-accessibility-heading' },
    h(headingTag, { id: 'react-accessibility-heading' }, 'Accessibility evidence'),
    h(Flow, { as: 'ul', direction: 'inline', wrap: 'wrap', gap: 'xs',
      className: 'vf-docs-standards-primary', 'aria-label': 'Standards' },
      ...references.standards.map((standard, i) => h('li', { key: i },
        standard.url
          ? h('a', { href: standard.url, 'data-vf-link': '' }, standard.label)
          : h('span', null, standard.label)))),
    (criteria.length || hasBaselineNote)
      ? h('details', { className: 'vf-docs-standards-details' },
          h('summary', null, criteria.length
            ? criteria.length + ' WCAG ' + (criteria.length === 1 ? 'criterion' : 'criteria')
            : 'Semantic baseline'),
          criteria.length ? h(AutoGrid, { as: 'ul', minItemSize: '15rem', gap: 'sm',
             'aria-label': 'Mapped WCAG criteria' },
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
    { label: 'React', items: [
      { id: 'home', title: 'React overview', href: links.home },
    ] },
    { label: 'Foundations', items: [
      { id: 'tokens', title: 'Design tokens', href: links.tokens },
      { id: 'styling', title: 'Styling & CSS', href: links.styling },
    ] },
    { label: 'Customization', items: [
      { id: 'color', title: 'Color / Theme Studio', href: links.color },
      { id: 'builder', title: 'Theme Builder', href: links.builder },
      { id: 'dark-mode', title: 'Dark mode', href: links.darkMode },
      { id: 'themes', title: 'Theming', href: links.themes },
      { id: 'rtl', title: 'Right-to-left', href: links.rtl },
    ] },
    { label: 'Components', items: [
      { id: 'guide', title: 'Button', href: links.guide },
      { id: 'toggle', title: 'ToggleButton', href: links.toggle.guide },
    ] },
    { label: 'Typography', items: ['text', 'code', 'kbd'].map((id) => ({
      id: 'typography:' + id,
      title: id === 'kbd' ? 'Kbd' : id[0].toUpperCase() + id.slice(1),
      href: links.typography[id].guide,
    })) },
    { label: 'Layout & Structure', items: [
      { id: 'layout', title: 'Layout', href: links.layout },
      { id: 'divider', title: 'Divider', href: links.divider.guide },
    ] },
    { label: 'Collections', items: [
      { id: 'list', title: 'List', href: links.list.guide },
    ] },
    { label: 'Media', items: [
      { id: 'icon', title: 'Icon', href: links.icon.guide },
      { id: 'image', title: 'Image', href: links.image.guide },
      { id: 'avatar', title: 'Avatar', href: links.avatar.guide },
      { id: 'badge', title: 'Badge', href: links.badge.guide },
    ] },
    { label: 'Libraries', items: [
      { id: 'icon-library', title: 'VyrnForge Icons', href: links.icon.library },
    ] },
    // API destinations remain working, but reference material is no longer
    // interleaved with consumer guides. A dedicated API catalog can follow.
    { label: 'API Reference', items: [
      { id: 'api', title: 'Button API', href: links.api },
      { id: 'toggle-api', title: 'ToggleButton API', href: links.toggle.api },
      { id: 'layout-api', title: 'Layout API', href: links.layoutApi },
      { id: 'divider-api', title: 'Divider API', href: links.divider.api },
      { id: 'list-api', title: 'List API', href: links.list.api },
      { id: 'icon-api', title: 'Icon API', href: links.icon.api },
      { id: 'image-api', title: 'Image API', href: links.image.api },
      { id: 'avatar-api', title: 'Avatar API', href: links.avatar.api },
      { id: 'badge-api', title: 'Badge API', href: links.badge.api },
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
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title), h(Text, { as: 'p' }, example.description))),
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
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-layout': '' },
      guideHeader(content, 'React · Layout & Structure · Flow & AutoGrid'),
      guidePart(sections[0], [
        ...guideBlocks(layout.frameworkContent, 'React installation and first use'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        exampleJumpLinks('Layout', examples,
          (example) => 'react-layout-example-' + example.id.split('/')[1]),
        ...examples.map((example) => layoutExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideSubsections(content, [
          'Choose a layout', 'Flow: vertical rhythm', 'Flow: one inline row',
          'Flow: wrapping peers', 'AutoGrid: intrinsic equal tracks',
          'Semantic groups and forms', 'Dividers and thematic breaks',
          'Density and centralized defaults',
          'Width, surfaces, and other non-layout responsibilities',
          'Migration from older layout names',
        ], 'react-layout'),
        ...guideSubsections(layout.frameworkContent,
          ['Native separators in JSX'], 'react-layout-native'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(content, 'Accessibility, responsive behavior, and evidence'),
        ...guideBlocks(layout.frameworkContent, 'Semantic layout and accessibility'),
        evidenceDisclosure(layout.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h('a', { href: links.layoutApi, 'data-vf-link': '' }, 'View Flow and AutoGrid React API')),
          h('li', null, h('a', { href: links.guide, 'data-vf-link': '' }, 'Button'))),
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
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null,
        h(Text, { as: 'h3', variant: 'heading-sm', id: headingId + '-heading' }, example.title),
        h(Text, { as: 'p' }, example.description))),
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
    return [h(Flow, { as: 'section', gap: 'sm', key: id,
      className: 'vf-docs-guide-subsection', 'aria-labelledby': id },
      h('h3', { id }, heading), ...renderBlocks(section.blocks))];
  });
}
function guideToc(sections) {
  return h('aside', { className: 'vf-docs-toc-region' },
    h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
      h('p', null, 'On this page'),
      h(Flow, { as: 'ol', gap: 'xs' }, ...sections.map(({ id, heading }) =>
        h('li', { key: id }, h('a', { href: '#' + id }, heading))))));
}
function guideHeader(content, eyebrow) {
  return h('header', { className: 'vf-docs-component-header' },
    h('p', { className: 'vf-docs-eyebrow', 'data-vf-text': '',
      'data-vf-text-variant': 'overline' }, eyebrow),
    h('h1', null, content.title),
    h('div', { className: 'vf-docs-lede', 'data-vf-text': '',
      'data-vf-text-variant': 'body-lg' }, ...renderBlocks(content.intro, 'body-lg')));
}
function guidePart(section, children, extra = {}) {
  return h(Flow, { as: 'section', gap: 'md', key: section.id, 'aria-labelledby': section.id, ...extra },
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
    h(Flow, { as: 'ul', direction: 'inline', wrap: 'wrap', gap: 'sm' },
      ...examples.map((example) =>
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
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-typography': id },
      guideHeader(unit.sharedContent, 'React · Typography'),
      guidePart(sections[0], [
        ...guideBlocks(unit.frameworkContent, 'React setup'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        exampleJumpLinks(unit.title, unit.examples, (example) =>
          'react-typography-' + id + '-' + example.id.slice(id.length + 1)),
        ...unit.examples.map((example) => typographyExample(unit, example, links)),
      ], { 'data-vf-docs-react-usage-gallery': id }),
      guidePart(sections[2], [
        ...guideSubsections(unit.sharedContent, guidance, 'react-' + id + '-guidance'),
        ...guideSubsections(unit.frameworkContent,
          id === 'text' ? ['Semantic colors and custom themes', 'Choosing a semantic host'] : id === 'code' ? ['Semantic authoring'] : [],
          'react-' + id + '-authoring'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(unit.sharedContent, 'Accessibility'),
        evidenceDisclosure(unit.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h('a', { 'data-vf-link': '', href: links.typography[id].api },
            'View ' + unit.title + ' public React API')),
          ...['text', 'code', 'kbd'].filter((other) => other !== id).map((other) =>
            h('li', { key: other },
              h('a', { 'data-vf-link': '', href: links.typography[other].guide },
                (other === 'kbd' ? 'Kbd' : other[0].toUpperCase() + other.slice(1)))))),
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
      'View ' + unit.title + ' examples'));
}
function buttonExample(example, links) {
  const id = example.id.slice('button/'.length);
  return h('article', { key: example.id, id: 'react-button-example-' + id,
    className: 'vf-docs-example', 'data-vf-docs-react-button-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title), h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: id === 'basic' ? 'Checked-in React Button example' : 'React ' + example.title + ' example',
      src: links.buttonExamples[id], sandbox: 'allow-scripts',
      loading: id === 'basic' ? 'eager' : 'lazy',
      style: { minBlockSize: id === 'joined' ? '26rem' : id === 'toggle' ? '17rem' :
        id === 'icons' || id === 'density' ? '14rem' : '10rem' } }),
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
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-component': 'button' },
      guideHeader(button.sharedContent, 'React · Components · Actions'),
      guidePart(sections[0], [
        ...guideBlocks(button.frameworkContent, 'React setup'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
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
        'Button groups and joined actions', 'Accessible icon actions',
        'ToggleButton and pressed state', 'Density and target sizing',
      ], 'react-button-guide')),
      guidePart(sections[3], [
        ...guideBlocks(button.sharedContent, 'Interaction and focus'),
        ...guideBlocks(button.sharedContent, 'Accessibility'),
        evidenceDisclosure(button.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h('a', { 'data-vf-link': '', href: links.api },
            'View Button public React API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.layout },
            'Layout')),
          h('li', null, h('a', { href: links.toggle.guide, 'data-vf-link': '' },
            'ToggleButton'))),
      ])));
}

function toggleExample(toggle, links) {
  const example = toggle.examples[0];
  return h('article', { className: 'vf-docs-example', id: 'react-toggle-example',
    'data-vf-docs-react-toggle-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
        h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame', title: 'React ToggleButton pressed-state example',
      src: links.toggle.example, sandbox: 'allow-scripts', loading: 'eager',
      style: { minBlockSize: '17rem' } }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function toggleUsage(toggle, links) {
  if (!toggle?.sharedContent || !toggle?.frameworkContent || !toggle.examples?.length) return null;
  const sections = [
    { id: 'react-toggle-setup', heading: 'Get started' },
    { id: 'react-toggle-examples', heading: 'Live pressed-state example' },
    { id: 'react-toggle-guidance', heading: 'State and composition' },
    { id: 'react-toggle-a11y', heading: 'Accessibility' },
    { id: 'react-toggle-reference', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-toggle': '' },
      guideHeader(toggle.sharedContent, 'React · Components · Actions'),
      guidePart(sections[0], guideBlocks(toggle.frameworkContent, 'React setup')),
      guidePart(sections[1], [toggleExample(toggle, links)]),
      guidePart(sections[2], [
        ...guideSubsections(toggle.sharedContent,
          ['Native semantics and behavior', 'Sizing and styling', 'Related controls and grouping'],
          'react-toggle-guidance'),
        ...guideSubsections(toggle.frameworkContent,
          ['Controlled and uncontrolled state', 'Sizing and composition'],
          'react-toggle-authoring'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(toggle.sharedContent, 'Accessibility and evidence'),
        evidenceDisclosure(toggle.standardReferences),
      ]),
      guidePart(sections[4], [
        h('a', { href: links.toggle.api, 'data-vf-link': '' }, 'ToggleButton public React API'),
        h('a', { href: links.guide, 'data-vf-link': '' }, 'Button and joined action groups'),
      ])));
}
function toggleApi(toggle, links) {
  if (!toggle?.publicToggleTypes || !toggle.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'toggle-button' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'ToggleButton API'),
      h('p', { className: 'vf-docs-lede' },
        'Native pressed button with controlled or uncontrolled state and shared Button sizes.'),
      accessibilityEvidence(toggle.standardReferences)),
    h('section', { 'aria-labelledby': 'react-toggle-api-entry' },
      h('h2', { id: 'react-toggle-api-entry' }, 'Public entrypoint'),
      h('ul', null, ...toggle.publicEntrypoints.map(name => h('li', { key: name },
        h('code', { 'data-vf-code': '' }, name)))),
      h('p', null, 'Canonical styling: ', h('code', null,
        '@vyrnforge/web/styles/toggle-button.css'))),
    h('section', { 'aria-labelledby': 'react-toggle-api-props' },
      h('h2', { id: 'react-toggle-api-props' }, 'Source-backed React props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, toggle.publicToggleTypes))),
    h('a', { href: links.toggle.guide, 'data-vf-link': '' }, 'View ToggleButton examples'));
}

function iconExample(example, links) {
  const slug = example.id.slice('icon/'.length);
  return h('article', { key: example.id, id: 'react-icon-example-' + slug,
    className: 'vf-docs-example', 'data-vf-docs-react-icon-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title), h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' example',
      src: links.icon.exampleBase + slug + '/',
      sandbox: 'allow-scripts', loading: slug === 'basic' ? 'eager' : 'lazy' }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function iconUsage(icon, links) {
  if (!icon?.sharedContent || !icon?.frameworkContent || !icon?.examples?.length) return null;
  const examples = [
    ...icon.examples.filter((example) => example.id === 'icon/basic'),
    ...icon.examples.filter((example) => example.id === 'icon/svg-wrapper'),
    ...icon.examples.filter((example) =>
      example.id !== 'icon/basic' && example.id !== 'icon/svg-wrapper'),
  ];
  const sections = [
    { id: 'react-icon-setup', heading: 'Get started' },
    { id: 'react-icon-examples', heading: 'Examples' },
    { id: 'react-icon-guidelines', heading: 'Usage guidelines' },
    { id: 'react-icon-accessibility', heading: 'Accessibility' },
    { id: 'react-icon-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-icon': '' },
      guideHeader(icon.sharedContent, 'React · Media'),
      guidePart(sections[0], [
        ...guideBlocks(icon.frameworkContent, 'React setup'),
        ...guideBlocks(icon.frameworkContent, 'Simple custom SVG'),
        h('p', { key: 'setup' }, 'See ', h('a', { href: links.home, 'data-vf-link': '' },
          'React overview'), ' for shared CSS and server-rendering setup.'),
      ]),
      guidePart(sections[1], [
        exampleJumpLinks('Icon', examples,
          (example) => 'react-icon-example-' + example.id.slice('icon/'.length)),
        ...examples.map((example) => iconExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideBlocks(icon.sharedContent, 'Artwork contract'),
        ...guideBlocks(icon.frameworkContent, 'React authoring'),
        ...guideSubsections(icon.frameworkContent,
          ['React color and theming', 'Inline SVG tags'], 'react-icon-authoring'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(icon.sharedContent, 'Accessibility'),
        evidenceDisclosure(icon.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h('a', { href: links.icon.api, 'data-vf-link': '' }, 'View Icon public React API')),
          h('li', null, h('a', { href: links.icon.library, 'data-vf-link': '' }, 'Browse VyrnForge Icons')),
          h('li', null, h('a', { href: links.guide, 'data-vf-link': '' }, 'Button')),
          h('li', null, h('a', { href: links.typography.text.guide, 'data-vf-link': '' }, 'Text'))),
      ])));
}
function iconLibrary(links) {
  return h(Flow, { as: 'article', gap: 'lg', className: 'vf-docs-article vf-docs-icon-library',
    'data-vf-docs-react-icon-library': '' },
    h('header', { className: 'vf-docs-component-header' },
      h('p', { className: 'vf-docs-eyebrow', 'data-vf-text': '', 'data-vf-text-variant': 'overline' },
        'React · Icon Library'),
      h('h1', null, 'VyrnForge Icons'),
      h('p', { className: 'vf-docs-lede' },
        'Explore every implemented first-party icon in the optional VyrnForge catalog, inspect its actual artwork variants, and copy reusable React code.')),
    h(IconExplorer),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': 'react-icon-library-resources' },
      h('h2', { id: 'react-icon-library-resources' }, 'Usage and public API'),
      h('p', null, 'Icons render artwork and do not handle clicks, focus or keyboard actions. Use the Icon usage guide for custom SVG definitions, standalone accessible labels, and icon-only controls.'),
      h('ul', null,
        h('li', null, h('a', { href: links.icon.guide, 'data-vf-link': '' }, 'Icon usage guide')),
        h('li', null, h('a', { href: links.icon.api, 'data-vf-link': '' }, 'Icon public React API')))));
}

function iconApi(icon, links) {
  if (!icon?.publicIconTypes || !icon?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'icon' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Icon API'),
      h('p', { className: 'vf-docs-lede' }, 'Public Icon and SvgIcon props and types from the checked-in React implementation.'),
      accessibilityEvidence(icon.standardReferences)),
    h('section', { 'aria-labelledby': 'react-icon-api-entrypoints' },
      h('h2', { id: 'react-icon-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...icon.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h('code', { 'data-vf-code': '' }, entry)))),
      h('p', null, 'Load the canonical Web stylesheet through your consuming application build.')),
    h('section', { 'aria-labelledby': 'react-icon-api-types' },
      h('h2', { id: 'react-icon-api-types' }, 'Source-backed React types and props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, icon.publicIconTypes))),
    h('section', { 'aria-labelledby': 'react-icon-api-css' },
      h('h2', { id: 'react-icon-api-css' }, 'Shared CSS'),
      h('code', { 'data-vf-code': '' }, '@vyrnforge/web/styles/icon.css')),
    h('p', null, h('a', { href: links.icon.guide, 'data-vf-link': '' }, 'View Icon examples')));
}
function listExample(example, links) {
  const slug = example.id.slice('list/'.length);
  return h('article', { key: example.id, className: 'vf-docs-example',
    id: 'react-list-example-' + slug, 'data-vf-docs-react-list-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap',
      gap: 'lg', align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
        h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' List example',
      src: links.list.exampleBase + slug + '/', sandbox: 'allow-scripts',
      loading: slug === 'rich' ? 'eager' : 'lazy',
      style: { minBlockSize: slug === 'density' ? '30rem' :
        slug === 'grouped' ? '19rem' : slug === 'nested' || slug === 'interactive' ? '18rem' : '14rem' } }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, example.source))));
}
function listUsage(list, links) {
  if (!list?.sharedContent || !list?.frameworkContent || !list.examples?.length) return null;
  const sections = [
    { id: 'react-list-setup', heading: 'Get started' },
    { id: 'react-list-examples', heading: 'Rich List examples' },
    { id: 'react-list-design', heading: 'Composition and variants' },
    { id: 'react-list-accessibility', heading: 'Accessibility and boundaries' },
    { id: 'react-list-related', heading: 'API and related components' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-list': '' },
      guideHeader(list.sharedContent, 'React · Collections'),
      guidePart(sections[0], [...guideBlocks(list.frameworkContent, 'React setup')]),
      guidePart(sections[1], [
        exampleJumpLinks('List', list.examples,
          example => 'react-list-example-' + example.id.slice('list/'.length)),
        ...list.examples.map(example => listExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideSubsections(list.sharedContent,
          ['When to use', 'Anatomy and reuse', 'Variants, sizing and spacing',
            'Responsive and design constraints',
            'Gutters, inset dividers and nesting', 'Grouped lists and sticky section headings',
            'Interactive rows and density'], 'react-list-guidance'),
        ...guideSubsections(list.frameworkContent,
          ['Composition with existing VyrnForge components',
           'React state and server rendering',
           'Extended React List examples'], 'react-list-integration'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(list.sharedContent, 'Accessibility and states'),
        evidenceDisclosure(list.standardReferences),
      ]),
      guidePart(sections[4], [
        h('a', { href: links.list.api, 'data-vf-link': '' },
          'View List and ListItem public React API'),
      ])));
}
function listApi(list, links) {
  if (!list?.publicListTypes || !list?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'list' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'List API'),
      h('p', { className: 'vf-docs-lede' },
        'Native ordered and unordered List hosts, rich ListItem composition, and documented presentation axes.'),
      accessibilityEvidence(list.standardReferences)),
    h('section', { 'aria-labelledby': 'react-list-api-entrypoints' },
      h('h2', { id: 'react-list-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...list.publicEntrypoints.map(name =>
        h('li', { key: name }, h('code', { 'data-vf-code': '' }, name)))),
      h('p', null, 'Shared styling: ', h('code', null,
        '@vyrnforge/web/styles/list.css'))),
    h('section', { 'aria-labelledby': 'react-list-api-types' },
      h('h2', { id: 'react-list-api-types' }, 'Source-backed React types and props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, list.publicListTypes))),
    h('p', null, h('a', { href: links.list.guide, 'data-vf-link': '' },
      'View List composition examples')));
}

function badgeExample(example, links) {
  const slug = example.id.slice('badge/'.length);
  return h('article', { key: example.id, id: 'react-badge-example-' + slug,
    className: 'vf-docs-example', 'data-vf-docs-react-badge-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
        h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' Badge example',
      src: links.badge.exampleBase + slug + '/',
      sandbox: 'allow-scripts', loading: slug === 'basic' ? 'eager' : 'lazy' }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function badgeUsage(badge, links) {
  if (!badge?.sharedContent || !badge?.frameworkContent || !badge.examples?.length) return null;
  const sections = [
    { id: 'react-badge-setup', heading: 'Get started' },
    { id: 'react-badge-examples', heading: 'Examples' },
    { id: 'react-badge-guidelines', heading: 'Behavior and usage' },
    { id: 'react-badge-accessibility', heading: 'Accessibility' },
    { id: 'react-badge-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-badge': '' },
      guideHeader(badge.sharedContent, 'React · Metadata'),
      guidePart(sections[0], [...guideBlocks(badge.frameworkContent, 'React setup')]),
      guidePart(sections[1], [
        exampleJumpLinks('Badge', badge.examples,
          example => 'react-badge-example-' + example.id.slice('badge/'.length)),
        ...badge.examples.map(example => badgeExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideSubsections(badge.sharedContent, [
          'When to use', 'Counts and visibility', 'Placement and overlap', 'Tones and sizing', 'Boundaries',
        ], 'react-badge-guidance'),
        ...guideSubsections(badge.frameworkContent, [
          'Composition with existing VyrnForge components', 'React state and server rendering',
        ], 'react-badge-integration'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(badge.sharedContent, 'Accessibility'),
        evidenceDisclosure(badge.standardReferences),
      ]),
      guidePart(sections[4], [
        h('a', { href: links.badge.api, 'data-vf-link': '' }, 'View Badge public React API'),
      ])));
}
function badgeApi(badge, links) {
  if (!badge?.publicBadgeTypes || !badge?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'badge' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Badge API'),
      h('p', { className: 'vf-docs-lede' },
        'Source-backed React Badge types for anchored count and dot indicators.'),
      accessibilityEvidence(badge.standardReferences)),
    h('section', { 'aria-labelledby': 'react-badge-api-entrypoints' },
      h('h2', { id: 'react-badge-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...badge.publicEntrypoints.map(name =>
        h('li', { key: name }, h('code', { 'data-vf-code': '' }, name)))),
      h('p', null, 'Load shared styles from @vyrnforge/web/styles/badge.css.')),
    h('section', { 'aria-labelledby': 'react-badge-api-types' },
      h('h2', { id: 'react-badge-api-types' }, 'Source-backed React types and props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, badge.publicBadgeTypes))),
    h('p', null, h('a', { href: links.badge.guide, 'data-vf-link': '' },
      'View Badge examples')));
}
function avatarExample(example, links) {
  const slug = example.id.slice('avatar/'.length);
  return h('article', { key: example.id, id: 'react-avatar-example-' + slug,
    className: 'vf-docs-example', 'data-vf-docs-react-avatar-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
        h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' avatar example',
      src: links.avatar.exampleBase + slug + '/',
      sandbox: 'allow-scripts', loading: slug === 'initials' ? 'eager' : 'lazy' }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function avatarUsage(avatar, links) {
  if (!avatar?.sharedContent || !avatar?.frameworkContent || !avatar?.examples?.length) return null;
  const examples = [
    ...avatar.examples.filter((example) => example.id === 'avatar/initials'),
    ...avatar.examples.filter((example) => example.id !== 'avatar/initials'),
  ];
  const sections = [
    { id: 'react-avatar-setup', heading: 'Get started' },
    { id: 'react-avatar-examples', heading: 'Examples' },
    { id: 'react-avatar-guidelines', heading: 'Behavior and usage' },
    { id: 'react-avatar-accessibility', heading: 'Accessibility' },
    { id: 'react-avatar-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-avatar': '' },
      guideHeader(avatar.sharedContent, 'React · Media'),
      guidePart(sections[0], [
        ...guideBlocks(avatar.frameworkContent, 'React setup'),
        h('p', { key: 'setup' }, 'See ', h('a', { href: links.home, 'data-vf-link': '' },
          'React overview'), ' for shared setup and stylesheet delivery.'),
      ]),
      guidePart(sections[1], [
        exampleJumpLinks('Avatar', examples,
          (example) => 'react-avatar-example-' + example.id.slice('avatar/'.length)),
        ...examples.map((example) => avatarExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideSubsections(avatar.sharedContent, [
          'When to use', 'Appearances and fallback', 'Grouped avatars and totals',
          'Group spacing', 'When not to use',
        ], 'react-avatar-guidance'),
        ...guideSubsections(avatar.frameworkContent, [
          'React state and server rendering',
        ], 'react-avatar-integration'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(avatar.sharedContent, 'Accessibility'),
        evidenceDisclosure(avatar.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h('a', { href: links.avatar.api, 'data-vf-link': '' },
            'View Avatar and AvatarGroup public React API')),
          h('li', null, h('a', { href: links.icon.guide, 'data-vf-link': '' }, 'Icon')),
          h('li', null, h('a', { href: links.typography.text.guide, 'data-vf-link': '' }, 'Text'))),
      ])));
}
function avatarApi(avatar, links) {
  if (!avatar?.publicAvatarTypes || !avatar?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'avatar' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Avatar API'),
      h('p', { className: 'vf-docs-lede' },
        'Public React Avatar and AvatarGroup types for appearances, fallback, grouping and overflow.'),
      accessibilityEvidence(avatar.standardReferences)),
    h('section', { 'aria-labelledby': 'react-avatar-api-entrypoints' },
      h('h2', { id: 'react-avatar-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...avatar.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h('code', { 'data-vf-code': '' }, entry)))),
      h('p', null, 'Load shared Avatar styles from @vyrnforge/web/styles/avatar.css.')),
    h('section', { 'aria-labelledby': 'react-avatar-api-types' },
      h('h2', { id: 'react-avatar-api-types' }, 'Source-backed React types and props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, avatar.publicAvatarTypes))),
    h('p', null, h('a', { href: links.avatar.guide, 'data-vf-link': '' },
      'View Avatar and AvatarGroup examples')));
}
function imageExample(example, links) {
  const slug = example.id.slice('image/'.length);
  return h('article', { key: example.id, id: 'react-image-example-' + slug,
    className: 'vf-docs-example', 'data-vf-docs-react-image-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title), h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' image example',
      src: links.image.exampleBase + slug + '/',
      sandbox: 'allow-scripts', loading: slug === 'basic' ? 'eager' : 'lazy' }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function imageUsage(image, links) {
  if (!image?.sharedContent || !image?.frameworkContent || !image?.examples?.length) return null;
  const examples = [
    ...image.examples.filter((example) => example.id === 'image/basic'),
    ...image.examples.filter((example) => example.id !== 'image/basic'),
  ];
  const sections = [
    { id: 'react-image-setup', heading: 'Get started' },
    { id: 'react-image-examples', heading: 'Examples' },
    { id: 'react-image-guidelines', heading: 'Usage guidelines' },
    { id: 'react-image-accessibility', heading: 'Accessibility' },
    { id: 'react-image-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-image': '' },
      guideHeader(image.sharedContent, 'React · Media'),
      guidePart(sections[0], [
        ...guideBlocks(image.frameworkContent, 'React setup'),
        h('p', { key: 'setup' }, 'See ', h('a', { href: links.home, 'data-vf-link': '' },
          'React overview'), ' for shared setup and stylesheet delivery.'),
      ]),
      guidePart(sections[1], [
        exampleJumpLinks('Image', examples,
          (example) => 'react-image-example-' + example.id.slice('image/'.length)),
        ...examples.map((example) => imageExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideSubsections(image.sharedContent, [
          'When to use', 'When not to use', 'Responsive images',
          'Informative and decorative content', 'Captions and context', 'Boundaries',
        ], 'react-image-guidance'),
        ...guideSubsections(image.frameworkContent, [
          'React attributes and refs', 'SSR and hydration', 'Styling',
        ], 'react-image-integration'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(image.sharedContent, 'Accessibility'),
        evidenceDisclosure(image.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h('a', { href: links.image.api, 'data-vf-link': '' },
            'View Image public React API')),
          h('li', null, h('a', { href: links.icon.guide, 'data-vf-link': '' }, 'Icon')),
          h('li', null, h('a', { href: links.typography.text.guide, 'data-vf-link': '' }, 'Text'))),
      ])));
}
function imageApi(image, links) {
  if (!image?.publicImageTypes || !image?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'image' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Image API'),
      h('p', { className: 'vf-docs-lede' },
        'Public native image attributes and ref-forwarding props from the React Image source.'),
      accessibilityEvidence(image.standardReferences)),
    h('section', { 'aria-labelledby': 'react-image-api-entrypoints' },
      h('h2', { id: 'react-image-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...image.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h('code', { 'data-vf-code': '' }, entry)))),
      h('p', null, 'Import the component and deliver canonical Web CSS through your app.')),
    h('section', { 'aria-labelledby': 'react-image-api-types' },
      h('h2', { id: 'react-image-api-types' }, 'Source-backed React types and props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, image.publicImageTypes))),
    h('section', { 'aria-labelledby': 'react-image-api-css' },
      h('h2', { id: 'react-image-api-css' }, 'Shared CSS'),
      h('code', { 'data-vf-code': '' }, '@vyrnforge/web/styles/image.css')),
    h('p', null, h('a', { href: links.image.guide, 'data-vf-link': '' },
      'View Image examples')));
}
// A dedicated visual-line guide, sourced from the Divider product unit.
function dividerExample(example, links) {
  const slug = example.id.slice('divider/'.length);
  return h('article', { key: example.id, id: 'react-divider-example-' + slug,
    className: 'vf-docs-example', 'data-vf-docs-react-divider-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title), h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' example',
      src: links.divider.exampleBase + slug + '/',
      sandbox: 'allow-scripts', loading: slug === 'basic' ? 'eager' : 'lazy' }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, example.source))));
}
function dividerUsage(divider, links) {
  if (!divider?.sharedContent || !divider?.frameworkContent || !divider?.examples?.length) return null;
  const examples = [
    ...divider.examples.filter((example) => example.id === 'divider/basic'),
    ...divider.examples.filter((example) => example.id !== 'divider/basic'),
  ];
  const sections = [
    { id: 'react-divider-setup', heading: 'Get started' },
    { id: 'react-divider-examples', heading: 'Examples' },
    { id: 'react-divider-guidelines', heading: 'Usage guidelines' },
    { id: 'react-divider-accessibility', heading: 'Accessibility' },
    { id: 'react-divider-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-divider': '' },
      guideHeader(divider.sharedContent, 'React · Layout & Structure'),
      guidePart(sections[0], [
        ...guideBlocks(divider.frameworkContent, 'React setup'),
        h('p', { key: 'setup' }, 'For shared styles and server rendering, see ',
          h('a', { href: links.home, 'data-vf-link': '' }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        exampleJumpLinks('Divider', examples,
          (example) => 'react-divider-example-' + example.id.slice('divider/'.length)),
        ...examples.map((example) => dividerExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideSubsections(divider.sharedContent, [
          'When to use', 'Horizontal and vertical', 'Text and alignment',
          'Vertical label direction', 'Appearance and tokens', 'When not to use', 'Framework consumption',
        ], 'react-divider-guide'),
        ...guideSubsections(divider.frameworkContent,
          ['React authoring'], 'react-divider-react'),
      ]),
      guidePart(sections[3], [
        ...guideBlocks(divider.sharedContent, 'Accessibility'),
        ...guideBlocks(divider.frameworkContent, 'React accessibility'),
        evidenceDisclosure(divider.standardReferences),
      ]),
      guidePart(sections[4], [
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h('a', { href: links.divider.api, 'data-vf-link': '' },
            'View Divider public React API')),
          h('li', null, h('a', { href: links.layout, 'data-vf-link': '' }, 'Layout')),
        ),
      ])));
}
function dividerApi(divider, links) {
  if (!divider?.publicDividerTypes || !divider?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'divider' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Divider API'),
      h('p', { className: 'vf-docs-lede' },
        'A visual horizontal or vertical line, with optional readable text and logical alignment.'),
      accessibilityEvidence(divider.standardReferences)),
    h('section', { 'aria-labelledby': 'react-divider-api-exports' },
      h('h2', { id: 'react-divider-api-exports' }, 'Public entrypoint'),
      h('ul', null, ...divider.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h('code', { 'data-vf-code': '' }, entry)))),
    ),
    h('section', { 'aria-labelledby': 'react-divider-api-types' },
      h('h2', { id: 'react-divider-api-types' }, 'Source-backed React props'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, divider.publicDividerTypes))),
    h('section', { 'aria-labelledby': 'react-divider-api-css' },
      h('h2', { id: 'react-divider-api-css' }, 'Shared CSS and hooks'),
      h('code', { 'data-vf-code': '' }, '@vyrnforge/web/styles/divider.css'),
      ...guideBlocks(divider.sharedContent, 'Horizontal and vertical'),
      ...guideBlocks(divider.sharedContent, 'Text and alignment'),
      ...guideBlocks(divider.sharedContent, 'Vertical label direction')),
    h('p', null, h('a', { href: links.divider.guide, 'data-vf-link': '' },
      'View Divider examples')));
}

function foundationCode(value) {
  return h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null, value));
}
function tokensGuide(links) {
  const sample = "import { colors, tokens, Text, Flow } from '@vyrnforge/react';\n\n" +
    '<Flow gap="md" style={{ padding: tokens.space.lg }}>\n' +
    '  <Text as="p" tone="secondary">Supporting information</Text>\n' +
    '  <Text as="p" style={{ color: colors.text }}>Readable text</Text>\n' +
    '</Flow>';
  return h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article',
    'data-vf-docs-react-tokens': '' },
    h('header', { className: 'vf-docs-component-header' },
      h(Text, { as: 'h1', variant: 'heading-lg' }, 'Design tokens'),
      h(Text, { as: 'p', variant: 'body-lg' },
        'One framework-neutral visual vocabulary, delivered through public Web CSS custom properties.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-foundation-token-basics' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-foundation-token-basics' }, 'Use semantic roles'),
      h(Text, { as: 'p' },
        'Choose a color for its meaning, not a hardcoded palette value. React colors.primary aliases the existing accent role; colors.secondary aliases muted text. Text and Icon also accept a tone prop.'),
      foundationCode(sample),
      h(Text, { as: 'p' }, 'React colors and tokens are typed CSS var() references, not resolved colors or a parallel theme engine. They follow the canonical Web stylesheet in every appearance.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-foundation-token-catalog' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-foundation-token-catalog' }, 'Token categories'),
      h(Text, { as: 'p' }, 'Public semantic colors cover accent, text, surface, border, danger, focus and disabled states. Public foundation values include spacing, typography, radius, shadows, control dimensions and motion.'),
      foundationCode("colors.accent;        // var(--vf-color-accent-background)\n" +
        "colors.onAccent;      // var(--vf-color-accent-foreground)\n" +
        "colors.danger;        // var(--vf-color-danger-border)\n" +
        "tokens.space.md;      // var(--vf-space-md)\n" +
        "tokens.fontSize.lg;   // var(--vf-font-size-lg)\n" +
        "tokens.radius.control; // var(--vf-control-radius)"),
      h(Text, { as: 'p' },
        'Reference/primitive values and private --_vf-* component implementation variables are not public customization contracts. Breakpoints are static build-time inputs, not runtime CSS custom properties.')),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': 'react-foundation-token-next' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-foundation-token-next' }, 'Continue'),
      h(Text, { as: 'p' }, h('a', { href: links.themes, 'data-vf-link': '' }, 'Apply colors and themes')),
      h(Text, { as: 'p' }, h('a', { href: links.styling, 'data-vf-link': '' }, 'Load and customize CSS'))));
}
function stylingGuide(links) {
  return h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article',
    'data-vf-docs-react-styling': '' },
    h('header', { className: 'vf-docs-component-header' },
      h(Text, { as: 'h1', variant: 'heading-lg' }, 'Styling & CSS'),
      h(Text, { as: 'p', variant: 'body-lg' },
        'Load shared Web styles and customize applications without creating React-specific component CSS.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-foundation-style-delivery' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-foundation-style-delivery' }, 'CSS delivery'),
      h(Text, { as: 'p' },
        'The canonical CSS is provided by @vyrnforge/web. Supported CSS-aware React browser bundlers can load it through browser package exports. Server rendering does not inject styles: ensure your application serves the extracted styles or imports the Web aggregate before hydration.'),
      foundationCode("import '@vyrnforge/web/styles.css';"),
      h(Text, { as: 'p' },
        'The reset stylesheet is separate and opt-in. Granular Web CSS entrypoints are available when an application needs explicit component-style loading.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-foundation-style-overrides' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-foundation-style-overrides' }, 'Application customization'),
      h(Text, { as: 'p' },
        'Prefer semantic tokens, documented component tokens, and public styling hooks. VyrnForge uses low-specificity namespaced cascade layers so ordinary consumer CSS can override its normal styles without !important.'),
      foundationCode(".account-summary {\n" +
        "  background: var(--vf-color-surface);\n" +
        "  color: var(--vf-color-text);\n" +
        "  border: 1px solid var(--vf-color-border);\n" +
        "  padding: var(--vf-space-lg);\n" +
        "}"),
      h(Text, { as: 'p' },
        'Avoid internal --_vf-* variables, deeply nested DOM selectors or per-component hardcoded appearance maps. Custom brand colors must preserve contrast, focus visibility, disabled states, forced colors and reduced-motion behavior.')),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': 'react-foundation-style-next' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-foundation-style-next' }, 'Related foundations'),
      h(Text, { as: 'p' }, h('a', { href: links.tokens, 'data-vf-link': '' }, 'Design token roles and references')),
      h(Text, { as: 'p' }, h('a', { href: links.themes, 'data-vf-link': '' }, 'Light, dark and custom themes'))));
}
function themesGuide(links) {
  const accentExample = "import { ThemeScope, Text, Flow, Button, tokens } from '@vyrnforge/react';\n\n" +
    '<ThemeScope theme="dark">\n' +
    '  <Text as="p" tone="primary">Primary / accent</Text>\n' +
    '  <Text as="p" tone="secondary">Secondary / muted</Text>\n' +
    '  <Text as="p" tone="danger">Danger</Text>\n' +
    '  <Button type="button" variant="primary">Primary action</Button>\n' +
    '</ThemeScope>\n\n' +
    '<Flow style={{ padding: tokens.space.md }}>Token-aware spacing</Flow>';
  const localExample = '<ThemeScope theme="dark" colors={{\n' +
    "  primary: '#a6c8ff', accentHover: '#c2d9ff', accentPressed: '#80aef2',\n" +
    "  onAccent: '#10284f', danger: '#ff908e'\n" +
    '}}>\n  <Text as="p" tone="primary">Custom accent</Text>\n</ThemeScope>';
  const brandExample = '[data-vf-theme="acme-light"] {\n' +
    '  color-scheme: light;\n' +
    '  --vf-color-accent-background: #1758c0;\n' +
    '  --vf-color-accent-background-hover: #0f4cad;\n' +
    '  --vf-color-accent-background-pressed: #0b3b85;\n' +
    '  --vf-color-accent-foreground: #fff;\n' +
    '}\n\n[data-vf-theme="acme-dark"] {\n' +
    '  color-scheme: dark;\n' +
    '  --vf-color-accent-background: #a6c8ff;\n' +
    '  --vf-color-accent-background-hover: #c2d9ff;\n' +
    '  --vf-color-accent-background-pressed: #80aef2;\n' +
    '  --vf-color-accent-foreground: #10284f;\n' +
    '}';
  return h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article', 'data-vf-docs-react-themes': '' },
    h('header', { className: 'vf-docs-component-header' },
      h(Text, { as: 'h1', variant: 'heading-lg' }, 'Theming'),
      h(Text, { as: 'p', variant: 'body-lg' },
        'Light, dark, system and branded appearances using shared semantic Web tokens.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-token-quickstart' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-token-quickstart' }, 'Use semantic colors'),
      h(Text, { as: 'p' }, 'Text and SVG Icon accept tone="primary", "secondary", "accent" or "danger". The names resolve to CSS tokens, so light, dark and custom scopes change the colors automatically.'),
      foundationCode(accentExample),
      h(Text, { as: 'p' }, 'primary is the action accent; secondary means muted text. Button variants express control treatments and remain independent of text tone.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-token-preview' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-token-preview' }, 'Light, dark and local override previews'),
      h(AutoGrid, { gap: 'md', minItemSize: '12rem', 'data-vf-docs-react-theme-previews': '' },
        ...[
          { name: 'Light', theme: 'light' },
          { name: 'Dark', theme: 'dark' },
          { name: 'Custom dark', theme: 'dark', colors: {
            primary: '#c6a4ff', accentHover: '#d6c0ff', accentPressed: '#aa84f2',
            onAccent: '#18082f', danger: '#ff8f94',
          } },
        ].map((item) => h(ThemeScope, {
          key: item.name, theme: item.theme, colors: item.colors, as: 'section',
          'aria-label': item.name + ' semantic colors',
          style: { backgroundColor: colors.surface, color: colors.text,
            border: '1px solid ' + colors.border, borderRadius: tokens.radius.surface, padding: tokens.space.md },
        },
        h(Flow, { gap: 'sm' },
          h(Text, { as: 'h3', variant: 'heading-sm' }, item.name),
          h(Text, { as: 'p', tone: 'primary' }, 'Primary accent'),
          h(Text, { as: 'p', tone: 'secondary' }, 'Secondary text'),
          h(Text, { as: 'p', tone: 'danger' }, 'Danger text'),
          h(Button, { type: 'button', variant: 'primary' }, 'Primary action'))))),
      h(Text, { as: 'p' }, 'These regions inherit the normal CSS theme scopes. No React Context, theme registry, JavaScript color lookup or duplicate stylesheets.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-token-local' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-token-local' }, 'Custom colors in one scope'),
      foundationCode(localExample),
      h(Text, { as: 'p' }, 'Pass only the roles you need. When changing primary/accent Button colors, also define accentHover, accentPressed and onAccent for coherent interactive states and contrast. A normal style prop can explicitly override a token.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-theme-function' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-theme-function' }, 'Create a theme with a function'),
      h(Text, { as: 'p' },
        'For richer palettes and reusable brand variants, use the optional framework-neutral @vyrnforge/web/theme authoring functions. createTheme maps your own named color shades to existing public semantic roles, supplies complete light/dark defaults, and supports extension from a base theme. The output is normal CSS: no required provider or registration.'),
      foundationCode("import { createTheme, renderThemeCss } from '@vyrnforge/web/theme';\n\nconst oceanLight = createTheme({\n  name: 'ocean-light',\n  appearance: 'light',\n  palette: { ocean: {\n    50: '#ecfeff', 100: '#cffafe',\n    600: '#0f766e', 700: '#115e59', 800: '#134e4a',\n  } },\n  colors: {\n    'accent-background': '{ocean.600}',\n    'accent-background-hover': '{ocean.700}',\n    'accent-background-pressed': '{ocean.800}',\n    'accent-foreground': '#ffffff',\n    'accent-subtle': '{ocean.50}',\n    'accent-subtle-hover': '{ocean.100}',\n  },\n  tokens: { '--vf-radius-surface': '0.75rem' },\n});\n\nconst oceanRounded = createTheme({\n  name: 'ocean-rounded',\n  base: oceanLight,\n  tokens: { '--vf-control-radius': '0.75rem' },\n});\n\nconst css = [oceanLight, oceanRounded].map(renderThemeCss).join('\\n');\n// Write css to your app stylesheet during your build."),
      h(Text, { as: 'p' },
        'Author light and dark themes separately when brand contrast differs. Do not assume light colors automatically produce an accessible dark scheme. The function does not add runtime styles; deliver its CSS through your application build.')),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'react-token-brand' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-token-brand' }, 'Custom themes for both appearances'),
      h(Text, { as: 'p' }, 'Define branded color mappings using canonical public CSS variables in your application stylesheet. Then use theme="acme-light" or theme="acme-dark". No registration is needed.'),
      foundationCode(brandExample),
      h(Text, { as: 'p' }, 'Custom themes must set color-scheme correctly and be checked for contrast, focus and forced-colors behavior. system is a built-in opt-in appearance using prefers-color-scheme.')),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': 'react-theme-links' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'react-theme-links' }, 'Related foundations'),
      h(Text, { as: 'p' }, h('a', { href: links.tokens, 'data-vf-link': '' }, 'Explore design tokens')),
      h(Text, { as: 'p' }, h('a', { href: links.styling, 'data-vf-link': '' }, 'Learn CSS loading and customization')),
      h(Text, { as: 'p' }, h('a', { href: links.color, 'data-vf-link': '' }, 'Explore palette colors')),
      h(Text, { as: 'p' }, h('a', { href: links.builder, 'data-vf-link': '' }, 'Build a custom theme')),
      h(Text, { as: 'p' }, h('a', { href: links.darkMode, 'data-vf-link': '' }, 'Configure dark mode')),
      h(Text, { as: 'p' }, h('a', { href: links.rtl, 'data-vf-link': '' }, 'Use right-to-left content'))));
}

function body(view, links, button, layout, typography, icon, image, avatar, divider, badge, list, message, setMessage, requestedTopic) {
  if (view === 'unavailable') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-unavailable': '' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'React documentation unavailable'),
        h('p', { className: 'vf-docs-lede' },
          'The React documentation view for ', h('strong', null, requestedTopic ?? 'this topic'),
          ' is not part of the currently documented React routes. This does not claim the React package lacks that capability.')),
      h('p', null, h('a', { href: links.native, 'data-vf-link': '' }, 'Return to Native Web topic')),
      h('p', null, h('a', { href: links.guide, 'data-vf-link': '' }, 'Browse React Button')),
      h('p', null, h('a', { href: links.layout, 'data-vf-link': '' }, 'Browse React Layout')));
  }
  if (view === 'tokens') return tokensGuide(links);
  if (view === 'color') return h(ColorGuide, { links });
  if (view === 'builder') return h(ThemeBuilder, { links });
  if (view === 'dark-mode') return h(DarkModeGuide, { links });
  if (view === 'rtl') return h(RtlGuide, { links });
  if (view === 'themes') return themesGuide(links);
  if (view === 'styling') return stylingGuide(links);
  if (view === 'home') {
    return h('article', { className: 'vf-docs-article' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'VyrnForge React'),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'Runnable React examples for Button, Layout, List, Divider, Text, Code, Kbd, Icon, Image and Avatar. All use the shared VyrnForge Web design foundation.')),
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
      h('section', null, h('h2', null, 'Semantic colors and themes'),
        h(Text, { as: 'p' },
          'Use public theme-aware color roles instead of repeating CSS variable names. ThemeScope is an optional native DOM scope, not a provider.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 }, h('code', null,
          'import { ThemeScope, Text } from \'@vyrnforge/react\';\n\n' +
          '<ThemeScope theme="dark">\n' +
          '  <Text as="p" tone="primary">Accent</Text>\n' +
          '  <Text as="p" tone="secondary">Muted</Text>\n' +
          '  <Text as="p" tone="danger">Danger</Text>\n' +
          '</ThemeScope>')),
        h(Text, { as: 'p' }, h('a', { href: links.tokens, 'data-vf-link': '' }, 'Browse design tokens')),
        h(Text, { as: 'p' }, h('a', { href: links.themes, 'data-vf-link': '' }, 'Explore theming')),
        h(Text, { as: 'p' }, h('a', { href: links.color, 'data-vf-link': '' }, 'Try the color playground')),
        h(Text, { as: 'p' }, h('a', { href: links.darkMode, 'data-vf-link': '' }, 'Preview light, dark and system')),
        h(Text, { as: 'p' }, h('a', { href: links.rtl, 'data-vf-link': '' }, 'Preview right-to-left layout')),
        h(Text, { as: 'p' }, h('a', { href: links.styling, 'data-vf-link': '' }, 'Learn styling and CSS'))),
      h('section', null, h('h2', null, 'React state and native semantics'),
        h('p', null, 'React owns component state, event handlers, refs, effects and hydration. VyrnForge components preserve native HTML semantics and shared interaction contracts; consuming applications own data, actions, async feedback and routing. Avoid adding custom keyboard handlers for behavior native elements already provide.')),
      h('section', null, h('h2', null, 'Components and APIs'),
        h('ul', null,
          h('li', null, h('a', { 'data-vf-link': '', href: links.guide }, 'React Button')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.api }, 'React Button API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.layout }, 'React Layout')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.layoutApi }, 'React Layout API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.divider.guide }, 'React Divider')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.divider.api }, 'React Divider API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.list.guide }, 'React List')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.list.api }, 'React List API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.icon.guide }, 'React Icon')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.icon.library }, 'VyrnForge Icons library')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.icon.api }, 'React Icon API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.image.guide }, 'React Image')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.image.api }, 'React Image API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.badge.guide }, 'React Badge')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.badge.api }, 'React Badge API')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.avatar.guide }, 'React Avatar')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.avatar.api }, 'React Avatar API')),
          ...['text', 'code', 'kbd'].flatMap((id) => [
            h('li', { key: id + '-guide' }, h('a', { 'data-vf-link': '',
              href: links.typography[id].guide }, 'React ' + (id === 'kbd' ? 'Kbd' : id[0].toUpperCase() + id.slice(1)))),
            h('li', { key: id + '-api' }, h('a', { 'data-vf-link': '',
              href: links.typography[id].api }, 'React ' + id + ' API')),
          ]))));
  }
  if (view === 'icon-library') return iconLibrary(links);
  if (view === 'icon') return iconUsage(icon, links);
  if (view === 'icon-api') return iconApi(icon, links);
  if (view === 'divider') return dividerUsage(divider, links);
  if (view === 'divider-api') return dividerApi(divider, links);
  if (view === 'list') return listUsage(list, links);
  if (view === 'list-api') return listApi(list, links);
  if (view === 'badge') return badgeUsage(badge, links);
  if (view === 'badge-api') return badgeApi(badge, links);
  if (view === 'avatar') return avatarUsage(avatar, links);
  if (view === 'avatar-api') return avatarApi(avatar, links);
  if (view === 'image') return imageUsage(image, links);
  if (view === 'image-api') return imageApi(image, links);
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
      h('p', null, h('a', { href: links.layout, 'data-vf-link': '' }, 'View Layout examples')));
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
      h('p', null, h('a', { 'data-vf-link': '', href: links.guide }, 'View Button examples')));
  }
  return buttonUsageGuide(button, links, message, setMessage);
}
export function ReactReferencePage({ view, links, button, layout, typography, icon, image, avatar, divider, badge, list, requestedTopic }) {
  const nav = useNavigation();
  const { theme, change } = useTheme();
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { document.documentElement.dataset.vfReactHydrated = 'true'; }, []);
  const pages = [
    { title: 'React overview', href: links.home, keywords: 'getting started setup' },
    { title: 'Design tokens', href: links.tokens,
      keywords: 'foundations tokens spacing typography colors semantic roles css variables radius motion shadows' },
    { title: 'Theming', href: links.themes,
      keywords: 'customization foundations branded themes scope nested local override css token semantic color' },
    { title: 'Color / Theme Studio', href: links.color,
      keywords: 'customization colors palette picker live component preview accent hover contrast swatches' },
    { title: 'Theme Builder', href: links.builder,
      keywords: 'customization create theme builder semantic color roles token inspector override editor export css typescript light dark brand' },
    { title: 'Dark mode', href: links.darkMode,
      keywords: 'customization dark light system color scheme prefers-color-scheme ssr theme scope' },
    { title: 'Right-to-left', href: links.rtl,
      keywords: 'customization rtl right-to-left direction arabic hebrew lang dir bidi localization internationalization' },
    { title: 'Styling & CSS', href: links.styling,
      keywords: 'foundations styles stylesheet css customization cascade layers browser bundler ssr hydration override reset' },
    { title: 'Button', href: links.guide, keywords: 'button usage accessibility examples state' },
    { title: 'Button API', href: links.api, keywords: 'button props reference public' },
    { title: 'Layout', href: links.layout, keywords: 'flow autogrid grid responsive spacing layout wrap inline block JSX divider separator thematic hr css border' },
    { title: 'Layout API', href: links.layoutApi, keywords: 'flowprops autogridprops as minitemsize ref gap' },
    { title: 'Divider', href: links.divider.guide, keywords: 'divider separator straight horizontal divider vertical divider divider text alignment horizontal divider with text vertical divider with text line visual border label text content start center end align alignment horizontal text vertical-rl top-to-bottom bottom-to-top textDirection rotate' },
    { title: 'List', href: links.list.guide, keywords: 'rich semantic list rows ordered unordered native markers divided bordered avatar actions density spacing' },
    { title: 'List API', href: links.list.api, keywords: 'listprops listitemprops listvariant listsize listspacing listmarker' },
    { title: 'Divider API', href: links.divider.api, keywords: 'dividerprops dividerorientation span visual css ref' },
    { title: 'Icon', href: links.icon.guide, keywords: 'icon usage svg custom icondefinition createSvgIcon accessibility outlined filled shape size colors currentColor JSX tags' },
    { title: 'VyrnForge Icons', href: links.icon.library, keywords: 'icon library explorer gallery catalog search category filter copy icon names outlined filled rounded sharp' },
    { title: 'Icon API', href: links.icon.api, keywords: 'iconprops SVGAttributes definition variant shape size label types' },
    { title: 'Image', href: links.image.guide, keywords: 'image img responsive alt decorative caption figure native JSX' },
    { title: 'Image API', href: links.image.api, keywords: 'imageprops img loading decoding srcset sizes ref types' },
    { title: 'Badge', href: links.badge.guide,
      keywords: 'badge label count dot status contextual visual tone shape pill neutral accent danger' },
    { title: 'Badge API', href: links.badge.api, keywords: 'badgeprops badgeappearance badgetone badgedot' },
    { title: 'Avatar', href: links.avatar.guide, keywords: 'avatar initials profile photo image user account fallback portrait accessible circle size' },
    { title: 'Avatar API', href: links.avatar.api, keywords: 'avatarprops avatarsize src initials name decorative loading native image error ref' },
    ...['text', 'code', 'kbd'].flatMap((id) => [
      { title: (id === 'kbd' ? 'Kbd' : id[0].toUpperCase() + id.slice(1)),
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
                ? h(Flow, { as: 'ul', gap: 'xs' }, ...matches.map((item) =>
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
        body(view, links, button, layout, typography, icon, image, avatar, divider, badge, list, message, setMessage, requestedTopic))),
    h(AppShellFooter, { className: 'vf-docs-footer' },
      h('span', null, 'VyrnForge React documentation'),
      h('span', null, links.channel + ' channel'))));
}
