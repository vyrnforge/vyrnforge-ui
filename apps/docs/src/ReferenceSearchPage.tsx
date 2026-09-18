import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  Heading,
  SearchInput,
  Text,
} from "@vyrnforge/ui-components";
import frameworkApiReferenceRaw from "../../../docs/generated/framework-api-reference.json?raw";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import { referenceModel } from "./docsContext";
import {
  accessibilityReferenceRecords,
  designTokenCategories,
  discoveryComponents,
  discoveryPackages,
  patternReferenceRecords,
} from "./discoveryData";
import { docsLinks } from "./deploymentLinks";
import { docsRoutes } from "./referenceRoutes";

type SearchEntry = {
  id: string;
  title: string;
  description: string;
  domain: string;
  keywords: string[];
  href: string;
};

type SearchApiComponent = {
  id: string;
  properties: Array<{ public: string; binding: string; type: string }>;
  events: Array<{ public: string; mode: string; detail: string }>;
  slots: Array<{ public: string; mode: string; content: string }>;
  methods: Array<{
    name: string;
    returns: string;
    parameters: Array<{ name: string; type: string }>;
  }>;
};

type SearchApiReference = {
  surfaces: Record<string, { components: SearchApiComponent[] }>;
};

const apiReference = JSON.parse(frameworkApiReferenceRaw) as SearchApiReference;

function recordHref(domain: string, id: string) {
  return `#${getReferenceRecordRoute(referenceModel, domain, id)}`;
}

function memberAnchor(kind: string, name: string) {
  return `api-${kind}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}`;
}

function memberHref(componentId: string, frameworkId: string, member: string) {
  const query = new URLSearchParams({
    [referenceModel.frameworkContext.queryParameter]: frameworkId,
  });
  const route = getReferenceRecordRoute(\n    referenceModel,\n    "components",\n    componentId,\n  );
  return `?${query.toString()}#${route}?member=${encodeURIComponent(member)}`;
}

function buildApiMemberEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const framework of referenceModel.frameworks) {
    const surface = apiReference.surfaces[framework.apiSurface];
    if (!surface) continue;

    for (const component of surface.components) {
      const componentRecord = discoveryComponents.find(
        (candidate) => candidate.id === component.id,
      );
      const componentName = componentRecord?.displayName ?? component.id;
      const baseKeywords = [
        component.id,
        componentName,
        framework.id,
        framework.label,
      ];

      for (const property of component.properties) {
        const anchor = memberAnchor("property", property.public);
        entries.push({
          id: `api:${framework.id}:${component.id}:property:${property.public}`,
          title: `${componentName}.${property.public}`,
          description: `${framework.label} property / input · ${property.type}`,
          domain: `${framework.label} property`,
          keywords: [
            ...baseKeywords,
            "property",
            "input",
            property.public,
            property.binding,
            property.type,
          ],
          href: memberHref(component.id, framework.id, anchor),
        });
      }

      for (const event of component.events) {
        const anchor = memberAnchor("event", event.public);
        entries.push({
          id: `api:${framework.id}:${component.id}:event:${event.public}`,
          title: `${componentName}.${event.public}`,
          description: `${framework.label} event / output / emit · ${event.detail}`,
          domain: `${framework.label} event`,
          keywords: [
            ...baseKeywords,
            "event",
            "output",
            "emit",
            event.public,
            event.mode,
            event.detail,
          ],
          href: memberHref(component.id, framework.id, anchor),
        });
      }

      for (const slot of component.slots) {
        const anchor = memberAnchor("slot", slot.public);
        entries.push({
          id: `api:${framework.id}:${component.id}:slot:${slot.public}`,
          title: `${componentName}.${slot.public}`,
          description: `${framework.label} slot / template · ${slot.content}`,
          domain: `${framework.label} slot`,
          keywords: [
            ...baseKeywords,
            "slot",
            "template",
            slot.public,
            slot.mode,
            slot.content,
          ],
          href: memberHref(component.id, framework.id, anchor),
        });
      }

      for (const method of component.methods) {
        const anchor = memberAnchor("method", method.name);
        const parameters = method.parameters.flatMap((parameter) => [
          parameter.name,
          parameter.type,
        ]);
        entries.push({
          id: `api:${framework.id}:${component.id}:method:${method.name}`,
          title: `${componentName}.${method.name}()`,
          description: `${framework.label} method · returns ${method.returns}`,
          domain: `${framework.label} method`,
          keywords: [
            ...baseKeywords,
            "method",
            method.name,
            method.returns,
            ...parameters,
          ],
          href: memberHref(component.id, framework.id, anchor),
        });
      }
    }
  }

  return entries;
}

function buildSearchEntries(): SearchEntry[] {
  const routes = docsRoutes.map((route) => ({
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
    keywords: [
      entry.status,
      entry.releaseTrack ?? "",
      ...entry.publicEntryPoints,
    ],
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
      keywords: [
        entry.framework,
        entry.entrypoint,
        entry.registry,
        entry.consumerManifest,
      ],
      href: `${docsLinks.playground}?${query.toString()}#${getReferenceRecordRoute(referenceModel, "examples", entry.id)}`,
    };
  });

  return [
    ...routes,
    ...packages,
    ...components,
    ...buildApiMemberEntries(),
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
          This is a derived index only. Results route to the canonical or
          generated reader that owns each fact, including framework API members
          with stable component-member deep links.
        </Text>
        <SearchInput
          aria-label="Search VyrnForge Reference records"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search components, properties, events, slots, methods, tokens, patterns, examples…"
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
          <Text tone="muted">
            Try a component, API member, token name, pattern keyword, package,
            framework, or setup term.
          </Text>
        </Card>
      ) : null}
    </div>
  );
}
