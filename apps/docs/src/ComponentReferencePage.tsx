import {
  Badge,
  Card,
  Heading,
  Tabs,
  Text,
  type TabItem,
} from "@vyrnforge/ui-components";

import consumerKnowledgeRaw from "../../../docs/generated/consumer-knowledge.json?raw";
import { getComponentMaturityPresentation } from "./componentMaturityPresentation";

type FrameworkUsage = {
  label: string;
  status: string;
  package: string | null;
  setup: string;
  example: string;
  note: string;
};

type ContractDetail = {
  properties: string[];
  attributes: string[];
  events: string[];
  slots: string[];
  methods: string[];
  accessibility: string[];
  formAssociation: string;
};

type ComponentReferenceItem = {
  id: string;
  displayName: string;
  category: string;
  maturity: string;
  purpose: string;
  knownLimitations: string[];
  nativeDeclaration: {
    name: string;
    tagName: string;
    description: string;
  } | null;
  frameworks: Record<
    "react" | "native-html" | "angular" | "vue",
    FrameworkUsage
  >;
  contract: ContractDetail | null;
};

type ConsumerKnowledge = {
  components: ComponentReferenceItem[];
};

const reference = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;

const frameworkOrder = [
  { id: "react", label: "React" },
  { id: "native-html", label: "Native HTML" },
  { id: "angular", label: "Angular" },
  { id: "vue", label: "Vue" },
] as const;

function UsagePanel({ usage }: { usage: FrameworkUsage }) {
  return (
    <div className="vf-docs-framework-usage">
      <div className="vf-docs-framework-usage__meta">
        <Badge size="sm" tone="subtle">
          {usage.status}
        </Badge>
        {usage.package && <code>{usage.package}</code>}
      </div>
      {usage.setup && (
        <>
          <Text size="sm" tone="muted">
            Setup
          </Text>
          <pre className="vf-docs-reference-code">
            <code>{usage.setup}</code>
          </pre>
        </>
      )}
      {usage.example && (
        <>
          <Text size="sm" tone="muted">
            Usage
          </Text>
          <pre className="vf-docs-reference-code">
            <code>{usage.example}</code>
          </pre>
        </>
      )}
      <Text size="sm" tone="muted">
        {usage.note}
      </Text>
    </div>
  );
}

function ContractList({
  label,
  values,
}: {
  label: string;
  values: readonly string[];
}) {
  return (
    <div className="vf-docs-contract-field">
      <strong>{label}</strong>
      <span>{values.length > 0 ? values.join(", ") : "None"}</span>
    </div>
  );
}

function ContractDetails({ contract }: { contract: ContractDetail | null }) {
  if (!contract) {
    return (
      <Text size="sm" tone="muted">
        Detailed framework-neutral contract fields are not yet present in the
        canonical component-contract catalog. This generated viewer does not
        invent them.
      </Text>
    );
  }

  return (
    <div className="vf-docs-contract-details">
      <ContractList label="Properties" values={contract.properties} />
      <ContractList label="Attributes" values={contract.attributes} />
      <ContractList label="Events" values={contract.events} />
      <ContractList label="Slots" values={contract.slots} />
      <ContractList label="Methods" values={contract.methods} />
      <ContractList label="Accessibility" values={contract.accessibility} />
      <div className="vf-docs-contract-field">
        <strong>Form association</strong>
        <span>{contract.formAssociation}</span>
      </div>
    </div>
  );
}

function frameworkTabs(component: ComponentReferenceItem): TabItem[] {
  return frameworkOrder.map(({ id, label }) => ({
    id,
    label,
    content: <UsagePanel usage={component.frameworks[id]} />,
  }));
}

const componentAreas = Object.entries(
  reference.components.reduce<Record<string, ComponentReferenceItem[]>>(
    (areas, component) => {
      (areas[component.category] ??= []).push(component);
      return areas;
    },
    {},
  ),
).sort(([left], [right]) => left.localeCompare(right));

export function ComponentReferencePage() {
  return (
    <div className="vf-docs-reference">
      {componentAreas.map(([area, components]) => (
        <Card className="vf-docs-reference__section" key={area} padding="lg">
          <Heading level={3} size="md">
            {area}
          </Heading>
          <div className="vf-docs-reference__grid">
            {components
              .sort((left, right) =>
                left.displayName.localeCompare(right.displayName),
              )
              .map((component) => {
                const maturity = getComponentMaturityPresentation(component);

                return (
                  <Card
                    className="vf-docs-reference-card"
                    key={component.id}
                    padding="md"
                  >
                    <div className="vf-docs-reference-card__header">
                      <div>
                        <Heading level={4} size="sm">
                          {component.displayName}
                        </Heading>
                        {component.nativeDeclaration?.tagName && (
                          <code>{component.nativeDeclaration.tagName}</code>
                        )}
                      </div>
                      <Badge size="sm" tone="subtle" variant={maturity.variant}>
                        {maturity.label}
                      </Badge>
                    </div>

                    <Text>{component.purpose}</Text>
                    <Text size="sm" tone="muted">AI context slice: <code>{`ai-context/components/${component.id}.json`}</code></Text>

                    <Tabs
                      aria-label={`${component.displayName} framework usage`}
                      className="vf-docs-framework-tabs"
                      defaultValue="react"
                      items={frameworkTabs(component)}
                      size="sm"
                    />

                    <div className="vf-docs-contract-section">
                      <Heading level={5} size="sm">
                        Contract details
                      </Heading>
                      <ContractDetails contract={component.contract} />
                    </div>

                    {component.knownLimitations.length > 0 && (
                      <Text tone="muted" size="sm">
                        {component.knownLimitations.join(" ")}
                      </Text>
                    )}
                  </Card>
                );
              })}
          </div>
        </Card>
      ))}
    </div>
  );
}
