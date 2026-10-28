import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_VARIABLE_DECLARATION_PATTERN = /(^|[;{]\s*)(--vf-[a-z0-9-]+)\s*:/gm;
const PUBLIC_VARIABLE_REFERENCE_PATTERN = /var\(\s*(--vf-[a-z0-9-]+)\s*(,)?/g;

export function extractDeclaredPublicVariables(css) {
  const variables = new Set();
  for (const match of css.matchAll(PUBLIC_VARIABLE_DECLARATION_PATTERN)) variables.add(match[2]);
  return variables;
}

export function findUndefinedPublicVariableReferences(css, declaredVariables) {
  const undefinedVariables = new Set();
  for (const match of css.matchAll(PUBLIC_VARIABLE_REFERENCE_PATTERN)) {
    const [, variable, fallbackMarker] = match;
    if (!declaredVariables.has(variable) && !fallbackMarker) undefinedVariables.add(variable);
  }
  return [...undefinedVariables].sort();
}

async function walkCss(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkCss(full));
    else if (entry.isFile() && entry.name.endsWith('.css')) files.push(full);
  }
  return files.sort();
}

export async function verifyPublicCssVariableReferences({
  cssRoot = new URL('../src/', import.meta.url),
  baselineFile = new URL('./public-css-variable-debt.json', import.meta.url),
} = {}) {
  const rootPath = cssRoot instanceof URL ? fileURLToPath(cssRoot) : path.resolve(cssRoot);
  const baselinePath = baselineFile instanceof URL ? fileURLToPath(baselineFile) : path.resolve(baselineFile);
  const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const files = await walkCss(rootPath);
  const sources = new Map();
  const declaredVariables = new Set();

  for (const file of files) {
    const css = await readFile(file, 'utf8');
    sources.set(file, css);
    for (const variable of extractDeclaredPublicVariables(css)) declaredVariables.add(variable);
  }

  if (declaredVariables.size === 0) throw new Error('Web CSS does not declare any public --vf-* variables');

  const unresolved = [];
  for (const [file, css] of sources) {
    const relative = path.relative(repositoryRoot, file);
    for (const variable of findUndefinedPublicVariableReferences(css, declaredVariables)) {
      unresolved.push(`${relative}: ${variable}`);
    }
  }
  unresolved.sort();

  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
  if (!Array.isArray(baseline) || baseline.some((entry) => typeof entry !== 'string')) {
    throw new Error('public-css-variable-debt.json must contain a JSON string array');
  }

  const actual = new Set(unresolved);
  const accepted = new Set(baseline);
  const introduced = unresolved.filter((entry) => !accepted.has(entry));
  const resolved = baseline.filter((entry) => !actual.has(entry));

  if (introduced.length > 0) {
    throw new Error(`Web CSS introduces unresolved public variables:\n${introduced.join('\n')}`);
  }
  if (resolved.length > 0) {
    throw new Error(`Web CSS debt baseline contains resolved entries; remove them:\n${resolved.join('\n')}`);
  }
}
