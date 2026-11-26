import { standardsCopy, criteriaHeading, criterionLearningNote } from './standards-presentation.mjs';
import { visibleGuideSections } from './guide-presentation.mjs';
import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } from '@vyrnforge/react/app-shell';
import { SideNav, SideNavGroup, SideNavGroupLabel, SideNavList, SideNavItem, SideNavLink } from '@vyrnforge/react/side-nav';
import { Button } from '@vyrnforge/react/button';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Code, CodeBlock } from '@vyrnforge/react/code';
import { Link } from '@vyrnforge/react/link';
import { ThemeScope, colors, tokens } from '@vyrnforge/react';
import { SearchFieldRoot, SearchFieldInput, SearchFieldClear } from '@vyrnforge/react/search-field';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { ColorGuide, DarkModeGuide, RtlGuide } from './react-customization.mjs';
import { reactConsumerBlocks } from './react-content-policy.mjs';
import { ThemeBuilder } from './react-theme-builder.mjs';
import { IconExplorer } from './react-icon-explorer.mjs';
import { OverlayUtility } from './react-overlay-utility.mjs';
import { MotionUtility } from './react-motion-utility.mjs';
import { ComponentPlayground } from './react-component-playground.mjs';
import { buttonPlayground, checkboxPlayground, radioPlayground, avatarPlayground, badgePlayground, chipPlayground, togglePlayground, dividerPlayground, listPlayground } from './react-playground-adapters.mjs';

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function renderInline(value) {
  // The compiler owns authored content; React renders its inline semantics without injecting HTML.
  return String(value).split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`'))
      return h(Code, { key: index }, token.slice(1, -1));
    if (token.startsWith('**') && token.endsWith('**'))
      return h('strong', { key: index }, token.slice(2, -2));
    return token;
  });
}
function renderBlocks(blocks = [], paragraphVariant = 'body-md') {
  return reactConsumerBlocks(blocks).map((block, i) => {
    if (block.type === 'list') return h('ul', { key: i },
      block.items.map((item, j) => h('li', { key: j }, ...renderInline(item))));
    if (block.type === 'code') return h(CodeBlock, { key: i, tabIndex: 0 }, block.text);
    return h(Text, { as: 'p', variant: paragraphVariant, key: i }, ...renderInline(block.text));
  });
}
function accessibilityEvidence(references, headingTag = 'h2') {
  if (!references) return null;
  const criteria = references.criteria ?? [];
  const hasBaselineNote = Boolean(references.nativeBaseline && !references.hasNativeReference);
  return h(Flow, { as: 'section', gap: 'sm', className: 'vf-docs-standards',
    'data-vf-docs-accessibility': '', 'aria-labelledby': 'react-accessibility-heading' },
    h(headingTag, { id: 'react-accessibility-heading' }, standardsCopy.heading),
    h(Flow, { as: 'ul', direction: 'inline', wrap: 'wrap', gap: 'xs',
      className: 'vf-docs-standards-primary', 'aria-label': 'Standards' },
      ...references.standards.map((standard, i) => h('li', { key: i },
        standard.url
          ? h(Link, { href: standard.url }, standard.label)
          : h('span', null, standard.label)))),
    (criteria.length || hasBaselineNote)
      ? h('details', { className: 'vf-docs-standards-details' },
          h('summary', null, criteriaHeading(criteria.length)),
          criteria.length ? h(AutoGrid, { as: 'ul', minItemSize: '20rem', gap: 'sm',
             'aria-label': 'WCAG requirements' },
            ...criteria.map((criterion, i) =>
              h('li', { key: i }, criterion.url
                ? h(Link, { href: criterion.url },
                    h(Code, null, criterion.id), ' ', criterion.label)
                : h('span', null, criterion.id),
                criterionLearningNote(criterion) ? h(Text, { as: 'p', className: 'vf-docs-criterion-note' }, criterionLearningNote(criterion)) : null))) : null,
          hasBaselineNote ? h('p', { className: 'vf-docs-standards-baseline' },
            standardsCopy.baselineLabel + ': ' + references.nativeBaseline) : null)
      : null,
    h('p', { className: 'vf-docs-standards-note' },
      references.reviewStatus === 'review-required' ? standardsCopy.reviewRequired + ' ' : '',
      standardsCopy.scope));
}
// Selection previews are sandboxed (opaque origin); only send a non-sensitive theme enum.
function syncSelectionPreviewTheme(frame) {
  frame.contentWindow?.postMessage({ type: 'vf-selection-preview-theme',
    theme: document.documentElement.dataset.vfTheme }, '*');
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
      document.querySelectorAll('[data-vf-docs-react-selection-example] iframe').forEach(syncSelectionPreviewTheme);
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
    { label: 'Utilities', items: [
      { id: 'overlay', title: 'Overlay', href: links.overlay },
      { id: 'motion', title: 'Motion', href: links.motion },
    ] },
    { label: 'Components', items: [
      { id: 'guide', title: 'Button', href: links.guide },
      { id: 'toggle', title: 'ToggleButton', href: links.toggle.guide },
      { id: 'toggle-group', title: 'ToggleGroup', href: links.toggleGroup.guide },
      { id: 'selection-checkbox', title: 'Checkbox', href: links.selection.checkbox.guide },
      { id: 'selection-radio', title: 'Radio', href: links.selection.radio.guide },
    ] },
    { label: 'Patterns', items: [
      { id: 'button-group', title: 'Button Group', href: links.buttonGroup.guide },
      { id: 'selection-checkbox-group', title: 'Checkbox Group', href: links.selection['checkbox-group'].guide },
      { id: 'selection-radio-group', title: 'Radio Group', href: links.selection['radio-group'].guide },
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
      { id: 'chip', title: 'Chip', href: links.chip.guide },
    ] },
    { label: 'Libraries', items: [
      { id: 'icon-library', title: 'VyrnForge Icons', href: links.icon.library },
    ] },
    // API destinations remain working, but reference material is no longer
    // interleaved with consumer guides. A dedicated API catalog can follow.
    { label: 'API Reference', items: [
      { id: 'api', title: 'Button API', href: links.api },
      { id: 'toggle-api', title: 'ToggleButton API', href: links.toggle.api },
      { id: 'toggle-group-api', title: 'ToggleGroup API', href: links.toggleGroup.api },
      { id: 'selection-checkbox-api', title: 'Checkbox API', href: links.selection.checkbox.api },
      { id: 'selection-radio-api', title: 'Radio API', href: links.selection.radio.api },
      { id: 'layout-api', title: 'Layout API', href: links.layoutApi },
      { id: 'divider-api', title: 'Divider API', href: links.divider.api },
      { id: 'list-api', title: 'List API', href: links.list.api },
      { id: 'icon-api', title: 'Icon API', href: links.icon.api },
      { id: 'image-api', title: 'Image API', href: links.image.api },
      { id: 'avatar-api', title: 'Avatar API', href: links.avatar.api },
      { id: 'badge-api', title: 'Badge API', href: links.badge.api },
      { id: 'chip-api', title: 'Chip API', href: links.chip.api },
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
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
    { id: 'react-layout-reference', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections, {
      label: 'Layout', examples: examples, getId: (example) => 'react-layout-example-' + example.id.split('/')[1],
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-layout': '' },
      guideHeader(content, 'React · Layout & Structure · Flow & AutoGrid', layout.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(layout.frameworkContent, 'React installation and first use'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h(Link, { href: links.home }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
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
        h(Flow, { as: 'ul', gap: 'sm', key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.layoutApi }, 'View Flow and AutoGrid React API')),
          h('li', null, h(Link, { href: links.guide }, 'Button'))),
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
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
  // Usage guidance is part of the article, not an accordion. Keep native heading
  // navigation and source-authored content readable without a disclosure action.
  return headings.flatMap((heading) => {
    const section = guideSection(content, heading);
    if (!section) return [];
    const id = prefix + '-' + slug(heading);
    return [h(Flow, { as: 'section', gap: 'sm', key: id,
      className: 'vf-docs-guide-subsection', 'aria-labelledby': id },
      h('h3', { id }, heading), ...renderBlocks(section.blocks))];
  });
}
function guideToc(sections, exampleIndex = null) {
  return h('aside', { className: 'vf-docs-toc-region' },
    h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
      h('p', null, 'On this page'),
      h(Flow, { as: 'ol', gap: 'xs' }, ...sections.map(({ id, heading }) =>
        h('li', { key: id }, h('a', { href: '#' + id }, heading))))),
    exampleIndex ? exampleJumpLinks(exampleIndex.label,
      exampleIndex.examples, exampleIndex.getId) : null);
}
function guideHeader(content, eyebrow, references) {
  return h('header', { className: 'vf-docs-component-header' },
    h('p', { className: 'vf-docs-eyebrow', 'data-vf-text': '',
      'data-vf-text-variant': 'overline' }, eyebrow),
    h('h1', null, content.title),
    evidenceDisclosure(references),
    h('div', { className: 'vf-docs-lede', 'data-vf-text': '',
      'data-vf-text-variant': 'body-lg' }, ...renderBlocks(content.intro, 'body-lg')));
}
function guidePart(section, children, extra = {}) {
  return h(Flow, { as: 'section', gap: 'md', key: section.id, 'aria-labelledby': section.id, ...extra },
    h('h2', { id: section.id }, section.heading), ...children);
}
function evidenceDisclosure(references) {
  if (!references) return null;
  return h('details', { key: 'evidence', className: 'vf-docs-reference-details',
    'data-vf-docs-standards-disclosure': '' },
    h('summary', null, standardsCopy.title),
    accessibilityEvidence(references));
}
function exampleJumpLinks(label, examples, getId) {
  // Section links belong in the quiet page sidebar; examples themselves are
  // always visible with their own heading, live demo and optional source.
  return h('nav', { className: 'vf-docs-example-links vf-docs-toc-examples',
    'aria-label': label + ' examples' },
    h('p', null, 'Examples'),
    h(Flow, { as: 'ol', gap: 'none' }, ...examples.map((example) =>
      h('li', { key: example.id },
        h('a', { href: '#' + getId(example) }, example.title)))));
}
function typographyUsageGuide(unit, links) {
  const id = unit.id;
  const sections = [
    { id: 'react-typography-setup', heading: 'Get started' },
    { id: 'react-typography-preview', heading: 'Examples' },
    { id: 'react-typography-guidelines', heading: 'Usage guidelines' },
    { id: 'react-typography-reference', heading: 'Related components and API' },
  ];
  const guidance = id === 'text'
    ? ['When to use', 'When not to use', 'Native baseline', 'Visual roles']
    : ['When to use', 'When not to use', 'Native baseline', 'Visual styling'];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections, {
      label: unit.title, examples: unit.examples, getId: (example) => 'react-typography-' + id + '-' + example.id.slice(id.length + 1),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-typography': id },
      guideHeader(unit.sharedContent, 'React · Typography', unit.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(unit.frameworkContent, 'React setup'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h(Link, { href: links.home }, 'React overview'), '.'),
      ]),
      guidePart(sections[1], [
        ...unit.examples.map((example) => typographyExample(unit, example, links)),
      ], { 'data-vf-docs-react-usage-gallery': id }),
      guidePart(sections[2], [
        ...guideSubsections(unit.sharedContent, guidance, 'react-' + id + '-guidance'),
        ...guideSubsections(unit.frameworkContent,
          id === 'text' ? ['Semantic colors and custom themes', 'Choosing a semantic host'] : id === 'code' ? ['Semantic authoring'] : [],
          'react-' + id + '-authoring'),
      ]),
      guidePart(sections[3], [
        h(Flow, { as: 'ul', gap: 'sm', key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.typography[id].api },
            'View ' + unit.title + ' public React API')),
          ...['text', 'code', 'kbd'].filter((other) => other !== id).map((other) =>
            h('li', { key: other },
              h(Link, { href: links.typography[other].guide },
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
      evidenceDisclosure(unit.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'Public React entrypoints and real product-owned TypeScript source, not an invented prop table.')),
    h('section', { 'aria-labelledby': 'react-typography-api-entrypoints' },
      h('h2', { id: 'react-typography-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...unit.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h(Code, null, entry)))),
      h('p', null, 'See ', h(Link, { href: links.home }, 'React overview'),
        ' for shared stylesheet and server-rendering setup.')),
    h('section', { 'aria-labelledby': 'react-typography-api-types' },
      h('h2', { id: 'react-typography-api-types' }, 'Source-backed React types and exports'),
      h('p', null, 'The following source comes from the component-owned React public implementation.'),
      h(CodeBlock, { tabIndex: 0 }, unit.publicSource)),
    h(Link, { href: links.typography[unit.id].guide },
      'View ' + unit.title + ' examples'));
}
function buttonExample(example, links) {
  const id = example.id.slice('button/'.length);
  return h('article', { key: example.id, id: 'react-button-example-' + id,
    className: 'vf-docs-example', 'data-vf-docs-react-button-example': example.id },
    h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'sm',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
        h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: id === 'basic' ? 'Checked-in React Button example' : 'React ' + example.title + ' example',
      src: links.buttonExamples[id], sandbox: 'allow-scripts',
      loading: id === 'basic' ? 'eager' : 'lazy',
      style: { minBlockSize: id === 'icons' ? '28rem' : id === 'density' ? '14rem' : '10rem' } }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, id === 'basic' ? 'View checked-in React source' : 'View React TSX source'),
      h(CodeBlock, { tabIndex: 0 }, example.source)));
}
function buttonUsageGuide(button, links) {
  if (!button?.sharedContent || !button?.frameworkContent) return null;
  // Product-owned documentationSection metadata binds each executable example
  // to the exact shared concept it teaches; React does not own a second list.
  const examples = button.examples;
  const mainExample = examples.filter((example) => !example.documentationSection);
  const exampleSections = button.sharedContent.sections.filter((section) =>
    section.heading === 'When to use' || examples.some((ex) => ex.documentationSection === section.heading));
  const sections = [
    { id: 'react-setup', heading: 'Get started' },
    ...exampleSections.map(({ heading }) => ({
      id: 'react-button-' + slug(heading),
      heading: heading === 'When to use' ? 'Basic buttons' : heading,
      sourceHeading: heading,
    })),
    { id: 'react-reference', heading: 'Related components and API' },
  ];
  const playgroundSection = { id: 'react-button-playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc([sections[0], playgroundSection, ...sections.slice(1)]),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-component': 'button' },
      guideHeader(button.sharedContent, 'React · Components · Actions', button.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(button.frameworkContent, 'React setup'),
        h('p', { key: 'shared-setup' }, 'For shared styling and server-rendering setup, see ',
          h(Link, { href: links.home }, 'React overview'), '.'),
      ]),
      guidePart(playgroundSection, [h(ComponentPlayground, { adapter: buttonPlayground, title: 'Button' })]),
      ...sections.slice(1, -1).map((section) => {
        const heading = section.sourceHeading;
        const demonstrations = heading === 'When to use' ? mainExample :
          examples.filter((example) => example.documentationSection === heading);
        return guidePart(section, [
          ...guideBlocks(button.sharedContent, heading),
          ...(heading === 'When to use' ? [
            h('h3', { id: 'react-button-native-baseline' }, 'Native baseline'),
            ...guideBlocks(button.sharedContent, 'Native baseline'),
            ...guideSubsections(button.sharedContent, ['Interaction and focus'], 'react-button-use'),
          ] : []),
          ...(heading === 'Density and target sizing' ? guideSubsections(button.sharedContent, ['Styling and adaptation'], 'react-button-use') : []),
          ...demonstrations.map((example) => buttonExample(example, links)),
        ], { 'data-vf-docs-button-topic': heading });
      }),
      guidePart(sections.at(-1), [
        h(Flow, { as: 'ul', gap: 'sm', key: 'related', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.api },
            'View Button public React API')),
          h('li', null, h(Link, { href: links.layout }, 'Layout')),
          h('li', null, h(Link, { href: links.toggle.guide }, 'ToggleButton')),
          h('li', null, h(Link, { href: links.buttonGroup.guide }, 'Button Group'))),
      ])));
}

function buttonGroupUsage(group, links) {
  const sections = visibleGuideSections(group.sharedContent.sections, group.examples).map(section => ({
    ...section, id: 'react-button-group-' + slug(section.heading),
  }));
  const related = { id: 'react-button-group-related', heading: 'Related guides' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc([...sections, related]),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-button-group': '' },
      guideHeader(group.sharedContent, 'React · Patterns · Actions', group.standardReferences),
      ...sections.map((section) => guidePart(section, [
        ...renderBlocks(section.blocks),
        ...group.examples.filter((example) => example.documentationSection === (section.sourceHeading ?? section.heading)).map((example) =>
          h('article', { key: example.id, className: 'vf-docs-example',
            'data-vf-docs-react-button-group-example': example.id },
            h('iframe', { className: 'vf-docs-react-example-frame',
              title: 'React ' + example.title + ' example', src: links.buttonGroup.examples[example.id],
              sandbox: 'allow-scripts', loading: 'lazy',
              style: { minBlockSize: example.id.endsWith('/vertical') || example.id.endsWith('/toggles') || example.id.endsWith('/mixed') ? '14rem' : '10rem' } }),
            h('details', { className: 'vf-docs-source-disclosure' },
              h('summary', null, 'View React TSX source'),
              h(CodeBlock, { tabIndex: 0 }, example.source)))),
      ])),
      guidePart(related, [
        h(Link, { href: links.guide }, 'Button'),
        h(Link, { href: links.toggle.guide }, 'ToggleButton'),
        h(Link, { href: links.toggleGroup.guide }, 'ToggleGroup'),
      ])));
}

function toggleOwnedExample(example, links, group = false) {
  const id = example.id.split('/')[1];
  const basic = !group && id === 'basic';
  const title = basic ? 'React ToggleButton pressed-state example' :
    !group && id === 'icons' ? 'React ToggleButton icon-only example' : 'React ' + example.title + ' example';
  return h('article', { key: example.id, className: 'vf-docs-example',
    id: group ? 'react-toggle-group-example-' + id : basic ? 'react-toggle-example' :
      id === 'icons' ? 'react-toggle-icon-example' : 'react-toggle-example-' + id,
    [group ? 'data-vf-docs-react-toggle-group-example' : 'data-vf-docs-react-toggle-example']: example.id },
    h('iframe', { className: 'vf-docs-react-example-frame', title,
      src: links.examples[example.id], sandbox: 'allow-scripts', loading: basic ? 'eager' : 'lazy',
      style: { minBlockSize: !group && id === 'sizes' ? '14rem' : id === 'controlled' ? '22rem' : id === 'states' ? '19rem' : id === 'text-only' || (group && (id === 'basic' || id === 'multiple')) ? '17rem' : id === 'icon-text' ? '14rem' : '12rem' } }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h(CodeBlock, { tabIndex: 0 }, example.source)));
}
function toggleUsage(toggle, links, group = false) {
  if (!toggle?.sharedContent || !toggle?.frameworkContent || !toggle.examples?.length) return null;
  const prefix = group ? 'react-toggle-group-' : 'react-toggle-';
  const routeLinks = group ? links.toggleGroup : links.toggle;
  const topics = visibleGuideSections(toggle.sharedContent.sections, toggle.examples).map(section => ({
    ...section, id: prefix + slug(section.heading),
    heading: !group && section.heading === 'Native semantics and behavior' ? 'Pressed state' : section.heading,
    sourceHeading: section.sourceHeading ?? section.heading,
  }));
  if (group && !topics.some(section => section.heading === 'Related controls and grouping')) {
    topics.push({ id: prefix + 'related', heading: 'Related controls and grouping', sourceHeading: 'Related controls and grouping', blocks: [] });
  }
  const sections = [{ id: prefix + 'setup', heading: 'Get started' }, ...topics];
  const playgroundSection = { id: prefix + 'playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(group ? sections : [sections[0], playgroundSection, ...sections.slice(1)]),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      [group ? 'data-vf-docs-react-toggle-group' : 'data-vf-docs-react-toggle']: '' },
      guideHeader(toggle.sharedContent, 'React · Components · Actions', toggle.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(toggle.frameworkContent, 'React setup'),
        ...(group ? guideBlocks(toggle.frameworkContent, 'Selection state') : []),
      ]),
      ...(!group ? [guidePart(playgroundSection, [h(ComponentPlayground, { adapter: togglePlayground, title: 'ToggleButton' })])] : []),
      ...topics.map((section) => {
        const heading = section.sourceHeading;
        const examples = toggle.examples.filter((example) => example.documentationSection === heading ||
          (!group && heading === 'Native semantics and behavior' && !example.documentationSection));
        const related = heading === 'Related controls and grouping';
        return guidePart(section, [
          ...renderBlocks(section.blocks),
          ...(section.heading === 'Additional examples' ? [] : guideBlocks(toggle.frameworkContent, heading)),
          ...(!group && heading === 'Sizing and styling' ? guideBlocks(toggle.frameworkContent, 'Sizing and composition') : []),
          ...(group && heading === 'Icon-only choices' ? guideBlocks(toggle.frameworkContent, 'Icon-only items') : []),
          ...examples.map((example) => toggleOwnedExample(example, routeLinks, group)),
          ...(related ? [
            h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
              h('li', null, h(Link, { href: routeLinks.api }, group ? 'ToggleGroup public React API' : 'ToggleButton public React API')),
              h('li', null, h(Link, { href: group ? links.toggle.guide : links.toggleGroup.guide }, group ? 'ToggleButton' : 'ToggleGroup')),
              h('li', null, h(Link, { href: links.guide }, 'Button')),
              h('li', null, h(Link, { href: links.buttonGroup.guide }, 'Button Group'))),
          ] : []),
        ], !group && heading === 'Native semantics and behavior' ? { 'data-vf-docs-react-toggle-topic': 'pressed' } : {});
      })));
}
function selectionGuide(unit, links) {
  const prefix = 'react-' + unit.id + '-';
  const routeLinks = links.selection[unit.id];
  const topics = visibleGuideSections(unit.sharedContent.sections, unit.examples).map(section => ({ ...section, id: prefix + slug(section.heading) }));
  const sections = [...(unit.frameworkContent ? [{ id: prefix + 'setup', heading: 'Get started' }] : []), ...topics];
  const adapter = unit.id === 'checkbox' ? checkboxPlayground : unit.id === 'radio' ? radioPlayground : null;
  const playgroundSection = { id: prefix + 'playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(adapter ? [sections[0], playgroundSection, ...sections.slice(1)] : sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-selection': unit.id },
      guideHeader(unit.sharedContent, unit.guideOnly ? 'React · Patterns · Forms' : 'React · Components · Forms', unit.standardReferences),
      ...(unit.frameworkContent ? [guidePart(sections[0], guideBlocks(unit.frameworkContent, 'React setup'))] : []),
      ...(adapter ? [guidePart(playgroundSection, [h(ComponentPlayground, { adapter, title: unit.title })])] : []),
      ...topics.map(section => guidePart(section, [
        ...renderBlocks(section.blocks),
        ...guideBlocks(unit.frameworkContent, section.heading),
        ...unit.examples.filter(example => example.documentationSection === (section.sourceHeading ?? section.heading)).map(example =>
          h(Flow, { as: 'article', gap: 'sm', key: example.id, className: 'vf-docs-example',
            'data-vf-docs-react-selection-example': example.id },
            h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
            h(Text, { as: 'p' }, example.description),
            h('iframe', { className: 'vf-docs-react-example-frame',
              'data-vf-docs-example-id': example.id, title: 'React ' + example.title + ' example',
              src: routeLinks.examples[example.id], sandbox: 'allow-scripts allow-forms', loading: 'lazy',
              onLoad: (event) => syncSelectionPreviewTheme(event.currentTarget),
              style: { minBlockSize: example.id === 'checkbox/basic' ? '10rem' : example.id.endsWith('/basic') ? '12rem' : '19rem' } }),
            h('details', { className: 'vf-docs-source-disclosure' },
              h('summary', null, 'View React TSX source'),
              h(CodeBlock, { tabIndex: 0 }, example.source)))),
        ...(section.heading === 'Related controls' ? [
          h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
            ...(routeLinks.api ? [h('li', { key: 'api' }, h(Link, { href: routeLinks.api }, unit.title + ' API'))] : []),
            ...['checkbox', 'radio', 'checkbox-group', 'radio-group'].filter(id => id !== unit.id).map(id =>
              h('li', { key: id }, h(Link, { href: links.selection[id].guide },
                id.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ')))))
        ] : []),
      ]))));
}
function selectionApi(unit, links) {
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': unit.id },
    h('header', { className: 'vf-docs-component-header' }, h('h1', null, unit.title + ' API'),
      evidenceDisclosure(unit.standardReferences),
      h(Text, { as: 'p' }, 'Native input attributes and the forwarded HTMLInputElement ref.')),
    h('section', null, h('h2', null, 'Public entrypoint'),
      h(Flow, { as: 'ul', gap: 'sm' }, ...unit.publicEntrypoints.map(name => h('li', { key: name }, h(Code, null, name)))),
      h(Text, { as: 'p' }, 'Canonical styling: ', h(Code, null, '@vyrnforge/web/styles/' + unit.id + '.css'))),
    h('section', null, h('h2', null, 'Source-backed React props'),
      h(CodeBlock, { tabIndex: 0 }, unit.publicTypes)),
    h(Link, { href: links.selection[unit.id].guide }, 'View ' + unit.title + ' guide'));
}
function toggleGroupApi(group, links) {
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'toggle-group' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'ToggleGroup API'),
      evidenceDisclosure(group.standardReferences),
      h('p', { className: 'vf-docs-lede' }, 'Named groups of native pressed buttons with single or multiple selection.')),
    h('section', null, h('h2', null, 'Public entrypoint'),
      h('ul', null, ...group.publicEntrypoints.map((name) => h('li', { key: name }, h(Code, null, name)))),
      h('p', null, 'Canonical styling: ', h(Code, null, '@vyrnforge/web/styles/toggle-group.css'))),
    h('section', null, h('h2', null, 'Source-backed React props'),
      h(CodeBlock, { tabIndex: 0 }, group.publicTypes)),
    h(Link, { href: links.toggleGroup.guide }, 'View ToggleGroup guide'));
}
function toggleApi(toggle, links) {
  if (!toggle?.publicToggleTypes || !toggle.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'toggle-button' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'ToggleButton API'),
      evidenceDisclosure(toggle.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'Native pressed button with controlled or uncontrolled state and shared Button sizes.')),
    h('section', { 'aria-labelledby': 'react-toggle-api-entry' },
      h('h2', { id: 'react-toggle-api-entry' }, 'Public entrypoint'),
      h('ul', null, ...toggle.publicEntrypoints.map(name => h('li', { key: name },
        h(Code, null, name)))),
      h('p', null, 'Canonical styling: ', h('code', null,
        '@vyrnforge/web/styles/toggle-button.css'))),
    h('section', { 'aria-labelledby': 'react-toggle-api-props' },
      h('h2', { id: 'react-toggle-api-props' }, 'Source-backed React props'),
      h(CodeBlock, { tabIndex: 0 }, toggle.publicToggleTypes)),
    h(Link, { href: links.toggle.guide }, 'View ToggleButton examples'));
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
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
    { id: 'react-icon-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections, {
      label: 'Icon', examples: examples, getId: (example) => 'react-icon-example-' + example.id.slice('icon/'.length),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-icon': '' },
      guideHeader(icon.sharedContent, 'React · Media', icon.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(icon.frameworkContent, 'React setup'),
        ...guideBlocks(icon.frameworkContent, 'Simple custom SVG'),
        h('p', { key: 'setup' }, 'See ', h(Link, { href: links.home },
          'React overview'), ' for shared CSS and server-rendering setup.'),
      ]),
      guidePart(sections[1], [
        ...examples.map((example) => iconExample(example, links)),
      ]),
      guidePart(sections[2], [
        ...guideBlocks(icon.sharedContent, 'Artwork contract'),
        ...guideBlocks(icon.frameworkContent, 'React authoring'),
        ...guideSubsections(icon.frameworkContent,
          ['React color and theming', 'Inline SVG tags'], 'react-icon-authoring'),
      ]),
      guidePart(sections[3], [
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.icon.api }, 'View Icon public React API')),
          h('li', null, h(Link, { href: links.icon.library }, 'Browse VyrnForge Icons')),
          h('li', null, h(Link, { href: links.guide }, 'Button')),
          h('li', null, h(Link, { href: links.typography.text.guide }, 'Text'))),
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
        h('li', null, h(Link, { href: links.icon.guide }, 'Icon usage guide')),
        h('li', null, h(Link, { href: links.icon.api }, 'Icon public React API')))));
}

function iconApi(icon, links) {
  if (!icon?.publicIconTypes || !icon?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'icon' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Icon API'),
      evidenceDisclosure(icon.standardReferences),
      h('p', { className: 'vf-docs-lede' }, 'Public Icon and SvgIcon props and types from the checked-in React implementation.')),
    h('section', { 'aria-labelledby': 'react-icon-api-entrypoints' },
      h('h2', { id: 'react-icon-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...icon.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h(Code, null, entry)))),
      h('p', null, 'Load the canonical Web stylesheet through your consuming application build.')),
    h('section', { 'aria-labelledby': 'react-icon-api-types' },
      h('h2', { id: 'react-icon-api-types' }, 'Source-backed React types and props'),
      h(CodeBlock, { tabIndex: 0 }, icon.publicIconTypes)),
    h('section', { 'aria-labelledby': 'react-icon-api-css' },
      h('h2', { id: 'react-icon-api-css' }, 'Shared CSS'),
      h(Code, null, '@vyrnforge/web/styles/icon.css')),
    h('p', null, h(Link, { href: links.icon.guide }, 'View Icon examples')));
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
}
function listUsage(list, links) {
  if (!list?.sharedContent || !list?.frameworkContent || !list.examples?.length) return null;
  const sections = [
    { id: 'react-list-setup', heading: 'Get started' },
    { id: 'react-list-examples', heading: 'Rich List examples' },
    { id: 'react-list-design', heading: 'Composition and variants' },
    { id: 'react-list-related', heading: 'API and related components' },
  ];
  const playgroundSection = { id: 'react-list-playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc([sections[0], playgroundSection, ...sections.slice(1)], {
      label: 'List', examples: list.examples, getId: (example) => 'react-list-example-' + example.id.slice('list/'.length),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-list': '' },
      guideHeader(list.sharedContent, 'React · Collections', list.standardReferences),
      guidePart(sections[0], [...guideBlocks(list.frameworkContent, 'React setup')]),
      guidePart(playgroundSection, [h(ComponentPlayground, { adapter: listPlayground, title: 'List' })]),
      guidePart(sections[1], [
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
        h(Link, { href: links.list.api },
          'View List and ListItem public React API'),
      ])));
}
function listApi(list, links) {
  if (!list?.publicListTypes || !list?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'list' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'List API'),
      evidenceDisclosure(list.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'Native ordered and unordered List hosts, rich ListItem composition, and documented presentation axes.')),
    h('section', { 'aria-labelledby': 'react-list-api-entrypoints' },
      h('h2', { id: 'react-list-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...list.publicEntrypoints.map(name =>
        h('li', { key: name }, h(Code, null, name)))),
      h('p', null, 'Shared styling: ', h('code', null,
        '@vyrnforge/web/styles/list.css'))),
    h('section', { 'aria-labelledby': 'react-list-api-types' },
      h('h2', { id: 'react-list-api-types' }, 'Source-backed React types and props'),
      h(CodeBlock, { tabIndex: 0 }, list.publicListTypes)),
    h('p', null, h(Link, { href: links.list.guide },
      'View List composition examples')));
}

function compactExample(example, links, component = 'badge', topicHeading = '') {
  const slug = example.id.slice(component.length + 1);
  const componentTitle = component === 'chip' ? 'Chip' : 'Badge';
  return h('article', { key: example.id, id: 'react-' + component + '-example-' + slug,
    className: 'vf-docs-example', ['data-vf-docs-react-' + component + '-example']: example.id },
    example.title === topicHeading ? null : h(Flow, { as: 'header', direction: 'inline', wrap: 'wrap', gap: 'lg',
      align: 'start', justify: 'space-between', className: 'vf-docs-example-header' },
      h('div', null, h(Text, { as: 'h3', variant: 'heading-sm' }, example.title),
        h(Text, { as: 'p' }, example.description))),
    h('iframe', { className: 'vf-docs-react-example-frame',
      title: 'React ' + example.title + ' ' + componentTitle + ' example',
      src: links[component].exampleBase + slug + '/',
      sandbox: 'allow-scripts', loading: slug === 'basic' ? 'eager' : 'lazy',
      ...(component === 'chip' ? { 'data-vf-docs-example-id': example.id } : {}) }),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View React TSX source'),
      h(CodeBlock, { tabIndex: 0 }, example.source)));
}
function chipUsage(chip, links) {
  if (!chip?.sharedContent || !chip?.frameworkContent || !chip.examples?.length) return null;
  const exampleOrder = ['basic', 'clickable', 'deletable', 'action-removal', 'links', 'custom-delete',
    'selection', 'artwork', 'icon', 'appearance', 'sizes', 'multiline', 'array', 'removal'];
  const examples = [...chip.examples].sort((a, b) => exampleOrder.indexOf(a.id.split('/')[1]) - exampleOrder.indexOf(b.id.split('/')[1]));
  const topics = chip.sharedContent.sections.filter(section =>
    section.heading !== 'Playground' && examples.some(example => example.documentationSection === section.heading));
  const sections = [
    { id: 'react-chip-setup', heading: 'Get started' },
    { id: 'react-chip-playground', heading: 'Playground' },
    ...topics.map(section => ({ id: 'react-chip-' + slug(section.heading), heading: section.heading })),
    { id: 'react-chip-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-chip': '' },
      guideHeader(chip.sharedContent, 'React · Metadata and interaction', chip.standardReferences),
      guidePart(sections[0], [...guideBlocks(chip.frameworkContent, 'React setup')]),
      guidePart(sections[1], [...guideBlocks(chip.sharedContent, 'Playground'),
        h(ComponentPlayground, { adapter: chipPlayground, title: 'Chip' })]),
      ...sections.slice(2, -1).map(section => guidePart(section, [
        ...guideBlocks(chip.sharedContent, section.heading),
        ...examples.filter(example => example.documentationSection === section.heading)
          .map(example => compactExample(example, links, 'chip', section.heading)),
      ])),
      guidePart(sections.at(-1), [
        ...guideBlocks(chip.sharedContent, 'When to use'),
        ...guideBlocks(chip.sharedContent, 'Accessibility'),
        ...guideBlocks(chip.sharedContent, 'Boundaries'),
        h(Link, { href: links.chip.api }, 'View Chip public React API'),
      ])));
}
function chipApi(chip, links) {
  if (!chip?.publicChipTypes || !chip?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'chip' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Chip API'), evidenceDisclosure(chip.standardReferences),
      h('p', { className: 'vf-docs-lede' }, 'Source-backed React Chip props and native action refs.')),
    h('section', { 'aria-labelledby': 'react-chip-api-entrypoints' },
      h('h2', { id: 'react-chip-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...chip.publicEntrypoints.map(name => h('li', { key: name }, h(Code, null, name)))),
      h('p', null, 'Load shared styles from @vyrnforge/web/styles/chip.css.')),
    h('section', { 'aria-labelledby': 'react-chip-api-types' },
      h('h2', { id: 'react-chip-api-types' }, 'Source-backed React types and props'),
      h(CodeBlock, { tabIndex: 0 }, chip.publicChipTypes)),
    h('p', null, h(Link, { href: links.chip.guide }, 'View Chip examples')));
}
function badgeUsage(badge, links) {
  if (!badge?.sharedContent || !badge?.frameworkContent || !badge.examples?.length) return null;
  const sections = [
    { id: 'react-badge-setup', heading: 'Get started' },
    { id: 'react-badge-examples', heading: 'Examples' },
    { id: 'react-badge-guidelines', heading: 'Behavior and usage' },
    { id: 'react-badge-related', heading: 'Related components and API' },
  ];
  const playgroundSection = { id: 'react-badge-playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc([sections[0], playgroundSection, ...sections.slice(1)], {
      label: 'Badge', examples: badge.examples, getId: (example) => 'react-badge-example-' + example.id.slice('badge/'.length),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-badge': '' },
      guideHeader(badge.sharedContent, 'React · Metadata', badge.standardReferences),
      guidePart(sections[0], [...guideBlocks(badge.frameworkContent, 'React setup')]),
      guidePart(playgroundSection, [h(ComponentPlayground, { adapter: badgePlayground, title: 'Badge' })]),
      guidePart(sections[1], [
        ...badge.examples.map(example => compactExample(example, links)),
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
        h(Link, { href: links.badge.api }, 'View Badge public React API'),
      ])));
}
function badgeApi(badge, links) {
  if (!badge?.publicBadgeTypes || !badge?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'badge' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Badge API'),
      evidenceDisclosure(badge.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'Source-backed React Badge types for anchored count and dot indicators.')),
    h('section', { 'aria-labelledby': 'react-badge-api-entrypoints' },
      h('h2', { id: 'react-badge-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...badge.publicEntrypoints.map(name =>
        h('li', { key: name }, h(Code, null, name)))),
      h('p', null, 'Load shared styles from @vyrnforge/web/styles/badge.css.')),
    h('section', { 'aria-labelledby': 'react-badge-api-types' },
      h('h2', { id: 'react-badge-api-types' }, 'Source-backed React types and props'),
      h(CodeBlock, { tabIndex: 0 }, badge.publicBadgeTypes)),
    h('p', null, h(Link, { href: links.badge.guide },
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
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
    { id: 'react-avatar-related', heading: 'Related components and API' },
  ];
  const playgroundSection = { id: 'react-avatar-playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc([sections[0], playgroundSection, ...sections.slice(1)], {
      label: 'Avatar', examples: examples, getId: (example) => 'react-avatar-example-' + example.id.slice('avatar/'.length),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-avatar': '' },
      guideHeader(avatar.sharedContent, 'React · Media', avatar.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(avatar.frameworkContent, 'React setup'),
        h('p', { key: 'setup' }, 'See ', h(Link, { href: links.home },
          'React overview'), ' for shared setup and stylesheet delivery.'),
      ]),
      guidePart(playgroundSection, [h(ComponentPlayground, { adapter: avatarPlayground, title: 'Avatar' })]),
      guidePart(sections[1], [
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
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.avatar.api },
            'View Avatar and AvatarGroup public React API')),
          h('li', null, h(Link, { href: links.icon.guide }, 'Icon')),
          h('li', null, h(Link, { href: links.typography.text.guide }, 'Text'))),
      ])));
}
function avatarApi(avatar, links) {
  if (!avatar?.publicAvatarTypes || !avatar?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'avatar' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Avatar API'),
      evidenceDisclosure(avatar.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'Public React Avatar and AvatarGroup types for appearances, fallback, grouping and overflow.')),
    h('section', { 'aria-labelledby': 'react-avatar-api-entrypoints' },
      h('h2', { id: 'react-avatar-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...avatar.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h(Code, null, entry)))),
      h('p', null, 'Load shared Avatar styles from @vyrnforge/web/styles/avatar.css.')),
    h('section', { 'aria-labelledby': 'react-avatar-api-types' },
      h('h2', { id: 'react-avatar-api-types' }, 'Source-backed React types and props'),
      h(CodeBlock, { tabIndex: 0 }, avatar.publicAvatarTypes)),
    h('p', null, h(Link, { href: links.avatar.guide },
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
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
    { id: 'react-image-related', heading: 'Related components and API' },
  ];
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc(sections, {
      label: 'Image', examples: examples, getId: (example) => 'react-image-example-' + example.id.slice('image/'.length),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-image': '' },
      guideHeader(image.sharedContent, 'React · Media', image.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(image.frameworkContent, 'React setup'),
        h('p', { key: 'setup' }, 'See ', h(Link, { href: links.home },
          'React overview'), ' for shared setup and stylesheet delivery.'),
      ]),
      guidePart(sections[1], [
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
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.image.api },
            'View Image public React API')),
          h('li', null, h(Link, { href: links.icon.guide }, 'Icon')),
          h('li', null, h(Link, { href: links.typography.text.guide }, 'Text'))),
      ])));
}
function imageApi(image, links) {
  if (!image?.publicImageTypes || !image?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'image' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Image API'),
      evidenceDisclosure(image.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'Public native image attributes and ref-forwarding props from the React Image source.')),
    h('section', { 'aria-labelledby': 'react-image-api-entrypoints' },
      h('h2', { id: 'react-image-api-entrypoints' }, 'Public entrypoint'),
      h('ul', null, ...image.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h(Code, null, entry)))),
      h('p', null, 'Import the component and deliver canonical Web CSS through your app.')),
    h('section', { 'aria-labelledby': 'react-image-api-types' },
      h('h2', { id: 'react-image-api-types' }, 'Source-backed React types and props'),
      h(CodeBlock, { tabIndex: 0 }, image.publicImageTypes)),
    h('section', { 'aria-labelledby': 'react-image-api-css' },
      h('h2', { id: 'react-image-api-css' }, 'Shared CSS'),
      h(Code, null, '@vyrnforge/web/styles/image.css')),
    h('p', null, h(Link, { href: links.image.guide },
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
      h(CodeBlock, { tabIndex: 0 }, example.source)));
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
    { id: 'react-divider-related', heading: 'Related components and API' },
  ];
  const playgroundSection = { id: 'react-divider-playground', heading: 'Playground' };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout' },
    guideToc([sections[0], playgroundSection, ...sections.slice(1)], {
      label: 'Divider', examples: examples, getId: (example) => 'react-divider-example-' + example.id.slice('divider/'.length),
    }),
    h(Flow, { as: 'article', gap: '2xl', className: 'vf-docs-article vf-docs-usage-guide',
      'data-vf-docs-react-divider': '' },
      guideHeader(divider.sharedContent, 'React · Layout & Structure', divider.standardReferences),
      guidePart(sections[0], [
        ...guideBlocks(divider.frameworkContent, 'React setup'),
        h('p', { key: 'setup' }, 'For shared styles and server rendering, see ',
          h(Link, { href: links.home }, 'React overview'), '.'),
      ]),
      guidePart(playgroundSection, [h(ComponentPlayground, { adapter: dividerPlayground, title: 'Divider' })]),
      guidePart(sections[1], [
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
        h(Flow, { as: 'ul', gap: 'sm', className: 'vf-docs-related-links' },
          h('li', null, h(Link, { href: links.divider.api },
            'View Divider public React API')),
          h('li', null, h(Link, { href: links.layout }, 'Layout')),
        ),
      ])));
}
function dividerApi(divider, links) {
  if (!divider?.publicDividerTypes || !divider?.publicEntrypoints?.length) return null;
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'divider' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, 'Divider API'),
      evidenceDisclosure(divider.standardReferences),
      h('p', { className: 'vf-docs-lede' },
        'A visual horizontal or vertical line, with optional readable text and logical alignment.')),
    h('section', { 'aria-labelledby': 'react-divider-api-exports' },
      h('h2', { id: 'react-divider-api-exports' }, 'Public entrypoint'),
      h('ul', null, ...divider.publicEntrypoints.map((entry) =>
        h('li', { key: entry }, h(Code, null, entry)))),
    ),
    h('section', { 'aria-labelledby': 'react-divider-api-types' },
      h('h2', { id: 'react-divider-api-types' }, 'Source-backed React props'),
      h(CodeBlock, { tabIndex: 0 }, divider.publicDividerTypes)),
    h('section', { 'aria-labelledby': 'react-divider-api-css' },
      h('h2', { id: 'react-divider-api-css' }, 'Shared CSS and hooks'),
      h(Code, null, '@vyrnforge/web/styles/divider.css'),
      ...guideBlocks(divider.sharedContent, 'Horizontal and vertical'),
      ...guideBlocks(divider.sharedContent, 'Text and alignment'),
      ...guideBlocks(divider.sharedContent, 'Vertical label direction')),
    h('p', null, h(Link, { href: links.divider.guide },
      'View Divider examples')));
}

function foundationCode(value) {
  return h(CodeBlock, { tabIndex: 0 }, value);
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
      h(Text, { as: 'p' }, h(Link, { href: links.themes }, 'Apply colors and themes')),
      h(Text, { as: 'p' }, h(Link, { href: links.styling }, 'Load and customize CSS'))));
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
      h(Text, { as: 'p' }, h(Link, { href: links.tokens }, 'Design token roles and references')),
      h(Text, { as: 'p' }, h(Link, { href: links.themes }, 'Light, dark and custom themes'))));
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
      h(Text, { as: 'p' }, h(Link, { href: links.tokens }, 'Explore design tokens')),
      h(Text, { as: 'p' }, h(Link, { href: links.styling }, 'Learn CSS loading and customization')),
      h(Text, { as: 'p' }, h(Link, { href: links.color }, 'Explore palette colors')),
      h(Text, { as: 'p' }, h(Link, { href: links.builder }, 'Build a custom theme')),
      h(Text, { as: 'p' }, h(Link, { href: links.darkMode }, 'Configure dark mode')),
      h(Text, { as: 'p' }, h(Link, { href: links.rtl }, 'Use right-to-left content'))));
}

function body(view, links, button, toggle, buttonGroup, toggleGroup, layout, typography, icon, image, avatar, divider, badge, chip, list, overlayGuide, motionGuide, requestedTopic, selection) {
  if (selection) return view.endsWith('-api') ? selectionApi(selection, links) : selectionGuide(selection, links);
  if (view === 'unavailable') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-unavailable': '' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'React documentation unavailable'),
        h('p', { className: 'vf-docs-lede' },
          'The React documentation view for ', h('strong', null, requestedTopic ?? 'this topic'),
          ' is not part of the currently documented React routes. This does not claim the React package lacks that capability.')),
      h('p', null, h(Link, { href: links.native }, 'Return to Native Web topic')),
      h('p', null, h(Link, { href: links.guide }, 'Browse React Button')),
      h('p', null, h(Link, { href: links.layout }, 'Browse React Layout')));
  }
  if (view === 'tokens') return tokensGuide(links);
  if (view === 'color') return h(ColorGuide, { links });
  if (view === 'builder') return h(ThemeBuilder, { links });
  if (view === 'dark-mode') return h(DarkModeGuide, { links });
  if (view === 'rtl') return h(RtlGuide, { links });
  if (view === 'themes') return themesGuide(links);
  if (view === 'styling') return stylingGuide(links);
  if (view === 'overlay') return h(OverlayUtility, { guide: overlayGuide, links });
  if (view === 'motion') return h(MotionUtility, { guide: motionGuide, links });
  if (view === 'home') {
    return h('article', { className: 'vf-docs-article' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'VyrnForge React'),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'Runnable React examples for Button, ToggleButton, Layout, List, Divider, Text, Code, Kbd, Icon, Image and Avatar. All use the shared VyrnForge Web design foundation.')),
      h('section', null, h('h2', null, 'Getting started'),
        h('p', null, 'Import React components from their public entrypoints. Supported CSS-aware browser builds automatically include canonical Web component styles; server-rendered apps must also deliver extracted client CSS.'),
        h(CodeBlock, { tabIndex: 0 }, "import { Button } from '@vyrnforge/react/button';"),
        h('p', null, 'Use the public React components with meaningful native HTML elements.')),
      h('section', null, h('h2', null, 'Styling, SSR and hydration'),
        h('p', null, 'React components share the canonical Web tokens and styles; they do not have a separate React theme. CSS-aware browser builds that resolve supported browser entrypoints can extract component CSS. The consuming app must ensure those styles reach the client HTML.'),
        h('p', null, 'If your build does not extract component styles, load the public Web aggregate once at app startup:'),
        h(CodeBlock, { tabIndex: 0 }, "import '@vyrnforge/web/styles.css';"),
        h('p', null, 'Node/SSR imports do not install client styles. Deliver the extracted or explicitly imported CSS alongside the server-rendered HTML before hydration. The optional Web reset is not loaded automatically.')),
      h('section', null, h('h2', null, 'Semantic colors and themes'),
        h(Text, { as: 'p' },
          'Use public theme-aware color roles instead of repeating CSS variable names. ThemeScope is an optional native DOM scope, not a provider.'),
        h(CodeBlock, { tabIndex: 0 },
          'import { ThemeScope, Text } from \'@vyrnforge/react\';\n\n' +
          '<ThemeScope theme="dark">\n' +
          '  <Text as="p" tone="primary">Accent</Text>\n' +
          '  <Text as="p" tone="secondary">Muted</Text>\n' +
          '  <Text as="p" tone="danger">Danger</Text>\n' +
          '</ThemeScope>'),
        h(Text, { as: 'p' }, h(Link, { href: links.tokens }, 'Browse design tokens')),
        h(Text, { as: 'p' }, h(Link, { href: links.themes }, 'Explore theming')),
        h(Text, { as: 'p' }, h(Link, { href: links.color }, 'Try the color playground')),
        h(Text, { as: 'p' }, h(Link, { href: links.darkMode }, 'Preview light, dark and system')),
        h(Text, { as: 'p' }, h(Link, { href: links.rtl }, 'Preview right-to-left layout')),
        h(Text, { as: 'p' }, h(Link, { href: links.styling }, 'Learn styling and CSS'))),
      h('section', null, h('h2', null, 'React state and native semantics'),
        h('p', null, 'React owns component state, event handlers, refs, effects and hydration. VyrnForge components preserve native HTML semantics and shared interaction contracts; consuming applications own data, actions, async feedback and routing. Avoid adding custom keyboard handlers for behavior native elements already provide.')),
      h('section', null, h('h2', null, 'Components and APIs'),
        h('ul', null,
          h('li', null, h(Link, { href: links.guide }, 'React Button')),
          h('li', null, h(Link, { href: links.api }, 'React Button API')),
          h('li', null, h(Link, { href: links.toggle.guide }, 'React ToggleButton')),
          h('li', null, h(Link, { href: links.toggle.api }, 'React ToggleButton API')),
          h('li', null, h(Link, { href: links.layout }, 'React Layout')),
          h('li', null, h(Link, { href: links.layoutApi }, 'React Layout API')),
          h('li', null, h(Link, { href: links.divider.guide }, 'React Divider')),
          h('li', null, h(Link, { href: links.divider.api }, 'React Divider API')),
          h('li', null, h(Link, { href: links.list.guide }, 'React List')),
          h('li', null, h(Link, { href: links.list.api }, 'React List API')),
          h('li', null, h(Link, { href: links.icon.guide }, 'React Icon')),
          h('li', null, h(Link, { href: links.icon.library }, 'VyrnForge Icons library')),
          h('li', null, h(Link, { href: links.icon.api }, 'React Icon API')),
          h('li', null, h(Link, { href: links.image.guide }, 'React Image')),
          h('li', null, h(Link, { href: links.image.api }, 'React Image API')),
          h('li', null, h(Link, { href: links.badge.guide }, 'React Badge')),
          h('li', null, h(Link, { href: links.chip.guide }, 'React Chip')),
          h('li', null, h(Link, { href: links.badge.api }, 'React Badge API')),
          h('li', null, h(Link, { href: links.chip.api }, 'React Chip API')),
          h('li', null, h(Link, { href: links.avatar.guide }, 'React Avatar')),
          h('li', null, h(Link, { href: links.avatar.api }, 'React Avatar API')),
          ...['text', 'code', 'kbd'].flatMap((id) => [
            h('li', { key: id + '-guide' }, h(Link, { href: links.typography[id].guide }, 'React ' + (id === 'kbd' ? 'Kbd' : id[0].toUpperCase() + id.slice(1)))),
            h('li', { key: id + '-api' }, h(Link, { href: links.typography[id].api }, 'React ' + id + ' API')),
          ]))));
  }
  if (view === 'button-group') return buttonGroupUsage(buttonGroup, links);
  if (view === 'toggle') return toggleUsage(toggle, links);
  if (view === 'toggle-api') return toggleApi(toggle, links);
  if (view === 'toggle-group') return toggleUsage(toggleGroup, links, true);
  if (view === 'toggle-group-api') return toggleGroupApi(toggleGroup, links);
  if (view === 'icon-library') return iconLibrary(links);
  if (view === 'icon') return iconUsage(icon, links);
  if (view === 'icon-api') return iconApi(icon, links);
  if (view === 'divider') return dividerUsage(divider, links);
  if (view === 'divider-api') return dividerApi(divider, links);
  if (view === 'list') return listUsage(list, links);
  if (view === 'list-api') return listApi(list, links);
  if (view === 'chip') return chipUsage(chip, links);
  if (view === 'chip-api') return chipApi(chip, links);
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
        evidenceDisclosure(layout.standardReferences),
        h('p', { className: 'vf-docs-lede' },
          'Real React components using the canonical Web CSS, with native semantic hosts and forwarded refs.')),
      h('section', { 'aria-labelledby': 'react-layout-api-exports' },
        h('h2', { id: 'react-layout-api-exports' }, 'Public entrypoint and CSS'),
        h('ul', null,
          ...layout.publicEntrypoints.map((name) => h('li', { key: name }, h(Code, null, name))),
          h('li', null, h(Code, null, layout.cssRecipeStyle)))),
      h('section', { 'aria-labelledby': 'react-layout-api-types' },
        h('h2', { id: 'react-layout-api-types' }, 'Public TypeScript props'),
        h('p', null, 'These declarations are derived from the checked-in React Layout implementation. ',
          'Flow and AutoGrid accept as for native semantic HTML, ordinary attributes and host refs.'),
        h(CodeBlock, { tabIndex: 0 }, layout.publicLayoutTypes)),
      h('section', { 'aria-labelledby': 'react-layout-api-css' },
        h('h2', { id: 'react-layout-api-css' }, 'CSS attributes and spacing'),
        ...guideBlocks(layout.sharedContent, 'Attributes and spacing')),
      h('p', null, h(Link, { href: links.layout }, 'View Layout examples')));
  }
  if (view === 'api') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'button' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'Button API'),
        evidenceDisclosure(button.standardReferences),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'Public React entrypoints are derived from the Product Graph; other APIs are not inferred.')),
      h('section', null, h('h2', null, 'Public entrypoints'),
        h('ul', null, ...button.publicEntrypoints.map((name) =>
          h('li', { key: name }, h(Code, null, name))))),
      h('section', { 'aria-labelledby': 'react-public-types' },
        h('h2', { id: 'react-public-types' }, 'Public TypeScript types'),
        h('p', null, 'The following declarations are read from the checked-in React Button source. ',
          'ButtonProps extends React native button attributes, and its ref targets HTMLButtonElement.'),
        h(CodeBlock, { tabIndex: 0 }, button.publicButtonTypes)),
      h('p', null, h(Link, { href: links.guide }, 'View Button examples')));
  }
  return buttonUsageGuide(button, links);
}
export function ReactReferencePage({ view, links, button, toggle, buttonGroup, toggleGroup, layout, typography, icon, image, avatar, divider, badge, chip, list, overlayGuide, motionGuide, requestedTopic, selection }) {
  const nav = useNavigation();
  const { theme, change } = useTheme();
  const [search, setSearch] = useState('');
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
    { title: 'Overlay utility', href: links.overlay,
      keywords: 'utilities overlay playground popover tooltip preview card dialog drawer theme placement elevation stacking backdrop RTL customization' },
    { title: 'Motion utility', href: links.motion,
      keywords: 'utilities motion transitions animation duration easing keyframes reduced-motion reduced motion accessibility loading spinner shimmer css tokens' },
    { title: 'Button', href: links.guide, keywords: 'button usage accessibility examples state' },
    { title: 'Button Group', href: links.buttonGroup.guide, keywords: 'joined horizontal vertical icon separate commands composition' },
    { title: 'Button API', href: links.api, keywords: 'button props reference public' },
    { title: 'ToggleButton', href: links.toggle.guide, keywords: 'toggle button pressed state independent' },
    { title: 'ToggleGroup', href: links.toggleGroup.guide, keywords: 'exclusive multiple selected pressed choices' },
    { title: 'ToggleGroup API', href: links.toggleGroup.api, keywords: 'root item type value onValueChange' },
    ...Object.entries(links.selection).flatMap(([id, entry]) => {
      const title = id.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
      return [{ title, href: entry.guide, keywords: 'native selection form checked required reset' },
        ...(entry.api ? [{ title: title + ' API', href: entry.api, keywords: 'React props native input ref' }] : [])];
    }),
    { title: 'ToggleButton API', href: links.toggle.api, keywords: 'togglebutton props aria-pressed controlled size' },
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
    { title: 'Chip', href: links.chip.guide, keywords: 'chip tag compact label filter clickable removable dismiss selected avatar icon' },
    { title: 'Chip API', href: links.chip.api, keywords: 'chipprops selected onremove removelabel ref' },
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
          h(Link, { href: links.native }, 'Native Web'),
          h('span', { 'aria-hidden': 'true' }, ' / '),
          h('span', { 'aria-current': 'page' }, 'React')),
        body(view, links, button, toggle, buttonGroup, toggleGroup, layout, typography, icon, image, avatar, divider, badge, chip, list, overlayGuide, motionGuide, requestedTopic, selection))),
    h(AppShellFooter, { className: 'vf-docs-footer' },
      h('span', null, 'VyrnForge React documentation'),
      h('span', null, links.channel + ' channel'))));
}
