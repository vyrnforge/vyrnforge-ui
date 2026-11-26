// Shared documentation application presentation styles; actual files are resolved
// through the public @vyrnforge/web package export map by each renderer.
export const documentationShellStyleSpecifiers = Object.freeze([
  '@vyrnforge/web/styles/tokens.css',
  '@vyrnforge/web/styles/reset.css',
  '@vyrnforge/web/styles/foundation.css',
  '@vyrnforge/web/styles/app-shell.css',
  '@vyrnforge/web/styles/side-nav.css',
  '@vyrnforge/web/styles/input.css',
  '@vyrnforge/web/styles/checkbox.css',
  '@vyrnforge/web/styles/radio.css',
  '@vyrnforge/web/styles/avatar.css',
  '@vyrnforge/web/styles/badge.css',
  '@vyrnforge/web/styles/chip.css',
  '@vyrnforge/web/styles/toggle-button.css',
  '@vyrnforge/web/styles/icon.css',
  '@vyrnforge/web/styles/search-field.css',
  '@vyrnforge/web/styles/native-select.css',
  '@vyrnforge/web/styles/link.css',
  '@vyrnforge/web/styles/button.css',
  '@vyrnforge/web/styles/text.css',
  '@vyrnforge/web/styles/code.css',
  '@vyrnforge/web/styles/layout.css',
]);

export function resolvePublicWebStyleAsset(manifest, specifier) {
  const prefix = '@vyrnforge/web/';
  if (!specifier.startsWith(prefix)) throw new Error('Not a public Web style: ' + specifier);
  const key = './' + specifier.slice(prefix.length);
  const target = manifest.exports?.[key];
  if (typeof target !== 'string' || !target.startsWith('./dist/')) {
    throw new Error('Documentation style must be a published Web CSS export: ' + specifier);
  }
  return { specifier, assetPath: '/assets/vyrnforge-web/' + target.slice('./dist/'.length) };
}
