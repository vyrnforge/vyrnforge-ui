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
import { NativeSelect } from '@vyrnforge/vue/native-select';
import {
  SideNav,
  SideNavGroup,
  SideNavGroupLabel,
  SideNavList,
  SideNavItem,
  SideNavLink,
} from '@vyrnforge/vue/side-nav';
import { parseFragment, textNodeValue } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

function propsFor(element) {
  const props = {};
  for (const attribute of element.attributes) props[attribute.name] = attribute.value || '';
  if (element.hasAttribute('hidden')) props.hidden = true;
  if (element.hasAttribute('open')) props.open = true;
  return props;
}

function renderSemanticNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return textNodeValue(node);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node;
  return h(element.localName, propsFor(element), Array.from(element.childNodes).map(renderSemanticNode));
}

function renderSemanticFragment(value) {
  return parseFragment(value).map(renderSemanticNode);
}

function renderNavItem(item) {
  return h(SideNavItem, { key: item.href }, {
    default: () => h(SideNavLink, { href: item.href, current: item.current }, { default: () => item.title }),
  });
}

function renderNavGroup(group) {
  const body = group.subgroups?.length
    ? group.subgroups.map((subgroup) =>
        h(
          'details',
          {
            key: subgroup.label,
            class: 'vf-docs-component-subgroup',
            'data-vf-docs-component-subgroup': '',
            'data-vf-current-group': subgroup.open ? 'true' : undefined,
            open: subgroup.open || undefined,
          },
          [
            h('summary', { class: 'vf-docs-component-subgroup__label' }, [
              h('span', null, subgroup.label),
              h('span', { class: 'vf-docs-component-subgroup__count', 'aria-hidden': 'true' }, String(subgroup.count)),
            ]),
            h(SideNavList, null, { default: () => subgroup.items.map(renderNavItem) }),
          ]
        )
      )
    : [h(SideNavList, { key: `${group.label}-list` }, { default: () => group.items.map(renderNavItem) })];

  return h(SideNavGroup, { key: group.label }, {
    default: () => [h(SideNavGroupLabel, null, { default: () => group.label }), ...body],
  });
}

function renderFrameworkSelector(model) {
  const current = model.frameworkChoices.find((choice) => choice.current);
  return h('div', { class: 'vf-docs-framework-selector' }, [
    h('label', { for: 'vf-docs-framework-select' }, 'Framework'),
    h(
      NativeSelect,
      {
        id: 'vf-docs-framework-select',
        'data-vf-framework-select': '',
        'aria-label': 'Framework',
        value: current?.href,
      },
      {
        default: () => model.frameworkChoices.map((choice) =>
          h('option', { key: choice.id, value: choice.href, 'data-vf-framework-value': choice.id }, choice.label)
        ),
      }
    ),
  ]);
}

function renderHeader(model) {
  return h('div', { class: 'vf-docs-header__inner' }, [
    h('a', { class: 'vf-docs-brand', href: model.brandHref }, 'VyrnForge'),
    h('span', { class: 'vf-docs-version', 'data-vf-docs-version': '' }, model.versionText),
    h('div', { class: 'vf-docs-tools' }, [
      h('div', { class: 'vf-docs-search-wrap' }, [
        h('label', { for: 'vf-docs-search' }, 'Search'),
        h(Input, {
          id: 'vf-docs-search',
          'data-vf-docs-search': '',
          type: 'search',
          autocomplete: 'off',
        }),
        h('ul', {
          class: 'vf-docs-search-results',
          'data-vf-docs-search-results': '',
          hidden: true,
        }),
      ]),
      renderFrameworkSelector(model),
    ]),
  ]);
}

const model = readDocsPageModel();
const app = createApp({
  render() {
    return h(AppShell, { 'data-vf-docs-renderer': 'vue' }, {
      default: () => [
        h('a', { class: 'vf-skip-link', href: '#main' }, 'Skip to content'),
        h(AppShellHeader, { class: 'vf-docs-header' }, { default: () => renderHeader(model) }),
        h(AppShellBody, null, {
          default: () => [
            h(AppShellNavigation, { class: 'vf-docs-navigation' }, {
              default: () => h(SideNav, { 'aria-label': 'Documentation' }, { default: () => model.navigation.map(renderNavGroup) }),
            }),
            h(AppShellMain, { id: 'main' }, { default: () => renderSemanticFragment(model.mainHtml) }),
          ],
        }),
        h(AppShellFooter, { class: 'vf-docs-footer' }, { default: () => model.footerText || '' }),
      ],
    });
  },
});

app.mount('#vf-docs-app');
markDocsRendered('vue');
