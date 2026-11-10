import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const stripImports = (css) => css
  .replace('@import "./tokens.css";\n', '')
  .replace('@import "../../styles/tokens.css";\n', '')
  .replace('@import "../../styles/loading-motion.css";\n', '');

export const browserFixture = {
  component: 'skeleton',
  prepare: async ({ port }) => {
    if (port !== 'web') return;

    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/skeleton');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const loadingMotionCss = stripImports(await readFile(path.join(root, 'packages/web/dist/styles/loading-motion.css'), 'utf8'));
    const skeletonCss = stripImports(await readFile(path.join(root, 'packages/web/dist/components/skeleton/skeleton.css'), 'utf8'));
    const layoutCss = stripImports(await readFile(path.join(root, 'packages/web/dist/components/layout/layout.css'), 'utf8'));
    const surfaceCss = stripImports(await readFile(path.join(root, 'packages/web/dist/components/surface/surface.css'), 'utf8'));
    const fixtureCss = `
      body { margin: 0; padding: 24px; background: var(--vf-color-surface); color: var(--vf-color-text); }
      #region { --vf-grid-min-item-size: 16rem; max-inline-size: 42rem; }
      #card { padding: var(--vf-space-md); }
      #circle, #circle-uncomposed { inline-size: 2.5rem; }
      #line-a { inline-size: 70%; }
      #line-b { inline-size: 45%; }
      #copy { flex: 1 1 auto; }
    `;

    await writeFile(
      path.join(outDir, 'skeleton.css'),
      `${tokensCss}\n${loadingMotionCss}\n${layoutCss}\n${surfaceCss}\n${skeletonCss}\n${fixtureCss}`,
    );

    const body = `
      <section id="region" aria-label="Latest activity" aria-busy="true" data-vf-grid data-vf-grid-gap="md">
        <article id="card" data-vf-surface>
          <div id="stack" data-vf-stack data-vf-stack-gap="sm">
            <div id="media" data-vf-skeleton data-vf-aspect-ratio data-vf-aspect-ratio-value="video" aria-hidden="true"></div>
            <div id="row" data-vf-inline data-vf-inline-gap="sm">
              <div id="circle" data-vf-skeleton data-vf-skeleton-shape="circle" data-vf-aspect-ratio data-vf-aspect-ratio-value="square" aria-hidden="true"></div>
              <div id="copy" data-vf-stack data-vf-stack-gap="xs">
                <div id="line-a" data-vf-skeleton data-vf-skeleton-shape="line" aria-hidden="true"></div>
                <div id="line-b" data-vf-skeleton data-vf-skeleton-shape="line" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </article>
      </section>
      <div id="circle-uncomposed" data-vf-skeleton data-vf-skeleton-shape="circle" aria-hidden="true"></div>
      <p id="status" role="status">Loading latest activity</p>
    `;

    await writeFile(
      path.join(outDir, 'web.html'),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./skeleton.css"><title>Skeleton fixture</title></head><body><main><h1>Skeleton fixture</h1>${body}</main></body></html>`,
    );
  },
};
