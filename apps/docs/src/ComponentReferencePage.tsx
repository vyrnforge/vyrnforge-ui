import { Badge, EmptyState, Heading, Text } from "@vyrnforge/ui-components";

import frameworkApiReferenceRaw from "../../../docs/generated/framework-api-reference.json?raw";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import {
  componentApiMemberAnchor,
  componentReferenceTargetHref,
} from "./componentApiMember";
import { getComponentMaturityPresentation } from "./componentMaturityPresentation";
import { referenceModel, type DocsFrameworkId } from "./docsContext";
import { ReferenceComponentGallery } from "./ReferenceComponentGallery";
import { ReferenceComponentSpecimen } from "./ReferenceComponentSpecimen";
import {
  getAvailableComponentReferenceRecords,
  getComponentAccessibilityEvidence,
  getComponentDocumentationCapabilities,
  getComponentReferenceRecord,
  getRelatedPatterns,
  isComponentAvailableForFramework,
  type ComponentReferenceRecord,
  type ReferenceContractProperty,
  type ReferenceFrameworkUsage,
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

function DetailList({
  label,
  values,
}: {
  label: string;
  values: readonly string[];
}) {
  return (
    <div className="vf-docs-detail-list">
      <strong>{label}</strong>
      <div className="vf-docs-detail-list__values">
        {values.length > 0 ? (
          values.map((value) => <span key={value}>{value}</span>)
        ) : (
          <span>None</span>
        )}
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
  frameworkId,
}: {
  component: FrameworkApiComponent;
  frameworkId: DocsFrameworkId;
}) {
  return (
    <div className="vf-docs-framework-api">
      <div className="vf-docs-framework-api__meta">
        <code>{component.package}</code>
        {component.export ? <code>export {component.export}</code> : null}
        {component.tag ? <code>{component.tag}</code> : null}
      </div>

      <section
        aria-labelledby="api-setup-heading"
        className="vf-docs-api-section"
        id="api-setup"
      >
        <Heading level={4} size="sm" id="api-setup-heading">
          Setup
        </Heading>
        <DetailList label="Imports / registration" values={component.setup} />
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
        <DetailList label="Guidance" values={component.accessibility} />
      </section>
    </div>
  );
}

function SelectedFrameworkExample({
  framework,
  usage,
}: {
  framework: string;
  usage: ReferenceFrameworkUsage;
}) {
  return (
    <section
      className="vf-docs-reference__section vf-docs-selected-example"
      id="component-example-code"
    >
      <div className="vf-docs-selected-example__heading">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Code
          </Text>
          <Heading level={3} size="md">
            {framework} example
          </Heading>
        </div>
        {usage.package ? <code>{usage.package}</code> : null}
      </div>
      <pre>
        <code>{usage.example}</code>
      </pre>
      {usage.setup.trim() ? (
        <details className="vf-docs-selected-example__setup">
          <summary>Setup for {framework}</summary>
          <pre>
            <code>{usage.setup}</code>
          </pre>
        </details>
      ) : null}
    </section>
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

function controlType(
  control: ReferenceContractProperty,
  contextualApi: FrameworkApiComponent | undefined,
) {
  return (
    contextualApi?.properties.find(
      (property) => property.public === control.name,
    )?.type ??
    control.type.typeName ??
    control.type.kind
  );
}

function CustomizationCard({
  control,
  contextualApi,
  description,
  title,
}: {
  control: ReferenceContractProperty;
  contextualApi: FrameworkApiComponent | undefined;
  description: string;
  title: string;
}) {
  return (
    <article className="vf-docs-customization-card">
      <Heading level={4} size="sm">
        {title}
      </Heading>
      <Text tone="muted">{description}</Text>
      <dl>
        <div>
          <dt>Property</dt>
          <dd>
            <code>{control.name}</code>
          </dd>
        </div>
        <div>
          <dt>Values</dt>
          <dd>
            <code>{controlType(control, contextualApi)}</code>
          </dd>
        </div>
        <div>
          <dt>Default</dt>
          <dd>
            <code>{formatDefault(control.default)}</code>
          </dd>
        </div>
      </dl>
    </article>
  );
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
      <Text size="sm">{component.guidance.useWhen}</Text>
    </article>
  );
}

function ComponentOutline({
  componentId,
  frameworkId,
  showCapabilities,
  showComposition,
  showInteraction,
  showTheming,
  showRelated,
}: {
  componentId: string;
  frameworkId: DocsFrameworkId;
  showCapabilities: boolean;
  showComposition: boolean;
  showInteraction: boolean;
  showTheming: boolean;
  showRelated: boolean;
}) {
  const sections = [
    ["component-overview", "Overview"],
    ["component-specimen", "Example"],
    ["component-example-code", "Code"],
    ["component-usage", "Usage"],
    ...(showCapabilities ? [["component-capabilities", "Customization"]] : []),
    ...(showComposition ? [["component-composition", "Composition"]] : []),
    ...(showInteraction ? [["component-interaction", "Behavior"]] : []),
    ["component-accessibility", "Accessibility"],
    ...(showTheming ? [["component-theming", "Styling"]] : []),
    ...(showRelated ? [["component-related-maturity", "Related"]] : []),
    ["component-generated-api", "API"],
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
          API
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
  const capabilities = getComponentDocumentationCapabilities(component);
  const accessibilityEvidence = getComponentAccessibilityEvidence(component.id);
  const showCapabilities = capabilities.controls.length > 0;
  const showComposition = capabilities.compositionSlots.length > 0;
  const showInteraction =
    capabilities.interactive ||
    Boolean(accessibilityEvidence?.keyboardDocumentation);
  const showTheming =
    capabilities.themingClasses.length > 0 ||
    capabilities.themingVariables.length > 0;
  const showRelated =
    component.guidance.relatedComponents.length > 0 ||
    component.knownLimitations.length > 0 ||
    relatedPatterns.length > 0;
  const framework = referenceModel.frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  const frameworkUsage = component.frameworks[frameworkId];
  const apiId = framework?.apiSurface as FrameworkApiId | undefined;
  const contextualApi = apiId ? apiComponent(component.id, apiId) : undefined;
  const frameworkLabel = framework?.label ?? frameworkId;

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <section className="vf-docs-reference__section" id="component-overview">
          <Text size="sm">
            <a href="#/component-reference">← Component reference</a>
          </Text>
          <div className="vf-docs-component-heading">
            <div>
              <Heading level={2} size="lg">
                {component.displayName}
              </Heading>
              <Text
                className="vf-docs-component-heading__meta"
                size="sm"
                tone="muted"
              >
                <code>{component.package}</code>
                {component.nativeDeclaration?.tagName ? (
                  <>
                    {" "}
                    · <code>{component.nativeDeclaration.tagName}</code>
                  </>
                ) : null}
              </Text>
            </div>
            <Badge size="sm" tone="subtle" variant={maturity.variant}>
              {maturity.label}
            </Badge>
          </div>
          <Text className="vf-docs-component-lede">{component.purpose}</Text>
        </section>

        <div id="component-specimen">
          <div className="vf-docs-human-example-heading">
            <Text className="vf-docs-catalog__kicker" size="sm">
              Example
            </Text>
            <Heading level={3} size="md">
              Live preview
            </Heading>
          </div>
          <ReferenceComponentSpecimen
            componentId={component.id}
            relatedPatterns={relatedPatterns.map((pattern) => pattern.id)}
          />
        </div>

        <SelectedFrameworkExample
          framework={frameworkLabel}
          usage={frameworkUsage}
        />

        <section className="vf-docs-reference__section" id="component-usage">
          <Heading level={3} size="md">
            Usage
          </Heading>
          <div className="vf-docs-guidance-grid">
            <article className="vf-docs-guidance-card">
              <Text className="vf-docs-catalog__kicker" size="sm">
                Use it when
              </Text>
              <Text>{component.guidance.useWhen}</Text>
            </article>
            <article className="vf-docs-guidance-card">
              <Text className="vf-docs-catalog__kicker" size="sm">
                Choose another approach when
              </Text>
              <Text>{component.guidance.avoidWhen}</Text>
            </article>
          </div>
        </section>

        {showCapabilities ? (
          <section
            className="vf-docs-reference__section"
            id="component-capabilities"
          >
            <Heading level={3} size="md">
              Customization
            </Heading>
            <Text tone="muted">
              Explore the public options this component exposes. The values
              shown here follow the selected framework while the behavior stays
              shared across VyrnForge surfaces.
            </Text>
            <div className="vf-docs-customization-grid">
              {capabilities.variantControl ? (
                <CustomizationCard
                  control={capabilities.variantControl}
                  contextualApi={contextualApi}
                  description="Choose the visual intent that fits the action or context."
                  title="Variants"
                />
              ) : null}
              {capabilities.sizeControl ? (
                <CustomizationCard
                  control={capabilities.sizeControl}
                  contextualApi={contextualApi}
                  description="Adjust the component scale without changing its behavior."
                  title="Sizing"
                />
              ) : null}
              {capabilities.densityControl ? (
                <CustomizationCard
                  control={capabilities.densityControl}
                  contextualApi={contextualApi}
                  description="Tune spacing and information density for the surrounding UI."
                  title="Density"
                />
              ) : null}
              {capabilities.states.length > 0 ? (
                <article className="vf-docs-customization-card">
                  <Heading level={4} size="sm">
                    States
                  </Heading>
                  <Text tone="muted">
                    State properties change how the component behaves or
                    presents its current condition.
                  </Text>
                  <div className="vf-docs-customization-card__states">
                    {capabilities.states.map((control) => (
                      <code key={control.name}>{control.name}</code>
                    ))}
                  </div>
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {showComposition ? (
          <section
            className="vf-docs-reference__section"
            id="component-composition"
          >
            <Heading level={3} size="md">
              Composition
            </Heading>
            <Text tone="muted">
              Content regions remain conceptually consistent across framework
              adapters.
            </Text>
            <DetailList
              label="Content regions"
              values={capabilities.compositionSlots.map((slot) =>
                [
                  slot.name,
                  slot.content,
                  slot.required ? "required" : "optional",
                  slot.multiple ? "multiple" : null,
                ]
                  .filter(Boolean)
                  .join(" · "),
              )}
            />
          </section>
        ) : null}

        {showInteraction ? (
          <section
            className="vf-docs-reference__section"
            id="component-interaction"
          >
            <Heading level={3} size="md">
              Behavior
            </Heading>
            {capabilities.interactionEvents.length > 0 ? (
              <DetailList
                label="Events"
                values={capabilities.interactionEvents.map(
                  (event) => event.name,
                )}
              />
            ) : null}
            {capabilities.interactionMethods.length > 0 ? (
              <DetailList
                label="Methods"
                values={capabilities.interactionMethods.map(
                  (method) => method.name,
                )}
              />
            ) : null}
            {accessibilityEvidence ? (
              <DetailList
                label="Keyboard guidance"
                values={[
                  accessibilityEvidence.keyboardDocumentation ===
                  "requires-verification"
                    ? "Verification in progress"
                    : accessibilityEvidence.keyboardDocumentation,
                ]}
              />
            ) : null}
          </section>
        ) : null}

        <section
          className="vf-docs-reference__section"
          id="component-accessibility"
        >
          <Heading level={3} size="md">
            Accessibility
          </Heading>
          <div className="vf-docs-accessibility-guidance">
            {[
              component.accessibilityNotes,
              ...(component.contract?.accessibility ?? []),
            ]
              .filter(Boolean)
              .map((note) => (
                <Text key={note}>{note}</Text>
              ))}
          </div>
          {accessibilityEvidence ? (
            <details className="vf-docs-evidence-details">
              <summary>Verification details</summary>
              <DetailList
                label="Evidence status"
                values={[accessibilityEvidence.evidenceStatus]}
              />
              <DetailList
                label="Source"
                values={[accessibilityEvidence.documentationPath]}
              />
            </details>
          ) : null}
        </section>

        {showTheming ? (
          <section
            className="vf-docs-reference__section"
            id="component-theming"
          >
            <Heading level={3} size="md">
              Styling & customization
            </Heading>
            <Text tone="muted">
              Prefer the VyrnForge styling surface and shared design tokens over
              application-local forks.
            </Text>
            {capabilities.themingClasses.length > 0 ? (
              <DetailList
                label="Public classes"
                values={capabilities.themingClasses}
              />
            ) : null}
            {capabilities.themingVariables.length > 0 ? (
              <DetailList
                label="CSS variables"
                values={capabilities.themingVariables}
              />
            ) : null}
          </section>
        ) : null}

        {showRelated ? (
          <section
            className="vf-docs-reference__section"
            id="component-related-maturity"
          >
            <Heading level={3} size="md">
              Related components
            </Heading>
            {component.guidance.relatedComponents.length > 0 ? (
              <DetailList
                label="Explore next"
                values={component.guidance.relatedComponents}
              />
            ) : null}
            {relatedPatterns.length > 0 ? (
              <DetailList
                label="Patterns"
                values={relatedPatterns.map((pattern) => pattern.displayName)}
              />
            ) : null}
            {component.knownLimitations.length > 0 ? (
              <DetailList
                label="Limitations"
                values={component.knownLimitations}
              />
            ) : null}
          </section>
        ) : null}

        <section
          className="vf-docs-reference__section"
          id="component-generated-api"
        >
          <Heading level={3} size="md">
            API
          </Heading>
          <Text tone="muted">
            {frameworkLabel} API for documentation version {version}.
          </Text>
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
        showCapabilities={showCapabilities}
        showComposition={showComposition}
        showInteraction={showInteraction}
        showRelated={showRelated}
        showTheming={showTheming}
      />
    </div>
  );
}

function componentAreaAnchor(area: string) {
  return `component-area-${area.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`;
}

function groupComponents(components: ComponentReferenceRecord[]) {
  return Object.entries(
    components.reduce<Record<string, ComponentReferenceRecord[]>>(
      (areas, component) => {
        (areas[component.category] ??= []).push(component);
        return areas;
      },
      {},
    ),
  ).sort(([left], [right]) => left.localeCompare(right));
}

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
    if (!isComponentAvailableForFramework(component, frameworkId, version)) {
      return (
        <EmptyState
          className="vf-docs-state"
          title="Component unavailable in this context"
          description={
            <>
              <code>{component.displayName}</code> is not available for{" "}
              <code>{frameworkId}</code> in documentation version{" "}
              <code>{version}</code>.
            </>
          }
          action={
            <a href="#/component-reference">Browse available components</a>
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

  const availableComponents = getAvailableComponentReferenceRecords(
    frameworkId,
    version,
  );
  const componentAreas = groupComponents(availableComponents);

  return (
    <div className="vf-docs-component-reference">
      <ReferenceComponentGallery />
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
              Browse components available to {frameworkId} in documentation
              version {version}, then open a record for live UI, usage guidance,
              customization, accessibility, and API details.
            </Text>
          </div>
          <dl className="vf-docs-catalog__stats">
            <div>
              <dt>Components</dt>
              <dd>{availableComponents.length}</dd>
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
                {components.map((component) => (
                  <ComponentIndexRow component={component} key={component.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
