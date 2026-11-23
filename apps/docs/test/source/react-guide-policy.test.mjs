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
      { heading: 'Accessibility', blocks: [] },
    ] };
    expect(reactConsumerSections(guide).map(({ heading }) => heading))
      .toEqual(['Reusable entrance effects', 'Accessibility']);
  });
});
