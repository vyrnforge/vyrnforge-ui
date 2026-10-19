import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const frameworkPorts = ['react', 'angular', 'vue', 'elements'];
const ssrPorts = new Set(['react', 'angular', 'vue']);
const sourceExtensions = ['.ts', '.tsx', '.mts', '.cts'];

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function existingPath(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function componentIdFromFrameworkExport(exportName) {
  const match = /^\.\/([a-z][a-z0-9-]*)$/.exec(exportName);
  return match?.[1] ?? null;
}

function componentIdFromWebExport(exportName) {
  const match = /^\.\/styles\/([a-z][a-z0-9-]*)\.css$/.exec(exportName);
  return match?.[1] ?? null;
}

function conventionalSourcePaths(root, port, componentId) {
  if (port === 'web') return [`packages/web/src/styles/${componentId}.css`];
  const base = `packages/${port}/src/${componentId}`;
  const files = sourceExtensions.map((extension) => `${base}${extension}`).filter((candidate) => existingPath(root, candidate));
  if (existingPath(root, base)) files.push(`${base}/`);
  return files;
}

function frameworkSourceModules(root, port) {
  const directory = path.join(root, `packages/${port}/src`);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.name.startsWith('_') || entry.name === 'internal') return [];
      if (entry.isDirectory()) return [entry.name];
      const extension = sourceExtensions.find((candidate) => entry.name.endsWith(candidate));
      if (!extension || entry.name === `index${extension}` || entry.name.endsWith('.d.ts')) return [];
      return [entry.name.slice(0, -extension.length)];
    })
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort();
}

function findExampleManifest(root, componentId) {
  const base = path.join(root, 'examples', componentId);
  if (!existsSync(base)) return null;
  const stack = [base];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.name === 'example.json') return path.relative(root, absolute).replaceAll('\\', '/');
    }
  }
  return null;
}

export function discoverComponents(root = repoRoot) {
  const frameworkExports = new Map();
  const frameworkSources = new Map();
  const discoveredIds = new Set();

  for (const port of frameworkPorts) {
    const manifest = readJson(root, `packages/${port}/package.json`);
    const exports = new Set(
      Object.keys(manifest.exports ?? {})
        .map(componentIdFromFrameworkExport)
        .filter(Boolean)
    );
    frameworkExports.set(port, exports);
    frameworkSources.set(port, frameworkSourceModules(root, port));
    for (const id of exports) discoveredIds.add(id);
  }

  const webManifest = readJson(root, 'packages/web/package.json');
  const webComponents = new Set(
    Object.keys(webManifest.exports ?? {})
      .map(componentIdFromWebExport)
      .filter(Boolean)
  );
  for (const id of webComponents) discoveredIds.add(id);

  const docsRegistry = readJson(root, 'documentation/site/registry.json');
  const docsByComponent = new Map();
  for (const page of docsRegistry.pages ?? []) {
    const match = /^components\/([a-z][a-z0-9-]*)$/.exec(page.slug ?? '');
    if (!match) continue;
    docsByComponent.set(match[1], page.source);
    discoveredIds.add(match[1]);
  }

  const examplesRoot = path.join(root, 'examples');
  const exampleComponents = new Set(
    existsSync(examplesRoot)
      ? readdirSync(examplesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^[a-z][a-z0-9-]*$/.test(entry.name)).map((entry) => entry.name)
      : []
  );
  for (const id of exampleComponents) discoveredIds.add(id);

  const components = [...discoveredIds].sort().map((componentId) => {
    const ports = {};
    if (webComponents.has(componentId)) {
      ports.web = {
        paths: conventionalSourcePaths(root, 'web', componentId),
        browser: true
      };
    }
    for (const port of frameworkPorts) {
      if (!frameworkExports.get(port).has(componentId)) continue;
      ports[port] = {
        paths: conventionalSourcePaths(root, port, componentId),
        ...(ssrPorts.has(port) ? { ssr: `tooling/tests/${componentId}-${port}.test.mjs` } : {}),
        browser: true
      };
    }

    const frameworkPortNames = Object.keys(ports).filter((port) => port !== 'web');
    const documentationPaths = [];
    const documentationSource = docsByComponent.get(componentId);
    if (documentationSource) documentationPaths.push(documentationSource);
    if (exampleComponents.has(componentId)) documentationPaths.push(`examples/${componentId}/`);

    return {
      component: componentId,
      status: 'implemented',
      ports,
      documentationPaths,
      documentationSource: documentationSource ?? null,
      exampleManifest: findExampleManifest(root, componentId),
      types: frameworkPortNames.length ? `tooling/types/${componentId}-api.ts` : null,
      browser: {
        runner: `tooling/browser/run-${componentId}.mjs`,
        paths: [
          `tooling/browser/run-${componentId}.mjs`,
          `tooling/browser/build-${componentId}-fixtures.mjs`,
          `tooling/browser/${componentId}.config.mjs`,
          `tooling/browser/${componentId}-tests/`
        ]
      },
      discovery: {
        webExport: webComponents.has(componentId),
        frameworkExports: frameworkPortNames,
        documentation: Boolean(documentationSource),
        examples: exampleComponents.has(componentId)
      }
    };
  });

  return { components, frameworkExports, frameworkSources };
}

export function componentPreparationProblems(root = repoRoot) {
  const { components, frameworkExports, frameworkSources } = discoverComponents(root);
  const problems = [];

  for (const [port, sourceModules] of frameworkSources) {
    const publicExports = frameworkExports.get(port);
    for (const moduleId of sourceModules) {
      if (!publicExports.has(moduleId)) {
        problems.push(`packages/${port}/src/${moduleId} is an unclassified top-level module; public component modules must be exported as ./${moduleId}, while internal modules belong under src/internal/ or use an _ prefix`);
      }
    }
  }

  for (const component of components) {
    const portNames = Object.keys(component.ports);
    if (portNames.length === 0) {
      problems.push(`${component.component} is documented or has examples but no public implementation surface was discovered`);
      continue;
    }

    if (!component.documentationSource) {
      problems.push(`${component.component} is public but missing a components/${component.component} documentation route`);
    } else if (!existingPath(root, component.documentationSource)) {
      problems.push(`${component.component} documentation source does not exist: ${component.documentationSource}`);
    }

    if (!component.exampleManifest) {
      problems.push(`${component.component} is public but has no executable example.json under examples/${component.component}/`);
    }

    for (const [port, config] of Object.entries(component.ports)) {
      if (!config.paths.length || config.paths.some((ownedPath) => !existingPath(root, ownedPath.replace(/\/$/, '')))) {
        problems.push(`${component.component}/${port} public surface has no conventional source at ${port === 'web' ? `packages/web/src/styles/${component.component}.css` : `packages/${port}/src/${component.component}.{ts,tsx,mts,cts} or packages/${port}/src/${component.component}/`}`);
      }
      if (config.ssr && !existingPath(root, config.ssr)) problems.push(`${component.component}/${port} is public but missing SSR evidence: ${config.ssr}`);
    }

    if (component.types && !existingPath(root, component.types)) {
      problems.push(`${component.component} has framework ports but is missing type-contract evidence: ${component.types}`);
    }

    for (const browserPath of component.browser.paths) {
      if (!existingPath(root, browserPath.replace(/\/$/, ''))) problems.push(`${component.component} is public but missing browser evidence preparation: ${browserPath}`);
    }
  }

  return problems;
}

export function assertComponentPreparation(root = repoRoot) {
  const problems = componentPreparationProblems(root);
  if (problems.length) throw new Error(`Component testing preparation failed:\n- ${problems.join('\n- ')}`);
  return discoverComponents(root).components;
}
