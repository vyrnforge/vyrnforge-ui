import * as VyrnForgeComponents from "@vyrnforge/ui-components";
import { Badge, EmptyState, Heading, Text } from "@vyrnforge/ui-components";
import {
  Component as ReactComponent,
  createElement,
  type ElementType,
  type ReactNode,
} from "react";
import { CodeBlock } from "./examples/components/CodeBlock";

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
  getComponentReferenceRecord,
  getRelatedPatterns,
  type ComponentReferenceRecord,
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
        <span>Available across VyrnForge surfaces</span>
      </div>
    </article>
  );
}

class ComponentSpecimenBoundary extends ReactComponent<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <Text size="sm" tone="muted">
          This component needs additional context for an isolated live specimen.
          Use the verified framework example below.
        </Text>
      );
    }
    return this.props.children;
  }
}

function ComponentLiveSpecimen({
  component,
}: {
  component: ComponentReferenceRecord;
}) {
  const reactApi = apiComponent(component.id, "react");
  const exportName = reactApi?.export;
  const candidate = exportName
    ? VyrnForgeComponents[exportName as keyof typeof VyrnForgeComponents]
    : undefined;
  const hasRequiredInputs =
    reactApi?.properties.some(
      (property) => property.required && property.default === undefined,
    ) ?? true;
  const canRender =
    !hasRequiredInputs &&
    candidate !== undefined &&
    (typeof candidate === "function" || typeof candidate === "object");

  if (!canRender || !reactApi) return null;

  const props: Record<string, unknown> = {};
  if (reactApi.slots.some((slot) => slot.public === "children")) {
    props.children = component.displayName;
  }

  return (
    <div className="vf-docs-component-live-specimen">
      <div className="vf-docs-component-live-specimen__heading">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Live specimen
          </Text>
          <Heading level={3} size="md">
            See the component before reading its contract.
          </Heading>
        </div>
        <Text size="sm" tone="muted">
          Rendered by the Reference host from the real VyrnForge component.
        </Text>
      </div>
      <div className="vf-docs-component-live-specimen__stage">
        <ComponentSpecimenBoundary>
          {createElement(candidate as ElementType, props)}
        </ComponentSpecimenBoundary>
      </div>
    </div>
  );
}

function ComponentUsageExample({
  component,
  frameworkId,
}: {
  component: ComponentReferenceRecord;
  frameworkId: DocsFrameworkId;
}) {
  const usage = component.frameworks[frameworkId];
  return (
    <div className="vf-docs-component-example">
      <div className="vf-docs-component-example__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            {usage.label} example
          </Text>
          <Heading level={3} size="md">
            Start from the public surface.
          </Heading>
          <Text tone="muted">{usage.note}</Text>
        </div>
        <Badge size="sm" tone="subtle" variant="success">
          {usage.status}
        </Badge>
      </div>
      <div className="vf-docs-component-example__code">
        {usage.setup ? (
          <div>
            <Text size="sm" tone="muted">
              Setup
            </Text>
            <CodeBlock code={usage.setup} />
          </div>
        ) : null}
        <div>
          <Text size="sm" tone="muted">
            Usage
          </Text>
          <CodeBlock code={usage.example} />
        </div>
      </div>
    </div>
  );
}

const presentationProperties = new Set([
  "variant",
  "size",
  "tone",
  "density",
  "orientation",
  "placement",
  "align",
  "justify",
  "loading",
  "disabled",
  "selected",
  "checked",
  "multiple",
  "fullWidth",
]);

function ComponentOptions({
  component,
}: {
  component: FrameworkApiComponent | undefined;
}) {
  const options =
    component?.properties.filter((property) =>
      presentationProperties.has(property.public),
    ) ?? [];

  if (options.length === 0) return null;

  return (
    <section className="vf-docs-reference__section" id="component-options">
      <div className="vf-docs-section-heading">
        <Text className="vf-docs-catalog__kicker" size="sm">
          Variants & states
        </Text>
        <Heading level={3} size="md">
          The public options you will reach for most.
        </Heading>
      </div>
      <div className="vf-docs-component-options">
        {options.map((property) => (
          <article key={property.public}>
            <div>
              <Heading level={4} size="sm">
                <code>{property.public}</code>
              </Heading>
              {property.default !== undefined ? (
                <Text size="sm" tone="muted">
                  Default: <code>{formatDefault(property.default)}</code>
                </Text>
              ) : null}
            </div>
            <code>{property.type}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComponentOutline({
  componentId,
  frameworkId,
  showLimitations,
  showOptions,
}: {
  componentId: string;
  frameworkId: DocsFrameworkId;
  showLimitations: boolean;
  showOptions: boolean;
}) {
  const sections = [
    ["component-overview", "Overview"],
    ["component-example", "Example"],
    ["component-guidance", "When to use"],
    ...(showOptions ? [["component-options", "Variants & states"]] : []),
    ["component-accessibility-styling", "Accessibility & styling"],
    ...(showLimitations
      ? [["component-related", "Related & limitations"]]
      : []),
    ["component-framework-api", "API reference"],
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
          API deep links
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
  const relatedPatterns = getRelatedPatterns(component.id);
  const showLimitations =
    component.knownLimitations.length > 0 || relatedPatterns.length > 0;
  const framework = referenceModel.frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  const apiId = framework?.apiSurface as FrameworkApiId | undefined;
  const contextualApi = apiId ? apiComponent(component.id, apiId) : undefined;
  const showOptions =
    contextualApi?.properties.some((property) =>
      presentationProperties.has(property.public),
    ) ?? false;

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference vf-docs-component-detail">
        <section
          className="vf-docs-reference__section vf-docs-component-detail__intro"
          id="component-overview"
        >
          <Text size="sm">
            <a href="#/component-reference">← Components</a>
          </Text>
          <div className="vf-docs-component-detail__identity">
            <div>
              <Text className="vf-docs-catalog__kicker" size="sm">
                {component.category.replace(/-/gu, " ")}
              </Text>
              <Heading level={3} size="lg">
                {component.displayName}
              </Heading>
              <Text size="lg" tone="muted">
                {component.purpose}
              </Text>
            </div>
            <Badge size="sm" tone="subtle" variant={maturity.variant}>
              {maturity.label}
            </Badge>
          </div>
        </section>

        <section className="vf-docs-reference__section" id="component-example">
          <ComponentLiveSpecimen component={component} />
          <ComponentUsageExample
            component={component}
            frameworkId={frameworkId}
          />
        </section>

        <section className="vf-docs-reference__section" id="component-guidance">
          <div className="vf-docs-section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Guidance
            </Text>
            <Heading level={3} size="md">
              When this component belongs in the interface.
            </Heading>
          </div>
          <div className="vf-docs-component-guidance">
            <article>
              <strong>Use when</strong>
              <Text>{component.guidance.useWhen}</Text>
            </article>
            <article>
              <strong>Avoid when</strong>
              <Text>{component.guidance.avoidWhen}</Text>
            </article>
          </div>
        </section>

        <ComponentOptions component={contextualApi} />

        <section
          className="vf-docs-reference__section"
          id="component-accessibility-styling"
        >
          <div className="vf-docs-section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Accessibility & styling
            </Text>
            <Heading level={3} size="md">
              Behavior and visual extension points.
            </Heading>
          </div>
          <div className="vf-docs-component-guidance">
            <article>
              <strong>Accessibility</strong>
              <Text>
                {[
                  component.accessibilityNotes,
                  ...(component.contract?.accessibility ?? []),
                ]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            </article>
            <article>
              <strong>Styling surface</strong>
              <Text size="sm" tone="muted">
                Public classes
              </Text>
              <div className="vf-docs-component-code-list">
                {component.styling.classes.length > 0 ? (
                  component.styling.classes.map((value) => (
                    <code key={value}>{value}</code>
                  ))
                ) : (
                  <span>Use shared VyrnForge tokens and component props.</span>
                )}
              </div>
              {component.styling.variables.length > 0 ? (
                <>
                  <Text size="sm" tone="muted">
                    CSS variables
                  </Text>
                  <div className="vf-docs-component-code-list">
                    {component.styling.variables.map((value) => (
                      <code key={value}>{value}</code>
                    ))}
                  </div>
                </>
              ) : null}
            </article>
          </div>
        </section>

        {showLimitations ? (
          <section
            className="vf-docs-reference__section"
            id="component-related"
          >
            <div className="vf-docs-section-heading">
              <Text className="vf-docs-catalog__kicker" size="sm">
                Continue building
              </Text>
              <Heading level={3} size="md">
                Related components and patterns.
              </Heading>
            </div>
            <div className="vf-docs-component-related">
              {component.guidance.relatedComponents.length > 0 ? (
                <div>
                  <strong>Related components</strong>
                  <div className="vf-docs-discovery-links">
                    {component.guidance.relatedComponents.map((name) => {
                      const related = componentReferenceRecords.find(
                        (candidate) =>
                          candidate.displayName === name ||
                          candidate.id === name,
                      );
                      return related ? (
                        <a href={componentHref(related.id)} key={name}>
                          {name}
                        </a>
                      ) : (
                        <span key={name}>{name}</span>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {relatedPatterns.length > 0 ? (
                <div>
                  <strong>Patterns</strong>
                  <div className="vf-docs-discovery-links">
                    {relatedPatterns.map((pattern) => (
                      <a
                        href={`#${getReferenceRecordRoute(
                          referenceModel,
                          "patterns",
                          pattern.id,
                        )}`}
                        key={pattern.id}
                      >
                        {pattern.displayName}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {component.knownLimitations.length > 0 ? (
                <div>
                  <strong>Known limitations</strong>
                  <ul>
                    {component.knownLimitations.map((limitation) => (
                      <li key={limitation}>{limitation}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section
          className="vf-docs-reference__section vf-docs-component-api-reference"
          id="component-framework-api"
        >
          <div className="vf-docs-section-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              API reference
            </Text>
            <Heading level={3} size="md">
              Generated {framework?.label ?? frameworkId} contract.
            </Heading>
            <Text tone="muted">
              Detailed API facts for documentation version {version}. Use this
              section when you need exact inputs, events, slots, or methods.
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
      </div>
      <ComponentOutline
        componentId={component.id}
        frameworkId={frameworkId}
        showLimitations={showLimitations}
        showOptions={showOptions}
      />
    </div>
  );
}

const componentCategoryPresentation: Record<
  string,
  { label: string; order: number }
> = {
  primitive: { label: "Primitives", order: 0 },
  "form-control": { label: "Form controls", order: 1 },
  navigation: { label: "Navigation", order: 2 },
  feedback: { label: "Feedback", order: 3 },
  overlay: { label: "Overlays", order: 4 },
  "data-display": { label: "Data display", order: 5 },
  composite: { label: "Layout & composition", order: 6 },
  "data-grid": { label: "Data grid", order: 7 },
  "grid-feature": { label: "Grid features", order: 8 },
};

function componentAreaLabel(area: string) {
  return (
    componentCategoryPresentation[area]?.label ??
    area.replace(/-/gu, " ").replace(/^./u, (value) => value.toUpperCase())
  );
}

function componentAreaAnchor(area: string) {
  return `component-area-${area.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`;
}

const componentAreas = Object.entries(
  componentReferenceRecords.reduce<Record<string, ComponentReferenceRecord[]>>(
    (areas, component) => {
      if (component.category !== "internal") {
        (areas[component.category] ??= []).push(component);
      }
      return areas;
    },
    {},
  ),
).sort(
  ([left], [right]) =>
    (componentCategoryPresentation[left]?.order ?? 99) -
      (componentCategoryPresentation[right]?.order ?? 99) ||
    left.localeCompare(right),
);

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
            Browse by the UI problem you are solving. Each component page starts
            with usage, variants, accessibility, and framework examples; exact
            API details come last.
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
            <span>{componentAreaLabel(area)}</span>
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
                  {componentAreaLabel(area)}
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
