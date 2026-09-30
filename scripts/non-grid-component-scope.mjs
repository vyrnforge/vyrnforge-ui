const excludedCategories = new Set(["data-grid", "grid-feature"]);

export function isPublicNonGridBetaComponent(component) {
  return Boolean(
    component &&
      component.publicExport === true &&
      component.frameworkParity?.betaScope === "included" &&
      !excludedCategories.has(component.category),
  );
}

export function getPublicNonGridBetaComponents(catalog) {
  return (catalog.components ?? [])
    .filter(isPublicNonGridBetaComponent)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getPublicNonGridBetaComponentIds(catalog) {
  return getPublicNonGridBetaComponents(catalog).map((component) => component.id);
}
