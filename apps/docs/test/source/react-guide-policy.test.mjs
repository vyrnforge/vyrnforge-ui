import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { reactConsumerBlocks, reactConsumerSections } from '../../react-content-policy.mjs';

describe('React framework-locked consumer guidance', () => {
  it('keeps shared semantics and styling while excluding Native Web HTML examples', () => {
    const blocks = [
      { type: 'paragraph', text: 'Behavior remains shared.' },
      { type: 'code', language: 'html', text: '<div data-vf-motion="fade">Native</div>' },
      { type: 'code', language: 'tsx', text: '<Motion effect="fade">React</Motion>' },
      { type: 'code', language: 'css', text: '.custom { --vf-motion-duration-enter: 420ms; }' },
    ];
    expect(reactConsumerBlocks(blocks)).toEqual([blocks[0], blocks[2], blocks[3]]);
  });

  it('keeps shared sections but removes explicitly Native Web usage sections', () => {
    const guide = { sections: [
      { heading: 'Reusable entrance effects', blocks: [] },
      { heading: 'Native Web usage', blocks: [] },
      { heading: 'Native Web customization', blocks: [] },
      { heading: 'Accessibility', blocks: [] },
    ] };
    expect(reactConsumerSections(guide).map(({ heading }) => heading))
      .toEqual(['Reusable entrance effects', 'Accessibility']);
  });
});

it('authored React examples use typed public tokens instead of literal Web variable names', () => {
  const root = fileURLToPath(new URL('../../../../product/', import.meta.url));
  const files = readdirSync(root, { recursive: true }).filter(name => /(?:^|[\\/])examples[\\/].*[\\/]react\.tsx$/.test(name));
  expect(files.length).toBeGreaterThan(100);
  const violations = files.filter(name => /--vf-[a-z0-9-]+/.test(readFileSync(path.join(root, name), 'utf8')));
  expect(violations).toEqual([]);
});

it('React-specific component and pattern guides use named tokens instead of literal Web variable names', () => {
  const root = fileURLToPath(new URL('../../../../product/', import.meta.url));
  const files = readdirSync(root, { recursive: true }).filter(name => /(?:^|[\\/])react[\\/]docs[\\/].*\.md$/.test(name));
  expect(files.length).toBeGreaterThan(20);
  const violations = files.filter(name => /--vf-[a-z0-9-]+/.test(readFileSync(path.join(root, name), 'utf8')));
  expect(violations).toEqual([]);
});
