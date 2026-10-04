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

    const themeScopedCount = category.tokens.filter(
      (token) => token.themeScoped,
    ).length;

    return (
      <div className="vf-docs-token-doc">
        <ReferenceBack href="#/token-reference" label="Design tokens" />

        <section className="vf-docs-token-doc__overview">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Semantic token category
          </Text>
          <Heading level={2} size="lg">
            {category.id}
          </Heading>
          <Text className="vf-docs-token-doc__lede">{category.purpose}</Text>
          <dl className="vf-docs-component-doc__identity">
            <div>
              <dt>Tokens</dt>
              <dd>{category.tokens.length}</dd>
            </div>
            <div>
              <dt>Theme scoped</dt>
              <dd>{themeScopedCount}</dd>
            </div>
            <div>
              <dt>Runtime source</dt>
              <dd>
                <code>{category.sourceFile}</code>
              </dd>
            </div>
          </dl>
        </section>

        <section className="vf-docs-token-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Usage
            </Text>
            <Heading level={3} size="md">
              Use semantic roles instead of hard-coded visual values
            </Heading>
            <Text tone="muted">
              Consume these CSS custom properties through the shared VyrnForge
              theme contract. Theme-scoped tokens may change across supported
              themes; structural tokens remain stable across theme modes.
            </Text>
          </div>
          <div className="vf-docs-token-doc__links">
            <a href="#/theme-tokens">Open interactive token catalog</a>
            <a href="#/theme-modes">Compare theme modes</a>
            <a href="#/theming">Read theming guidance</a>
          </div>
        </section>

        <section className="vf-docs-token-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Reference
            </Text>
            <Heading level={3} size="md">
              Tokens in this category
            </Heading>
          </div>
          <div className="vf-docs-token-table-scroll">
            <table className="vf-docs-token-table">
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Semantic role</th>
                  <th scope="col">Theme scoped</th>
                </tr>
              </thead>
              <tbody>
                {category.tokens.map((token) => (
                  <tr key={token.name}>
                    <th scope="row">
                      <CodeText>{token.name}</CodeText>
                    </th>
                    <td>{token.purpose}</td>
                    <td>{token.themeScoped ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="vf-docs-token-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Ownership
            </Text>
            <Heading level={3} size="md">
              Canonical sources
            </Heading>
          </div>
          <div className="vf-docs-component-doc__facts-grid">
            <div>
              <strong>Implementation</strong>
              <span>{designTokenSource.implementation}</span>
            </div>
            <div>
              <strong>Typed contract</strong>
              <span>{designTokenSource.typedExport}</span>
            </div>
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

      <div className="vf-docs-discovery-tiles">
        {designTokenCategories.map((category) => (
          <article className="vf-docs-discovery-tile" key={category.id}>
            <div className="vf-docs-discovery-tile__heading">
              <div>
                <Text className="vf-docs-catalog__kicker" size="sm">
                  {category.tokens.length} tokens
                </Text>
                <Heading level={3} size="md">
                  <a href={recordHref("tokens", category.id)}>{category.id}</a>
                </Heading>
              </div>
              <span aria-hidden="true">→</span>
            </div>
            <Text tone="muted">{category.purpose}</Text>
            <div className="vf-docs-discovery-tile__samples">
              {category.tokens.slice(0, 3).map((token) => (
                <CodeText key={token.name}>{token.name}</CodeText>
              ))}
            </div>
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
      <div className="vf-docs-pattern-doc">
        <ReferenceBack href="#/pattern-reference" label="Patterns" />

        <section className="vf-docs-pattern-doc__overview">
          <div className="vf-docs-pattern-doc__meta">
            <Badge size="sm" tone="subtle" variant="neutral">
              {pattern.category}
            </Badge>
            <span>
              {pattern.frameworkNeutral
                ? "Framework-neutral composition"
                : "Framework-specific example"}
            </span>
          </div>
          <Heading level={2} size="lg">
            {pattern.displayName}
          </Heading>
          <Text className="vf-docs-pattern-doc__lede">{pattern.purpose}</Text>
        </section>

        <section className="vf-docs-pattern-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Use when
            </Text>
            <Heading level={3} size="md">
              Choose this pattern for the right workflow
            </Heading>
          </div>
          <div className="vf-docs-component-doc__guidance">
            <div>
              <strong>Use when</strong>
              <Text>{pattern.useWhen}</Text>
            </div>
            <div>
              <strong>Avoid when</strong>
              <Text>{pattern.avoidWhen}</Text>
            </div>
          </div>
        </section>

        <section className="vf-docs-pattern-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Composition
            </Text>
            <Heading level={3} size="md">
              Reusable VyrnForge building blocks
            </Heading>
            <Text tone="muted">
              The pattern composes existing VyrnForge primitives and components.
              Application routing, persistence, authorization, and business
              rules remain outside the library.
            </Text>
          </div>
          <div className="vf-docs-pattern-doc__components">
            {pattern.components.map((componentId, index) => (
              <a href={componentHref(componentId)} key={componentId}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{componentId}</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="vf-docs-pattern-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Behavior
            </Text>
            <Heading level={3} size="md">
              Library and application boundary
            </Heading>
          </div>
          <Text>{pattern.avoidWhen}</Text>
          <Text size="sm" tone="muted">
            Component-level keyboard, focus, form, and assistive-technology
            requirements still apply to every building block in the composition.
          </Text>
        </section>

        <section className="vf-docs-pattern-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Example
            </Text>
            <Heading level={3} size="md">
              Curated implementation evidence
            </Heading>
          </div>
          {pattern.playgroundRoute ? (
            <div className="vf-docs-component-doc__facts-grid">
              <div>
                <strong>Example route</strong>
                <span>{pattern.playgroundRoute}</span>
              </div>
              <div>
                <strong>Example framework</strong>
                <span>
                  {pattern.exampleFramework ?? "Not framework-specific"}
                </span>
              </div>
            </div>
          ) : (
            <Text tone="muted">
              This pattern currently has no dedicated curated example route.
            </Text>
          )}
        </section>

        <section className="vf-docs-pattern-doc__section">
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Discoverability
            </Text>
            <Heading level={3} size="md">
              Related concepts
            </Heading>
          </div>
          <div className="vf-docs-pattern-doc__keywords">
            {pattern.aiKeywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
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
