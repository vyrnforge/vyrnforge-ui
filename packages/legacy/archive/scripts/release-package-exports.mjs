export function exportSpecifier(packageName, exportKey) {
  return exportKey === "."
    ? packageName
    : `${packageName}/${exportKey.replace(/^\.\//u, "")}`;
}

export function collectStringTargets(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStringTargets);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStringTargets);
  }
  return [];
}

export function collectPackageExportEntries(packageName, exportsMap = {}) {
  return Object.entries(exportsMap)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([exportKey, value]) => ({
      exportKey,
      specifier: exportSpecifier(packageName, exportKey),
      targets: collectStringTargets(value),
      value,
    }));
}
