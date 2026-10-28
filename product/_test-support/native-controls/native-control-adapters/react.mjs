import path from 'node:path';

function assertOptionalBoolean(value, field, componentId) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new Error(`${componentId}/react native-control fixture ${field} must be a boolean when provided`);
  }
}

export function validateReactNativeControlContract(contract, componentId) {
  if (typeof contract.exportName !== 'string' || !contract.exportName.trim()) {
    throw new Error(`${componentId}/react native-control fixture requires exportName`);
  }
  if (contract.props !== undefined && (contract.props === null || typeof contract.props !== 'object' || Array.isArray(contract.props))) {
    throw new Error(`${componentId}/react native-control fixture props must be an object when provided`);
  }
  assertOptionalBoolean(contract.select, 'select', componentId);
  assertOptionalBoolean(contract.label, 'label', componentId);
  assertOptionalBoolean(contract.hydrate, 'hydrate', componentId);
  return contract;
}

function controlSource(contract) {
  const props = JSON.stringify({ id: 'control', ...(contract.props ?? {}) });
  if (contract.select) {
    return `createElement(${contract.exportName},${props},createElement('option',{value:'one'},'One'),createElement('option',{value:'two'},'Two'))`;
  }
  return `createElement(${contract.exportName},${props}${contract.content === undefined ? '' : `,${JSON.stringify(contract.content)}`})`;
}

export async function buildNativeControlPortFixture({ componentId, contract, outDir, page, writeClient, writeFile, root }) {
  validateReactNativeControlContract(contract, componentId);
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const module = await import(`@vyrnforge/react/${componentId}`);
  const Component = module[contract.exportName];
  if (!Component) throw new Error(`${componentId}/react does not export ${contract.exportName}`);
  const props = { id: 'control', ...(contract.props ?? {}) };
  const control = contract.select
    ? createElement(Component, props, createElement('option', { value: 'one' }, 'One'), createElement('option', { value: 'two' }, 'Two'))
    : createElement(Component, props, contract.content);
  const label = contract.label === false ? null : createElement('label', { htmlFor: 'control' }, componentId);
  const markup = renderToString(createElement('form', { id: 'form' }, label, control));
  let script = '';
  if (contract.hydrate) {
    const labelSource = contract.label === false ? '' : `createElement('label',{htmlFor:'control'},${JSON.stringify(componentId)}),`;
    await writeClient(outDir, 'react.ts', `import{createElement}from'react';import{hydrateRoot}from'react-dom/client';import{${contract.exportName}}from'@vyrnforge/react/${componentId}';const app=createElement('form',{id:'form'},${labelSource}${controlSource(contract)});hydrateRoot(document.querySelector('#react-root'),app);`, root);
    script = '<script type="module" src="./react.js"></script>';
  }
  await writeFile(path.join(outDir, 'react.html'), page(componentId, `<div id="react-root">${markup}</div>`, script));
}
