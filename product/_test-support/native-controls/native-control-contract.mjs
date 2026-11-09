import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverComponentRoots } from '../../../tooling/product/component-paths.mjs';

export function validateNativeControlContract(contract, componentId, file = `product/${componentId}/test/native-contract.mjs`) {
  if (!contract || contract.id !== componentId) throw new Error(`${file} must default-export a contract with id ${componentId}`);
  if (!contract.semantics?.tag) throw new Error(`${file} is missing shared native-control semantics.tag`);
  if (contract.styleDependencies !== undefined && !Array.isArray(contract.styleDependencies)) {
    throw new Error(`${file} styleDependencies must be an array when provided`);
  }
  if (contract.assertBrowser !== undefined && typeof contract.assertBrowser !== 'function') {
    throw new Error(`${file} assertBrowser must be a function when provided`);
  }
  if (contract.reducedMotion !== undefined && typeof contract.reducedMotion !== 'boolean') {
    throw new Error(`${file} reducedMotion must be a boolean when provided`);
  }
  return contract;
}

export async function loadNativeControlContract(componentId) {
  if (!/^[a-z][a-z0-9-]*$/.test(componentId)) throw new Error(`Invalid component id: ${componentId}`);
  const root = process.cwd();
  const canonicalRoot = discoverComponentRoots(root).get(componentId)?.root;
  const file = path.resolve(root, canonicalRoot ?? `product/${componentId}`, 'test', 'native-contract.mjs');
  const module = await import(pathToFileURL(file).href);
  return validateNativeControlContract(module.default, componentId, file);
}
