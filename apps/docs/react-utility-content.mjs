import { createElement as h } from 'react';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

/** Shared Markdown-section renderer for authored utility guidance, not a component runtime. */
export function UtilitySections({ guide, prefix }) {
  return guide.sections.map((section) => {
    const id = prefix + section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return h(Flow, { as: 'section', gap: 'sm', key: section.heading, 'aria-labelledby': id },
      h(Text, { as: 'h2', variant: 'heading-md', id }, section.heading),
      ...section.blocks.map((block, index) => {
        if (block.type === 'list') return h(Flow, { as: 'ul', gap: 'xs', key: index },
          ...block.items.map((item, i) => h('li', { key: i }, item)));
        if (block.type === 'code') return h('pre', { key: index, tabIndex: 0, 'data-vf-code-block': '' },
          h('code', null, block.text));
        return h(Text, { as: 'p', key: index }, block.text);
      }));
  });
}
