export const componentBrowserServerManagedEnv = 'VF_COMPONENT_BROWSER_SERVER_MANAGED';

export function managedPlaywrightConfigSource(configFileName) {
  const importSpecifier = `./${configFileName.replaceAll('\\', '/')}`;
  return `import config from ${JSON.stringify(importSpecifier)};\n\nfunction reuseExistingWebServer(webServer) {\n  if (Array.isArray(webServer)) return webServer.map((server) => ({ ...server, reuseExistingServer: true }));\n  if (!webServer) return webServer;\n  return { ...webServer, reuseExistingServer: true };\n}\n\nexport default { ...config, webServer: reuseExistingWebServer(config.webServer) };\n`;
}
