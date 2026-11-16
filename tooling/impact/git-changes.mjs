import { execFileSync } from 'node:child_process';

export function changedPathsFromGit(base, head, cwd = process.cwd()) {
  if (!base || !head) throw new Error('Both --base and --head are required');
  return execFileSync('git', ['diff', '--no-renames', '--name-only', `${base}...${head}`], { cwd, encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function resolvableRef(ref, cwd) {
  try {
    git(['rev-parse', '--verify', ref], cwd);
    return true;
  } catch {
    return false;
  }
}

export function changedPathsFromLocal(baseRef = process.env.NX_BASE, cwd = process.cwd()) {
  const base = baseRef
    || (resolvableRef('origin/main', cwd) ? 'origin/main' : resolvableRef('main', cwd) ? 'main' : null);
  if (!base) throw new Error('Local impact planning requires a reachable main/origin/main base or NX_BASE');
  const mergeBase = git(['merge-base', base, 'HEAD'], cwd);
  const commands = [
    ['diff', '--no-renames', '--name-only', `${mergeBase}...HEAD`],
    ['diff', '--no-renames', '--name-only'],
    ['diff', '--no-renames', '--name-only', '--cached'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  const paths = new Set();
  for (const args of commands) {
    for (const value of git(args, cwd).split('\n').map((entry) => entry.trim()).filter(Boolean)) paths.add(value);
  }
  return [...paths].sort();
}
