import { discoverChangeFragments } from '../release/fragments.mjs';

const fragments = discoverChangeFragments();
const seen = new Set();
for (const fragment of fragments) {
  if (seen.has(fragment.path)) throw new Error(`Duplicate change fragment path: ${fragment.path}`);
  seen.add(fragment.path);
  if (!fragment.description || fragment.description.length < 12) throw new Error(`${fragment.path} must explain the consumer or internal change clearly`);
}

function changedPaths() {
  if (process.env.VF_VALIDATION_MODE !== 'pr' || !process.env.VF_CHANGED_PATHS) return [];
  const paths = JSON.parse(process.env.VF_CHANGED_PATHS);
  if (!Array.isArray(paths) || paths.some((value) => typeof value !== 'string')) throw new Error('VF_CHANGED_PATHS must be a JSON string array');
  return paths;
}

function requiredOwner(filePath) {
  const component = /^packages\/(?:web|react|angular|vue|elements)\/src\/components\/([^/]+)\//.exec(filePath);
  if (component) return { key: `component:${component[1]}`, prefix: `product/${component[1]}/changes/` };
  const unit = /^packages\/([^/]+)\/src\/(capabilities|accessibility|foundations)\/([^/]+)\//.exec(filePath);
  if (unit) return { key: `unit:${unit[1]}:${unit[2]}:${unit[3]}`, prefix: `packages/${unit[1]}/changes/${unit[2]}/${unit[3]}/` };
  return null;
}

const changed = changedPaths();
const required = new Map();
for (const filePath of changed) {
  const owner = requiredOwner(filePath);
  if (owner) required.set(owner.key, owner);
}
for (const owner of required.values()) {
  if (!changed.some((filePath) => filePath.startsWith(owner.prefix) && filePath.endsWith('.md'))) {
    throw new Error(`${owner.key} implementation changed without a scoped change fragment under ${owner.prefix}`);
  }
}

process.stdout.write(`change fragments: ${fragments.length} valid scoped fragments${required.size ? `; ${required.size} changed product owners covered` : ''}\n`);
