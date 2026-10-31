const packageDefinitions = {
  core: {
    role: 'shared-runtime',
    browser: false,
    ssr: false,
    changeFanout: 'all-components',
    internalDependencies: [],
  },
  web: {
    role: 'shared-web',
    browser: true,
    ssr: false,
    changeFanout: 'all-components',
    internalDependencies: ['@vyrnforge/core'],
  },
  icons: {
    role: 'optional-catalog',
    browser: false,
    ssr: false,
    changeFanout: 'package',
    internalDependencies: ['@vyrnforge/web'],
  },
  react: {
    role: 'framework-port',
    browser: true,
    ssr: true,
    changeFanout: 'port-components',
    internalDependencies: ['@vyrnforge/core', '@vyrnforge/web'],
  },
  angular: {
    role: 'framework-port',
    browser: true,
    ssr: true,
    changeFanout: 'port-components',
    vitestSetup: './tooling/testing/angular-vitest.setup.mjs',
    internalDependencies: ['@vyrnforge/core', '@vyrnforge/web'],
  },
  vue: {
    role: 'framework-port',
    browser: true,
    ssr: true,
    changeFanout: 'port-components',
    internalDependencies: ['@vyrnforge/core', '@vyrnforge/web'],
  },
  elements: {
    role: 'framework-port',
    browser: true,
    ssr: false,
    changeFanout: 'port-components',
    internalDependencies: ['@vyrnforge/core', '@vyrnforge/web'],
  },
};

export const publicPackageModel = Object.freeze(
  Object.fromEntries(
    Object.entries(packageDefinitions).map(([name, definition]) => [
      name,
      Object.freeze({
        ...definition,
        internalDependencies: Object.freeze([...definition.internalDependencies]),
      }),
    ]),
  ),
);

export const publicPackageNames = Object.freeze(Object.keys(publicPackageModel));
export const publicPackagePaths = Object.freeze(publicPackageNames.map((name) => `packages/${name}`));

export const frameworkPortNames = Object.freeze(
  publicPackageNames.filter((name) => publicPackageModel[name].role === 'framework-port'),
);

export const browserPortNames = Object.freeze(
  publicPackageNames.filter((name) => publicPackageModel[name].browser),
);

export const ssrPortNames = Object.freeze(
  publicPackageNames.filter((name) => publicPackageModel[name].ssr),
);

export const sharedImplementationPackageNames = Object.freeze(
  publicPackageNames.filter((name) => publicPackageModel[name].changeFanout === 'all-components'),
);

export const allowedInternalDependencies = Object.freeze(
  Object.fromEntries(
    publicPackageNames.map((name) => [name, publicPackageModel[name].internalDependencies]),
  ),
);

export function packageDefinition(name) {
  return publicPackageModel[name] ?? null;
}
