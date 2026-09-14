import { useEffect } from "react";
import {
  Badge,
  Card,
  Heading,
  Tabs,
  Text,
  type TabItem,
} from "@vyrnforge/ui-components";

import consumerKnowledgeRaw from "../../../docs/generated/consumer-knowledge.json?raw";
import frameworkApiReferenceRaw from "../../../docs/generated/framework-api-reference.json?raw";
import { getComponentMaturityPresentation } from "./componentMaturityPresentation";
import type { DocsFrameworkId } from "./docsContext";

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
  contract: ContractDetail | null;
};

type ConsumerKnowledge = {
  components: ComponentReferenceItem[];
};

type ApiProperty = {
  public: string;
  binding: string;
  type: string;
  required: boolean;
  readOnly: boolean;
  controlled: boolean;
  default: unknown;
};

type ApiEvent = {
  public: string;
  mode: string;
  detail: string;
  bubbles: boolean;
  composed: boolean;
  cancelable: boolean;
  detailFields: Array<{ name: string; type: string; required: boolean }>;
};

type ApiSlot = {
  public: string;
  mode: string;
  required: boolean;
  multiple: boolean;
  content: string;
};

type ApiMethod = {
  name: string;
  async: boolean;
  parameters: Array<{ name: string; type: string; required: boolean }>;
  returns: string;
};

type FrameworkApiComponent = {
  id: string;
  category: string;
  package: string;
  status: string;
  export: string | null;
  tag: string | null;
  properties: ApiProperty[];
  events: ApiEvent[];
  slots: ApiSlot[];
  methods: ApiMethod[];
  model: unknown;
  form: unknown;
  ref: unknown;
  accessibility: string[];
  setup: string[];
};

type FrameworkApiSurface = {
  package: string;
  summary: { componentCount: number };
  components: FrameworkApiComponent[];
};

type FrameworkApiId = "native" | "react" | "angular" | "vue";

type FrameworkApiReference = {
  generated: {
    editable: boolean;
    generator: string;
    sources: string[];
  };
  surfaces: Record<FrameworkApiId, FrameworkApiSurface>;
};

type ComponentReferencePageProps = {
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
};

const reference = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
const apiReference = JSON.parse(frameworkApiReferenceRaw) as FrameworkApiReference;

const frameworkOrder = [
  { id: "react", apiId: "react", label: "React" },
  { id: "native-html", apiId: "native", label: "Native HTML" },
  { id: "angular", apiId: "angular", label: "Angular" },
  { id: "vue", apiId: "vue", label: "Vue" },
] as const;

function formatDefault(value: unknown) {
  if (value === undefined) return "—";
  return JSON.stringify(value);
}

function formatProperty(property: ApiProperty) {
  const flags = [
    property.required && "required",
    property.readOnly && "readonly",
    property.controlled && "controlled",
  ].filter(Boolean);
  const suffix = flags.length > 0 ? ` (${flags.join(", ")})` : "";
  return `${property.public}: ${property.type}${suffix}; binding=${property.binding}; default=${formatDefault(property.default)}`;
}

function formatEvent(event: ApiEvent) {
  const detail = event.detailFields
    .map(
      (field) => `${field.name}: ${field.type}${field.required ? "" : "?"}`,
    )
    .join(", ");
  const detailShape = detail ? ` { ${detail} }` : "";
  return [
    `${event.public} (${event.mode}; detail=${event.detail}${detailShape}`,
    `bubbles=${event.bubbles}; composed=${event.composed}`,
    `cancelable=${event.cancelable})`,
  ].join("; ");
}

function formatSlot(slot: ApiSlot) {
  const flags = [slot.required && "required", slot.multiple && "multiple"].filter(
    Boolean,
  );
  const suffix = flags.length > 0 ? `; ${flags.join("; ")}` : "";
  return `${slot.public} (${slot.mode}; ${slot.content}${suffix})`;
}

function formatMethod(method: ApiMethod) {
  const parameters = method.parameters
    .map(
      (parameter) =>
        `${parameter.name}${parameter.required ? "" : "?"}: ${parameter.type}`,
    )
    .join(", ");
  return `${method.async ? "async " : ""}${method.name}(${parameters}): ${method.returns}`;
}

function MemberList({
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
      <MemberList label="Canonical properties" values={contract.properties} />
      <MemberList label="HTML attributes" values={contract.attributes} />
      <MemberList label="Canonical events" values={contract.events} />
      <MemberList label="Canonical slots" values={contract.slots} />
      <MemberList label="Canonical methods" values={contract.methods} />
      <MemberList label="Accessibility" values={contract.accessibility} />
      <div className="vf-docs-contract-field">
        <strong>Form association</strong>
        <span>{contract.formAssociation}</span>
      </div>
    </div>
  );
}

function FrameworkApiPanel({
  component,
}: {
  component: FrameworkApiComponent;
}) {
  return (
    <div className="vf-docs-framework-usage">
      <div className="vf-docs-framework-usage__meta">
        <Badge size="sm" tone="subtle">
          {component.status}
        </Badge>
        <code>{component.package}</code>
        {component.export && <code>export {component.export}</code>}
        {component.tag && <code>{component.tag}</code>}
      </div>

      <MemberList label="Setup" values={component.setup} />
      <MemberList
        label="Properties / inputs"
        values={component.properties.map(formatProperty)}
      />
      <MemberList
        label="Events / outputs / emits"
        values={component.events.map(formatEvent)}
      />
      <MemberList
        label="Slots / templates"
        values={component.slots.map(formatSlot)}
      />
      <MemberList
        label="Methods"
        values={component.methods.map(formatMethod)}
      />
      <MemberList label="Accessibility" values={component.accessibility} />
      <details>
        <summary>Model, form, and ref contracts</summary>
        <pre className="vf-docs-reference-code">
          <code>
            {JSON.stringify(
              {
                model: component.model,
                form: component.form,
                ref: component.ref,
              },
              null,
              2,
            )}
          </code>
        </pre>
      </details>
    </div>
  );
}

function apiComponent(componentId: string, apiId: FrameworkApiId) {
  return apiReference.surfaces[apiId].components.find(
    (component) => component.id === componentId,
  );
}

function frameworkTabs(componentId: string): TabItem[] {
  return frameworkOrder.map(({ id, apiId, label }) => {
    const component = apiComponent(componentId, apiId);
    return {
      id,
      label,
      content: component ? (
        <FrameworkApiPanel component={component} />
      ) : (
        <Text size="sm" tone="muted">
          No generated API record exists for this surface.
        </Text>
      ),
    };
  });
}

function componentDeepLink(frameworkId: DocsFrameworkId, componentId: string) {
  const query = new URLSearchParams({
    framework: frameworkId,
    component: componentId,
  });
  return `?${query.toString()}#/component-reference`;
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

export function ComponentReferencePage({
  frameworkId,
  onFrameworkChange,
}: ComponentReferencePageProps) {
  useEffect(() => {
    const selectedComponent = new URLSearchParams(window.location.search).get(
      "component",
    );
    if (!selectedComponent) return;
    document
      .getElementById(`api-${selectedComponent}`)
      ?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Generated API reference
        </Heading>
        <Text tone="muted">
          This viewer reads the generated framework API model directly. API
          facts come from canonical component contracts; missing contracts are
          shown as missing rather than reconstructed in the docs application.
        </Text>
        <Text size="sm" tone="muted">
          Generator: <code>{apiReference.generated.generator}</code> ·
          sources: <code>{apiReference.generated.sources.join(", ")}</code>
        </Text>
      </Card>

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
                    id={`api-${component.id}`}
                    key={component.id}
                    padding="md"
                  >
                    <div className="vf-docs-reference-card__header">
                      <div>
                        <Heading level={4} size="sm">
                          <a
                            aria-label={`Permanent link to ${component.displayName} API reference`}
                            href={componentDeepLink(frameworkId, component.id)}
                          >
                            {component.displayName}
                          </a>
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

                    <Tabs
                      aria-label={`${component.displayName} framework API`}
                      className="vf-docs-framework-tabs"
                      items={frameworkTabs(component.id)}
                      onValueChange={(value) =>
                        onFrameworkChange(value as DocsFrameworkId)
                      }
                      size="sm"
                      value={frameworkId}
                    />

                    <div className="vf-docs-contract-section">
                      <Heading level={5} size="sm">
                        Framework-neutral contract
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
