export const browserFixture = {
  component: 'progress',
  title: 'Progress fixture',
  heading: 'Progress browser fixture',
  ports: {
    web: {
      body: `<progress id="known" data-vf-progress aria-label="Upload" value="48" max="100"></progress>
        <progress id="unknown" data-vf-progress aria-label="Preparing"></progress>`,
    },
  },
};
