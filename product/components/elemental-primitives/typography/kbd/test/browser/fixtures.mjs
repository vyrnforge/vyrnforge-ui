export const browserFixture = {
  component: 'kbd',
  title: 'Kbd fixture',
  heading: 'Kbd contract fixture',
  ports: {
    web: { body: '<p>Press <kbd id="kbd" data-vf-kbd>Enter</kbd> to continue.</p>' },
    react: { story: 'kbdReactStory' },
  },
};

export async function kbdReactStory() {
  const { createElement: h } = await import('react');
  const { Kbd } = await import('@vyrnforge/react/kbd');
  return h('p', null, 'Press ', h(Kbd, { id: 'kbd', title: 'Enter key' }, 'Enter'), ' to continue.');
}
