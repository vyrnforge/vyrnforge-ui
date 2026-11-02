import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import {
  AppShell,
  AppShellHeader,
  AppShellBody,
  AppShellNavigation,
  AppShellMain,
  AppShellFooter,
} from '@vyrnforge/react/app-shell';
import { Input } from '@vyrnforge/react/input';
import { NativeSelect } from '@vyrnforge/react/native-select';
import {
  SideNav,
  SideNavGroup,
  SideNavGroupLabel,
  SideNavList,
  SideNavItem,
  SideNavLink,
} from '@vyrnforge/react/side-nav';
import { parseFragment, textNodeValue } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

const reactAttributeNames = Object.freeze({
  class: 'className',
  for: 'htmlFor',
  autocomplete: 'autoComplete',
  spellcheck: 'spellCheck',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  contenteditable: 'contentEditable',
});

const booleanAttributes = new Set([
  'checked',
  'disabled',
  'hidden',
  'multiple',
  'open',
  'readonly',
  'required',
  'selected',
]);

function reactStyleName(property) {
  if (property.startsWith('--')) return property;
  return property
    .replace(/^-ms-/, 'ms-')
    .replace(/^-webkit-/, 'Webkit-')
    .replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

function styleFor(element) {
  const style = {};
  for (const property of element.style) {
    style[reactStyleName(property)] = element.style.getPropertyValue(property).trim();
  }
  return style;
}

function propsFor(element) {
  const props = {};
  for (const attribute of element.attributes) {
    if (attribute.name === 'style') {
      props.style = styleFor(element);
      continue;
    }
    const name = reactAttributeNames[attribute.name] || attribute.name;
    props[name] = booleanAttributes.has(attribute.name) ? true : attribute.value;
  }
  return props;
}

function renderSemanticNode(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return textNodeValue(node);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node;
  const props = propsFor(element);
  props.key = key;
  const children = Array.from(element.childNodes).map((child, index) => renderSemanticNode(child, index));
  return createElement(element.localName, props, ...children);
}

function renderSemanticFragment(value) {
  return parseFragment(value).map((node, index) => renderSemanticNode(node, index));
}

function renderNavItem(item, key) {
  return createElement(
    SideNavItem,
    { key },
    createElement(SideNavLink, { href: item.href, current: item.current }, item.title)
  );
}

function renderNavGroup(group) {
  const body = group.subgroups?.length
    ? group.subgroups.map((subgroup) =>
        createElement(
          'details',
          {
            key: subgroup.label,
            className: 'vf-docs-component-subgroup',
            'data-vf-docs-component-subgroup': '',
            'data-vf-current-group': subgroup.open ? 'true' : undefined,
            open: subgroup.open || undefined,
          },
          createElement(
            'summary',
            { className: 'vf-docs-component-subgroup__label' },
            createElement('span', null, subgroup.label),
            createElement(
              'span',
              { className: 'vf-docs-component-subgroup__count', 'aria-hidden': 'true' },
              String(subgroup.count)
            )
          ),
          createElement(SideNavList, null, ...subgroup.items.map(renderNavItem))
        )
      )
    : [createElement(SideNavList, { key: `${group.label}-list` }, ...group.items.map(renderNavItem))];

  return createElement(
    SideNavGroup,
    { key: group.label },
    createElement(SideNavGroupLabel, null, group.label),
    ...body
  );
}

function renderFrameworkSelector(model) {
  const current = model.frameworkChoices.find((choice) => choice.current);
  return createElement(
    'div',
    { className: 'vf-docs-framework-selector' },
    createElement('label', { htmlFor: 'vf-docs-framework-select' }, 'Framework'),
    createElement(
      NativeSelect,
      {
        id: 'vf-docs-framework-select',
        'data-vf-framework-select': '',
        'aria-label': 'Framework',
        defaultValue: current?.href,
      },
      ...model.frameworkChoices.map((choice) =>
        createElement(
          'option',
          { key: choice.id, value: choice.href, 'data-vf-framework-value': choice.id },
          choice.label
        )
      )
    )
  );
}

function renderHeader(model) {
  return createElement(
    'div',
    { className: 'vf-docs-header__inner' },
    createElement('a', { className: 'vf-docs-brand', href: model.brandHref }, 'VyrnForge'),
    createElement('span', { className: 'vf-docs-version', 'data-vf-docs-version': '' }, model.versionText),
    createElement(
      'div',
      { className: 'vf-docs-tools' },
      createElement(
        'div',
        { className: 'vf-docs-search-wrap' },
        createElement('label', { htmlFor: 'vf-docs-search' }, 'Search'),
        createElement(Input, {
          id: 'vf-docs-search',
          'data-vf-docs-search': '',
          type: 'search',
          autoComplete: 'off',
        }),
        createElement('ul', {
          className: 'vf-docs-search-results',
          'data-vf-docs-search-results': '',
          hidden: true,
        })
      ),
      renderFrameworkSelector(model)
    )
  );
}

const model = readDocsPageModel();
const root = createRoot(document.querySelector('#vf-docs-app'));

flushSync(() =>
  root.render(
    createElement(
      AppShell,
      { 'data-vf-docs-renderer': 'react' },
      createElement('a', { className: 'vf-skip-link', href: '#main' }, 'Skip to content'),
      createElement(AppShellHeader, { className: 'vf-docs-header' }, renderHeader(model)),
      createElement(
        AppShellBody,
        null,
        createElement(
          AppShellNavigation,
          { className: 'vf-docs-navigation' },
          createElement(SideNav, { 'aria-label': 'Documentation' }, ...model.navigation.map(renderNavGroup))
        ),
        createElement(AppShellMain, { id: 'main' }, ...renderSemanticFragment(model.mainHtml))
      ),
      createElement(AppShellFooter, { className: 'vf-docs-footer' }, model.footerText || '')
    )
  )
);

markDocsRendered('react');
