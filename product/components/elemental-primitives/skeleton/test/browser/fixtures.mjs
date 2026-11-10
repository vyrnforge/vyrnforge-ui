export const browserFixture = {
  component: "skeleton",
  title: "Skeleton fixture",
  heading: "Skeleton contract fixture",
  ports: {
    web: {
      body: `
        <section id="region" aria-label="Latest activity" aria-busy="true">
          <div id="block" data-vf-skeleton aria-hidden="true" style="inline-size: 12rem; block-size: 3rem"></div>
          <div id="line" data-vf-skeleton data-vf-skeleton-shape="line" aria-hidden="true" style="inline-size: 9rem"></div>
          <div id="circle" data-vf-skeleton data-vf-skeleton-shape="circle" aria-hidden="true" style="inline-size: 2.5rem"></div>
        </section>
        <p id="status" role="status">Loading latest activity</p>
      `,
    },
  },
};
