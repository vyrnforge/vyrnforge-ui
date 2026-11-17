import { describe, expect, it } from 'vitest';
import { resolveBrowserFixtureScope, selectedBrowserFixtureOwners } from './browser-fixture-scope.mjs';
import { validateBrowserFixtureModule } from './browser-fixtures.mjs';

const entries = {
  'app-shell': { definition: { component: 'app-shell', dependencies: { react: ['input'] } } },
  input: { definition: { component: 'input' } },
  unrelated: { definition: { component: 'unrelated' } },
};
const load = async (id) => entries[id];
const resolve = async (roots, port = 'react', loader = load) =>
  (await resolveBrowserFixtureScope({ roots, port, load: loader })).map(({ definition }) => definition.component);

describe('browser fixture dependency scope', () => {
  it('prepares the React dependency without selecting unrelated fixtures', async () => {
    expect(await resolve(['app-shell'])).toEqual(['input', 'app-shell']);
  });
  it('does not expand other ports', async () => {
    expect(await resolve(['app-shell'], 'web')).toEqual(['app-shell']);
  });
  it('deduplicates selected dependencies and preserves broad scope', async () => {
    expect(await resolve(['app-shell', 'input', 'unrelated'])).toEqual(['input', 'app-shell', 'unrelated']);
  });
  it('rejects a missing or unsupported dependency', async () => {
    await expect(resolve(['app-shell'], 'react', async (id) => id === 'input' ? undefined : load(id)))
      .rejects.toThrow('Missing react browser fixture dependency input required by app-shell');
  });
  it('rejects a dependency cycle', async () => {
    await expect(resolve(['app-shell'], 'react', async (id) => ({
      definition: { component: id, dependencies: { react: [id === 'app-shell' ? 'input' : 'app-shell'] } },
    }))).rejects.toThrow('app-shell -> input -> app-shell');
  });
});


describe('browser fixture dependency declarations', () => {
  const validate = (dependencies) => validateBrowserFixtureModule({
    fixturePath: 'app-shell/fixtures.mjs',
    component: 'app-shell',
    fixtureModule: { browserFixture: { component: 'app-shell', dependencies, prepare() {} } },
  });
  it('accepts an owner-local port map', () => {
    expect(validate({ react: ['input'] }).dependencies).toEqual({ react: ['input'] });
  });
  it('rejects malformed dependency declarations', () => {
    for (const dependencies of [null, [], { react: 'input' }, { unknown: ['input'] }, { react: ['app-shell'] }, { react: ['input', 'input'] }]) {
      expect(() => validate(dependencies)).toThrow('browserFixture.dependencies');
    }
  });
});


describe('pattern-owned browser evidence fixture selection', () => {
  const patterns = [{
    unitId: 'settings-navigation',
    exampleReferences: [{ owner: 'component:app-shell', evidence: { port: 'react' } }],
  }];

  it('prepares AppShell for a pattern-only React scope without selecting AppShell specs', async () => {
    const selectedComponents = new Set(['settings-navigation']);
    const fixtureOwners = selectedBrowserFixtureOwners({ selectedComponents, patterns, port: 'react' });
    expect([...fixtureOwners]).toEqual(['settings-navigation', 'app-shell']);
    expect([...selectedComponents]).toEqual(['settings-navigation']);
    expect(await resolve([...fixtureOwners].filter((id) => id in entries))).toEqual(['input', 'app-shell']);
  });

  it('does not add a React-only pattern fixture to Angular or unrelated selections', () => {
    expect([...selectedBrowserFixtureOwners({
      selectedComponents: new Set(['settings-navigation']), patterns, port: 'angular',
    })]).toEqual(['settings-navigation']);
    expect([...selectedBrowserFixtureOwners({
      selectedComponents: new Set(['unrelated']), patterns, port: 'react',
    })]).toEqual(['unrelated']);
    expect([...selectedBrowserFixtureOwners({
      selectedComponents: new Set(), patterns, port: 'react',
    })]).toEqual([]);
  });
});
