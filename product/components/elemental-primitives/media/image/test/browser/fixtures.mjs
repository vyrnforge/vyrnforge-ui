export const browserFixture = {
  component: "image",
  title: "Image fixture",
  heading: "Image contract fixture",
  ports: {
    web: {
      body: [
        `<img id="image" data-vf-image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%238b96aa'/%3E%3C/svg%3E" alt="Sample placeholder" width="16" height="16" loading="lazy" decoding="async" fetchpriority="low" referrerpolicy="no-referrer" sizes="16px">`,
        `<div style="inline-size: 120px"><img id="responsive-image" data-vf-image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='320' viewBox='0 0 640 320'%3E%3Crect width='640' height='320' fill='%23c4d6e8'/%3E%3C/svg%3E" alt="Pale blue rectangle" width="640" height="320"></div>`,
        `<img id="decorative-image" data-vf-image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20'%3E%3Crect width='40' height='20' fill='%23dce5e8'/%3E%3C/svg%3E" alt="" width="40" height="20">`,
        `<figure id="captioned-figure"><img data-vf-image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20'%3E%3Ccircle cx='20' cy='10' r='9' fill='%235e8cad'/%3E%3C/svg%3E" alt="Blue circle on a light background" width="40" height="20"><figcaption>Simple geometric study</figcaption></figure>`,
      ].join("\n"),
    },
    react: { story: 'imageReactStory' },
  },
};

export async function imageReactStory({ client = false } = {}) {
  const { createElement: h } = await import('react');
  const { Image } = await import('@vyrnforge/react/image');
  const sample = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%238b96aa'/%3E%3C/svg%3E";
  const wide = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='320' viewBox='0 0 640 320'%3E%3Crect width='640' height='320' fill='%23c4d6e8'/%3E%3C/svg%3E";
  const ornament = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20'%3E%3Crect width='40' height='20' fill='%23dce5e8'/%3E%3C/svg%3E";
  const circle = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20'%3E%3Ccircle cx='20' cy='10' r='9' fill='%235e8cad'/%3E%3C/svg%3E";

  return h('div', null,
    h(Image, {
      id: 'image', src: sample, alt: 'Sample placeholder', width: 16, height: 16,
      loading: 'lazy', decoding: 'async', fetchPriority: 'low',
      referrerPolicy: 'no-referrer', sizes: '16px',
      ref: client ? (node) => { if (node) document.body.dataset.imageRefAttached = String(node instanceof HTMLImageElement); } : undefined,
    }),
    h('div', { style: { inlineSize: '120px' } },
      h(Image, {
        id: 'responsive-image', src: wide, alt: 'Pale blue rectangle',
        width: 640, height: 320,
      })),
    h(Image, {
      id: 'decorative-image', src: ornament, alt: '', width: 40, height: 20,
    }),
    h('figure', { id: 'captioned-figure' },
      h(Image, {
        src: circle, alt: 'Blue circle on a light background', width: 40, height: 20,
      }),
      h('figcaption', null, 'Simple geometric study')),
  );
}
