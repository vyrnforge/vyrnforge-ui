import { readFile } from 'node:fs/promises';

function unquote(value) {
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1);
  }
  return value;
}

export function parsePnpmWorkspacePaths(source) {
  const lines = source.split(/\r?\n/);
  const workspaces = [];
  let inPackages = false;
  let foundPackages = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inPackages) {
      if (trimmed === 'packages:') {
        inPackages = true;
        foundPackages = true;
      }
      continue;
    }

    if (trimmed === '' || trimmed.startsWith('#')) continue;
    if (!/^\s/.test(line)) break;

    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) {
      throw new Error(`pnpm workspace packages must use explicit list entries, found ${JSON.stringify(trimmed)}`);
    }

    const workspace = unquote(match[1].trim());
    if (!/^packages\/[A-Za-z0-9._-]+$/.test(workspace)) {
      throw new Error(`pnpm workspace packages must use explicit package paths, found ${JSON.stringify(workspace)}`);
    }
    workspaces.push(workspace);
  }

  if (!foundPackages) throw new Error('pnpm workspace must define a packages list');
  if (workspaces.length === 0) throw new Error('pnpm workspace packages list must not be empty');
  if (new Set(workspaces).size !== workspaces.length) throw new Error('pnpm workspace packages list must not contain duplicates');

  return workspaces;
}

export async function readPnpmWorkspacePaths(workspaceFile) {
  return parsePnpmWorkspacePaths(await readFile(workspaceFile, 'utf8'));
}
