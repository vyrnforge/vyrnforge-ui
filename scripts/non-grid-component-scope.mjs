const excludedCategories = new Set(["data-grid", "grid-feature"]);

export function isPublicNonGridBetaComponent(component) {
  return (
    component?.publicExport === true &&
    component.frameworkParity?.betaScope === "included" &&
    !excludedCategories.has(component.category)
  );
}

export function getPublicNonGridBetaComponents(catalog) {
  return (catalog.components ?? [])
    .filter(isPublicNonGridBetaComponent)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getPublicNonGridBetaComponentIds(catalog) {
  const components = getPublicNonGridBetaComponents(catalog);
  return components.map((component) => component.id);
}
