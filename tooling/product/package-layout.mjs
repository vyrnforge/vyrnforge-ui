const componentDirectoryTargets = new Set(['react', 'vue', 'elements']);

function assertComponentId(componentId) {
  if (!/^[a-z][a-z0-9-]*$/.test(componentId)) {
    throw new Error(`Invalid component id for package projection: ${componentId}`);
  }
}

/**
 * Return the repository path where a component surface is projected inside an
 * existing public package. These are distribution-shell paths, not authoring
 * paths and not public import specifiers.
 *
 * Core is intentionally not inferred here. Renderer-neutral component logic
 * must first prove the reusable capability/public-subpath it projects to rather
 * than assuming a component-shaped Core destination.
 */
export function componentPackageProjectionPath(target, componentId) {
  assertComponentId(componentId);

  if (target === 'web') return `packages/web/src/components/${componentId}/`;
  if (target === 'angular') return `packages/angular/${componentId}/src/`;
  if (componentDirectoryTargets.has(target)) {
    return `packages/${target}/src/components/${componentId}/`;
  }
  return null;
}
