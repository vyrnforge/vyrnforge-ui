import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  Heading,
  Text,
  TextInput
} from "@dravyn/ui-components";
import type { DocsRoute } from "./docsRegistry";

type MetadataPageProps = {
  route: DocsRoute;
};

type MetadataRecord = Record<string, unknown>;

function parseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): MetadataRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as MetadataRecord)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toText(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatJson(content: string) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

function statusVariant(status: string) {
  if (status === "stable" || status === "current") {
    return "success";
  }

  if (status === "experimental") {
    return "warning";
  }

  if (status === "deprecated") {
    return "danger";
  }

  return "info";
}

function MetadataList({ items }: { items: unknown[] }) {
  return (
    <div className="docs-metadata-list">
      {items.map((item, index) => (
        <span className="docs-metadata-pill" key={`${toText(item)}-${index}`}>
          {toText(item)}
        </span>
      ))}
    </div>
  );
}

function MetadataKeyValues({ record }: { record: MetadataRecord }) {
  return (
    <dl className="docs-metadata-kv">
      {Object.entries(record).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{Array.isArray(value) ? <MetadataList items={value} /> : toText(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function PackagesMetadata({ data }: { data: MetadataRecord }) {
  const packages = asArray(data.packages).map(asRecord);

  return (
    <div className="docs-metadata-grid">
      {packages.map((packageInfo) => (
        <Card className="docs-metadata-card" key={toText(packageInfo.name)} padding="lg">
          <div className="docs-metadata-card__header">
            <Heading level={3} size="md">
              {toText(packageInfo.name)}
            </Heading>
            <Badge tone="subtle" variant="info">
              {toText(packageInfo.status)}
            </Badge>
          </div>
          <Text>{toText(packageInfo.purpose)}</Text>
          <MetadataKeyValues
            record={{
              owns: packageInfo.owns,
              doesNotOwn: packageInfo.doesNotOwn,
              cssImport: packageInfo.cssImport,
              dependsOn: packageInfo.dependsOn,
              mustNotDependOn: packageInfo.mustNotDependOn,
              publicEntryPoints: packageInfo.publicEntryPoints,
              notes: packageInfo.notes
            }}
          />
        </Card>
      ))}
    </div>
  );
}

function ComponentsMetadata({ data }: { data: MetadataRecord }) {
  const [query, setQuery] = useState("");
  const components = asArray(data.components).map(asRecord);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredComponents = useMemo(
    () =>
      components.filter((component) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          component.name,
          component.package,
          component.category,
          component.status,
          component.purpose,
          component.aiUsageNotes
        ]
          .map(toText)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [components, normalizedQuery]
  );

  return (
    <div className="docs-metadata">
      <Card className="docs-metadata-toolbar" padding="md">
        <TextInput
          aria-label="Search component metadata"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, package, category, status, or usage note"
          value={query}
        />
        <Text tone="muted" size="sm">
          Showing {filteredComponents.length} of {components.length} components
        </Text>
      </Card>
      <div className="docs-metadata-grid">
        {filteredComponents.map((component) => (
          <Card className="docs-metadata-card" key={toText(component.id)} padding="lg">
            <div className="docs-metadata-card__header">
              <div>
                <Heading level={3} size="md">
                  {toText(component.name)}
                </Heading>
                <code>{toText(component.package)}</code>
              </div>
              <Badge
                tone="subtle"
                variant={statusVariant(toText(component.status))}
              >
                {toText(component.status)}
              </Badge>
            </div>
            <Text>{toText(component.purpose)}</Text>
            <MetadataKeyValues
              record={{
                category: component.category,
                useWhen: component.useWhen,
                avoidWhen: component.avoidWhen,
                relatedComponents: component.relatedComponents,
                cssClasses: component.cssClasses,
                cssVariables: component.cssVariables,
                importExample: component.importExample,
                basicUsageExample: component.basicUsageExample,
                accessibilityNotes: component.accessibilityNotes,
                aiUsageNotes: component.aiUsageNotes
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

function CssImportsMetadata({ data }: { data: MetadataRecord }) {
  const imports = asArray(data.imports).map(asRecord);

  return (
    <div className="docs-metadata">
      <Card className="docs-metadata-card" padding="lg">
        <Heading level={3} size="md">
          Recommended import order
        </Heading>
        <MetadataList items={asArray(data.recommendedOrder)} />
      </Card>
      <div className="docs-metadata-grid">
        {imports.map((item) => (
          <Card className="docs-metadata-card" key={toText(item.importPath)} padding="lg">
            <Heading level={3} size="md">
              {toText(item.package)}
            </Heading>
            <code>{toText(item.importPath)}</code>
            <MetadataKeyValues
              record={{
                requiredFor: item.requiredFor,
                mustComeBefore: item.mustComeBefore,
                notes: item.notes
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

function StateContractsMetadata({ data }: { data: MetadataRecord }) {
  const ownership = asRecord(data.stateOwnership);
  const policies = asRecord(data.policies);

  return (
    <div className="docs-metadata">
      <div className="docs-metadata-grid">
        {Object.entries(ownership).map(([key, value]) => (
          <Card className="docs-metadata-card" key={key} padding="lg">
            <Heading level={3} size="md">
              {key}
            </Heading>
            <MetadataKeyValues record={asRecord(value)} />
          </Card>
        ))}
      </div>
      <Card className="docs-metadata-card" padding="lg">
        <Heading level={3} size="md">
          Policies
        </Heading>
        <div className="docs-metadata-grid docs-metadata-grid--compact">
          {Object.entries(policies).map(([key, value]) => (
            <article className="docs-metadata-subcard" key={key}>
              <h4>{key}</h4>
              <MetadataKeyValues record={asRecord(value)} />
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AiRulesMetadata({ data }: { data: MetadataRecord }) {
  const rules = asArray(data.rules).map(asRecord);

  return (
    <div className="docs-metadata-grid">
      {rules.map((rule) => (
        <Card className="docs-metadata-card" key={toText(rule.id)} padding="lg">
          <div className="docs-metadata-card__header">
            <Heading level={3} size="md">
              {toText(rule.id)}
            </Heading>
            <Badge tone="subtle" variant="info">
              AI rule
            </Badge>
          </div>
          <Text>{toText(rule.rule)}</Text>
          <Text tone="muted" size="sm">
            {toText(rule.reason)}
          </Text>
        </Card>
      ))}
    </div>
  );
}

export function MetadataPage({ route }: MetadataPageProps) {
  const data = asRecord(parseJson(route.content ?? ""));

  return (
    <div className="docs-reference">
      <Card className="docs-metadata-note" padding="md">
        <Text tone="muted">
          Metadata is a structured index for AI and the docs app. Markdown docs
          remain the source of truth for project direction.
        </Text>
      </Card>
      {route.id === "metadata-packages" && <PackagesMetadata data={data} />}
      {route.id === "metadata-components" && <ComponentsMetadata data={data} />}
      {route.id === "metadata-css-imports" && <CssImportsMetadata data={data} />}
      {route.id === "metadata-state-contracts" && (
        <StateContractsMetadata data={data} />
      )}
      {route.id === "metadata-ai-usage-rules" && <AiRulesMetadata data={data} />}
      <details className="docs-metadata-raw">
        <summary>Raw JSON</summary>
        <pre className="docs-markdown__code">
          <code>{formatJson(route.content ?? "")}</code>
        </pre>
      </details>
    </div>
  );
}
