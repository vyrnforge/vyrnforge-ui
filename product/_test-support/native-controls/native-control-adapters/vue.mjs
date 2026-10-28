import path from 'node:path';

function assertOptionalBoolean(value, field, componentId) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new Error(`${componentId}/vue native-control fixture ${field} must be a boolean when provided`);
  }
}

export function validateVueNativeControlContract(contract, componentId) {
  if (typeof contract.exportName !== 'string' || !contract.exportName.trim()) {
    throw new Error(`${componentId}/vue native-control fixture requires exportName`);
  }
  if (contract.props !== undefined && (contract.props === null || typeof contract.props !== 'object' || Array.isArray(contract.props))) {
    throw new Error(`${componentId}/vue native-control fixture props must be an object when provided`);
  }
  assertOptionalBoolean(contract.select, 'select', componentId);
  assertOptionalBoolean(contract.label, 'label', componentId);
  assertOptionalBoolean(contract.hydrate, 'hydrate', componentId);
  return contract;
}

function initialProps(props = {}) {
  const { defaultValue, defaultChecked, ...rest } = props;
  return { ...rest, ...(defaultValue !== undefined ? { value: defaultValue } : {}), ...(defaultChecked !== undefined ? { checked: defaultChecked } : {}) };
}

function controlSource(contract) {
  const props = JSON.stringify({ id: 'control', ...initialProps(contract.props) });
  if (contract.select) {
    return `h(${contract.exportName},${props},()=>[h('option',{value:'one'},'One'),h('option',{value:'two'},'Two')])`;
  }
  return `h(${contract.exportName},${props}${contract.content === undefined ? '' : `,()=>${JSON.stringify(contract.content)}`})`;
}

export async function buildNativeControlPortFixture({ componentId, contract, outDir, page, writeClient, writeFile, root }) {
  validateVueNativeControlContract(contract, componentId);
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const module = await import(`@vyrnforge/vue/${componentId}`);
  const Component = module[contract.exportName];
  if (!Component) throw new Error(`${componentId}/vue does not export ${contract.exportName}`);
  const props = initialProps(contract.props);
  const app = createSSRApp({ render: () => h('form', { id: 'form' }, [
    ...(contract.label === false ? [] : [h('label', { for: 'control' }, componentId)]),
    contract.select
      ? h(Component, { id: 'control', ...props }, () => [h('option', { value: 'one', selected: props.value === 'one' }, 'One'), h('option', { value: 'two', selected: props.value === 'two' }, 'Two')])
      : h(Component, { id: 'control', ...props }, contract.content === undefined ? undefined : () => contract.content),
  ]) });
  const markup = await renderToString(app);
  let script = '';
  if (contract.hydrate) {
    const labelSource = contract.label === false ? '' : `h('label',{for:'control'},${JSON.stringify(componentId)}),`;
    await writeClient(outDir, 'vue.ts', `import{createSSRApp,h}from'vue';import{${contract.exportName}}from'@vyrnforge/vue/${componentId}';const app=createSSRApp({render:()=>h('form',{id:'form'},[${labelSource}${controlSource(contract)}])});app.mount('#vue-root');`, root);
    script = '<script type="module" src="./vue.js"></script>';
  }
  await writeFile(path.join(outDir, 'vue.html'), page(componentId, `<div id="vue-root">${markup}</div>`, script));
}
