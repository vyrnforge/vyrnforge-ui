import { compileFrameworkDocumentation, parseMarkdownDocument } from './framework-documentation.mjs';

import { documentationShellStyleSpecifiers, resolvePublicWebStyleAsset } from './public-shell-styles.mjs';

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

  const shellStyles = documentationShellStyleSpecifiers.map((specifier) => resolvePublicWebStyleAsset(webPackage.manifest, specifier));
  const showcasePages = shared.showcasePages.map((page) => {
    if (page.guideOnly) return { ...page, content: page.sharedContent, sourcePath: page.sharedSourcePath, styleSpecifier: null, styleAssetPath: null };
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
      styleAssetPath: resolvePublicWebStyleAsset(webPackage.manifest, styleSpecifier).assetPath,
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
