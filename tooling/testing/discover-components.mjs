import { discoverProductUnits, productPreparationProblems, assertProductPreparation } from './discover-product-units.mjs';

export function discoverComponents(root) {
  const discovery = discoverProductUnits(root);
  return { components: discovery.components, frameworkExports: discovery.frameworkExports };
}

export function componentPreparationProblems(root) {
  return productPreparationProblems(root);
}

export function assertComponentPreparation(root) {
  return assertProductPreparation(root).components;
}
