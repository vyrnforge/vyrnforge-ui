import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { usePresence } from '@vyrnforge/react/presence';
function Fixture() { const presence = usePresence(true); return presence.mounted ? createElement('div', { 'data-state': presence.state }, 'Content') : null; }
test('React Presence is server-safe and renders entered content', () => { const html = renderToStaticMarkup(createElement(Fixture)); assert.match(html, /data-state="entered"/); });
