export const browserFixture = {
  component: 'skeleton',
  title: 'Skeleton fixture',
  heading: 'Skeleton browser fixture',
  ports: {
    web: {
      body: `<div id="line" data-vf-skeleton data-vf-skeleton-shape="line" aria-hidden="true"></div>
        <div id="block" data-vf-skeleton data-vf-skeleton-shape="block" aria-hidden="true"></div>
        <div id="circle" data-vf-skeleton data-vf-skeleton-shape="circle" aria-hidden="true"></div>`,
    },
  },
};
