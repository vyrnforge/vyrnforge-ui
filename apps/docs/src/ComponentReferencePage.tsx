import {
  Badge,
  Card,
  Heading,
  Tabs,
  Text,
  type TabItem,
} from "@vyrnforge/ui-components";

import frameworkApiReferenceRaw from "../../../docs/generated/framework-api-reference.json?raw";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import { getComponentMaturityPresentation } from "./componentMaturityPresentation";
import { referenceModel, type DocsFrameworkId } from "./docsContext";
import {
  componentReferenceRecords,
  getComponentReferenceRecord,
  getRelatedPatterns,
  type ComponentReferenceRecord,
  type ReferenceContract,
} from "./referenceData";

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

type FrameworkApiId = "native" | "react" | "angular" | "vue";

type FrameworkApiReference = {
  generated: {
    editable: boolean;
    generator: string;
    sources: string[];
  };
  surfaces: Record<
    FrameworkApiId,
    {
      package: string;
      summary: { componentCount: number };
      components: FrameworkApiComponent[];
    }
  >;
};

type ComponentReferencePageProps = {
  componentId?: string | null;
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
};

const apiReference = JSON.parse(
  frameworkApiReferenceRaw,
) as FrameworkApiReference;

function formatDefault(value: unknown) {
  return value === undefined ? "—" : JSON.stringify(value);
}

function memberAnchor(kind: string, name: string) {
  return `api-${kind}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}`;
}

function propertyFlags(property: ApiProperty) {
  return [
    property.required && "required",
    property.readOnly && "readonly",
    property.controlled && "controlled",
  ].filter(Boolean) as string[];
}

function eventDelivery(event: ApiEvent) {
  return [
    event.bubbles && "bubbles",
    event.composed && "composed",
    event.cancelable && "cancelable",
  ].filter(Boolean) as string[];
}

function slotFlags(slot: ApiSlot) {
  return [slot.required && "required", slot.multiple && "multiple"].filter(
    Boolean,
  ) as string[];
}

function methodParameters(method: ApiMethod) {
  return method.parameters
    .map(
      (parameter) =>
        `${parameter.name}${parameter.required ? "" : "?"}: ${parameter.type}`,
    )
    .join(", ");
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

function ContractDetails({ contract }: { contract: ReferenceContract | null }) {
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

function EmptyApiMembers() {
  return (
    <Text size="sm" tone="muted">
      None on this framework surface.
    </Text>
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

      <section
        aria-labelledby="api-setup-heading"
        className="vf-docs-api-section"
        id="api-setup"
      >
        <Heading level={4} size="sm" id="api-setup-heading">
          Setup
        </Heading>
        <MemberList label="Imports / registration" values={component.setup} />
      </section>

      <section
        aria-labelledby="api-properties-heading"
        className="vf-docs-api-section"
        id="api-properties"
      >
        <Heading level={4} size="sm" id="api-properties-heading">
          Properties / inputs
        </Heading>
        {component.properties.length > 0 ? (
          <div className="vf-docs-api-table-scroll">
            <table className="vf-docs-api-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Binding</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Flags</th>
                </tr>
              </thead>
              <tbody>
                {component.properties.map((property) => {
                  const anchor = memberAnchor("property", property.public);
                  return (
                    <tr id={anchor} key={property.public}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={`#${anchor}`}
                        >
                          <code>{property.public}</code>
                        </a>
                      </th>
                      <td>
                        <code>{property.binding}</code>
                      </td>
                      <td>
                        <code>{property.type}</code>
                      </td>
                      <td>
                        <code>{formatDefault(property.default)}</code>
                      </td>
                      <td>{propertyFlags(property).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyApiMembers />
        )}
      </section>

      <section
        aria-labelledby="api-events-heading"
        className="vf-docs-api-section"
        id="api-events"
      >
        <Heading level={4} size="sm" id="api-events-heading">
          Events / outputs / emits
        </Heading>
        {component.events.length > 0 ? (
          <div className="vf-docs-api-table-scroll">
            <table className="vf-docs-api-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Detail</th>
                  <th scope="col">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {component.events.map((event) => {
                  const anchor = memberAnchor("event", event.public);
                  const detailFields = event.detailFields
                    .map(
                      (field) =>
                        `${field.name}${field.required ? "" : "?"}: ${field.type}`,
                    )
                    .join(", ");
                  return (
                    <tr id={anchor} key={event.public}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={`#${anchor}`}
                        >
                          <code>{event.public}</code>
                        </a>
                      </th>
                      <td>{event.mode}</td>
                      <td>
                        <code>
                          {event.detail}
                          {detailFields ? ` { ${detailFields} }` : ""}
                        </code>
                      </td>
                      <td>{eventDelivery(event).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyApiMembers />
        )}
      </section>

      <section
        aria-labelledby="api-slots-heading"
        className="vf-docs-api-section"
        id="api-slots"
      >
        <Heading level={4} size="sm" id="api-slots-heading">
          Slots / templates
        </Heading>
        {component.slots.length > 0 ? (
          <div className="vf-docs-api-table-scroll">
            <table className="vf-docs-api-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Content</th>
                  <th scope="col">Flags</th>
                </tr>
              </thead>
              <tbody>
                {component.slots.map((slot) => {
                  const anchor = memberAnchor("slot", slot.public);
                  return (
                    <tr id={anchor} key={slot.public}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={`#${anchor}`}
                        >
                          <code>{slot.public}</code>
                        </a>
                      </th>
                      <td>{slot.mode}</td>
                      <td>{slot.content}</td>
                      <td>{slotFlags(slot).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyApiMembers />
        )}
      </section>

      <section
        aria-labelledby="api-methods-heading"
        className="vf-docs-api-section"
        id="api-methods"
      >
        <Heading level={4} size="sm" id="api-methods-heading">
          Methods
        </Heading>
        {component.methods.length > 0 ? (
          <div className="vf-docs-api-table-scroll">
            <table className="vf-docs-api-table">
              <thead>
                <tr>
                  <th scope="col">Method</th>
                  <th scope="col">Parameters</th>
                  <th scope="col">Returns</th>
                </tr>
              </thead>
              <tbody>
                {component.methods.map((method) => {
                  const anchor = memberAnchor("method", method.name);
                  return (
                    <tr id={anchor} key={method.name}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={`#${anchor}`}
                        >
                          <code>
                            {method.async ? "async " : ""}
                            {method.name}()
                          </code>
                        </a>
                      </th>
                      <td>
                        <code>{methodParameters(method) || "—"}</code>
                      </td>
                      <td>
                        <code>{method.returns}</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyApiMembers />
        )}
      </section>

      <section
        aria-labelledby="api-accessibility-heading"
        className="vf-docs-api-section"
        id="api-accessibility"
      >
        <Heading level={4} size="sm" id="api-accessibility-heading">
          Accessibility
        </Heading>
        <MemberList
          label="Generated guidance"
          values={component.accessibility}
        />
      </section>

      <details className="vf-docs-api-advanced">
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
  return referenceModel.frameworks.map((framework) => {
    const apiId = framework.apiSurface as FrameworkApiId;
    const component = apiComponent(componentId, apiId);
    return {
      id: framework.id,
      label: framework.label,
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

function componentHref(componentId: string) {
  return `#${getReferenceRecordRoute(referenceModel, "components", componentId)}`;
}

function ComponentIndexCard({
  component,
}: {
  component: ComponentReferenceRecord;
}) {
  const maturity = getComponentMaturityPresentation(component);
  return (
    <Card className="vf-docs-reference-card" padding="md">
      <div className="vf-docs-reference-card__header">
        <div>
          <Heading level={4} size="sm">
            <a href={componentHref(component.id)}>{component.displayName}</a>
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
      <Text size="sm" tone="muted">
        {component.package}
      </Text>
    </Card>
  );
}

function ComponentOutline({ showLimitations }: { showLimitations: boolean }) {
  const sections = [
    ["component-overview", "Overview"],
    ["component-usage", "Usage guidance"],
    ["component-framework-api", "Framework API"],
    ["component-contract", "Framework-neutral contract"],
    ["component-accessibility-styling", "Accessibility and styling"],
    ...(showLimitations
      ? [["component-limitations", "Limitations and related patterns"]]
      : []),
  ];

  return (
    <aside
      className="vf-docs-reference-outline"
      aria-label="On this component page"
    >
      <Text size="sm" tone="muted">
        On this page
      </Text>
      <nav>
        <ul>
          {sections.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="vf-docs-reference-outline__api">
        <Text size="sm" tone="muted">
          Framework API
        </Text>
        <a href="#api-properties">Properties</a>
        <a href="#api-events">Events</a>
        <a href="#api-slots">Slots</a>
        <a href="#api-methods">Methods</a>
      </div>
    </aside>
  );
}

function ComponentDetail({
  component,
  frameworkId,
  onFrameworkChange,
}: {
  component: ComponentReferenceRecord;
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
}) {
  const maturity = getComponentMaturityPresentation(component);
  const relatedPatterns = getRelatedPatterns(component.id);
  const showLimitations =
    component.knownLimitations.length > 0 || relatedPatterns.length > 0;

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <Card
          className="vf-docs-reference__section"
          id="component-overview"
          padding="lg"
        >
          <Text size="sm">
            <a href="#/component-reference">← Component reference</a>
          </Text>
          <div className="vf-docs-reference-card__header">
            <div>
              <Heading level={3} size="md">
                {component.displayName}
              </Heading>
              <Text size="sm" tone="muted">
                <code>{component.package}</code>
                {component.nativeDeclaration?.tagName && (
                  <>
                    {" "}
                    · <code>{component.nativeDeclaration.tagName}</code>
                  </>
                )}
              </Text>
            </div>
            <Badge size="sm" tone="subtle" variant={maturity.variant}>
              {maturity.label}
            </Badge>
          </div>
          <Text>{component.purpose}</Text>
          <Text size="sm" tone="muted">
            AI context slice:{" "}
            <code>{`ai-context/components/${component.id}.json`}</code>
          </Text>
        </Card>

        <Card
          className="vf-docs-reference__section"
          id="component-usage"
          padding="lg"
        >
          <Heading level={3} size="md">
            Usage guidance
          </Heading>
          <MemberList label="Use when" values={[component.guidance.useWhen]} />
          <MemberList
            label="Avoid when"
            values={[component.guidance.avoidWhen]}
          />
          <MemberList
            label="AI usage notes"
            values={[component.guidance.aiUsageNotes]}
          />
          <MemberList
            label="Related components"
            values={component.guidance.relatedComponents}
          />
        </Card>

        <Card
          className="vf-docs-reference__section"
          id="component-framework-api"
          padding="lg"
        >
          <Heading level={3} size="md">
            Framework API
          </Heading>
          <Text tone="muted">
            Public API facts below come directly from the generated framework API
            reference. Member rows have stable anchors for deep links, while
            selecting a tab updates the shared Reference framework context.
          </Text>
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
        </Card>

        <Card
          className="vf-docs-reference__section"
          id="component-contract"
          padding="lg"
        >
          <Heading level={3} size="md">
            Framework-neutral contract
          </Heading>
          <ContractDetails contract={component.contract} />
        </Card>

        <Card
          className="vf-docs-reference__section"
          id="component-accessibility-styling"
          padding="lg"
        >
          <Heading level={3} size="md">
            Accessibility and styling
          </Heading>
          <MemberList
            label="Accessibility guidance"
            values={[
              component.accessibilityNotes,
              ...(component.contract?.accessibility ?? []),
            ].filter(Boolean)}
          />
          <MemberList
            label="Public classes"
            values={component.styling.classes}
          />
          <MemberList
            label="CSS variables"
            values={component.styling.variables}
          />
        </Card>

        {showLimitations && (
          <Card
            className="vf-docs-reference__section"
            id="component-limitations"
            padding="lg"
          >
            <Heading level={3} size="md">
              Limitations and related patterns
            </Heading>
            <MemberList
              label="Known limitations"
              values={component.knownLimitations}
            />
            <MemberList
              label="Patterns using this component"
              values={relatedPatterns.map((pattern) => pattern.displayName)}
            />
          </Card>
        )}
      </div>
      <ComponentOutline showLimitations={showLimitations} />
    </div>
  );
}

const componentAreas = Object.entries(
  componentReferenceRecords.reduce<Record<string, ComponentReferenceRecord[]>>(
    (areas, component) => {
      (areas[component.category] ??= []).push(component);
      return areas;
    },
    {},
  ),
).sort(([left], [right]) => left.localeCompare(right));

export function ComponentReferencePage({
  componentId,
  frameworkId,
  onFrameworkChange,
}: ComponentReferencePageProps) {
  if (componentId) {
    const component = getComponentReferenceRecord(componentId);
    if (!component) {
      return (
        <Card className="vf-docs-reference__section" padding="lg">
          <Heading level={3} size="md">
            Component not found
          </Heading>
          <Text tone="muted">
            No generated component record exists for <code>{componentId}</code>.
          </Text>
          <Text>
            <a href="#/component-reference">Return to component reference</a>
          </Text>
        </Card>
      );
    }
    return (
      <ComponentDetail
        component={component}
        frameworkId={frameworkId}
        onFrameworkChange={onFrameworkChange}
      />
    );
  }

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Generated component reference
        </Heading>
        <Text tone="muted">
          Choose a component for a stable detail route. API facts remain
          generated from canonical contracts while guidance stays sourced from
          canonical component metadata.
        </Text>
        <Text size="sm" tone="muted">
          Generator: <code>{apiReference.generated.generator}</code> · sources:{" "}
          <code>{apiReference.generated.sources.join(", ")}</code>
        </Text>
      </Card>

      {componentAreas.map(([area, components]) => (
        <Card className="vf-docs-reference__section" key={area} padding="lg">
          <Heading level={3} size="md">
            {area}
          </Heading>
          <div className="vf-docs-reference__grid">
            {[...components]
              .sort((left, right) =>
                left.displayName.localeCompare(right.displayName),
              )
              .map((component) => (
                <ComponentIndexCard component={component} key={component.id} />
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
