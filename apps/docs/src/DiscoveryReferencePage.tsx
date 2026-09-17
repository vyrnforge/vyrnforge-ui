import { Badge, Card, CodeText, Heading, Text } from "@vyrnforge/ui-components";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import type { ReferenceRecordSelection } from "./App";
import { referenceModel } from "./docsContext";
import {
  accessibilityReferenceRecords,
  designTokenCategories,
  designTokenSource,
  getAccessibilityReferenceRecord,
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
        <Card className="vf-docs-reference__section" padding="lg">
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
        </Card>
      </div>
    );
  }

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Canonical design-token explorer
        </Heading>
        <Text tone="muted">
          Token names and category facts are read directly from canonical
          design-token metadata. Runtime implementation remains{" "}
          {designTokenSource.implementation}; typed ownership remains{" "}
          {designTokenSource.typedExport}.
        </Text>
      </Card>
      <div className="vf-docs-discovery-grid">
        {designTokenCategories.map((category) => (
          <Card key={category.id} padding="lg">
            <Heading level={3} size="md">
              <a href={recordHref("tokens", category.id)}>{category.id}</a>
            </Heading>
            <Text>{category.purpose}</Text>
            <Badge tone="subtle" variant="neutral">
              {category.tokens.length} tokens
            </Badge>
          </Card>
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
        <Card className="vf-docs-reference__section" padding="lg">
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
        </Card>
        <Card className="vf-docs-reference__section" padding="lg">
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
        </Card>
      </div>
    );
  }

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Reusable application patterns
        </Heading>
        <Text tone="muted">
          Pattern guidance comes from canonical pattern metadata. The curated
          example documentation remains {patternDocumentation}.
        </Text>
      </Card>
      <div className="vf-docs-discovery-grid">
        {patternReferenceRecords.map((pattern) => (
          <Card key={pattern.id} padding="lg">
            <Heading level={3} size="md">
              <a href={recordHref("patterns", pattern.id)}>
                {pattern.displayName}
              </a>
            </Heading>
            <Text>{pattern.purpose}</Text>
            <Badge tone="subtle" variant="neutral">
              {pattern.category}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AccessibilityReference({ id }: { id?: string | null }) {
  if (id) {
    const component = getAccessibilityReferenceRecord(id);
    if (!component)
      return <MissingRecord label="Accessibility record" id={id} />;

    return (
      <div className="vf-docs-reference">
        <ReferenceBack
          href="#/accessibility-reference"
          label="Accessibility & Keyboard"
        />
        <Card className="vf-docs-reference__section" padding="lg">
          <Heading level={3} size="md">
            {component.displayName}
          </Heading>
          <Text>{component.notes}</Text>
          <Text size="sm" tone="muted">
            Package: {component.package}
          </Text>
          <Heading level={4} size="sm">
            Accessibility contract
          </Heading>
          {component.contract.length > 0 ? (
            <ul>
              {component.contract.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <Text tone="muted">No component-specific contract entries.</Text>
          )}
          {component.knownLimitations.length > 0 ? (
            <>
              <Heading level={4} size="sm">
                Known limitations
              </Heading>
              <ul>
                {component.knownLimitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="vf-docs-discovery-links">
            <a href={componentHref(component.id)}>Full component reference</a>
            <a href="#/accessibility-standards">
              Canonical accessibility standards
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Accessibility and keyboard discovery
        </Heading>
        <Text tone="muted">
          Component records project the framework-neutral accessibility contract
          already used by generated component reference pages. Canonical
          standards and cross-framework evidence remain their owning sources.
        </Text>
        <div className="vf-docs-discovery-links">
          <a href="#/accessibility-standards">Accessibility standards</a>
          <a href="#/metadata-cross-framework-accessibility">
            Cross-framework accessibility evidence
          </a>
        </div>
      </Card>
      <div className="vf-docs-discovery-grid">
        {accessibilityReferenceRecords.map((component) => (
          <Card key={component.id} padding="lg">
            <Heading level={3} size="md">
              <a href={recordHref("accessibility", component.id)}>
                {component.displayName}
              </a>
            </Heading>
            <Text>{component.notes}</Text>
            <Badge tone="subtle" variant="neutral">
              {component.contract.length} contract entries
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReferenceBack({ href, label }: { href: string; label: string }) {
  return (
    <Card className="vf-docs-reference__section" padding="lg">
      <Text size="sm">
        <a href={href}>← {label}</a>
      </Text>
    </Card>
  );
}

function MissingRecord({ label, id }: { label: string; id: string }) {
  return (
    <Card className="vf-docs-reference__section" padding="lg">
      <Heading level={3} size="md">
        {label} not found
      </Heading>
      <Text tone="muted">No generated reader record exists for {id}.</Text>
    </Card>
  );
}

export function DiscoveryReferencePage({
  routeId,
  referenceRecord,
}: {
  routeId: string;
  referenceRecord: ReferenceRecordSelection | null;
}) {
  if (routeId === "token-reference") {
    return (
      <TokenReference
        id={referenceRecord?.domain === "tokens" ? referenceRecord.id : null}
      />
    );
  }
  if (routeId === "pattern-reference") {
    return (
      <PatternReference
        id={referenceRecord?.domain === "patterns" ? referenceRecord.id : null}
      />
    );
  }
  return (
    <AccessibilityReference
      id={
        referenceRecord?.domain === "accessibility" ? referenceRecord.id : null
      }
    />
  );
}
