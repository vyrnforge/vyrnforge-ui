import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } from '@vyrnforge/react/app-shell';
import { SideNav, SideNavGroup, SideNavGroupLabel, SideNavList, SideNavItem, SideNavLink } from '@vyrnforge/react/side-nav';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function renderBlocks(blocks = []) {
  return blocks.map((block, i) => block.type === 'list'
    ? h('ul', { key: i }, block.items.map((item, j) => h('li', { key: j }, item)))
    : h('p', { key: i }, block.text));
}
function renderSections(content, prefix) {
  if (!content) return null;
  return h('section', { 'aria-label': prefix },
    ...renderBlocks(content.intro),
    ...content.sections.map((section, index) => {
      const id = slug(prefix + '-' + section.heading + '-' + index);
      return h('section', { key: id, 'aria-labelledby': id },
        h('h2', { id }, section.heading), ...renderBlocks(section.blocks));
    }));
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
  return { mobile, expanded, setExpanded, navRef, menuRef, mainRef, visible: !mobile || expanded };
}
function navigation(view, links) {
  const entries = [
    { id: 'home', title: 'React overview', href: links.home },
    { id: 'guide', title: 'Button guide', href: links.guide },
    { id: 'api', title: 'Button API', href: links.api },
  ];
  return h(SideNav, { 'aria-label': 'Documentation' },
    h(SideNavGroup, null, h(SideNavGroupLabel, null, 'React'),
      h(SideNavList, null, ...entries.map((entry) =>
        h(SideNavItem, { key: entry.id },
          h(SideNavLink, { current: entry.id === view, href: entry.href }, entry.title))))));
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
function body(view, links, button, message, setMessage) {
  if (view === 'home') {
    return h('article', { className: 'vf-docs-article' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'VyrnForge React'),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'A real React documentation view for the verified Button pilot. Other framework and component documentation routes are not yet claimed.')),
      h('section', null, h('h2', null, 'Getting started'),
        h('p', null, 'Install the React port and load the shared Web tokens, foundation and Button stylesheet in your application.'),
        h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
          h('code', null, "import { Button } from '@vyrnforge/react/button';")),
        h('p', null, 'React owns component state, rendering, event handlers, and hydration; VyrnForge supplies shared semantics and presentation.')),
      h('section', null, h('h2', null, 'Verified routes'),
        h('ul', null,
          h('li', null, h('a', { 'data-vf-link': '', href: links.guide }, 'React Button guide')),
          h('li', null, h('a', { 'data-vf-link': '', href: links.api }, 'React Button API')))));
  }
  if (view === 'api') {
    return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-api': 'button' },
      h('header', { className: 'vf-docs-component-header' },
        h('h1', null, 'Button API'),
        h('p', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
          'Public React entrypoints are derived from the Product Graph; other APIs are not inferred.')),
      h('section', null, h('h2', null, 'Public entrypoints'),
        h('ul', null, ...button.publicEntrypoints.map((name) =>
          h('li', { key: name }, h('code', { 'data-vf-code': '' }, name))))),
      renderSections(button.frameworkContent, 'React integration'),
      h('p', null, h('a', { 'data-vf-link': '', href: links.guide }, 'Open Button guide')));
  }
  return h('article', { className: 'vf-docs-article', 'data-vf-docs-react-component': 'button' },
    h('header', { className: 'vf-docs-component-header' },
      h('h1', null, button.sharedContent?.title || 'Button'),
      h('div', { className: 'vf-docs-lede', 'data-vf-text': '', 'data-vf-text-variant': 'body-lg' },
        ...renderBlocks(button.sharedContent?.intro))),
    h('section', { 'aria-labelledby': 'react-setup' },
      h('h2', { id: 'react-setup' }, 'React setup'),
      h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
        h('code', null, "import { Button } from '@vyrnforge/react/button';"))),
    h('section', { 'aria-labelledby': 'react-usage' },
      h('h2', { id: 'react-usage' }, 'Usage preview'),
      h('div', { className: 'vf-docs-preview', 'data-vf-cluster': '', 'data-vf-cluster-gap': 'md' },
        h(Button, { type: 'button', onClick: () => setMessage('Save changes activated') }, 'Save changes'),
        h('span', { role: 'status', 'aria-live': 'polite', 'data-vf-docs-react-feedback': '' }, message))),
    example(button, links),
    renderSections(button.sharedContent, 'Shared semantics'),
    renderSections(button.frameworkContent, 'React integration'),
    h('section', { 'aria-labelledby': 'react-reference' },
      h('h2', { id: 'react-reference' }, 'Reference'),
      h('a', { 'data-vf-link': '', href: links.api }, 'Button API reference')));
}
export function ReactReferencePage({ view, links, button }) {
  const nav = useNavigation();
  const { theme, change } = useTheme();
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const searchRef = useRef(null);
  useEffect(() => { document.documentElement.dataset.vfReactHydrated = 'true'; }, []);
  const pages = [
    { title: 'React overview', href: links.home, keywords: 'getting started setup' },
    { title: 'Button guide', href: links.guide, keywords: 'button usage accessibility examples state' },
    { title: 'Button API', href: links.api, keywords: 'button props reference public' },
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
          h('a', { className: 'vf-docs-brand', href: links.home }, 'VyrnForge ', h('span', null, 'Docs')),
          h('span', { className: 'vf-docs-surface' }, 'React · ' + links.channel)),
        h('div', { className: 'vf-docs-header-tools' },
          h('search', { className: 'vf-docs-search', 'data-vf-search-field-root': '',
            'aria-label': 'React documentation search' },
            h('label', { htmlFor: 'vf-react-search', 'data-vf-visually-hidden': '' }, 'Search React documentation'),
            h(Input, { id: 'vf-react-search', ref: searchRef, type: 'search',
              'data-vf-search-field-input': '', value: search,
              onChange: (event) => setSearch(event.target.value),
              placeholder: 'Search React documentation', 'aria-controls': 'vf-react-results' }),
            h(Button, { type: 'button', size: 'sm', variant: 'ghost',
              'data-vf-search-field-clear': '', 'aria-label': 'Clear search',
              disabled: !search, onClick: () => { setSearch(''); searchRef.current?.focus(); },
            }, '×'),
            h('span', { 'data-vf-visually-hidden': '', role: 'status', 'aria-live': 'polite' },
              search ? matches.length + ' React documentation results' : ''),
            h('div', { id: 'vf-react-results', className: 'vf-docs-search-panel',
              'data-vf-docs-react-results': '', hidden: !search },
              h('p', { className: 'vf-docs-search-label' }, 'React documentation results'),
              matches.length
                ? h('ul', null, ...matches.map((item) =>
                    h('li', { key: item.title }, h('a', { href: item.href }, item.title))))
                : h('p', null, 'No matching React documentation.'))),
          h('div', { className: 'vf-docs-theme-control' },
            h('label', { htmlFor: 'vf-react-theme' }, 'Theme'),
            h('select', { id: 'vf-react-theme', 'data-vf-native-select': '', value: theme,
              onChange: (event) => change(event.target.value) },
              h('option', { value: 'light' }, 'Light'),
              h('option', { value: 'dark' }, 'Dark'),
              h('option', { value: 'system' }, 'System')))))),
    h(AppShellBody, { className: 'vf-docs-app-body' },
      h(AppShellNavigation, { id: 'vf-docs-navigation', ref: nav.navRef,
        hidden: !nav.visible, className: 'vf-docs-navigation-region' },
        h('div', { className: 'vf-docs-navigation-scroll' }, navigation(view, links))),
      h(AppShellMain, { id: 'main', ref: nav.mainRef, tabIndex: -1, className: 'vf-docs-main' },
        h('nav', { className: 'vf-docs-breadcrumbs', 'aria-label': 'Documentation framework' },
          h('a', { 'data-vf-link': '', href: links.native }, 'Native Web'),
          h('span', { 'aria-hidden': 'true' }, ' / '),
          h('span', { 'aria-current': 'page' }, 'React')),
        body(view, links, button, message, setMessage))),
    h(AppShellFooter, { className: 'vf-docs-footer' },
      h('span', null, 'VyrnForge React documentation'),
      h('span', null, links.channel + ' channel'))));
}
