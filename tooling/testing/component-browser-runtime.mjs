export const componentBrowserServerManagedEnv = 'VF_COMPONENT_BROWSER_SERVER_MANAGED';

export function managedPlaywrightConfigSource(configFileName) {
  const importSpecifier = `./${configFileName.replaceAll('\\', '/')}`;
  return `import config from ${JSON.stringify(importSpecifier)};\n\n// The impact executor owns the shared component browser server when this managed config is used.\n// Remove Playwright's per-config webServer entirely rather than relying on reuseExistingServer:\n// Playwright may still attempt to launch the configured command if its readiness probe does not\n// match the already-running shared server, which causes an EADDRINUSE race on the shared port.\nexport default { ...config, webServer: undefined };\n`;
}
