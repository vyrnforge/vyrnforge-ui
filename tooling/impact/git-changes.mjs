import { execFileSync } from 'node:child_process';

export function changedPathsFromGit(base, head) {
  if (!base || !head) throw new Error('Both --base and --head are required');
  return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function resolvableRef(ref) {
  try {
    git(['rev-parse', '--verify', ref]);
    return true;
  } catch {
    return false;
  }
}

export function changedPathsFromLocal(baseRef = process.env.NX_BASE) {
  const base = baseRef
    || (resolvableRef('origin/main') ? 'origin/main' : resolvableRef('main') ? 'main' : null);
  if (!base) throw new Error('Local impact planning requires a reachable main/origin/main base or NX_BASE');
  const mergeBase = git(['merge-base', base, 'HEAD']);
  const commands = [
    ['diff', '--name-only', `${mergeBase}...HEAD`],
    ['diff', '--name-only'],
    ['diff', '--name-only', '--cached'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  const paths = new Set();
  for (const args of commands) {
    for (const value of git(args).split('\n').map((entry) => entry.trim()).filter(Boolean)) paths.add(value);
  }
  return [...paths].sort();
}
