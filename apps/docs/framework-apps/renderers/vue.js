import { createApp, h } from 'vue';
import {
  AppShell,
  AppShellHeader,
  AppShellBody,
  AppShellNavigation,
  AppShellMain,
  AppShellFooter,
} from '@vyrnforge/vue/app-shell';
import { Button } from '@vyrnforge/vue/button';
import { Input } from '@vyrnforge/vue/input';
import { Link } from '@vyrnforge/vue/link';
import {
  SideNav,
  SideNavGroup,
  SideNavGroupLabel,
  SideNavList,
  SideNavItem,
  SideNavLink,
} from '@vyrnforge/vue/side-nav';
import { Surface } from '@vyrnforge/vue/surface';
import { Text } from '@vyrnforge/vue/text';
import { Textarea } from '@vyrnforge/vue/textarea';
import { parseInline } from '../../content-model.mjs';
import { parseFragment, textNodeValue } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

function propsFor(element) {
  const props = {};
  for (const attribute of element.attributes) props[attribute.name] = attribute.value || '';
  if (element.hasAttribute('hidden')) props.hidden = true;
  if (element.hasAttribute('open')) props.open = true;
  return props;
}

function renderLegacyNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return textNodeValue(node);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node;
  return h(element.localName, propsFor(element), Array.from(element.childNodes).map(renderLegacyNode));
}

function renderLegacyFragment(value) {
  return parseFragment(value || '').map(renderLegacyNode);
}

function frameworkMark(id, mark) {
  if (!mark) return null;
  return h('svg', {
    class: 'vf-framework-mark',
    'data-vf-framework-mark': id,
    viewBox: mark.viewBox,
    'aria-hidden': 'true',
    focusable: 'false',
  }, [h('path', { d: mark.path })]);
}

function richText(value) {
  return parseInline(value || '').map((part) => {
    if (part.kind === 'code') return h('code', null, part.value);
    if (part.kind === 'strong') return h(Text, { as: 'strong', variant: 'label-md' }, { default: () => part.value });
    return part.value;
  });
}

function text(as, variant, value, props = {}) {
  return h(Text, { as, variant, ...props }, { default: () => Array.isArray(value) ? value : richText(value) });
}

function renderExample(block) {
  if (block.type === 'example-unavailable') {
    return h(Surface, {
      as: 'section',
      class: 'vf-example--unavailable',
      'data-vf-example-unavailable': block.id,
    }, { default: () => [
      text('h3', 'heading-sm', block.title),
      text('p', 'body-md', 'This executable example is not available for the selected framework in this documentation channel.'),
    ] });
  }

  const data = JSON.stringify(block.data).replaceAll('<', '\\u003c');
  return h(Surface, {
    as: 'section',
    class: 'vf-example',
    'data-vf-example-id': block.id,
    'data-vf-example-default-framework': block.framework,
    'data-vf-example-locked-framework': block.framework,
  }, { default: () => [
    h('header', { class: 'vf-example__header' }, [
      h('div', null, [
        text('h3', 'heading-sm', block.title),
        block.description ? text('p', 'body-md', block.description) : null,
      ]),
      text('span', 'label-md', block.framework, { class: 'vf-example__framework' }),
    ]),
    h('div', { class: 'vf-example__preview' }, [
      h('iframe', { 'data-vf-example-frame': '', title: `${block.title} preview`, sandbox: 'allow-scripts' }),
    ]),
    h('div', { class: 'vf-example__controls' }, [
      h(Button, { type: 'button', variant: 'ghost', size: 'sm', 'data-vf-example-code-toggle': '', 'aria-expanded': 'false' }, { default: () => 'Show code' }),
    ]),
    h('div', { class: 'vf-example__editor', 'data-vf-example-editor': '', hidden: true }, [
      h('div', { class: 'vf-example__editor-toolbar' }, [
        text('strong', 'label-md', 'Editable source'),
        h('span', { 'data-vf-example-language': '' }),
        h('span', { class: 'vf-example__editor-actions' }, [
          h(Button, { type: 'button', variant: 'primary', size: 'sm', 'data-vf-example-run': '' }, { default: () => 'Run' }),
          h(Button, { type: 'button', variant: 'secondary', size: 'sm', 'data-vf-example-reset': '' }, { default: () => 'Reset' }),
        ]),
      ]),
      h(Textarea, { 'data-vf-example-source': '', spellcheck: false, 'aria-label': `${block.title} code editor` }),
      text('p', 'body-sm', 'Ready.', { class: 'vf-example__status', 'data-vf-example-status': '', 'aria-live': 'polite' }),
    ]),
    h('span', { 'data-vf-example-data': '', hidden: true }, data),
  ] });
}

function renderContentBlock(block, framework) {
  if (block.type === 'paragraph') return text('p', 'body-md', block.text);
  if (block.type === 'heading') return text(`h${Math.min(6, Math.max(3, Number(block.level) || 3))}`, 'heading-sm', block.text);
  if (block.type === 'code') {
    return h('pre', {
      tabindex: 0,
      'data-vf-framework-usage-code': block.frameworkUsage ? framework : undefined,
    }, [h('code', { class: `language-${block.language || 'text'}` }, block.value || '')]);
  }
  if (block.type === 'split') {
    return h('div', { class: 'vf-docs-split' }, (block.items || []).map((item) =>
      h(Surface, { as: 'article', key: item.title, class: `vf-docs-card vf-docs-card--${item.tone || 'neutral'}` }, {
        default: () => [text('h3', 'heading-sm', item.title), text('p', 'body-md', item.text)],
      })
    ));
  }
  if (block.type === 'example' || block.type === 'example-unavailable') return renderExample(block);
  if (block.type === 'list') return h('ul', null, (block.items || []).map((item, index) => h('li', { key: index }, richText(item))));
  if (block.type === 'note') return h(Surface, { as: 'aside', class: 'vf-docs-note' }, { default: () => richText(block.text) });
  if (block.type === 'table') {
    return h(Surface, { as: 'div', class: 'vf-docs-table-wrap', tabindex: 0, role: 'region', 'aria-label': block.label || 'Reference table' }, {
      default: () => h('table', null, [
        h('thead', null, [h('tr', null, (block.columns || []).map((column) => h('th', { key: column }, richText(column))))]),
        h('tbody', null, (block.rows || []).map((row, rowIndex) =>
          h('tr', { key: rowIndex }, row.map((cell, cellIndex) => cellIndex === 0
            ? h('th', { key: cellIndex, scope: 'row' }, richText(cell))
            : h('td', { key: cellIndex }, richText(cell))))
        )),
      ]),
    });
  }
  throw new Error(`Unsupported Vue documentation content block: ${block.type}`);
}

function renderModelContent(content) {
  const context = content.context;
  return [
    text('h1', 'heading-lg', content.pageTitle),
    context ? h('div', { class: 'vf-docs-framework-context', 'data-vf-framework-context': context.framework }, [
      text('strong', 'label-md', [frameworkMark(context.framework, context.mark), h('span', null, context.label)]),
      h('span', null, context.entrypoint ? ['Public entrypoint: ', h('code', null, context.entrypoint)] : 'Framework-specific documentation view'),
    ]) : null,
    text('p', 'body-lg', content.lede, { class: 'vf-docs-lede' }),
    content.meta?.length ? h('div', { class: 'vf-docs-page-meta', 'aria-label': `${content.pageTitle} characteristics` },
      content.meta.map((item) => text('span', 'label-md', item, { key: item }))) : null,
    ...(content.sections || []).map((section) => h('section', {
      key: `${section.adaptation || 'shared'}-${section.title}`,
      'data-vf-framework-adaptation': section.adaptation || undefined,
    }, [
      text('h2', 'heading-md', section.title),
      ...(section.blocks || []).map((block) => renderContentBlock(block, content.framework)),
    ])),
  ];
}

function renderNavItem(item) {
  return h(SideNavItem, { key: item.href }, {
    default: () => h(SideNavLink, { href: item.href, current: item.current }, { default: () => item.title }),
  });
}

function renderNavGroup(group) {
  const body = group.subgroups?.length
    ? group.subgroups.map((subgroup) =>
        h('details', {
          key: subgroup.label,
          class: 'vf-docs-component-subgroup',
          'data-vf-docs-component-subgroup': '',
          'data-vf-current-group': subgroup.open ? 'true' : undefined,
          open: subgroup.open || undefined,
        }, [
          h('summary', { class: 'vf-docs-component-subgroup__label' }, [
            h('span', null, subgroup.label),
            h('span', { class: 'vf-docs-component-subgroup__count', 'aria-hidden': 'true' }, String(subgroup.count)),
          ]),
          h(SideNavList, null, { default: () => subgroup.items.map(renderNavItem) }),
        ])
      )
    : [h(SideNavList, { key: `${group.label}-list` }, { default: () => group.items.map(renderNavItem) })];

  return h(SideNavGroup, { key: group.label }, {
    default: () => [h(SideNavGroupLabel, null, { default: () => group.label }), ...body],
  });
}

function renderFrameworkSwitcher(model) {
  return h('nav', { class: 'vf-docs-framework-switcher', 'aria-label': 'Framework' }, [
    h('ul', { class: 'vf-docs-framework-switcher__list' },
      model.frameworkChoices.map((choice) =>
        h('li', { key: choice.id }, [
          h(Link, {
            href: choice.href,
            class: 'vf-docs-framework-switcher__link',
            'data-vf-framework-choice': choice.id,
            'data-vf-framework-current': choice.current ? 'true' : undefined,
            'aria-current': choice.current ? 'page' : undefined,
            'aria-label': `${choice.label} documentation`,
            title: choice.label,
          }, { default: () => frameworkMark(choice.id, choice.mark) }),
        ])
      )
    ),
  ]);
}

function renderHeader(model) {
  return h('div', { class: 'vf-docs-header__inner' }, [
    h(Link, { class: 'vf-docs-brand', href: model.brandHref }, { default: () => 'VyrnForge' }),
    text('span', 'label-md', model.versionText, { class: 'vf-docs-version', 'data-vf-docs-version': '' }),
    h('div', { class: 'vf-docs-tools' }, [
      h('div', { class: 'vf-docs-search-wrap' }, [
        text('label', 'label-md', 'Search', { for: 'vf-docs-search' }),
        h(Input, { id: 'vf-docs-search', 'data-vf-docs-search': '', type: 'search', autocomplete: 'off' }),
        h('ul', { class: 'vf-docs-search-results', 'data-vf-docs-search-results': '', hidden: true }),
      ]),
      renderFrameworkSwitcher(model),
    ]),
  ]);
}

const model = readDocsPageModel();
const app = createApp({
  render() {
    return h(AppShell, { 'data-vf-docs-renderer': 'vue' }, {
      default: () => [
        h(Link, { class: 'vf-skip-link', href: '#main' }, { default: () => 'Skip to content' }),
        h(AppShellHeader, { class: 'vf-docs-header' }, { default: () => renderHeader(model) }),
        h(AppShellBody, null, {
          default: () => [
            h(AppShellNavigation, { class: 'vf-docs-navigation' }, {
              default: () => h(SideNav, { 'aria-label': 'Documentation' }, { default: () => model.navigation.map(renderNavGroup) }),
            }),
            h(AppShellMain, { id: 'main' }, { default: () => model.mainContent ? renderModelContent(model.mainContent) : renderLegacyFragment(model.mainHtml) }),
          ],
        }),
        h(AppShellFooter, { class: 'vf-docs-footer' }, { default: () => text('span', 'body-sm', model.footerText || '') }),
      ],
    });
  },
});

app.mount('#vf-docs-app');
markDocsRendered('vue');
