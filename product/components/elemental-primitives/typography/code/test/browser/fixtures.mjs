export const browserFixture = {
  component: "code",
  title: "Code fixture",
  heading: "Code contract fixture",
  ports: {
    web: {
      body: "<p>Run <code id=\"inline\" data-vf-code>pnpm test</code>.</p><pre id=\"block\" data-vf-code-block><code>pnpm exec vitest run</code></pre>",
    },
  },
};
