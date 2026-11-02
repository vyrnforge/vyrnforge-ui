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
import {
  SideNav,
  SideNavGroup,
  SideNavGroupLabel,
  SideNavList,
  SideNavItem,
  SideNavLink,
} from '@vyrnforge/react/side-nav';
import { parseFragment } from '../fragment.js';
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

function propsFor(element) {
  const props = {};
  for (const attribute of element.attributes) {
    const name = reactAttributeNames[attribute.name] || attribute.name;
    props[name] = booleanAttributes.has(attribute.name) ? true : attribute.value;
  }
  return props;
}

function componentFor(element) {
  if (element.hasAttribute('data-vf-side-nav')) return SideNav;
  if (element.hasAttribute('data-vf-side-nav-group')) return SideNavGroup;
  if (element.hasAttribute('data-vf-side-nav-group-label')) return SideNavGroupLabel;
  if (element.hasAttribute('data-vf-side-nav-list')) return SideNavList;
  if (element.hasAttribute('data-vf-side-nav-item')) return SideNavItem;
  if (element.hasAttribute('data-vf-side-nav-link')) return SideNavLink;
  if (element.matches('input[data-vf-docs-search], input[data-vf-input]')) return Input;
  return element.localName;
}

function renderNode(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node;
  const Component = componentFor(element);
  const props = propsFor(element);
  if (Component === SideNavLink) props.current = element.getAttribute('data-vf-current') === 'true';
  props.key = key;

  const children = Array.from(element.childNodes).map((child, index) => renderNode(child, index));
  return createElement(Component, props, ...children);
}

function renderFragment(value) {
  return parseFragment(value).map((node, index) => renderNode(node, index));
}

const model = readDocsPageModel();
const root = createRoot(document.querySelector('#vf-docs-app'));

flushSync(() =>
  root.render(
    createElement(
      AppShell,
      { 'data-vf-docs-renderer': 'react' },
      createElement('a', { className: 'vf-skip-link', href: '#main' }, 'Skip to content'),
      createElement(AppShellHeader, { className: 'vf-docs-header' }, ...renderFragment(model.headerHtml)),
      createElement(
        AppShellBody,
        null,
        createElement(
          AppShellNavigation,
          { className: 'vf-docs-navigation' },
          ...renderFragment(model.navigationHtml)
        ),
        createElement(AppShellMain, { id: 'main' }, ...renderFragment(model.mainHtml))
      ),
      createElement(AppShellFooter, { className: 'vf-docs-footer' }, model.footerText || '')
    )
  )
);

markDocsRendered('react');
