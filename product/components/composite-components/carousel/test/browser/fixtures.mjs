import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'carousel',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/carousel');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/carousel.css";',
        resolveDir: root,
        sourcefile: 'carousel-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Carousel browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Carousel browser fixture</h1><section id="root" data-vf-carousel-root role="region" aria-roledescription="carousel" aria-label="Featured items"><button id="prev" data-vf-carousel-previous type="button" aria-label="Previous slide" disabled>Previous</button><div data-vf-carousel-viewport><div data-vf-carousel-slide role="group" aria-roledescription="slide">First slide</div><div data-vf-carousel-slide role="group" aria-roledescription="slide" hidden>Second slide</div></div><button id="next" data-vf-carousel-next type="button" aria-label="Next slide">Next</button></section><script>const s=[...document.querySelectorAll('[data-vf-carousel-slide]')];let i=0;function y(){s.forEach((x,n)=>x.hidden=n!==i);prev.disabled=i===0;next.disabled=i===s.length-1}prev.onclick=()=>{i=Math.max(0,i-1);y()};next.onclick=()=>{i=Math.min(s.length-1,i+1);y()};y()</script></main></body></html>`);
  },
};
