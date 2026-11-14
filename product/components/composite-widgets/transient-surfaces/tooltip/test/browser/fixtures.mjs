import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'tooltip',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/tooltip');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/tooltip.css";',
        resolveDir: root,
        sourcefile: 'tooltip-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    if (port === 'elements') {
      await build({
        stdin: {
          contents: "import { defineTooltipElement } from '@vyrnforge/elements/tooltip'; defineTooltipElement();",
          resolveDir: root,
          sourcefile: 'tooltip-elements.js',
          loader: 'js',
        },
        bundle: true,
        format: 'esm',
        outfile: path.join(dir, 'elements.js'),
      });
      await writeFile(
        path.join(dir, 'elements.html'),
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tooltip browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Tooltip browser fixture</h1><p id="additional">Additional context</p><vf-tooltip id="first" open-delay="0" close-delay="100" placement="bottom"><button id="t" data-vf-tooltip-trigger aria-describedby="additional tip">Info</button><div id="tip" role="tooltip" data-vf-tooltip-content hidden>More information</div></vf-tooltip><vf-tooltip id="second" open-delay="0"><button data-vf-tooltip-trigger>Second</button><div data-vf-tooltip-content hidden>Second description</div></vf-tooltip><button id="outside">Outside</button></main><script type="module" src="./elements.js"></script></body></html>`,
      );
      return;
    }
    await writeFile(
      path.join(dir, `${port}.html`),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tooltip browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Tooltip browser fixture</h1><button id="t" aria-describedby="tip">Info</button><div id="tip" role="tooltip" data-vf-tooltip-content>More information</div></main></body></html>',
    );
  },
};
