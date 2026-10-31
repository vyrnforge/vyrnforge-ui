export const publicPackageNames = Object.freeze([
  'core',
  'web',
  'icons',
  'react',
  'angular',
  'vue',
  'elements',
]);

export const publicPackagePaths = Object.freeze(publicPackageNames.map((name) => `packages/${name}`));

export const frameworkPortNames = Object.freeze(['react', 'angular', 'vue', 'elements']);

export const allowedInternalDependencies = Object.freeze({
  core: Object.freeze([]),
  web: Object.freeze(['@vyrnforge/core']),
  icons: Object.freeze(['@vyrnforge/web']),
  react: Object.freeze(['@vyrnforge/core', '@vyrnforge/web']),
  angular: Object.freeze(['@vyrnforge/core', '@vyrnforge/web']),
  vue: Object.freeze(['@vyrnforge/core', '@vyrnforge/web']),
  elements: Object.freeze(['@vyrnforge/core', '@vyrnforge/web']),
});
