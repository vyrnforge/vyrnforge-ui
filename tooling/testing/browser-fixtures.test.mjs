import { afterEach, describe, expect, test } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareBrowserFixture } from './browser-fixtures.mjs';

const roots = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixtureRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'vyrnforge-browser-fixture-'));
  roots.push(root);
  await mkdir(path.join(root, 'packages/web/dist/components/example'), { recursive: true });
  await mkdir(path.join(root, 'packages/web/dist/styles'), { recursive: true });
  await writeFile(path.join(root, 'packages/web/dist/styles/tokens.css'), ':root{--vf-test:1;}');
  await writeFile(
    path.join(root, 'packages/web/dist/components/example/example.css'),
    '@import "../../styles/tokens.css";\n[data-example]{display:block;}',
  );
  return root;
}

describe('browser fixture infrastructure', () => {
  test('writes owner-provided Web semantics through the shared page and style infrastructure', async () => {
    const root = await fixtureRoot();
    const fixtureModule = {
      browserFixture: {
        component: 'example',
        title: 'Example fixture',
        heading: 'Example browser fixture',
        ports: {
          web: {
            body: '<button data-example>Example</button>',
            script: "document.body.dataset.ready='true';",
          },
        },
      },
    };

    await expect(prepareBrowserFixture({
      root,
      fixturePath: path.join(root, 'product/example/test/browser/fixtures.mjs'),
      fixtureModule,
      port: 'web',
    })).resolves.toBe(true);

    const html = await readFile(path.join(root, 'dist/browser-fixtures/components/example/web.html'), 'utf8');
    const css = await readFile(path.join(root, 'dist/browser-fixtures/components/example/example.css'), 'utf8');
    expect(html).toContain('<h1>Example browser fixture</h1>');
    expect(html).toContain('<button data-example>Example</button>');
    expect(html).toContain("<script>document.body.dataset.ready='true';</script>");
    expect(css).toContain(':root{--vf-test:1;}');
    expect(css).toContain('[data-example]{display:block;}');
    expect(css).not.toContain('@import "../../styles/tokens.css";');
  });

  test('reports an unsupported port without creating framework-specific output', async () => {
    const root = await fixtureRoot();
    const fixtureModule = {
      browserFixture: {
        component: 'example',
        title: 'Example fixture',
        heading: 'Example browser fixture',
        ports: { web: { body: '<p>Web only</p>' } },
      },
    };

    await expect(prepareBrowserFixture({
      root,
      fixturePath: path.join(root, 'product/example/test/browser/fixtures.mjs'),
      fixtureModule,
      port: 'react',
    })).resolves.toBe(false);
  });
});
