import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const PUBLIC_TOKEN_PATTERN = /--vf-[a-z0-9-]+/g;
const PUBLIC_TOKEN_REFERENCE_PATTERN = /var\(\s*(--vf-[a-z0-9-]+)/g;

export function extractDeclaredPublicTokens(css) {
  const tokens = new Set();
  const declarationPattern = /(^|[;{]\s*)(--vf-[a-z0-9-]+)\s*:/gm;
  for (const match of css.matchAll(declarationPattern)) tokens.add(match[2]);
  return tokens;
}

export function findUndefinedPublicTokenReferences(css, declaredTokens) {
  const undefinedTokens = new Set();
  for (const match of css.matchAll(PUBLIC_TOKEN_REFERENCE_PATTERN)) {
    if (!declaredTokens.has(match[1])) undefinedTokens.add(match[1]);
  }
  return [...undefinedTokens].sort();
}

async function walkCss(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkCss(full));
    else if (entry.isFile() && entry.name.endsWith('.css')) files.push(full);
  }
  return files;
}

export async function verifyPublicCssTokenReferences({
  tokenFile = 'packages/web/src/styles/tokens.css',
  cssRoot = 'packages/web/src',
} = {}) {
  const tokenCss = await readFile(tokenFile, 'utf8');
  const declaredTokens = extractDeclaredPublicTokens(tokenCss);
  if (declaredTokens.size === 0 || !PUBLIC_TOKEN_PATTERN.test(tokenCss)) {
    throw new Error(`${tokenFile} does not declare any public --vf-* tokens`);
  }

  const failures = [];
  for (const file of await walkCss(cssRoot)) {
    const css = await readFile(file, 'utf8');
    for (const token of findUndefinedPublicTokenReferences(css, declaredTokens)) {
      failures.push(`${file}: ${token}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Web CSS references undefined public tokens:\n${failures.join('\n')}`);
  }
}
