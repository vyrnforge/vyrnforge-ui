export const browserFixture = {
  component: 'code',
  title: 'Code fixture',
  heading: 'Code contract fixture',
  ports: {
    web: {
      body: '<p>Run <code id="inline" data-vf-code>pnpm test</code>.</p><pre id="block" data-vf-code-block><code>pnpm exec vitest run</code></pre>',
    },
    react: { story: 'codeReactStory' },
  },
};

export async function codeReactStory() {
  const { createElement: h } = await import('react');
  const { Code, CodeBlock } = await import('@vyrnforge/react/code');
  return h('div', null,
    h('p', null, 'Run ', h(Code, { id: 'inline', title: 'Run tests' }, 'pnpm test'), '.'),
    h(CodeBlock, { id: 'block', 'aria-label': 'Run Vitest' }, 'pnpm exec vitest run'),
  );
}
