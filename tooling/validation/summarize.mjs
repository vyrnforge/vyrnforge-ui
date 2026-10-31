import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function loadExecutionMetrics(root) {
  if (!root || !existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const value = JSON.parse(readFileSync(path.join(root, name), 'utf8'));
      if (!value || typeof value !== 'object' || !Array.isArray(value.metrics) || typeof value.scope !== 'string') {
        throw new Error(`invalid validation metric report: ${name}`);
      }
      return value;
    });
}

const planPath = arg('--plan');
const metricsRoot = arg('--metrics-dir');
const outputRoot = arg('--output-dir') ?? 'test-results/validation-summary';
if (!planPath) throw new Error('validation summary requires --plan <semantic-impact.json>');

const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const executionMetrics = loadExecutionMetrics(metricsRoot);
const revision = process.env.VF_HEAD_SHA ?? null;
const mismatchedMetrics = executionMetrics.filter((record) => revision && record.revision && record.revision !== revision);
if (mismatchedMetrics.length) {
  throw new Error(`validation metrics revision mismatch: expected ${revision}; got ${mismatchedMetrics.map((record) => `${record.scope}:${record.revision}`).join(', ')}`);
}
const evidence = [
  { id: 'affected', label: 'Nx affected + repository contracts', required: true, result: process.env.VF_RESULT_AFFECTED ?? 'unknown' },
  { id: 'package-artifacts', label: 'Packed packages / public consumers', required: plan.selectors.packageArtifactsRequired, result: process.env.VF_RESULT_PACKAGES ?? 'skipped' },
  { id: 'release-intent', label: 'Release intent', required: plan.selectors.releaseRequired, result: process.env.VF_RESULT_RELEASE ?? 'skipped' },
  { id: 'documentation', label: 'Documentation build', required: plan.selectors.docsRequired, result: process.env.VF_RESULT_DOCS ?? 'skipped' },
  { id: 'browser', label: 'Real-browser evidence', required: plan.selectors.browserRequired, result: process.env.VF_RESULT_BROWSER ?? 'skipped' },
];

const normalized = evidence.map((entry) => ({
  ...entry,
  disposition: entry.required
    ? entry.result === 'success' ? 'pass' : 'fail'
    : entry.result === 'skipped' ? 'not-selected' : entry.result === 'success' ? 'extra-pass' : 'extra-result',
}));
const failures = normalized.filter((entry) => entry.required && entry.result !== 'success');
const selectedScopes = plan.validationScopes.filter((scope) => scope.selected);
const skippedScopes = plan.validationScopes.filter((scope) => !scope.selected);

const report = {
  schemaVersion: 2,
  mode: plan.mode,
  revision,
  changedPaths: plan.changedPaths,
  productImpact: {
    components: plan.components,
    packages: plan.packages,
    ownedUnits: plan.ownedUnits,
    browserScopes: plan.browserScopes,
    packageArtifactPackages: plan.packageArtifactPackages,
    repositoryWide: plan.repositoryWide,
    unknownPaths: plan.unknownPaths,
  },
  validation: {
    selectedScopes,
    skippedScopes,
    executionPrerequisites: plan.executionPrerequisites,
    executionMetrics,
    evidence: normalized,
  },
  result: failures.length ? 'fail' : 'pass',
};

const line = (values) => values.length ? values.join(', ') : 'none';
const timingRows = executionMetrics.flatMap((record) => record.metrics.map((metric) => {
  const scope = record.port ? `${record.scope}:${record.port}` : record.scope;
  const seconds = Number.isFinite(metric.durationSeconds) ? metric.durationSeconds : 'n/a';
  const reuse = metric.cacheHit === true ? 'cache-hit' : metric.cacheHit === false ? 'cache-miss' : '';
  return `| ${scope} | ${metric.name} | ${metric.result ?? 'unknown'} | ${seconds} | ${reuse} |`;
}));
const cacheRows = executionMetrics
  .filter((record) => record.cache)
  .map((record) => `- \`${record.port ?? record.scope}\`: browser runtime ${record.cache.browserRuntimeHit ? 'hit' : 'miss'}, exact-revision build artifact ${record.cache.buildArtifactRestored ? 'restored' : 'missing'}`);

const markdown = [
  '# VyrnForge validation summary',
  '',
  `- Mode: \`${report.mode}\``,
  `- Revision: \`${report.revision ?? 'unknown'}\``,
  `- Result: **${report.result.toUpperCase()}**`,
  `- Repository-wide: ${report.productImpact.repositoryWide ? 'yes' : 'no'}`,
  '',
  '## Change and product impact',
  '',
  `- Changed paths: ${line(report.changedPaths.map((value) => `\`${value}\``))}`,
  `- Components: ${line(report.productImpact.components.map((value) => `\`${value}\``))}`,
  `- Packages: ${line(report.productImpact.packages.map((value) => `\`${value}\``))}`,
  `- Packed package roots: ${line(report.productImpact.packageArtifactPackages.map((value) => `\`${value}\``))}`,
  `- Unknown paths: ${line(report.productImpact.unknownPaths.map((value) => `\`${value}\``))}`,
  '',
  '## Selected execution evidence',
  '',
  '| Evidence | Required | Result | Disposition |',
  '| --- | --- | --- | --- |',
  ...normalized.map((entry) => `| ${entry.label} | ${entry.required ? 'yes' : 'no'} | ${entry.result} | ${entry.disposition} |`),
  '',
  '## Logical validation scopes',
  '',
  ...selectedScopes.map((scope) => `- **${scope.scope}**${scope.owner ? ` (\`${scope.owner}\`)` : ''}: ${scope.because}`),
  '',
  '## Relevant skipped scopes',
  '',
  ...skippedScopes.map((scope) => `- ${scope.scope}: ${scope.because}`),
  '',
  '## Execution prerequisites',
  '',
  ...report.validation.executionPrerequisites.map((item) => `- \`${item}\``),
  '',
  '## Execution timing',
  '',
  ...(timingRows.length ? [
    '| Scope | Metric | Result | Seconds | Reuse |',
    '| --- | --- | --- | ---: | --- |',
    ...timingRows,
  ] : ['No executor timing metrics were retained for this run.']),
  '',
  ...(cacheRows.length ? ['### Restored prerequisite caches', '', ...cacheRows, ''] : []),
];

mkdirSync(outputRoot, { recursive: true });
writeFileSync(path.join(outputRoot, 'validation-summary.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'validation-summary.md'), `${markdown.join('\n')}\n`);

console.log(`validation summary: ${report.result}; selected=${normalized.filter((item) => item.required).length}; failures=${failures.length}; metricReports=${executionMetrics.length}`);
if (failures.length) {
  console.error(`required validation evidence did not pass: ${failures.map((entry) => `${entry.id}=${entry.result}`).join(', ')}`);
  process.exitCode = 1;
}
