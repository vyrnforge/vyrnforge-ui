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
import {
  designTokenCategories,
  designTokenSource,
  getDesignTokenCategory,
  getPatternReferenceRecord,
  patternDocumentation,
  patternReferenceRecords,
  type DesignTokenRecord,
  type PatternReferenceRecord,
} from "./discoveryData";
import { MigratedExamplePage } from "./examples/MigratedExamplePage";
import { documentationExamples } from "./referenceRoutes";

function recordHref(domain: string, id: string) {
  return `#${getReferenceRecordRoute(referenceModel, domain, id)}`;
}

function componentHref(id: string) {
  return recordHref("components", id);
}

function TokenSpecimen({
  categoryId,
  token,
}: {
  categoryId: string;
  token: DesignTokenRecord;
}) {
  const name = token.name;
  const isTypography = name.includes("--vf-type-");
  const isMeasure =
    /(?:height|width|size|gap|padding|offset|radius)$/u.test(name) ||
    /(?:height|width|size|gap|padding|offset|radius)-/u.test(name);

  return (
    <article className="vf-docs-token-specimen">
      <div className="vf-docs-token-specimen__visual" aria-hidden="true">
        {token.themeScoped ? (
          categoryId === "text" ? (
            <span style={{ color: `var(${name})` }}>Aa</span>
          ) : categoryId === "border" ? (
            <span
              className="vf-docs-token-specimen__border"
              style={{ borderColor: `var(${name})` }}
            />
          ) : (
            <span
              className="vf-docs-token-specimen__swatch"
              style={{ background: `var(${name})` }}
            />
          )
        ) : isTypography ? (
          <span
            className="vf-docs-token-specimen__type"
            style={
              name.includes("font-size")
                ? { fontSize: `var(${name})` }
                : name.includes("font-weight")
                  ? { fontWeight: `var(${name})` }
                  : name.includes("letter-spacing")
                    ? { letterSpacing: `var(${name})` }
                    : undefined
            }
          >
            Aa
          </span>
        ) : isMeasure ? (
          <span
            className="vf-docs-token-specimen__measure"
            style={{ inlineSize: `var(${name})` }}
          />
        ) : (
          <span className="vf-docs-token-specimen__generic">Aa</span>
        )}
      </div>
      <div className="vf-docs-token-specimen__copy">
        <CodeText>{name}</CodeText>
        <Text size="sm" tone="muted">
          {token.purpose}
        </Text>
      </div>
    </article>
  );
}

function TokenReference({ id }: { id?: string | null }) {
  if (id) {
    const category = getDesignTokenCategory(id);
    if (!category) return <MissingRecord label="Token category" id={id} />;

    return (
      <div className="vf-docs-reference vf-docs-token-reference">
        <ReferenceBack href="#/token-reference" label="Design tokens" />
        <section className="vf-docs-reference__section">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Token category
          </Text>
          <Heading level={3} size="lg">
            {category.id}
          </Heading>
          <Text size="lg" tone="muted">
            {category.purpose}
          </Text>
        </section>
        <section className="vf-docs-reference__section">
          <div className="vf-docs-section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Visual reference
            </Text>
            <Heading level={3} size="md">
              See the design decision before copying the variable.
            </Heading>
          </div>
          <div className="vf-docs-token-specimen-grid">
            {category.tokens.map((token) => (
              <TokenSpecimen
                categoryId={category.id}
                key={token.name}
                token={token}
              />
            ))}
          </div>
        </section>
        <section className="vf-docs-reference__section vf-docs-token-reference__source">
          <Heading level={3} size="sm">
            Source
          </Heading>
          <Text size="sm" tone="muted">
            Canonical implementation: <code>{category.sourceFile}</code>
          </Text>
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
            Design system
          </Text>
          <Heading level={3} size="md">
            Choose semantic roles visually, then use the canonical token.
          </Heading>
          <Text tone="muted">
            VyrnForge tokens drive the same themes, density, typography,
            surfaces, and interaction states across every framework surface.
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
            <dt>Source</dt>
            <dd>Shared</dd>
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
            <div className="vf-docs-token-category-preview" aria-hidden="true">
              {category.tokens.slice(0, 4).map((token) => (
                <span
                  key={token.name}
                  style={
                    token.themeScoped
                      ? { background: `var(${token.name})` }
                      : undefined
                  }
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function patternExampleId(pattern: PatternReferenceRecord) {
  const componentName = pattern.playgroundRoute
    .replace(/^\//u, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const suffix = `/${componentName}Page.tsx`;

  return documentationExamples.find((example) =>
    example.implementations.some((implementation) =>
      implementation.sourcePath.endsWith(suffix),
    ),
  )?.id;
}

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
    const exampleId = patternExampleId(pattern);
    const exampleFramework =
      (pattern.exampleFramework as DocsFrameworkId | undefined) ?? frameworkId;

    return (
      <div className="vf-docs-reference vf-docs-pattern-reference">
        <ReferenceBack href="#/pattern-reference" label="Patterns" />
        <section className="vf-docs-reference__section">
          <Text className="vf-docs-catalog__kicker" size="sm">
            {pattern.category.replace(/-/gu, " ")}
          </Text>
          <Heading level={3} size="lg">
            {pattern.displayName}
          </Heading>
          <Text size="lg" tone="muted">
            {pattern.purpose}
          </Text>
        </section>

        {exampleId ? (
          <section className="vf-docs-reference__section">
            <div className="vf-docs-section-heading">
              <Text className="vf-docs-catalog__kicker" size="sm">
                Interactive example
              </Text>
              <Heading level={3} size="md">
                See the composition working before reading the recipe.
              </Heading>
              {pattern.frameworkNeutral ? (
                <Text tone="muted">
                  The rendered example uses {exampleFramework}; the composition
                  pattern is framework-neutral.
                </Text>
              ) : null}
            </div>
            <MigratedExamplePage
              exampleId={exampleId}
              frameworkId={exampleFramework}
              version={version}
            />
          </section>
        ) : null}

        <section className="vf-docs-reference__section">
          <div className="vf-docs-section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Guidance
            </Text>
            <Heading level={3} size="md">
              Use the pattern for the problem it was designed to solve.
            </Heading>
          </div>
          <div className="vf-docs-component-guidance">
            <article>
              <strong>Use when</strong>
              <Text>{pattern.useWhen}</Text>
            </article>
            <article>
              <strong>Avoid when</strong>
              <Text>{pattern.avoidWhen}</Text>
            </article>
          </div>
        </section>

        <section className="vf-docs-reference__section">
          <div className="vf-docs-section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Composition
            </Text>
            <Heading level={3} size="md">
              Built from reusable VyrnForge pieces.
            </Heading>
          </div>
          <div className="vf-docs-discovery-links">
            {pattern.components.map((componentId) => (
              <a href={componentHref(componentId)} key={componentId}>
                {componentId}
              </a>
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
            Start from a proven composition, not a blank canvas.
          </Heading>
          <Text tone="muted">
            Patterns combine VyrnForge components into reusable application
            structures while keeping routing, permissions, and business state
            in the consuming app.
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
              View pattern <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </div>
      <Text size="sm" tone="muted">
        Pattern guidance is sourced from {patternDocumentation}; rendered
        examples remain owned by the generated Documentation Registry.
      </Text>
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
