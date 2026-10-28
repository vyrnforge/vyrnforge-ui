import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

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

export async function collectPublicCssVariableState({ cssRoot = 'packages/web/src' } = {}) {
  const files = await walkCss(cssRoot);
  const sources = new Map();
  const declaredVariables = new Set();

  for (const file of files) {
    const css = await readFile(file, 'utf8');
    sources.set(file, css);
    for (const variable of extractDeclaredPublicVariables(css)) declaredVariables.add(variable);
  }

  const unresolved = [];
  for (const [file, css] of sources) {
    for (const variable of findUndefinedPublicVariableReferences(css, declaredVariables)) {
      unresolved.push(`${file}: ${variable}`);
    }
  }

  return { declaredVariables, unresolved: unresolved.sort() };
}

export function compareUnresolvedReferencesToBaseline(unresolved, baseline) {
  const actual = new Set(unresolved);
  const accepted = new Set(baseline);
  return {
    introduced: unresolved.filter((entry) => !accepted.has(entry)),
    resolved: baseline.filter((entry) => !actual.has(entry)),
  };
}

export async function verifyPublicCssVariableReferences({
  cssRoot = 'packages/web/src',
  baselineFile = 'tooling/verify/public-css-variable-debt.json',
} = {}) {
  const { declaredVariables, unresolved } = await collectPublicCssVariableState({ cssRoot });
  if (declaredVariables.size === 0) throw new Error(`${cssRoot} does not declare any public --vf-* variables`);

  const baseline = JSON.parse(await readFile(baselineFile, 'utf8'));
  if (!Array.isArray(baseline) || baseline.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${baselineFile} must contain a JSON string array`);
  }

  const { introduced, resolved } = compareUnresolvedReferencesToBaseline(unresolved, baseline);
  if (introduced.length > 0) {
    throw new Error(`Web CSS introduces unresolved public variables:\n${introduced.join('\n')}`);
  }
  if (resolved.length > 0) {
    throw new Error(`Web CSS debt baseline contains resolved entries; remove them from ${baselineFile}:\n${resolved.join('\n')}`);
  }
}
