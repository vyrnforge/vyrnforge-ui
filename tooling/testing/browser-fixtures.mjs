import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const TOKEN_IMPORT = '@import "../../styles/tokens.css";';

function moduleSpecifier(root, fixturePath) {
  const relative = path.relative(root, fixturePath).replaceAll(path.sep, '/');
  return `./${relative}`;
}

function page({ title, heading, stylesheet, body, script = '' }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${stylesheet}"><title>${title}</title></head><body><main><h1>${heading}</h1>${body}</main>${script}</body></html>`;
}

async function bundleClient({ root, outDir, component, port, contents }) {
  await build({
    stdin: {
      resolveDir: root,
      sourcefile: `${port}-${component}-fixture-client.mjs`,
      contents,
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: path.join(outDir, `${port}.js`),
  });
}

function storyExport(module, exportName, fixturePath, port) {
  const story = module[exportName];
  if (typeof story !== 'function') {
    throw new Error(`${fixturePath} must export function ${exportName}() for the ${port} browser fixture.`);
  }
  return story;
}

async function prepareStyles({ root, outDir, component }) {
  const componentCss = await readFile(
    path.join(root, `packages/web/dist/components/${component}/${component}.css`),
    'utf8',
  );
  const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
  const stylesheet = `${component}.css`;
  await writeFile(path.join(outDir, stylesheet), `${tokenCss}\n${componentCss.replace(TOKEN_IMPORT, '')}`);
  return stylesheet;
}

async function prepareWeb({ outDir, definition, stylesheet, config }) {
  await writeFile(
    path.join(outDir, 'web.html'),
    page({
      title: definition.title,
      heading: definition.heading,
      stylesheet,
      body: config.body,
      script: config.script ? `<script>${config.script}</script>` : '',
    }),
  );
}

async function prepareReact({ root, outDir, definition, stylesheet, config, fixtureModule, fixturePath }) {
  const createStory = storyExport(fixtureModule, config.story, fixturePath, 'react');
  const { renderToString } = await import('react-dom/server');
  const markup = renderToString(await createStory({ client: false }));
  const rootId = config.rootId ?? 'react-root';
  await writeFile(
    path.join(outDir, 'react.html'),
    page({
      title: definition.title,
      heading: definition.heading,
      stylesheet,
      body: `<div id="${rootId}">${markup}</div>`,
      script: '<script type="module" src="./react.js"></script>',
    }),
  );
  const specifier = moduleSpecifier(root, fixturePath);
  await bundleClient({
    root,
    outDir,
    component: definition.component,
    port: 'react',
    contents: `import {hydrateRoot} from 'react-dom/client';import {${config.story} as createStory} from ${JSON.stringify(specifier)};(async()=>{hydrateRoot(document.querySelector(${JSON.stringify(`#${rootId}`)}),await createStory({client:true}));})();`,
  });
}

async function prepareVue({ root, outDir, definition, stylesheet, config, fixtureModule, fixturePath }) {
  const createStory = storyExport(fixtureModule, config.story, fixturePath, 'vue');
  const { renderToString } = await import('@vue/server-renderer');
  const markup = await renderToString(await createStory({ client: false }));
  const rootId = config.rootId ?? 'vue-root';
  await writeFile(
    path.join(outDir, 'vue.html'),
    page({
      title: definition.title,
      heading: definition.heading,
      stylesheet,
      body: `<div id="${rootId}">${markup}</div>`,
      script: '<script type="module" src="./vue.js"></script>',
    }),
  );
  const specifier = moduleSpecifier(root, fixturePath);
  await bundleClient({
    root,
    outDir,
    component: definition.component,
    port: 'vue',
    contents: `import {${config.story} as createStory} from ${JSON.stringify(specifier)};(async()=>{const app=await createStory({client:true});app.mount(${JSON.stringify(`#${rootId}`)});})();`,
  });
}

function angularDocument({ selector, stylesheet }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${stylesheet}"></head><body><${selector}></${selector}></body></html>`;
}

async function prepareAngular({ root, outDir, definition, stylesheet, config, fixtureModule, fixturePath }) {
  await import('@angular/compiler');
  const { provideZonelessChangeDetection } = await import('@angular/core');
  const {
    bootstrapApplication,
    provideClientHydration,
    withNoIncrementalHydration,
  } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const createStory = storyExport(fixtureModule, config.story, fixturePath, 'angular');
  const RootComponent = await createStory({ client: false });
  const providers = [
    provideZonelessChangeDetection(),
    provideClientHydration(withNoIncrementalHydration()),
  ];
  const html = await renderApplication(
    (context) => bootstrapApplication(RootComponent, { providers }, context),
    { document: angularDocument({ selector: config.selector, stylesheet }) },
  );
  await writeFile(
    path.join(outDir, 'angular.html'),
    html.replace('</body>', '<script type="module" src="./angular.js"></script></body>'),
  );
  const specifier = moduleSpecifier(root, fixturePath);
  await bundleClient({
    root,
    outDir,
    component: definition.component,
    port: 'angular',
    contents: `import '@angular/compiler';import{provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication,provideClientHydration,withNoIncrementalHydration}from'@angular/platform-browser';import{${config.story} as createStory}from${JSON.stringify(specifier)};(async()=>{const RootComponent=await createStory({client:true});await bootstrapApplication(RootComponent,{providers:[provideZonelessChangeDetection(),provideClientHydration(withNoIncrementalHydration())]});})();`,
  });
}

async function prepareElements({ root, outDir, definition, stylesheet, config, fixtureModule, fixturePath }) {
  const createStory = storyExport(fixtureModule, config.story, fixturePath, 'elements');
  const story = await createStory({ client: false });
  await writeFile(
    path.join(outDir, 'elements.html'),
    page({
      title: definition.title,
      heading: definition.heading,
      stylesheet,
      body: story.body,
      script: '<script type="module" src="./elements.js"></script>',
    }),
  );
  const specifier = moduleSpecifier(root, fixturePath);
  await bundleClient({
    root,
    outDir,
    component: definition.component,
    port: 'elements',
    contents: `import{${config.story} as createStory}from${JSON.stringify(specifier)};(async()=>{const story=await createStory({client:true});await story.activate?.();})();`,
  });
}

const preparers = {
  web: prepareWeb,
  react: prepareReact,
  vue: prepareVue,
  angular: prepareAngular,
  elements: prepareElements,
};

export async function prepareBrowserFixture({ root, fixturePath, fixtureModule, port }) {
  const definition = fixtureModule.browserFixture;
  if (!definition || typeof definition !== 'object') {
    throw new Error(`${fixturePath} must export a browserFixture definition.`);
  }
  if (!definition.component || !definition.title || !definition.heading || !definition.ports) {
    throw new Error(`${fixturePath} has an incomplete browserFixture definition.`);
  }
  const config = definition.ports[port];
  if (!config) return false;
  const prepare = preparers[port];
  if (!prepare) throw new Error(`Unsupported browser fixture port: ${port}`);

  const outDir = path.join(root, 'dist/browser-fixtures/components', definition.component);
  await mkdir(outDir, { recursive: true });
  const stylesheet = await prepareStyles({ root, outDir, component: definition.component });
  await prepare({ root, outDir, definition, stylesheet, config, fixtureModule, fixturePath });
  return true;
}

export async function loadBrowserFixtureModule(fixturePath) {
  return import(pathToFileURL(fixturePath).href);
}
