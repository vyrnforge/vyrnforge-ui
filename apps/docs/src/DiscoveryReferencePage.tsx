import {
  Badge,
  CodeText,
  EmptyState,
  Heading,
  Text,
} from "@vyrnforge/ui-components";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import type { ReferenceRecordSelection } from "./App";
import { referenceModel } from "./docsContext";
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

  return (
    <div className="vf-docs-reference">
      <section className="vf-docs-reference__section">
        <Heading level={3} size="md">
          Canonical design-token explorer
        </Heading>
        <Text tone="muted">
          Token names and category facts are read directly from canonical
          design-token metadata. Runtime implementation remains{" "}
          {designTokenSource.implementation}; typed ownership remains{" "}
          {designTokenSource.typedExport}.
        </Text>
      </section>
      <div className="vf-docs-discovery-grid">
        {designTokenCategories.map((category) => (
          <article className="vf-docs-discovery-row-card" key={category.id}>
            <Heading level={3} size="md">
              <a href={recordHref("tokens", category.id)}>{category.id}</a>
            </Heading>
            <Text>{category.purpose}</Text>
            <Badge tone="subtle" variant="neutral">
              {category.tokens.length} tokens
            </Badge>
          </article>
        ))}
      </div>
    </div>
  );
}

function PatternReference({ id }: { id?: string | null }) {
  if (id) {
    const pattern = getPatternReferenceRecord(id);
    if (!pattern) return <MissingRecord label="Pattern" id={id} />;

    return (
      <div className="vf-docs-reference">
        <ReferenceBack href="#/pattern-reference" label="Patterns" />
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

  return (
    <div className="vf-docs-reference">
      <section className="vf-docs-reference__section">
        <Heading level={3} size="md">
          Reusable application patterns
        </Heading>
        <Text tone="muted">
          Pattern guidance comes from canonical pattern metadata. The curated
          example documentation remains {patternDocumentation}.
        </Text>
      </section>
      <div className="vf-docs-discovery-grid">
        {patternReferenceRecords.map((pattern) => (
          <article className="vf-docs-discovery-row-card" key={pattern.id}>
            <Heading level={3} size="md">
              <a href={recordHref("patterns", pattern.id)}>
                {pattern.displayName}
              </a>
            </Heading>
            <Text>{pattern.purpose}</Text>
            <Badge tone="subtle" variant="neutral">
              {pattern.category}
            </Badge>
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
  recordDomain,
  referenceRecord,
}: {
  recordDomain: "tokens" | "patterns";
  referenceRecord: ReferenceRecordSelection | null;
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
      id={referenceRecord?.domain === "patterns" ? referenceRecord.id : null}
    />
  );
}
