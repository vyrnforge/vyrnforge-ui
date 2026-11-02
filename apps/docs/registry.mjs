import { readFileSync } from 'node:fs';
import path from 'node:path';

export function documentationRegistry(root) {
  return JSON.parse(readFileSync(path.join(root, 'documentation/site/registry.json'), 'utf8'));
}
