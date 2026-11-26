import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverProductGraph } from './discover-product-graph.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const componentId = (key) => /^\.\/[a-z][a-z0-9-]*$/.test(key) ? key.slice(2) : null;

/**
 * Derive browser-only CSS imports from Product Graph owners and public package exports.
 * No React-specific CSS or parallel component inventory is introduced.
 *
 * Node/SSR keeps the normal JS entrypoints; CSS-aware browser bundlers select
 * the "browser" export condition and receive canonical @vyrnforge/web CSS.
 */
export function reactBrowserCssPlan({ root = repoRoot, react, web, graph } = {}) {
  const reactManifest = react ?? readJson(path.join(root, 'packages/react/package.json'));
  const webManifest = web ?? readJson(path.join(root, 'packages/web/package.json'));
  const productGraph = graph ?? discoverProductGraph(root);

  if (webManifest.exports?.['./styles.css'] !== './dist/styles.css') {
    throw new Error('React browser root requires the canonical Web aggregate CSS export');
  }
  const rootExport = reactManifest.exports?.['.'];
  if (!rootExport || rootExport.browser !== './dist/browser.js' || rootExport.import !== './dist/index.js') {
    throw new Error('React root must expose browser CSS and retain native SSR import');
  }

  const owners = new Map([...productGraph.components, ...(productGraph.patterns ?? [])]
    .filter((unit) => unit.surfaces?.react?.publicEntrypoints?.length)
    .map((unit) => [unit.unitId, unit]));
  const entries = [];
  for (const [subpath, entry] of Object.entries(reactManifest.exports ?? {})) {
    if (subpath === '.') continue;
    const id = componentId(subpath);
    if (!id) throw new Error('Unsupported React public subpath: ' + subpath);
    const owner = owners.get(id);
    if (!owner) throw new Error('React CSS export has no implemented Product Graph owner: ' + id);
    const expectedJs = `./dist/components/${id}/index.js`;
    const expectedBrowser = `./dist/components/${id}/browser.js`;
    if (entry?.import !== expectedJs || entry?.default !== expectedJs || entry?.browser !== expectedBrowser || typeof entry?.types !== 'string') {
      throw new Error('React browser/SSR conditional export drift for ' + subpath);
    }
    if (webManifest.exports?.[`./styles/${id}.css`] !== `./dist/components/${id}/${id}.css`) {
      throw new Error('React ' + id + ' has no canonical Web stylesheet entrypoint');
    }

    const metadata = readJson(path.join(root, owner.metadataPath));
    const additional = metadata?.styling?.dependencies ?? [];
    if (!Array.isArray(additional) || additional.some((name) => typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(name) || name === id)) {
      throw new Error('Invalid declared styling dependencies for ' + id);
    }
    const cssIds = [...new Set([...additional, id])];
    for (const cssId of cssIds) {
      if (webManifest.exports?.[`./styles/${cssId}.css`] !== `./dist/components/${cssId}/${cssId}.css`) {
        throw new Error(`${id} depends on missing canonical Web styling ${cssId}`);
      }
    }
    entries.push({
      component: id,
      output: `dist/components/${id}/browser.js`,
      source: cssIds.map((name) => `import '@vyrnforge/web/styles/${name}.css';`).join('\n') +
        `\nexport * from './index.js';\n`,
      cssIds,
    });
  }
  if (entries.length !== owners.size) throw new Error('React CSS entrypoints must cover every implemented component');

  const expectedSideEffects = ['./dist/browser.js', './dist/components/*/browser.js'];
  if (JSON.stringify(reactManifest.sideEffects) !== JSON.stringify(expectedSideEffects)) {
    throw new Error('React CSS wrappers must be marked as side effects for browser tree shaking');
  }
  return {
    root: {
      output: 'dist/browser.js',
      source: "import '@vyrnforge/web/styles.css';\nexport * from './index.js';\n",
    },
    components: entries,
  };
}

export function writeReactBrowserCss({ root = repoRoot, ...options } = {}) {
  const plan = reactBrowserCssPlan({ root, ...options });
  for (const entry of [plan.root, ...plan.components]) {
    const file = path.join(root, 'packages/react', entry.output);
    if (!existsSync(path.dirname(file))) throw new Error('React build output is missing: ' + path.dirname(file));
    writeFileSync(file, entry.source, 'utf8');
  }
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const plan = writeReactBrowserCss();
  process.stdout.write(`Generated ${plan.components.length} React browser-only CSS wrappers plus root aggregate.\n`);
}
