import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { prepareBrowserFixture } from '../../../../../../../tooling/testing/browser-fixtures.mjs';
import * as stories from './stories.mjs';

export const browserFixture = {
  ...stories.browserFixture,
  prepare: async ({ root, fixturePath, port }) => {
    await prepareBrowserFixture({
      root,
      fixturePath: path.join(path.dirname(fixturePath), 'stories.mjs'),
      port,
      component: 'alert-dialog',
      fixtureModule: stories,
    });
    if (port === 'react') {
      const dir = path.join(root, 'dist/browser-fixtures/components/alert-dialog');
      const entry = path.join(
        root,
        'product/components/composite-widgets/transient-surfaces/alert-dialog/examples/destructive-commit/react.tsx',
      );
      await build({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outdir: dir,
        entryNames: 'destructive-react',
      });
      await writeFile(
        path.join(dir, 'destructive-react.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Alert dialog destructive workflow fixture</title><link rel="stylesheet" href="./destructive-react.css"></head><body><div id="root"></div><script type="module" src="./destructive-react.js"></script></body></html>',
      );
    }
  },
};
