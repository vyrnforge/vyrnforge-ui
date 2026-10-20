import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { build, transform } from 'esbuild';

const mode = process.argv[2] ?? '--capture';
const baselinePath = 'tooling/performance/representative-bundle-baselines.json';
const components = ['button', 'tabs', 'dialog'];
const ports = ['react', 'angular', 'vue', 'elements'];
const selectedExport = {
  react: { button: 'Button', tabs: 'TabsRoot', dialog: 'DialogRoot' },
  angular: { button: 'VfButtonDirective', tabs: 'VfTabsRootDirective', dialog: 'VfDialogRootDirective' },
  vue: { button: 'Button', tabs: 'TabsRoot', dialog: 'DialogRoot' },
  elements: { tabs: 'VfTabsElement' },
};
const externals = {
  react: ['react', 'react/*'],
  angular: ['@angular/*', 'rxjs', 'rxjs/*'],
  vue: ['vue', 'vue/*'],
  elements: [],
};

function byteCounts(text) {
  const bytes = Buffer.byteLength(text);
  return { bytes, gzipBytes: gzipSync(text, { level: 9 }).byteLength };
}

async function bundle(entryPoint, external) {
  const result = await build({
    entryPoints: [entryPoint],
    absWorkingDir: process.cwd(),
    bundle: true,
    external,
    format: 'esm',
    logLevel: 'silent',
    minify: true,
    platform: 'browser',
    sourcemap: false,
    target: ['es2022'],
    treeShaking: true,
    write: false,
  });
  const output = result.outputFiles.find((file) => file.path.endsWith('.js')) ?? result.outputFiles[0];
  if (!output) throw new Error(`No JavaScript output produced for ${entryPoint}`);
  return byteCounts(output.text);
}

async function selectedRootBundle(port, component, symbol) {
  const result = await build({
    absWorkingDir: process.cwd(),
    bundle: true,
    external: externals[port],
    format: 'esm',
    logLevel: 'silent',
    minify: true,
    platform: 'browser',
    sourcemap: false,
    stdin: {
      contents: `import { ${symbol} } from './packages/${port}/dist/index.js'; export { ${symbol} };`,
      loader: 'js',
      resolveDir: process.cwd(),
      sourcefile: `${port}-${component}-root-selection.js`,
    },
    target: ['es2022'],
    treeShaking: true,
    write: false,
  });
  const output = result.outputFiles.find((file) => file.path.endsWith('.js')) ?? result.outputFiles[0];
  if (!output) throw new Error(`No root-selection JavaScript output produced for ${port}/${component}`);
  return byteCounts(output.text);
}

const measurements = { schemaVersion: 1, components: {} };
for (const component of components) {
  const css = await readFile(`packages/web/dist/components/${component}/${component}.css`, 'utf8');
  const minifiedCss = (await transform(css, { loader: 'css', minify: true })).code;
  const entry = { css: byteCounts(minifiedCss), ports: {} };
  for (const port of ports) {
    const symbol = selectedExport[port]?.[component];
    if (!symbol) continue;
    entry.ports[port] = {
      subpath: await bundle(`packages/${port}/dist/components/${component}/index.js`, externals[port]),
      rootSelected: await selectedRootBundle(port, component, symbol),
    };
  }
  measurements.components[component] = entry;
}

const serialized = `${JSON.stringify(measurements, null, 2)}\n`;
if (mode === '--capture') {
  process.stdout.write(serialized);
  process.exit(0);
}
if (mode !== '--check') throw new Error(`Unknown mode ${mode}; expected --capture or --check`);

let expected;
try {
  expected = await readFile(baselinePath, 'utf8');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
  process.stdout.write(serialized);
  throw new Error(`Representative bundle baseline is missing: ${baselinePath}`);
}
if (expected !== serialized) {
  process.stdout.write('Measured representative bundle baseline:\n');
  process.stdout.write(serialized);
  throw new Error('Representative bundle baseline changed; review the measurement and update the committed baseline deliberately');
}

process.stdout.write('representative bundle baselines: ok\n');
