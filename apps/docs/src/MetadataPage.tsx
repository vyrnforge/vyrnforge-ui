import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Badge,
  Card,
  EmptyState,
  Heading,
  InlineMessage,
  SearchInput,
  Select,
  Text,
} from "@vyrnforge/ui-components";
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

function uniqueValues(records: MetadataRecord[], key: string) {
  return Array.from(new Set(records.map((record) => toText(record[key])).filter(Boolean))).sort();
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

function MetadataChips({ items }: { items: unknown[] }) {
  if (items.length === 0) {
    return <span className="dv-docs-muted-inline">None</span>;
  }

  return (
    <div className="dv-docs-metadata-chips">
      {items.map((item, index) => (
        <span className="dv-docs-metadata-chip" key={`${toText(item)}-${index}`}>
          {toText(item)}
        </span>
      ))}
    </div>
  );
}

function CodeBlock({ value }: { value: unknown }) {
  const text = toText(value);

  if (!text) {
    return <span className="dv-docs-muted-inline">None</span>;
  }

  return (
    <pre className="dv-docs-metadata-code">
      <code>{text}</code>
    </pre>
  );
}

function DetailSection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="dv-docs-metadata-detail__section">
      <Heading level={4} size="sm">
        {title}
      </Heading>
      {children}
    </section>
  );
}

function SelectFilter({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="dv-docs-metadata-filter">
      <span>{label}</span>
      <Select
        onChange={(event) => onChange(event.target.value)}
        options={[
          { label: "All", value: "all" },
          ...options.map((option) => ({ label: option, value: option }))
        ]}
        size="sm"
        value={value}
      />
    </label>
  );
}

function MetadataToolbar({
  children,
  count,
  searchLabel,
  searchPlaceholder,
  total,
  value,
  onSearch
}: {
  children?: ReactNode;
  count: number;
  searchLabel: string;
  searchPlaceholder: string;
  total: number;
  value: string;
  onSearch: (value: string) => void;
}) {
  return (
    <div className="dv-docs-metadata-toolbar" role="search">
      <SearchInput
        aria-label={searchLabel}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={searchPlaceholder}
        size="sm"
        value={value}
      />
      <div className="dv-docs-metadata-toolbar__filters">{children}</div>
      <Text className="dv-docs-metadata-count" tone="muted" size="sm">
        {count} of {total}
      </Text>
    </div>
  );
}

function PackagesMetadata({ data }: { data: MetadataRecord }) {
  const [query, setQuery] = useState("");
  const packages = useMemo(() => asArray(data.packages).map(asRecord), [data]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPackages = useMemo(
    () =>
      packages.filter((packageInfo) =>
        [
          packageInfo.name,
          packageInfo.purpose,
          packageInfo.status,
          packageInfo.cssImport,
          packageInfo.notes
        ]
          .map(toText)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, packages]
  );

  return (
    <div className="dv-docs-metadata">
      <MetadataToolbar
        count={filteredPackages.length}
        onSearch={setQuery}
        searchLabel="Search package metadata"
        searchPlaceholder="Search packages"
        total={packages.length}
        value={query}
      />
      <div className="dv-docs-metadata-table dv-docs-metadata-table--packages">
        <div className="dv-docs-metadata-table__head">
          <span>Package</span>
          <span>Status</span>
          <span>CSS import</span>
          <span>Purpose</span>
        </div>
        {filteredPackages.map((packageInfo) => (
          <article className="dv-docs-metadata-table__row" key={toText(packageInfo.name)}>
            <div>
              <strong>{toText(packageInfo.name)}</strong>
              <Text tone="muted" size="sm">
                {toText(packageInfo.notes)}
              </Text>
            </div>
            <Badge tone="subtle" variant={statusVariant(toText(packageInfo.status))}>
              {toText(packageInfo.status)}
            </Badge>
            <code>{toText(packageInfo.cssImport)}</code>
            <Text>{toText(packageInfo.purpose)}</Text>
          </article>
        ))}
      </div>
      {filteredPackages.map((packageInfo) => (
        <Card className="dv-docs-metadata-summary" key={`${toText(packageInfo.name)}-details`} padding="md">
          <Heading level={3} size="sm">
            {toText(packageInfo.name)} boundaries
          </Heading>
          <div className="dv-docs-metadata-summary__grid">
            <DetailSection title="Owns">
              <MetadataChips items={asArray(packageInfo.owns)} />
            </DetailSection>
            <DetailSection title="Does not own">
              <MetadataChips items={asArray(packageInfo.doesNotOwn)} />
            </DetailSection>
            <DetailSection title="Depends on">
              <MetadataChips items={asArray(packageInfo.dependsOn)} />
            </DetailSection>
            <DetailSection title="Must not depend on">
              <MetadataChips items={asArray(packageInfo.mustNotDependOn)} />
            </DetailSection>
            <DetailSection title="Public entry points">
              <MetadataChips items={asArray(packageInfo.publicEntryPoints)} />
            </DetailSection>
          </div>
        </Card>
      ))}
      {filteredPackages.length === 0 && (
        <EmptyState
          className="dv-docs-metadata-empty"
          title="No packages found"
          description="No packages match the current search."
        />
      )}
    </div>
  );
}

function ComponentsMetadata({ data }: { data: MetadataRecord }) {
  const components = useMemo(() => asArray(data.components).map(asRecord), [data]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(() => toText(components[0]?.id));
  const [statusFilter, setStatusFilter] = useState("all");

  const categoryOptions = useMemo(() => uniqueValues(components, "category"), [components]);
  const packageOptions = useMemo(() => uniqueValues(components, "package"), [components]);
  const statusOptions = useMemo(() => uniqueValues(components, "status"), [components]);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredComponents = useMemo(
    () =>
      components.filter((component) => {
        const matchesQuery =
          !normalizedQuery ||
          [
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

        return (
          matchesQuery &&
          (packageFilter === "all" || toText(component.package) === packageFilter) &&
          (categoryFilter === "all" || toText(component.category) === categoryFilter) &&
          (statusFilter === "all" || toText(component.status) === statusFilter)
        );
      }),
    [categoryFilter, components, normalizedQuery, packageFilter, statusFilter]
  );

  useEffect(() => {
    if (filteredComponents.length === 0) {
      setSelectedId("");
      return;
    }

    if (!filteredComponents.some((component) => toText(component.id) === selectedId)) {
      setSelectedId(toText(filteredComponents[0].id));
    }
  }, [filteredComponents, selectedId]);

  const selectedComponent =
    filteredComponents.find((component) => toText(component.id) === selectedId) ??
    filteredComponents[0];

  return (
    <div className="dv-docs-metadata">
      <MetadataToolbar
        count={filteredComponents.length}
        onSearch={setQuery}
        searchLabel="Search component metadata"
        searchPlaceholder="Search components"
        total={components.length}
        value={query}
      >
        <SelectFilter
          label="Package"
          onChange={setPackageFilter}
          options={packageOptions}
          value={packageFilter}
        />
        <SelectFilter
          label="Category"
          onChange={setCategoryFilter}
          options={categoryOptions}
          value={categoryFilter}
        />
        <SelectFilter
          label="Status"
          onChange={setStatusFilter}
          options={statusOptions}
          value={statusFilter}
        />
      </MetadataToolbar>

      <div className="dv-docs-metadata-master-detail">
        <div className="dv-docs-metadata-table dv-docs-metadata-table--components">
          <div className="dv-docs-metadata-table__head">
            <span>Component</span>
            <span>Package</span>
            <span>Category</span>
            <span>Status</span>
            <span>Purpose summary</span>
          </div>
          {filteredComponents.map((component) => {
            const id = toText(component.id);

            return (
              <button
                aria-current={id === toText(selectedComponent?.id) ? "true" : undefined}
                className="dv-docs-metadata-table__row dv-docs-metadata-table__row--button"
                key={id}
                onClick={() => setSelectedId(id)}
                type="button"
              >
                <strong>{toText(component.name)}</strong>
                <span>{toText(component.package)}</span>
                <span>{toText(component.category)}</span>
                <Badge tone="subtle" variant={statusVariant(toText(component.status))}>
                  {toText(component.status)}
                </Badge>
                <span>{toText(component.purpose)}</span>
              </button>
            );
          })}
          {filteredComponents.length === 0 && (
            <EmptyState
              className="dv-docs-metadata-empty"
              title="No components found"
              description="No components match the current filters."
            />
          )}
        </div>

        {selectedComponent && <ComponentDetail component={selectedComponent} />}
      </div>
    </div>
  );
}

function ComponentDetail({ component }: { component: MetadataRecord }) {
  return (
    <Card
      className="dv-docs-metadata-detail"
      aria-label={`${toText(component.name)} details`}
      padding="md"
      role="complementary"
    >
      <div className="dv-docs-metadata-detail__header">
        <div>
          <Heading level={3} size="md">
            {toText(component.name)}
          </Heading>
          <Text tone="muted" size="sm">
            {toText(component.package)} / {toText(component.category)}
          </Text>
        </div>
        <Badge tone="subtle" variant={statusVariant(toText(component.status))}>
          {toText(component.status)}
        </Badge>
      </div>

      <DetailSection title="Purpose">
        <Text>{toText(component.purpose)}</Text>
      </DetailSection>
      <DetailSection title="Use when">
        <Text>{toText(component.useWhen)}</Text>
      </DetailSection>
      <DetailSection title="Avoid when">
        <Text>{toText(component.avoidWhen)}</Text>
      </DetailSection>
      <DetailSection title="Related components">
        <MetadataChips items={asArray(component.relatedComponents)} />
      </DetailSection>
      <DetailSection title="CSS classes">
        <MetadataChips items={asArray(component.cssClasses)} />
      </DetailSection>
      <DetailSection title="CSS variables">
        <MetadataChips items={asArray(component.cssVariables)} />
      </DetailSection>
      <DetailSection title="Import example">
        <CodeBlock value={component.importExample} />
      </DetailSection>
      <DetailSection title="Basic usage">
        <CodeBlock value={component.basicUsageExample} />
      </DetailSection>
      <DetailSection title="Accessibility notes">
        <Text>{toText(component.accessibilityNotes)}</Text>
      </DetailSection>
      <DetailSection title="AI usage notes">
        <Text>{toText(component.aiUsageNotes)}</Text>
      </DetailSection>
      <details className="dv-docs-metadata-raw dv-docs-metadata-raw--compact">
        <summary>Raw metadata</summary>
        <pre className="dv-docs-metadata-code">
          <code>{JSON.stringify(component, null, 2)}</code>
        </pre>
      </details>
    </Card>
  );
}

function CssImportsMetadata({ data }: { data: MetadataRecord }) {
  const imports = useMemo(() => asArray(data.imports).map(asRecord), [data]);

  return (
    <div className="dv-docs-metadata">
      <Card className="dv-docs-metadata-summary" padding="md">
        <Heading level={3} size="sm">
          Recommended import order
        </Heading>
        <ol className="dv-docs-metadata-order">
          {asArray(data.recommendedOrder).map((item, index) => (
            <li key={`${toText(item)}-${index}`}>
              <code>{toText(item)}</code>
            </li>
          ))}
        </ol>
      </Card>
      <div className="dv-docs-metadata-table dv-docs-metadata-table--imports">
        <div className="dv-docs-metadata-table__head">
          <span>Package</span>
          <span>Import path</span>
          <span>Required for</span>
          <span>Notes</span>
        </div>
        {imports.map((item) => (
          <article className="dv-docs-metadata-table__row" key={toText(item.importPath)}>
            <strong>{toText(item.package)}</strong>
            <code>{toText(item.importPath)}</code>
            <MetadataChips items={asArray(item.requiredFor)} />
            <Text>{toText(item.notes)}</Text>
          </article>
        ))}
      </div>
      <Card className="dv-docs-metadata-summary" padding="md">
        <Heading level={3} size="sm">
          Rules
        </Heading>
        <MetadataChips items={asArray(data.rules)} />
      </Card>
    </div>
  );
}

function StateContractsMetadata({ data }: { data: MetadataRecord }) {
  const ownership = asRecord(data.stateOwnership);
  const policies = asRecord(data.policies);

  return (
    <div className="dv-docs-metadata">
      <section>
        <Heading level={3} size="md">
          State ownership
        </Heading>
        <div className="dv-docs-metadata-section-grid">
          {Object.entries(ownership).map(([key, value]) => {
            const record = asRecord(value);

            return (
              <Card className="dv-docs-metadata-summary" key={key} padding="md">
                <div className="dv-docs-metadata-summary__header">
                  <Heading level={4} size="sm">
                    {key}
                  </Heading>
                  <Badge tone="subtle" variant="info">
                    {toText(record.owner)}
                  </Badge>
                </div>
                <DetailSection title="Examples">
                  <MetadataChips items={asArray(record.examples)} />
                </DetailSection>
                <DetailSection title="Rules">
                  <MetadataChips items={asArray(record.rules)} />
                </DetailSection>
              </Card>
            );
          })}
        </div>
      </section>
      <section>
        <Heading level={3} size="md">
          Policies
        </Heading>
        <div className="dv-docs-metadata-section-grid">
          {Object.entries(policies).map(([key, value]) => {
            const record = asRecord(value);

            return (
              <Card className="dv-docs-metadata-summary" key={key} padding="md">
                <Heading level={4} size="sm">
                  {key}
                </Heading>
                <Text>{toText(record.summary)}</Text>
                {Boolean(record.allowed) && (
                  <DetailSection title="Allowed">
                    <Text>{toText(record.allowed)}</Text>
                  </DetailSection>
                )}
                {Boolean(record.forbidden) && (
                  <DetailSection title="Forbidden">
                    <Text>{toText(record.forbidden)}</Text>
                  </DetailSection>
                )}
                {Boolean(record.rules) && (
                  <DetailSection title="Rules">
                    <MetadataChips items={asArray(record.rules)} />
                  </DetailSection>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AiRulesMetadata({ data }: { data: MetadataRecord }) {
  const [query, setQuery] = useState("");
  const rules = useMemo(() => asArray(data.rules).map(asRecord), [data]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRules = useMemo(
    () =>
      rules.filter((rule) =>
        [rule.id, rule.rule, rule.reason]
          .map(toText)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, rules]
  );

  return (
    <div className="dv-docs-metadata">
      <MetadataToolbar
        count={filteredRules.length}
        onSearch={setQuery}
        searchLabel="Search AI usage rules"
        searchPlaceholder="Search rules"
        total={rules.length}
        value={query}
      />
      <div className="dv-docs-metadata-table dv-docs-metadata-table--rules">
        <div className="dv-docs-metadata-table__head">
          <span>Rule</span>
          <span>Guidance</span>
          <span>Reason</span>
        </div>
        {filteredRules.map((rule) => (
          <article className="dv-docs-metadata-table__row" key={toText(rule.id)}>
            <strong>{toText(rule.id)}</strong>
            <Text>{toText(rule.rule)}</Text>
            <Text tone="muted">{toText(rule.reason)}</Text>
          </article>
        ))}
      </div>
      {filteredRules.length === 0 && (
        <EmptyState
          className="dv-docs-metadata-empty"
          title="No rules found"
          description="No AI rules match the current search."
        />
      )}
    </div>
  );
}

export function MetadataPage({ route }: MetadataPageProps) {
  const data = asRecord(parseJson(route.content ?? ""));

  return (
    <div className="dv-docs-reference">
      <InlineMessage className="dv-docs-metadata-note" variant="info">
        Metadata powers the docs UI and AI lookups. Markdown docs remain the
        source of truth for project direction.
      </InlineMessage>
      {route.id === "metadata-packages" && <PackagesMetadata data={data} />}
      {route.id === "metadata-components" && <ComponentsMetadata data={data} />}
      {route.id === "metadata-css-imports" && <CssImportsMetadata data={data} />}
      {route.id === "metadata-state-contracts" && (
        <StateContractsMetadata data={data} />
      )}
      {route.id === "metadata-ai-usage-rules" && <AiRulesMetadata data={data} />}
      <details className="dv-docs-metadata-raw">
        <summary>Raw JSON</summary>
        <pre className="dv-docs-metadata-code">
          <code>{formatJson(route.content ?? "")}</code>
        </pre>
      </details>
    </div>
  );
}
