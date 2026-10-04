import { Badge, EmptyState, Heading, Text } from "@vyrnforge/ui-components";

import frameworkApiReferenceRaw from "../../../docs/generated/framework-api-reference.json?raw";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import {
  componentApiMemberAnchor,
  componentReferenceTargetHref,
} from "./componentApiMember";
import { getComponentMaturityPresentation } from "./componentMaturityPresentation";
import { referenceModel, type DocsFrameworkId } from "./docsContext";
import {
  componentReferenceRecords,
  getComponentDocumentationRecord,
  getComponentReferenceRecord,
  getRelatedPatterns,
  type ComponentReferenceRecord,
} from "./referenceData";
import { CodeBlock } from "./examples/components/CodeBlock";

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
  version: string;
};

const apiReference = JSON.parse(
  frameworkApiReferenceRaw,
) as FrameworkApiReference;

function formatDefault(value: unknown) {
  return value === undefined ? "—" : JSON.stringify(value);
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

function EmptyApiMembers() {
  return (
    <Text size="sm" tone="muted">
      None on this framework surface.
    </Text>
  );
}

function FrameworkApiPanel({
  component,
  frameworkId,
}: {
  component: FrameworkApiComponent;
  frameworkId: DocsFrameworkId;
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
                  const anchor = componentApiMemberAnchor(
                    "property",
                    property.public,
                  );
                  return (
                    <tr id={anchor} key={property.public}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={componentReferenceTargetHref(
                            component.id,
                            frameworkId,
                            anchor,
                          )}
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
                  const anchor = componentApiMemberAnchor(
                    "event",
                    event.public,
                  );
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
                          href={componentReferenceTargetHref(
                            component.id,
                            frameworkId,
                            anchor,
                          )}
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
                  const anchor = componentApiMemberAnchor("slot", slot.public);
                  return (
                    <tr id={anchor} key={slot.public}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={componentReferenceTargetHref(
                            component.id,
                            frameworkId,
                            anchor,
                          )}
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
                  const anchor = componentApiMemberAnchor(
                    "method",
                    method.name,
                  );
                  return (
                    <tr id={anchor} key={method.name}>
                      <th scope="row">
                        <a
                          className="vf-docs-api-member-link"
                          href={componentReferenceTargetHref(
                            component.id,
                            frameworkId,
                            anchor,
                          )}
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
        <MemberList label="Guidance" values={component.accessibility} />
      </section>
    </div>
  );
}

function apiComponent(componentId: string, apiId: FrameworkApiId) {
  return apiReference.surfaces[apiId].components.find(
    (component) => component.id === componentId,
  );
}

function componentHref(componentId: string) {
  return `#${getReferenceRecordRoute(referenceModel, "components", componentId)}`;
}

function relatedComponentHref(label: string) {
  const related = componentReferenceRecords.find(
    (candidate) => candidate.displayName === label || candidate.id === label,
  );
  return related ? componentHref(related.id) : null;
}

function patternHref(patternId: string) {
  return `#${getReferenceRecordRoute(referenceModel, "patterns", patternId)}`;
}

function ComponentIndexRow({
  component,
}: {
  component: ComponentReferenceRecord;
}) {
  const maturity = getComponentMaturityPresentation(component);
  return (
    <article className="vf-docs-component-entry">
      <div className="vf-docs-component-entry__title">
        <Heading level={4} size="sm">
          <a href={componentHref(component.id)}>{component.displayName}</a>
        </Heading>
        <Badge size="sm" tone="subtle" variant={maturity.variant}>
          {maturity.label}
        </Badge>
      </div>
      <Text className="vf-docs-component-entry__purpose" tone="muted">
        {component.purpose}
      </Text>
      <div className="vf-docs-component-entry__meta">
        <code>{component.package}</code>
        {component.nativeDeclaration?.tagName ? (
          <code>{component.nativeDeclaration.tagName}</code>
        ) : null}
      </div>
    </article>
  );
}

function ComponentOutline({
  componentId,
  frameworkId,
  showRelated,
}: {
  componentId: string;
  frameworkId: DocsFrameworkId;
  showRelated: boolean;
}) {
  const sections = [
    ["component-overview", "Overview"],
    ["component-usage", "Usage"],
    ["component-configuration", "Configuration"],
    ["component-behavior", "Behavior"],
    ["component-accessibility", "Accessibility"],
    ["component-framework-api", "API"],
    ["component-styling", "Styling"],
    ...(showRelated ? [["component-related", "Related"]] : []),
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
              <a
                href={componentReferenceTargetHref(
                  componentId,
                  frameworkId,
                  id,
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="vf-docs-reference-outline__api">
        <Text size="sm" tone="muted">
          API members
        </Text>
        <a
          href={componentReferenceTargetHref(
            componentId,
            frameworkId,
            "api-properties",
          )}
        >
          Properties
        </a>
        <a
          href={componentReferenceTargetHref(
            componentId,
            frameworkId,
            "api-events",
          )}
        >
          Events
        </a>
        <a
          href={componentReferenceTargetHref(
            componentId,
            frameworkId,
            "api-slots",
          )}
        >
          Slots
        </a>
        <a
          href={componentReferenceTargetHref(
            componentId,
            frameworkId,
            "api-methods",
          )}
        >
          Methods
        </a>
      </div>
    </aside>
  );
}

function ComponentDetail({
  component,
  frameworkId,
  version,
}: {
  component: ComponentReferenceRecord;
  frameworkId: DocsFrameworkId;
  version: string;
}) {
  const maturity = getComponentMaturityPresentation(component);
  const documentation = getComponentDocumentationRecord(component.id);
  const relatedPatterns = getRelatedPatterns(component.id);
  const relatedComponents = component.guidance.relatedComponents;
  const showRelated =
    component.knownLimitations.length > 0 ||
    relatedPatterns.length > 0 ||
    relatedComponents.length > 0;
  const framework = referenceModel.frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  const frameworkUsage = component.frameworks[frameworkId];
  const apiId = framework?.apiSurface as FrameworkApiId | undefined;
  const contextualApi = apiId ? apiComponent(component.id, apiId) : undefined;
  const controlledProperties =
    contextualApi?.properties
      .filter((property) => property.controlled)
      .map((property) => property.public) ?? [];
  const interactionEvents =
    contextualApi?.events.map((event) => event.public) ?? [];
  const slots = contextualApi?.slots.map((slot) => slot.public) ?? [];
  const methods = contextualApi?.methods.map((method) => method.name) ?? [];

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-component-doc">
        <section
          className="vf-docs-component-doc__overview"
          id="component-overview"
        >
          <Text size="sm">
            <a href="#/component-reference">← Components</a>
          </Text>
          <div className="vf-docs-component-doc__title">
            <div>
              <Text className="vf-docs-catalog__kicker" size="sm">
                {component.category}
              </Text>
              <Heading level={2} size="lg">
                {component.displayName}
              </Heading>
              <Text className="vf-docs-component-doc__lede">
                {component.purpose}
              </Text>
            </div>
            <Badge size="sm" tone="subtle" variant={maturity.variant}>
              {maturity.label}
            </Badge>
          </div>
          <dl className="vf-docs-component-doc__identity">
            <div>
              <dt>Package</dt>
              <dd>
                <code>{component.package}</code>
              </dd>
            </div>
            {component.nativeDeclaration?.tagName ? (
              <div>
                <dt>Custom Element</dt>
                <dd>
                  <code>{component.nativeDeclaration.tagName}</code>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Since</dt>
              <dd>{documentation?.since ?? "Requires verification"}</dd>
            </div>
            <div>
              <dt>Framework</dt>
              <dd>{framework?.label ?? frameworkId}</dd>
            </div>
          </dl>
        </section>

        <section
          className="vf-docs-component-doc__section"
          id="component-usage"
        >
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Usage
            </Text>
            <Heading level={3} size="md">
              Start with the supported path
            </Heading>
            <Text tone="muted">
              Use the selected framework surface without reimplementing the
              component behavior in application code.
            </Text>
          </div>

          <div className="vf-docs-component-doc__guidance">
            <div>
              <strong>Use when</strong>
              <Text>{component.guidance.useWhen}</Text>
            </div>
            <div>
              <strong>Avoid when</strong>
              <Text>{component.guidance.avoidWhen}</Text>
            </div>
          </div>

          {frameworkUsage ? (
            <div className="vf-docs-component-doc__example">
              <div className="vf-docs-component-doc__example-heading">
                <div>
                  <Heading level={4} size="sm">
                    {frameworkUsage.label} example
                  </Heading>
                  <Text size="sm" tone="muted">
                    {frameworkUsage.package ?? component.package}
                  </Text>
                </div>
                <Badge
                  size="sm"
                  tone="subtle"
                  variant={
                    frameworkUsage.status === "current" ? "success" : "info"
                  }
                >
                  {frameworkUsage.status}
                </Badge>
              </div>
              <div className="vf-docs-component-doc__code-stack">
                <CodeBlock
                  code={frameworkUsage.setup}
                  language={framework?.language ?? "text"}
                />
                <CodeBlock
                  code={frameworkUsage.example}
                  language={framework?.language ?? "text"}
                />
              </div>
              <Text size="sm" tone="muted">
                {frameworkUsage.note}
              </Text>
            </div>
          ) : null}
        </section>

        <section
          className="vf-docs-component-doc__section"
          id="component-configuration"
        >
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Configuration
            </Text>
            <Heading level={3} size="md">
              Composition surface
            </Heading>
          </div>
          <div className="vf-docs-component-doc__facts-grid">
            <div>
              <strong>Controlled state</strong>
              <span>
                {controlledProperties.length > 0
                  ? controlledProperties.join(", ")
                  : "No controlled state contract"}
              </span>
            </div>
            <div>
              <strong>Slots / templates</strong>
              <span>{slots.length > 0 ? slots.join(", ") : "None"}</span>
            </div>
            <div>
              <strong>Imperative methods</strong>
              <span>{methods.length > 0 ? methods.join(", ") : "None"}</span>
            </div>
            <div>
              <strong>Form association</strong>
              <span>{component.contract?.formAssociation ?? "None"}</span>
            </div>
          </div>
        </section>

        <section
          className="vf-docs-component-doc__section"
          id="component-behavior"
        >
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Behavior
            </Text>
            <Heading level={3} size="md">
              State and interaction contract
            </Heading>
            <Text tone="muted">
              These facts describe the reusable behavior VyrnForge owns. Keep
              business state, persistence, permissions, and workflow effects in
              the consuming application.
            </Text>
          </div>
          <div className="vf-docs-component-doc__behavior">
            <div>
              <strong>Public interaction events</strong>
              <span>
                {interactionEvents.length > 0
                  ? interactionEvents.join(", ")
                  : "No component-specific events"}
              </span>
            </div>
            <div>
              <strong>Library guidance</strong>
              <span>{component.guidance.aiUsageNotes}</span>
            </div>
          </div>
        </section>

        <section
          className="vf-docs-component-doc__section"
          id="component-accessibility"
        >
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Accessibility
            </Text>
            <Heading level={3} size="md">
              Semantics and keyboard expectations
            </Heading>
          </div>
          <div className="vf-docs-component-doc__accessibility">
            <Text>{component.accessibilityNotes}</Text>
            {component.contract?.accessibility?.length ? (
              <ul>
                {component.contract.accessibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {documentation ? (
              <Text size="sm" tone="muted">
                Keyboard documentation:{" "}
                {documentation.accessibility.keyboardDocumentation}
              </Text>
            ) : null}
          </div>
        </section>

        <section
          className="vf-docs-component-doc__section"
          id="component-framework-api"
        >
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              API reference
            </Text>
            <Heading level={3} size="md">
              {framework?.label ?? frameworkId} surface
            </Heading>
            <Text tone="muted">
              Generated public API for documentation version {version}. Use this
              after the usage and behavior guidance above.
            </Text>
          </div>
          {contextualApi ? (
            <FrameworkApiPanel
              component={contextualApi}
              frameworkId={frameworkId}
            />
          ) : (
            <Text size="sm" tone="muted">
              This component has no generated API surface for the selected
              framework and documentation version.
            </Text>
          )}
        </section>

        <section
          className="vf-docs-component-doc__section"
          id="component-styling"
        >
          <div className="vf-docs-component-doc__section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Styling
            </Text>
            <Heading level={3} size="md">
              Theme and extension hooks
            </Heading>
            <Text tone="muted">
              Prefer shared VyrnForge tokens and the documented public hooks
              instead of application-specific forks.
            </Text>
          </div>
          <div className="vf-docs-component-doc__facts-grid">
            <div>
              <strong>Public classes</strong>
              <span>
                {component.styling.classes.length > 0
                  ? component.styling.classes.join(", ")
                  : "None"}
              </span>
            </div>
            <div>
              <strong>Component variables</strong>
              <span>
                {component.styling.variables.length > 0
                  ? component.styling.variables.join(", ")
                  : "Uses shared semantic tokens"}
              </span>
            </div>
            <div>
              <strong>Source</strong>
              <span>
                {documentation?.sourcePath ?? component.docsPath ?? "—"}
              </span>
            </div>
            <div>
              <strong>Canonical docs</strong>
              <span>
                {documentation?.docsPath ?? component.docsPath ?? "—"}
              </span>
            </div>
          </div>
        </section>

        {showRelated ? (
          <section
            className="vf-docs-component-doc__section"
            id="component-related"
          >
            <div className="vf-docs-component-doc__section-heading">
              <Text className="vf-docs-catalog__kicker" size="sm">
                Related
              </Text>
              <Heading level={3} size="md">
                Alternatives, patterns, and limits
              </Heading>
            </div>
            {relatedComponents.length > 0 ? (
              <div className="vf-docs-component-doc__related-links">
                {relatedComponents.map((label) => {
                  const href = relatedComponentHref(label);
                  return href ? (
                    <a href={href} key={label}>
                      {label}
                    </a>
                  ) : (
                    <span key={label}>{label}</span>
                  );
                })}
              </div>
            ) : null}
            {relatedPatterns.length > 0 ? (
              <div>
                <Heading level={4} size="sm">
                  Patterns using this component
                </Heading>
                <div className="vf-docs-component-doc__related-links">
                  {relatedPatterns.map((pattern) => (
                    <a href={patternHref(pattern.id)} key={pattern.id}>
                      {pattern.displayName}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            {component.knownLimitations.length > 0 ? (
              <div>
                <Heading level={4} size="sm">
                  Known limitations
                </Heading>
                <ul>
                  {component.knownLimitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      <ComponentOutline
        componentId={component.id}
        frameworkId={frameworkId}
        showRelated={showRelated}
      />
    </div>
  );
}

function componentAreaAnchor(area: string) {
  return `component-area-${area.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`;
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
  version,
}: ComponentReferencePageProps) {
  if (componentId) {
    const component = getComponentReferenceRecord(componentId);
    if (!component) {
      return (
        <EmptyState
          className="vf-docs-state"
          title="Component not found"
          description={
            <>
              No generated component record exists for{" "}
              <code>{componentId}</code>.
            </>
          }
          action={
            <a href="#/component-reference">Return to component reference</a>
          }
        />
      );
    }
    return (
      <ComponentDetail
        component={component}
        frameworkId={frameworkId}
        version={version}
      />
    );
  }

  return (
    <div className="vf-docs-catalog">
      <section className="vf-docs-catalog__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Component directory
          </Text>
          <Heading level={3} size="md">
            Find the primitive or composition that matches the job.
          </Heading>
          <Text tone="muted">
            Browse by functional area, then open a component for framework
            usage, generated API, accessibility, styling, and limitations.
          </Text>
        </div>
        <dl className="vf-docs-catalog__stats">
          <div>
            <dt>Components</dt>
            <dd>{componentReferenceRecords.length}</dd>
          </div>
          <div>
            <dt>Areas</dt>
            <dd>{componentAreas.length}</dd>
          </div>
          <div>
            <dt>Framework</dt>
            <dd>{frameworkId}</dd>
          </div>
        </dl>
      </section>

      <nav aria-label="Component areas" className="vf-docs-catalog__jump-nav">
        {componentAreas.map(([area, components]) => (
          <a href={`#${componentAreaAnchor(area)}`} key={area}>
            <span>{area}</span>
            <small>{components.length}</small>
          </a>
        ))}
      </nav>

      <div className="vf-docs-component-groups">
        {componentAreas.map(([area, components]) => (
          <section
            className="vf-docs-component-group"
            id={componentAreaAnchor(area)}
            key={area}
          >
            <div className="vf-docs-component-group__heading">
              <div>
                <Text className="vf-docs-catalog__kicker" size="sm">
                  {String(components.length).padStart(2, "0")} components
                </Text>
                <Heading level={3} size="md">
                  {area}
                </Heading>
              </div>
              <a href="#vf-reference-main">Back to top</a>
            </div>
            <div className="vf-docs-component-index">
              {[...components]
                .sort((left, right) =>
                  left.displayName.localeCompare(right.displayName),
                )
                .map((component) => (
                  <ComponentIndexRow component={component} key={component.id} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
