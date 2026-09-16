import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  Heading,
  SearchInput,
  Text,
} from "@vyrnforge/ui-components";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import { referenceModel } from "./docsContext";
import { docsRoutes } from "./docsRegistry";
import { discoveryRoutes } from "./discoveryRoutes";
import {
  accessibilityReferenceRecords,
  designTokenCategories,
  discoveryComponents,
  discoveryPackages,
  patternReferenceRecords,
} from "./discoveryData";
import { docsLinks } from "./deploymentLinks";

type SearchEntry = {
  id: string;
  title: string;
  description: string;
  domain: string;
  keywords: string[];
  href: string;
};

function recordHref(domain: string, id: string) {
  return `#${getReferenceRecordRoute(referenceModel, domain, id)}`;
}

function buildSearchEntries(): SearchEntry[] {
  const routes = [...docsRoutes, ...discoveryRoutes].map((route) => ({
    id: `guide:${route.id}`,
    title: route.title,
    description: route.description ?? route.sourcePath,
    domain: route.id === "api-import-and-setup" ? "setup" : "guide",
    keywords: [route.group, route.sourcePath, ...(route.tags ?? [])],
    href: `#/${route.id}`,
  }));

  const packages = discoveryPackages.map((entry) => ({
    id: `package:${entry.name}`,
    title: entry.name,
    description: entry.purpose,
    domain: "package",
    keywords: [entry.status, entry.releaseTrack ?? "", ...entry.publicEntryPoints],
    href: recordHref("packages", entry.name),
  }));

  const components = discoveryComponents.map((entry) => ({
    id: `component:${entry.id}`,
    title: entry.displayName,
    description: entry.purpose,
    domain: "component",
    keywords: [entry.id, entry.package, entry.category, entry.maturity],
    href: recordHref("components", entry.id),
  }));

  const tokens = designTokenCategories.map((entry) => ({
    id: `token:${entry.id}`,
    title: `${entry.id} tokens`,
    description: entry.purpose,
    domain: "token",
    keywords: entry.tokens.map((token) => token.name),
    href: recordHref("tokens", entry.id),
  }));

  const patterns = patternReferenceRecords.map((entry) => ({
    id: `pattern:${entry.id}`,
    title: entry.displayName,
    description: entry.purpose,
    domain: "pattern",
    keywords: [entry.category, ...entry.aiKeywords, ...entry.components],
    href: recordHref("patterns", entry.id),
  }));

  const accessibility = accessibilityReferenceRecords.map((entry) => ({
    id: `accessibility:${entry.id}`,
    title: `${entry.displayName} accessibility`,
    description: entry.notes,
    domain: "accessibility",
    keywords: [entry.id, entry.package, ...entry.contract],
    href: recordHref("accessibility", entry.id),
  }));

  const examples = referenceModel.examples.map((entry) => {
    const framework = referenceModel.frameworks.find(
      (candidate) => candidate.id === entry.framework,
    );
    const query = new URLSearchParams();
    query.set(referenceModel.frameworkContext.queryParameter, entry.framework);
    return {
      id: `example:${entry.id}`,
      title: `${framework?.label ?? entry.framework} executable example`,
      description: `Verified consumer fixture ${entry.id} · ${entry.entrypoint}`,
      domain: "example",
      keywords: [entry.framework, entry.entrypoint, entry.registry, entry.consumerManifest],
      href: `${docsLinks.playground}?${query.toString()}#${getReferenceRecordRoute(referenceModel, "examples", entry.id)}`,
    };
  });

  return [
    ...routes,
    ...packages,
    ...components,
    ...tokens,
    ...patterns,
    ...accessibility,
    ...examples,
  ];
}

const searchEntries = buildSearchEntries();

export function ReferenceSearchPage() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return searchEntries;
    return searchEntries.filter((entry) =>
      [entry.title, entry.description, entry.domain, ...entry.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [normalized]);

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Search the VyrnForge Reference model
        </Heading>
        <Text tone="muted">
          This is a derived index only. Results route to the canonical or generated reader that owns each fact.
        </Text>
        <SearchInput
          aria-label="Search VyrnForge Reference records"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search setup, packages, components, tokens, patterns, accessibility, examples…"
          value={query}
        />
      </Card>
      <Text size="sm" tone="muted">
        {results.length} of {searchEntries.length} reference records
      </Text>
      <div className="vf-docs-discovery-list">
        {results.map((entry) => (
          <Card key={entry.id} padding="lg">
            <div className="vf-docs-discovery-row__heading">
              <Heading level={3} size="md">
                <a href={entry.href}>{entry.title}</a>
              </Heading>
              <Badge size="sm" tone="subtle" variant="neutral">
                {entry.domain}
              </Badge>
            </div>
            <Text>{entry.description}</Text>
          </Card>
        ))}
      </div>
      {results.length === 0 ? (
        <Card padding="lg">
          <Heading level={3} size="md">
            No reference records found
          </Heading>
          <Text tone="muted">Try a component, token name, pattern keyword, package, framework, or setup term.</Text>
        </Card>
      ) : null}
    </div>
  );
}
