import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { componentBrowserConcurrencyFromEnv, componentBrowserOwner, executeValidationPlan } from './execute.mjs';

test('component browser scopes expose a component isolation owner', () => {
  assert.equal(componentBrowserOwner('component:button:react:browser'), 'button');
  assert.equal(componentBrowserOwner('component:button:web:browser-cross'), 'button');
  assert.equal(componentBrowserOwner('browser-docs-chromium'), null);
});

test('component browser concurrency defaults to four and validates overrides', () => {
  assert.equal(componentBrowserConcurrencyFromEnv({}), 4);
  assert.equal(componentBrowserConcurrencyFromEnv({ VF_COMPONENT_BROWSER_CONCURRENCY: '2' }), 2);
  assert.throws(() => componentBrowserConcurrencyFromEnv({ VF_COMPONENT_BROWSER_CONCURRENCY: '0' }), /positive integer/);
  assert.throws(() => componentBrowserConcurrencyFromEnv({ VF_COMPONENT_BROWSER_CONCURRENCY: 'many' }), /positive integer/);
});

test('executor overlaps different components while serializing ports of the same component', async () => {
  const validationPlan = {
    mode: 'pr',
    changedPaths: [],
    validationScopes: [
      'build-react',
      'build-vue',
      'component:button:react:browser',
      'component:button:vue:browser',
      'component:checkbox:react:browser',
    ],
    scopeReasons: {},
  };
  const activeComponents = new Set();
  const starts = [];
  let active = 0;
  let maxActive = 0;
  await executeValidationPlan(validationPlan, {
    componentBrowserConcurrency: 2,
    runCommand: () => {},
    startBrowserServer: async () => ({}),
    stopBrowserServer: async () => {},
    runBrowserCommand: async (_command, args) => {
      const [component, port] = args.slice(1, 3);
      starts.push(`${component}:${port}`);
      assert.equal(activeComponents.has(component), false, `overlapped ${component}`);
      activeComponents.add(component);
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, component === 'button' && port === 'react' ? 20 : 5));
      active -= 1;
      activeComponents.delete(component);
    },
  });

  assert.equal(maxActive, 2);
  assert.deepEqual(starts.slice(0, 2).sort(), ['button:react', 'checkbox:react']);
  assert.ok(starts.indexOf('button:vue') > starts.indexOf('button:react'));
});

test('executor stops scheduling new browser evidence after failure and preserves ordered partial results', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vf-impact-browser-concurrency-'));
  const output = path.join(directory, 'validation-plan.json');
  const started = [];
  try {
    await assert.rejects(() => executeValidationPlan(
      {
        mode: 'pr',
        changedPaths: [],
        validationScopes: [
          'component:button:react:browser',
          'component:checkbox:react:browser',
          'component:dialog:react:browser',
        ],
        scopeReasons: {},
      },
      {
        output,
        componentBrowserConcurrency: 2,
        runCommand: () => {},
        startBrowserServer: async () => ({}),
        stopBrowserServer: async () => {},
        runBrowserCommand: async (_command, args) => {
          const component = args[1];
          started.push(component);
          if (component === 'button') throw Object.assign(new Error('browser failed'), { status: 9 });
          await new Promise((resolve) => setTimeout(resolve, 10));
        },
      },
    ), /browser failed/);

    assert.deepEqual(started.sort(), ['button', 'checkbox']);
    const report = JSON.parse(readFileSync(output, 'utf8'));
    const browserResults = report.results.filter((result) => result.scope.includes(':browser'));
    assert.deepEqual(report.componentBrowserExecution, { concurrency: 2, isolation: 'component' });
    assert.deepEqual(browserResults.map((result) => result.scope), [
      'component:button:react:browser',
      'component:checkbox:react:browser',
    ]);
    assert.equal(browserResults[0].outcome, 'failure');
    assert.equal(browserResults[0].exitCode, 9);
    assert.equal(browserResults[1].outcome, 'success');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
