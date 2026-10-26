import { readFile } from 'node:fs/promises';
import { discoverProductUnits, productPreparationProblems } from '../testing/discover-product-units.mjs';

const inventory = [
  'button',
  'link',
  'toggle-button',
  'input',
  'textarea',
  'number-input',
  'checkbox',
  'radio',
  'switch',
  'native-select',
  'slider',
  'file-input',
  'color-input',
  'temporal-input',
];
const specializedAliases = ['search-input', 'email-input', 'password-input', 'tel-input', 'url-input'];
const discovery = discoverProductUnits();
const preparationProblems = productPreparationProblems();
const manifests = Object.fromEntries(await Promise.all(['web', 'react', 'angular', 'vue', 'elements'].map(async (port) => [port, JSON.parse(await readFile(`packages/${port}/package.json`, 'utf8'))])));
const aggregateCss = await readFile('packages/web/src/styles.css', 'utf8');
const inputSource = await readFile('packages/web/src/components/input/index.ts', 'utf8');
const toggleSource = await readFile('packages/web/src/components/toggle-button/index.ts', 'utf8');
const temporalSource = await readFile('packages/web/src/components/temporal-input/index.ts', 'utf8');

if (preparationProblems.length) {
  const controlProblems = preparationProblems.filter((problem) => inventory.some((component) => problem.includes(component)));
  if (controlProblems.length) throw new Error(`Interactive control primitive public-product preparation failed:\n- ${controlProblems.join('\n- ')}`);
}

for (const componentId of inventory) {
  const component = discovery.components.find((entry) => entry.component === componentId);
  if (!component) throw new Error(`Interactive control primitive inventory is missing discovered component: ${componentId}`);
  for (const port of ['web', 'react', 'angular', 'vue']) {
    if (!component.ports?.[port]) throw new Error(`${componentId} is missing required interactive control ${port} port`);
  }
  if (component.ports.elements) throw new Error(`${componentId} must remain native-first and must not introduce a redundant Custom Element wrapper`);
  if (!component.exampleManifests.length) throw new Error(`${componentId} is missing executable documentation examples`);
  if (!component.conformanceTypes) throw new Error(`${componentId} is missing cross-port public API conformance evidence`);
  if (!aggregateCss.includes(`./components/${componentId}/${componentId}.css`)) throw new Error(`Aggregate Web CSS is missing interactive control component: ${componentId}`);
}

for (const componentId of inventory) {
  if (!manifests.web.exports?.[`./styles/${componentId}.css`]) throw new Error(`@vyrnforge/web is missing ./styles/${componentId}.css`);
  for (const port of ['react', 'angular', 'vue']) {
    if (!manifests[port].exports?.[`./${componentId}`]) throw new Error(`@vyrnforge/${port} is missing ./${componentId}`);
  }
  if (manifests.elements.exports?.[`./${componentId}`]) throw new Error(`@vyrnforge/elements must not wrap native interactive control ${componentId}`);
}

for (const alias of specializedAliases) {
  for (const port of ['react', 'angular', 'vue', 'elements']) {
    if (manifests[port].exports?.[`./${alias}`]) throw new Error(`Interactive controls must use Input type vocabulary instead of public ${alias}`);
  }
}
for (const type of ['text', 'email', 'password', 'search', 'tel', 'url']) {
  if (!inputSource.includes(`'${type}'`)) throw new Error(`Input type vocabulary is missing ${type}`);
}
for (const forbidden of ['checkbox', 'radio', 'range', 'file', 'color', 'date']) {
  if (inputSource.includes(`| '${forbidden}'`)) throw new Error(`Input must not absorb specialized interactive control type ${forbidden}`);
}

if (!manifests.web.exports?.['./toggle-button']) throw new Error('Native Web ToggleButton behavior connector is not public');
for (const token of ['aria-pressed', 'data-vf-pressed', 'defaultPressed', 'onPressedChange']) {
  if (!toggleSource.includes(token)) throw new Error(`Native Web ToggleButton connector is missing ${token}`);
}
if (!manifests.web.exports?.['./temporal-input']) throw new Error('TemporalInput type vocabulary is not public from @vyrnforge/web');
for (const type of ['date', 'time', 'datetime-local', 'month', 'week']) {
  if (!temporalSource.includes(`'${type}'`)) throw new Error(`TemporalInput type vocabulary is missing ${type}`);
}

const established = ['button', 'input', 'textarea'];
for (const componentId of established) {
  const component = discovery.components.find((entry) => entry.component === componentId);
  if (!component?.changeFragments.length) throw new Error(`Established interactive control component ${componentId} lacks repository evidence`);
}

process.stdout.write(`interactive control primitives readiness: ${inventory.length} controls resolved across Native Web, React, Angular, and Vue; Custom Elements remain native-first\n`);
