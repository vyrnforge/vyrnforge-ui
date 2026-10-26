import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const changeTypes = new Set(['patch', 'minor', 'major', 'internal']);

function walk(root, relativePath) {
  const absolute = path.join(root, relativePath);
  if (!existsSync(absolute)) return [];
  const files = [];
  const stack = [absolute];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.name.endsWith('.md')) files.push(path.relative(root, target).replaceAll('\\', '/'));
    }
  }
  return files.sort();
}

export function fragmentOwner(relativePath) {
  const component = /^product\/([^/]+)\/changes\//.exec(relativePath);
  if (component) return { kind: 'component', id: component[1] };
  const unit = /^packages\/([^/]+)\/changes\/([^/]+)\/([^/]+)\//.exec(relativePath);
  if (unit) return { kind: unit[2], id: unit[3], package: unit[1] };
  const packageChange = /^packages\/([^/]+)\/changes\//.exec(relativePath);
  if (packageChange) return { kind: 'package', id: packageChange[1], package: packageChange[1] };
  return null;
}

export function parseChangeFragment(root, relativePath) {
  const source = readFileSync(path.join(root, relativePath), 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n+([\s\S]+?)\s*$/.exec(source);
  if (!match) throw new Error(`${relativePath} must contain YAML-like frontmatter followed by a description`);
  const metadata = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(':');
    if (separator < 1) throw new Error(`${relativePath} contains invalid frontmatter line: ${line}`);
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  if (!changeTypes.has(metadata.type)) throw new Error(`${relativePath} type must be one of ${[...changeTypes].join(', ')}`);
  const owner = fragmentOwner(relativePath);
  if (!owner) throw new Error(`${relativePath} is not under a recognized product component, package, or scoped-unit changes directory`);
  return { path: relativePath, owner, type: metadata.type, description: match[2].trim() };
}

export function discoverChangeFragments(root = defaultRoot) {
  const paths = [...walk(root, 'product'), ...walk(root, 'packages')]
    .filter((file) => file.includes('/changes/'))
    .filter((file, index, values) => values.indexOf(file) === index)
    .sort();
  return paths.map((file) => parseChangeFragment(root, file));
}

export function renderUnreleasedChanges(fragments) {
  const publicChanges = fragments.filter((fragment) => fragment.type !== 'internal');
  const internalChanges = fragments.filter((fragment) => fragment.type === 'internal');
  const lines = ['# Unreleased changes', ''];
  for (const type of ['major', 'minor', 'patch']) {
    const matching = publicChanges.filter((fragment) => fragment.type === type);
    if (!matching.length) continue;
    lines.push(`## ${type[0].toUpperCase()}${type.slice(1)}`, '');
    for (const fragment of matching) lines.push(`- **${fragment.owner.package ? `${fragment.owner.package}/` : ''}${fragment.owner.id}** — ${fragment.description}`);
    lines.push('');
  }
  if (internalChanges.length) {
    lines.push('## Internal', '');
    for (const fragment of internalChanges) lines.push(`- **${fragment.owner.package ? `${fragment.owner.package}/` : ''}${fragment.owner.id}** — ${fragment.description}`);
    lines.push('');
  }
  if (!fragments.length) lines.push('No unreleased change fragments.', '');
  return `${lines.join('\n').trimEnd()}\n`;
}
