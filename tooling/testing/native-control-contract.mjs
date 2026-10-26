import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadNativeControlContract(componentId) {
  if (!/^[a-z][a-z0-9-]*$/.test(componentId)) throw new Error(`Invalid component id: ${componentId}`);
  const file = path.resolve('product', componentId, 'test', 'native-contract.mjs');
  const module = await import(pathToFileURL(file).href);
  const contract = module.default;
  if (!contract || contract.id !== componentId) throw new Error(`${file} must default-export a contract with id ${componentId}`);
  if (!contract.exportName || !contract.angularName || !contract.markup || !contract.angular || !contract.hook || !contract.semantics?.tag) {
    throw new Error(`${file} is missing required native-control contract fields`);
  }
  return contract;
}
