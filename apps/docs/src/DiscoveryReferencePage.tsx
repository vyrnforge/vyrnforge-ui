import {
  Badge,
  CodeText,
  EmptyState,
  Heading,
  Text,
} from "@vyrnforge/ui-components";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import type { ReferenceRecordSelection } from "./App";
import { referenceModel, type DocsFrameworkId } from "./docsContext";
import { ReferenceLiveExample } from "./ReferenceLiveExample";
import { ReferenceTokenGallery } from "./ReferenceTokenGallery";
import {
  designTokenCategories,
  designTokenSource,
  getDesignTokenCategory,
  getPatternReferenceRecord,
  patternDocumentation,
  patternReferenceRecords,
} from "./discoveryData";

function recordHref(domain: string, id: string) {
  return `#${getReferenceRecordRoute(referenceModel, domain, id)}`;
}

function componentHref(id: string) {
  return recordHref("components", id);
}

function TokenReference({ id }: { id?: string | null }) {
  if (id) {
    const category = getDesignTokenCategory(id);
    if (!category) return <MissingRecord label="Token category" id={id} />;

    return (
      <div className="vf-docs-reference">
        <ReferenceBack href="#/token-reference" label="Design tokens" />
        <section className="vf-docs-reference__section">
          <Heading level={3} size="md">
            {category.id}
          </Heading>
          <Text>{category.purpose}</Text>
          <Text size="sm" tone="muted">
            Canonical source: {category.sourceFile}
          </Text>
          <div className="vf-docs-discovery-list">
            {category.tokens.map((token) => (
              <div className="vf-docs-discovery-row" key={token.name}>
                <CodeText>{token.name}</CodeText>
                <Text size="sm">{token.purpose}</Text>
                {token.themeScoped ? (
                  <Badge size="sm" tone="subtle" variant="info">
                    Theme scoped
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const tokenCount = designTokenCategories.reduce(
    (total, category) => total + category.tokens.length,
    0,
  );

  return (
    <div className="vf-docs-catalog">
      <section className="vf-docs-catalog__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Token system
          </Text>
          <Heading level={3} size="md">
            Start with semantic categories, then inspect the exact variables.
          </Heading>
          <Text tone="muted">
            Token names and category facts come directly from canonical
            design-token metadata. The runtime implementation remains{" "}
            {designTokenSource.implementation}.
          </Text>
        </div>
        <dl className="vf-docs-catalog__stats">
          <div>
            <dt>Categories</dt>
            <dd>{designTokenCategories.length}</dd>
          </div>
          <div>
            <dt>Tokens</dt>
            <dd>{tokenCount}</dd>
          </div>
          <div>
            <dt>Typed source</dt>
            <dd>Yes</dd>
          </div>
        </dl>
      </section>

      <ReferenceTokenGallery categories={designTokenCategories} />
    </div>
  );
}

const patternExampleIds: Partial<Record<string, string>> = {
  "resource-list": "pattern-resource-list",
  detail: "pattern-detail",
  settings: "pattern-settings",
  form: "pattern-form",
  "filter-form": "pattern-filter-form",
  "assignment-patterns": "pattern-assignments",
  "empty-error-loading": "pattern-feedback-states",
  "admin-shell": "pattern-admin-shell",
  "customer-portal-shell": "pattern-customer-portal",
};

function PatternReference({
  frameworkId,
  id,
  version,
}: {
  frameworkId: DocsFrameworkId;
  id?: string | null;
  version: string;
}) {
  if (id) {
    const pattern = getPatternReferenceRecord(id);
    if (!pattern) return <MissingRecord label="Pattern" id={id} />;

    const exampleId = patternExampleIds[pattern.id];

    return (
      <div className="vf-docs-reference vf-docs-pattern-detail">
        <ReferenceBack href="#/pattern-reference" label="Patterns" />
        {exampleId ? (
          <ReferenceLiveExample
            exampleId={exampleId}
            frameworkId={frameworkId}
            title={pattern.displayName}
            version={version}
          />
        ) : null}
        <section className="vf-docs-reference__section">
          <Heading level={3} size="md">
            {pattern.displayName}
          </Heading>
          <Text>{pattern.purpose}</Text>
          <div className="vf-docs-contract-details">
            <div className="vf-docs-contract-field">
              <strong>Use when</strong>
              <span>{pattern.useWhen}</span>
            </div>
            <div className="vf-docs-contract-field">
              <strong>Avoid when</strong>
              <span>{pattern.avoidWhen}</span>
            </div>
            <div className="vf-docs-contract-field">
              <strong>Category</strong>
              <span>{pattern.category}</span>
            </div>
            <div className="vf-docs-contract-field">
              <strong>Framework neutral</strong>
              <span>{pattern.frameworkNeutral ? "Yes" : "No"}</span>
            </div>
          </div>
        </section>
        <section className="vf-docs-reference__section">
          <Heading level={3} size="md">
            Reusable VyrnForge building blocks
          </Heading>
          <div className="vf-docs-discovery-links">
            {pattern.components.map((componentId) => (
              <a href={componentHref(componentId)} key={componentId}>
                {componentId}
              </a>
            ))}
          </div>
          <Text size="sm" tone="muted">
            Curated example route: {pattern.playgroundRoute} · example
            framework: {pattern.exampleFramework}
          </Text>
        </section>
      </div>
    );
  }

  const categories = new Set(
    patternReferenceRecords.map((pattern) => pattern.category),
  );

  return (
    <div className="vf-docs-catalog">
      <section className="vf-docs-catalog__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Application patterns
          </Text>
          <Heading level={3} size="md">
            Reuse proven compositions before inventing application-specific UI.
          </Heading>
          <Text tone="muted">
            Pattern guidance comes from canonical metadata and points back to
            reusable VyrnForge building blocks. Curated examples remain sourced
            from {patternDocumentation}.
          </Text>
        </div>
        <dl className="vf-docs-catalog__stats">
          <div>
            <dt>Patterns</dt>
            <dd>{patternReferenceRecords.length}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd>{categories.size}</dd>
          </div>
          <div>
            <dt>Framework neutral</dt>
            <dd>
              {
                patternReferenceRecords.filter(
                  (pattern) => pattern.frameworkNeutral,
                ).length
              }
            </dd>
          </div>
        </dl>
      </section>

      <section className="vf-docs-pattern-featured">
        <div className="vf-docs-catalog__section-heading">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              Interactive patterns
            </Text>
            <Heading level={3} size="md">
              See the composition before reading the contract.
            </Heading>
            <Text tone="muted">
              These previews render the existing VyrnForge examples directly.
              Open a pattern for use/avoid guidance and its reusable building
              blocks.
            </Text>
          </div>
        </div>
        {["admin-shell", "settings", "resource-list"].map((patternId) => {
          const pattern = getPatternReferenceRecord(patternId);
          const exampleId = patternExampleIds[patternId];
          return pattern && exampleId ? (
            <ReferenceLiveExample
              exampleId={exampleId}
              frameworkId={frameworkId}
              key={patternId}
              title={pattern.displayName}
              version={version}
            />
          ) : null;
        })}
      </section>

      <div className="vf-docs-pattern-grid">
        {patternReferenceRecords.map((pattern) => (
          <article className="vf-docs-pattern-tile" key={pattern.id}>
            <div className="vf-docs-pattern-tile__meta">
              <Badge size="sm" tone="subtle" variant="neutral">
                {pattern.category}
              </Badge>
              <span>{pattern.components.length} building blocks</span>
            </div>
            <Heading level={3} size="md">
              <a href={recordHref("patterns", pattern.id)}>
                {pattern.displayName}
              </a>
            </Heading>
            <Text tone="muted">{pattern.purpose}</Text>
            <div className="vf-docs-pattern-tile__use">
              <strong>Use when</strong>
              <span>{pattern.useWhen}</span>
            </div>
            <a
              className="vf-docs-pattern-tile__action"
              href={recordHref("patterns", pattern.id)}
            >
              Open pattern <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReferenceBack({ href, label }: { href: string; label: string }) {
  return (
    <section className="vf-docs-reference__section">
      <Text size="sm">
        <a href={href}>← {label}</a>
      </Text>
    </section>
  );
}

function MissingRecord({ label, id }: { label: string; id: string }) {
  return (
    <EmptyState
      className="vf-docs-state"
      title={`${label} not found`}
      description={
        <>
          No generated reader record exists for <code>{id}</code>.
        </>
      }
    />
  );
}

export function DiscoveryReferencePage({
  frameworkId,
  recordDomain,
  referenceRecord,
  version,
}: {
  frameworkId: DocsFrameworkId;
  recordDomain: "tokens" | "patterns";
  referenceRecord: ReferenceRecordSelection | null;
  version: string;
}) {
  if (recordDomain === "tokens") {
    return (
      <TokenReference
        id={referenceRecord?.domain === "tokens" ? referenceRecord.id : null}
      />
    );
  }

  return (
    <PatternReference
      frameworkId={frameworkId}
      id={referenceRecord?.domain === "patterns" ? referenceRecord.id : null}
      version={version}
    />
  );
}
