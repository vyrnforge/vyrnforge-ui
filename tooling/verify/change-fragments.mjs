import { discoverChangeFragments } from '../changes/fragments.mjs';

const fragments = discoverChangeFragments();
const seen = new Set();
for (const fragment of fragments) {
  if (seen.has(fragment.path)) throw new Error(`Duplicate change fragment path: ${fragment.path}`);
  seen.add(fragment.path);
  if (!fragment.description || fragment.description.length < 12) throw new Error(`${fragment.path} must explain the consumer or internal change clearly`);
}
process.stdout.write(`change fragments: ${fragments.length} valid scoped fragments\n`);
