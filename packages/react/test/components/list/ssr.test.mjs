import { test, expect } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { List, ListItem } from '@vyrnforge/react/list';
import { List as RootList, ListItem as RootListItem } from '@vyrnforge/react';

test('List renders a native unordered list and native list items', () => {
  const markup = renderToStaticMarkup(h(List, {
    'aria-label': 'Team', variant: 'divided', id: 'staff', className: 'staff-list',
  }, h(ListItem, { leading: h('span', null, 'AC'),
    trailing: h('button', { type: 'button', 'aria-label': 'View Alex' }, 'View') },
    h('strong', null, 'Alex Chen'))));
  expect(markup).toMatch(/^<ul\b/);
  expect(markup).toContain('role="list"');
  expect(markup).toContain('aria-label="Team"');
  expect(markup).toContain('data-vf-list-variant="divided"');
  expect(markup).toContain('id="staff"');
  expect(markup).toContain('class="staff-list"');
  expect(markup).toContain('<li');
  expect(markup).toContain('data-vf-list-item-leading');
  expect(markup).toContain('data-vf-list-item-content');
  expect(markup).toContain('data-vf-list-item-trailing');
  expect(markup).toContain('aria-label="View Alex"');
  expect(markup).not.toMatch(/role="(listbox|option|menu|menuitem)"/);
  expect(markup).not.toMatch(/aria-selected|aria-activedescendant|tabindex=/i);
});

test('ordered List keeps semantic ol and native start', () => {
  const markup = renderToStaticMarkup(h(RootList, {
    as: 'ol', start: 4, marker: 'auto', size: 'sm', spacing: 'lg',
  }, h(RootListItem, { value: 6 }, 'Step A'), h(RootListItem, null, 'Step B')));
  expect(markup).toMatch(/^<ol\b/);
  expect(markup).toContain('start="4"');
  expect(markup).toContain('value="6"');
  expect(markup).toContain('data-vf-list-marker="auto"');
  expect(markup).toContain('data-vf-list-spacing="lg"');
  expect((markup.match(/<li\b/g) ?? [])).toHaveLength(2);
});

test('structural rows do not turn into disabled, selected or focus-managed widgets', () => {
  const markup = renderToStaticMarkup(h(List, {
    variant: 'bordered',
  }, h(ListItem, {
    trailing: h('button', { disabled: true, type: 'button' }, 'Unavailable'),
  }, 'Archived report')));
  expect(markup).toContain('data-vf-list-variant="bordered"');
  expect(markup).toMatch(/<button disabled="" type="button">Unavailable<\/button>/);
  expect(markup).not.toMatch(/aria-busy=|aria-disabled=|aria-selected=|tabindex=/i);
});

test('SSR rendering is deterministic with custom native attrs and no generated IDs', () => {
  const element = h(List, { as: 'ul', dir: 'rtl', title: 'Items' },
    h(ListItem, { 'data-row-id': '1' }, 'عنصر'));
  const first = renderToStaticMarkup(element);
  const second = renderToStaticMarkup(element);
  expect(first).toBe(second);
  expect(first).toContain('dir="rtl"');
  expect(first).toContain('data-row-id="1"');
  expect(first).not.toMatch(/id=":|data-reactroot|useId/);
});
