import { createApp, h } from 'vue';
import {
  AppShell,
  AppShellHeader,
  AppShellBody,
  AppShellNavigation,
  AppShellMain,
  AppShellFooter,
} from '@vyrnforge/vue/app-shell';
import { Input } from '@vyrnforge/vue/input';
import {
  SideNav,
  SideNavGroup,
  SideNavGroupLabel,
  SideNavList,
  SideNavItem,
  SideNavLink,
} from '@vyrnforge/vue/side-nav';
import { parseFragment } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

function propsFor(element) {
  const props = {};
  for (const attribute of element.attributes) props[attribute.name] = attribute.value || '';
  if (element.hasAttribute('hidden')) props.hidden = true;
  if (element.hasAttribute('open')) props.open = true;
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

function renderNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node;
  const Component = componentFor(element);
  const props = propsFor(element);
  if (Component === SideNavLink) props.current = element.getAttribute('data-vf-current') === 'true';

  const children = Array.from(element.childNodes).map(renderNode);
  return typeof Component === 'string'
    ? h(Component, props, children)
    : h(Component, props, { default: () => children });
}

function renderFragment(value) {
  return parseFragment(value).map(renderNode);
}

const model = readDocsPageModel();
const app = createApp({
  render() {
    return h(AppShell, { 'data-vf-docs-renderer': 'vue' }, {
      default: () => [
        h('a', { class: 'vf-skip-link', href: '#main' }, 'Skip to content'),
        h(AppShellHeader, { class: 'vf-docs-header' }, { default: () => renderFragment(model.headerHtml) }),
        h(AppShellBody, null, {
          default: () => [
            h(
              AppShellNavigation,
              { class: 'vf-docs-navigation' },
              { default: () => renderFragment(model.navigationHtml) }
            ),
            h(AppShellMain, { id: 'main' }, { default: () => renderFragment(model.mainHtml) }),
          ],
        }),
        h(AppShellFooter, { class: 'vf-docs-footer' }, { default: () => model.footerText || '' }),
      ],
    });
  },
});

app.mount('#vf-docs-app');
markDocsRendered('vue');
