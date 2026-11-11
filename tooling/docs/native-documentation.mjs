import { compileFrameworkDocumentation, parseMarkdownDocument } from './framework-documentation.mjs';

const nativeShellStyleSpecifiers = [
  '@vyrnforge/web/styles/tokens.css',
  '@vyrnforge/web/styles/reset.css',
  '@vyrnforge/web/styles/foundation.css',
  '@vyrnforge/web/styles/app-shell.css',
  '@vyrnforge/web/styles/side-nav.css',
  '@vyrnforge/web/styles/input.css',
  '@vyrnforge/web/styles/native-select.css',
  '@vyrnforge/web/styles/theme-toggle.css',
  '@vyrnforge/web/styles/link.css',
  '@vyrnforge/web/styles/button.css',
];

function resolvePublicStyleAsset(webPackage, specifier) {
  const packagePrefix = `${webPackage.name}/`;
  if (!specifier.startsWith(packagePrefix)) {
    throw new Error(`Native documentation stylesheet must use ${webPackage.name}: ${specifier}`);
  }
  const exportName = `./${specifier.slice(packagePrefix.length)}`;
  const exportTarget = webPackage.manifest.exports?.[exportName];
  if (typeof exportTarget !== 'string') {
    throw new Error(`Native documentation requires ${exportName} in ${webPackage.manifestPath ?? 'packages/web/package.json'}`);
  }
  const relativeAssetPath = exportTarget.replace(/^\.\/dist\//, '');
  if (relativeAssetPath === exportTarget) {
    throw new Error(`Native Web stylesheet export ${exportName} must resolve beneath @vyrnforge/web dist`);
  }
  return {
    specifier,
    assetPath: `/assets/vyrnforge-web/${relativeAssetPath}`,
  };
}

function publicStyleSpecifiers(packageEntry) {
  return Object.keys(packageEntry.manifest.exports ?? {})
    .filter((entry) => entry === './styles.css' || entry.startsWith('./styles/'))
    .map((entry) => `${packageEntry.name}/${entry.slice(2)}`)
    .sort();
}

export { parseMarkdownDocument };

export function compileNativeDocumentation(root) {
  const shared = compileFrameworkDocumentation('native-web', root);
  const webPackage = {
    name: shared.packageName,
    manifest: shared.packageManifest,
    manifestPath: 'packages/web/package.json',
  };

  const shellStyles = nativeShellStyleSpecifiers.map((specifier) => resolvePublicStyleAsset(webPackage, specifier));
  const showcasePages = shared.showcasePages.map((page) => {
    const styleSpecifier = `${shared.packageName}/styles/${page.id}.css`;
    if (!page.publicEntrypoints.includes(styleSpecifier)) {
      throw new Error(`${page.id} Native Web showcase requires public entrypoint ${styleSpecifier}`);
    }
    if (!page.accessibility) {
      throw new Error(`${page.id} Native Web showcase requires component-owned accessibility evidence`);
    }
    return {
      ...page,
      content: page.sharedContent,
      sourcePath: page.sharedSourcePath,
      styleSpecifier,
      styleAssetPath: resolvePublicStyleAsset(webPackage, styleSpecifier).assetPath,
    };
  });

  const foundationPages = [
    {
      id: 'styling',
      title: 'Styling',
      route: 'foundations/styling/',
      pageKind: 'foundation',
      description: 'Load the canonical VyrnForge Web styling foundation and component styles through public package entrypoints.',
      entrypoints: publicStyleSpecifiers(webPackage),
    },
    {
      id: 'tokens',
      title: 'Design tokens',
      route: 'foundations/tokens/',
      pageKind: 'foundation',
      description: 'Use VyrnForge design tokens as the shared visual contract instead of hard-coded application values.',
      entrypoints: [`${shared.packageName}/styles/tokens.css`],
    },
  ];

  return {
    ...shared,
    shellStyles,
    showcasePages,
    pages: showcasePages,
    foundationPages,
  };
}
