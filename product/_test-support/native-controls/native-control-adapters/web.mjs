import path from 'node:path';

export function validateWebNativeControlContract(contract, componentId) {
  if (typeof contract.markup !== 'string' || !contract.markup.trim()) {
    throw new Error(`${componentId}/web native-control fixture requires markup`);
  }
  if (contract.webConnector !== undefined && (typeof contract.webConnector !== 'string' || !contract.webConnector.trim())) {
    throw new Error(`${componentId}/web native-control fixture webConnector must be a non-empty string when provided`);
  }
  if (contract.webInlineScript !== undefined && (typeof contract.webInlineScript !== 'string' || !contract.webInlineScript.trim())) {
    throw new Error(`${componentId}/web native-control fixture webInlineScript must be a non-empty string when provided`);
  }
  if (contract.webConnector && contract.webInlineScript) {
    throw new Error(`${componentId}/web native-control fixture must not define both webConnector and webInlineScript`);
  }
  return contract;
}

export async function buildNativeControlPortFixture({ componentId, contract, outDir, page, writeClient, writeFile, root }) {
  validateWebNativeControlContract(contract, componentId);
  let script = '';
  if (contract.webConnector) {
    await writeClient(outDir, 'web.ts', `import{${contract.webConnector}}from'@vyrnforge/web/${componentId}';${contract.webConnector}(document.querySelector('#control'));`, root);
    script = '<script type="module" src="./web.js"></script>';
  } else if (contract.webInlineScript) {
    script = `<script>${contract.webInlineScript}</script>`;
  }
  await writeFile(path.join(outDir, 'web.html'), page(componentId, `<form id="form">${contract.markup}</form>`, script));
}
