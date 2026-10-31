import { appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createSemanticImpact } from './classify.mjs';
import { changedPathsFromGit, changedPathsFromLocal } from './git-changes.mjs';
import { broadModes, modes } from './policy.mjs';

export { createSemanticImpact } from './classify.mjs';
export { changedPathsFromGit, changedPathsFromLocal } from './git-changes.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function emitGithubOutputs(plan, outputPath) {
  const browserMatrix = plan.browserScopes.map((scope) => ({
    port: scope.port,
    components: scope.components.join(','),
  }));
  const lines = [
    `package_artifacts_required=${plan.selectors.packageArtifactsRequired}`,
    `package_artifact_packages=${plan.packageArtifactPackages.join(',')}`,
    `browser_required=${plan.selectors.browserRequired}`,
    `browser_ports=${JSON.stringify(plan.browserPorts)}`,
    `browser_scopes=${JSON.stringify(browserMatrix)}`,
    `docs_required=${plan.selectors.docsRequired}`,
    `release_required=${plan.selectors.releaseRequired}`,
    `repository_wide=${plan.repositoryWide}`,
  ];
  appendFileSync(outputPath, `${lines.join('\n')}\n`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = arg('--mode') ?? 'local';
  if (!modes.has(mode)) throw new Error(`Unsupported --mode ${mode}`);
  const filesArg = arg('--files');
  let paths;
  if (filesArg !== undefined) {
    paths = filesArg.split(',').map((value) => value.trim()).filter(Boolean);
  } else if (broadModes.has(mode) && !arg('--base') && !arg('--head')) {
    paths = [];
  } else if (mode === 'local' && !arg('--base') && !arg('--head')) {
    paths = changedPathsFromLocal(arg('--local-base'));
  } else {
    paths = changedPathsFromGit(arg('--base'), arg('--head'));
  }

  const plan = createSemanticImpact(paths, { mode });
  const serialized = `${JSON.stringify(plan, null, 2)}\n`;
  const output = arg('--output');
  if (output) writeFileSync(output, serialized);
  else process.stdout.write(serialized);
  const githubOutput = arg('--github-output')
    || (hasArg('--emit-github-outputs') ? process.env.GITHUB_OUTPUT : undefined);
  if (githubOutput) emitGithubOutputs(plan, githubOutput);
}
