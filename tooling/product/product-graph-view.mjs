import { discoverProductGraph } from './discover-product-graph.mjs';

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

export function impactProductView(graph = discoverProductGraph()) {
  return {
    packages: graph.packages.map(({ id, manifest }) => ({ name: id, manifest })),
    components: graph.components.map((component) => {
      const ports = Object.fromEntries(
        Object.values(component.surfaces).map((surface) => [surface.target, {
          paths: unique([...surface.authoringPaths, ...surface.legacyPaths]),
          browser: surface.browser,
          dependencies: [...surface.dependencies],
          types: surface.types,
          ssr: surface.ssr,
        }]),
      );
      const roots = unique([
        component.facets.canonicalRoot,
        component.facets.legacyRoot,
        component.facets.root,
      ]);
      return {
        component: component.unitId,
        status: component.status,
        root: roots[0] ?? component.facets.root,
        roots,
        ports,
        metadataPath: component.metadataPath,
        documentationGroup: component.documentationGroup,
      };
    }),
    ownedUnits: graph.units
      .filter((unit) => unit.kind !== 'component')
      .map((unit) => {
        const legacyNodes = unit.legacyNodes ?? [];
        const primaryLegacy = legacyNodes[0] ?? null;
        return {
          node: primaryLegacy?.node ?? unit.id,
          nodes: unique([unit.id, ...legacyNodes.map((legacy) => legacy.node)]),
          package: unit.packages?.[0] ?? primaryLegacy?.package ?? null,
          packages: unique(unit.packages ?? legacyNodes.map((legacy) => legacy.package)),
          kind: unit.kind,
          id: unit.unitId,
          sourcePath: unit.migration?.canonicalRoot ?? primaryLegacy?.sourcePath ?? unit.root,
          testPath: primaryLegacy?.testPath ?? null,
          metadataPath: primaryLegacy?.metadataPath ?? null,
          paths: unique([
            unit.root,
            unit.migration?.canonicalRoot,
            ...legacyNodes.flatMap((legacy) => [legacy.sourcePath, legacy.testPath, legacy.metadataPath]),
          ]),
          dependencies: [...(unit.dependencies ?? [])],
        };
      }),
  };
}
