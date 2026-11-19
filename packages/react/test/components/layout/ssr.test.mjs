import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Flow as RootFlow, AutoGrid as RootAutoGrid } from '@vyrnforge/react';

test('public React layout entrypoints expose the same two components', () => {
  assert.equal(Flow, RootFlow);
  assert.equal(AutoGrid, RootAutoGrid);
});

test('Flow maps straightforward props to canonical Web CSS hooks on the requested semantic host', () => {
  const html = renderToStaticMarkup(h(Flow, {
    as: 'nav', direction: 'inline', wrap: 'wrap', gap: 'sm', align: 'center',
    justify: 'space-between', id: 'actions', className: 'consumer-actions',
    dir: 'rtl', 'aria-label': 'Actions',
  }, h('button', { type: 'button' }, 'Save'), h('button', { type: 'button' }, 'Cancel')));
  assert.match(html, /^<nav /);
  assert.match(html, /data-vf-flow=""/);
  assert.match(html, /data-vf-flow-direction="inline"/);
  assert.match(html, /data-vf-flow-wrap="wrap"/);
  assert.match(html, /data-vf-flow-gap="sm"/);
  assert.match(html, /data-vf-flow-align="center"/);
  assert.match(html, /data-vf-flow-justify="space-between"/);
  assert.match(html, /dir="rtl"/);
  assert.match(html, /aria-label="Actions"/);
  assert.match(html, /class="consumer-actions"/);
  assert.doesNotMatch(html, / role="group"/);
  assert.doesNotMatch(html, /\sgap="|\swrap="|\salign="|\sjustify="/);
  assert.ok(html.indexOf('Save') < html.indexOf('Cancel'), 'DOM and focus order is unchanged');
});

test('Flow defaults to a semantic div with block direction but does not manufacture state', () => {
  const html = renderToStaticMarkup(h(Flow, { id: 'vertical' },
    h('label', { htmlFor: 'email' }, 'Email'), h('input', { id: 'email' })));
  assert.match(html, /^<div /);
  assert.match(html, /data-vf-flow-direction="block"/);
  assert.doesNotMatch(html, /aria-|role=|tabindex=/);
  assert.ok(html.indexOf('Email') < html.indexOf('id="email"'));
});

test('AutoGrid exposes native list semantics, gap, and a consumer-selectable minimum track size', () => {
  const html = renderToStaticMarkup(h(AutoGrid, {
    as: 'ul', gap: 'lg', minItemSize: '12rem', style: { margin: 0, color: 'red' },
    className: 'settings-list', 'aria-label': 'Settings',
  }, h('li', null, 'Settings'), h('li', null, 'Notifications')));
  assert.match(html, /^<ul /);
  assert.match(html, /data-vf-auto-grid=""/);
  assert.match(html, /data-vf-auto-grid-gap="lg"/);
  assert.match(html, /--vf-auto-grid-min-item-size:12rem/);
  assert.match(html, /margin:0/);
  assert.match(html, /color:red/);
  assert.match(html, /aria-label="Settings"/);
  assert.doesNotMatch(html, /\sminItemSize=|\sgap=/);
  assert.ok(html.indexOf('Settings') < html.indexOf('Notifications'));
});

test('AutoGrid without minItemSize does not impose inline geometry or extra DOM', () => {
  const html = renderToStaticMarkup(h(AutoGrid, { as: 'section', 'aria-label': 'Cards' },
    h('article', null, 'One')));
  assert.match(html, /^<section /);
  assert.doesNotMatch(html, /style=|--vf-auto-grid-min-item-size/);
  assert.match(html, /data-vf-auto-grid=""/);
});
