import { describe, expect, it } from 'vitest';
import { resolveBrowserFixtureScope } from './browser-fixture-scope.mjs';

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
