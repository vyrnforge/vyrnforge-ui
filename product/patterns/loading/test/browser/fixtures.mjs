import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const stripImports = (css) => css
  .replace('@import "../../styles/tokens.css";\n', '')
  .replace('@import "../../styles/loading-motion.css";\n', '')
  .replace('@import "./tokens.css";\n', '');

export const browserFixture = {
  component: 'loading',
  prepare: async ({ port }) => {
    if (port !== 'web') return;

    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/loading');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const motionCss = stripImports(await readFile(path.join(root, 'packages/web/dist/styles/loading-motion.css'), 'utf8'));
    const loadingCss = stripImports(await readFile(path.join(root, 'packages/web/dist/components/loading/loading.css'), 'utf8'));
    const layoutCss = stripImports(await readFile(path.join(root, 'packages/web/dist/components/layout/layout.css'), 'utf8'));
    const fixtureCss = `
      body { margin: 0; padding: 24px; background: var(--vf-color-surface); color: var(--vf-color-text); }
      #examples { max-inline-size: 44rem; }
      #placeholder-card { background: var(--vf-color-surface); border: 1px solid var(--vf-color-border-required); border-radius: var(--vf-radius-surface); color: var(--vf-color-text); padding: var(--vf-space-md); }
      #avatar { inline-size: 2.5rem; }
      #line-a { inline-size: 70%; }
      #line-b { inline-size: 45%; }
      #placeholder-copy { flex: 1 1 auto; }
    `;

    await writeFile(
      path.join(outDir, 'loading.css'),
      `${tokensCss}\n${motionCss}\n${layoutCss}\n${loadingCss}\n${fixtureCss}`,
    );

    const body = `
      <section id="examples" data-vf-stack data-vf-stack-gap="lg" aria-labelledby="heading">
        <h1 id="heading">Loading fixture</h1>

        <div id="indicator-row" data-vf-inline data-vf-inline-gap="md">
          <span
            id="scope-sm"
            data-vf-loading
            data-vf-loading-size="sm"
            style="
              --vf-loading-spinner-color: rgb(120 40 200);
              --vf-loading-spinner-track-color: rgb(230 220 240);
              --vf-loading-indicator-thickness: 0.2em;
              --vf-loading-spinner-duration: 1.1s;
            "
          >
            <span id="spinner" data-vf-loading-indicator data-vf-loading-variant="spinner" aria-hidden="true"></span>
          </span>

          <span
            data-vf-loading
            style="
              --vf-loading-dots-color: rgb(20 120 160);
              --vf-loading-indicator-size: 2rem;
              --vf-loading-dots-duration: 1.2s;
            "
          >
            <span id="dots" data-vf-loading-indicator data-vf-loading-variant="dots" aria-hidden="true"></span>
          </span>

          <span data-vf-loading style="--vf-loading-bars-color: rgb(25 90 60); --vf-loading-bars-duration: 1.3s">
            <span id="bars" data-vf-loading-indicator data-vf-loading-variant="bars" aria-hidden="true"></span>
          </span>

          <span data-vf-loading data-vf-loading-size="lg" style="--vf-loading-pulse-color: rgb(180 80 20)">
            <span id="pulse" data-vf-loading-indicator data-vf-loading-variant="pulse" aria-hidden="true"></span>
          </span>
        </div>

        <section id="busy-region" aria-label="Account summary" aria-busy="true">
          <article
            id="placeholder-card"
            data-vf-loading
            style="
              --vf-loading-placeholder-color: rgb(225 235 255);
              --vf-loading-placeholder-highlight: rgb(190 210 250);
              --vf-loading-placeholder-radius: 0.75rem;
              --vf-loading-placeholder-duration: 1.8s;
            "
          >
            <div data-vf-stack data-vf-stack-gap="sm">
              <div id="media" data-vf-loading-placeholder data-vf-aspect-ratio data-vf-aspect-ratio-value="video" aria-hidden="true"></div>
              <div data-vf-inline data-vf-inline-gap="sm">
                <div id="avatar" data-vf-loading-placeholder data-vf-loading-placeholder-shape="circle" data-vf-aspect-ratio data-vf-aspect-ratio-value="square" aria-hidden="true"></div>
                <div id="placeholder-copy" data-vf-stack data-vf-stack-gap="xs">
                  <div id="line-a" data-vf-loading-placeholder data-vf-loading-placeholder-shape="line" aria-hidden="true"></div>
                  <div id="line-b" data-vf-loading-placeholder data-vf-loading-placeholder-shape="line" aria-hidden="true"></div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <div>
          <label for="determinate">Importing records</label>
          <progress
            id="determinate"
            data-vf-loading-progress
            max="100"
            value="48"
            style="
              --vf-loading-progress-color: rgb(35 105 225);
              --vf-loading-progress-track-color: rgb(225 235 255);
              --vf-loading-progress-size: 1rem;
              --vf-loading-progress-radius: 0.75rem;
            "
          >48%</progress>
        </div>

        <div>
          <label for="indeterminate">Preparing import</label>
          <progress id="indeterminate" data-vf-loading-progress max="100">Preparing</progress>
        </div>

        <div
          id="custom"
          data-vf-loading
          data-vf-loading-custom
          aria-hidden="true"
          style="--vf-loading-custom-color: rgb(90 70 210)"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" role="presentation">
            <path d="M24 5 40 14v20L24 43 8 34V14Z" fill="none" stroke="currentColor" stroke-width="3"/>
            <circle cx="24" cy="24" r="4" fill="currentColor"/>
          </svg>
        </div>

        <p id="status" role="status">Loading account summary</p>
      </section>
    `;

    await writeFile(
      path.join(outDir, 'web.html'),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./loading.css"><title>Loading fixture</title></head><body><main>${body}</main></body></html>`,
    );
  },
};
