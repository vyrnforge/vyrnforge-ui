import { discoverProductGraph } from './discover-product-graph.mjs';

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

export function impactProductView(graph = discoverProductGraph()) {
  return {
    packages: graph.packages.map(({ id, manifest }) => ({ name: id, manifest })),
    components: [...graph.components, ...graph.patterns].map((component) => {
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
        root: component.facets.root,
        roots,
        ports,
        metadataPath: component.metadataPath,
        documentationGroup: component.documentationGroup,
      };
    }),
    ownedUnits: graph.units
      .filter((unit) => unit.kind !== 'component' && unit.kind !== 'pattern')
      .map((unit) => {
        const legacyNodes = unit.legacyNodes ?? [];
        const primaryLegacy = legacyNodes[0] ?? null;
        const packages = unique([...(unit.packages ?? []), ...legacyNodes.map((legacy) => legacy.package)]);
        return {
          node: primaryLegacy?.node ?? unit.id,
          nodes: unique([unit.id, ...legacyNodes.map((legacy) => legacy.node)]),
          package: packages[0] ?? null,
          packages,
          kind: unit.kind,
          id: unit.unitId,
          sourcePath: unit.migration?.canonicalRoot ?? primaryLegacy?.sourcePath ?? unit.root,
          testPath: unit.testPath ?? primaryLegacy?.testPath ?? null,
          metadataPath: unit.metadataPath ?? primaryLegacy?.metadataPath ?? null,
          paths: unique([
            unit.root,
            unit.migration?.canonicalRoot,
            unit.testPath,
            unit.metadataPath,
            ...legacyNodes.flatMap((legacy) => [legacy.sourcePath, legacy.testPath, legacy.metadataPath]),
          ]),
          dependencies: [...(unit.dependencies ?? [])],
        };
      }),
  };
}
