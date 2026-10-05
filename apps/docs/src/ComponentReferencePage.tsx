import {
  Badge,
  Button,
  EmptyState,
  Heading,
  Text,
} from "@vyrnforge/ui-components";

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
  componentReferenceRecords,
  getComponentDocumentation,
  getComponentReferenceRecord,
  getContractEnumValues,
  getRelatedPatterns,
  type ComponentReferenceRecord,
  type ReferenceFrameworkId,
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

function CopyableCode({ code, language }: { code: string; language: string }) {
  return (
    <div className="vf-docs-code-block">
      <div className="vf-docs-code-block__header">
        <span className="vf-docs-code-block__language">{language}</span>
        <Button
          className="vf-docs-code-block__copy"
          onClick={() => void navigator.clipboard?.writeText(code)}
          size="sm"
          variant="ghost"
        >
          Copy
        </Button>
      </div>
      <pre className="vf-docs-code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
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
        <span>{component.category}</span>
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
  hasAnatomy,
  hasCapabilityMatrix,
  showLimitations,
}: {
  componentId: string;
  frameworkId: DocsFrameworkId;
  hasAnatomy: boolean;
  hasCapabilityMatrix: boolean;
  showLimitations: boolean;
}) {
  const sections = [
    ["component-overview", "Overview"],
    ["component-specimen", "Live specimen"],
    ["component-usage", "When to use"],
    ...(hasCapabilityMatrix
      ? [["component-capabilities", "Variants, sizes & states"]]
      : []),
    ...(hasAnatomy ? [["component-anatomy", "Anatomy"]] : []),
    ["component-accessibility-styling", "Accessibility & interaction"],
    ["component-framework-usage", "Framework usage"],
    ["component-theming", "Theming"],
    ["component-related", "Related components & patterns"],
    ...(showLimitations ? [["component-limitations", "Limitations"]] : []),
    ["component-framework-api", "Generated API reference"],
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
          Generated API
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
  const documentation = getComponentDocumentation(component.id);
  const relatedPatterns = getRelatedPatterns(component.id);
  const showLimitations = component.knownLimitations.length > 0;
  const variantValues = documentation?.controls.some(
    (control) => control.property === "variant",
  )
    ? getContractEnumValues(component, "variant")
    : [];
  const sizeValues = documentation?.controls.some(
    (control) => control.property === "size",
  )
    ? getContractEnumValues(component, "size")
    : [];
  const stateValues =
    documentation?.controls
      .filter((control) => control.kind === "boolean")
      .map((control) => control.label) ?? [];
  const hasCapabilityMatrix =
    variantValues.length > 0 || sizeValues.length > 0 || stateValues.length > 0;
  const hasAnatomy = (documentation?.anatomy.length ?? 0) > 0;
  const framework = referenceModel.frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  const apiId = framework?.apiSurface as FrameworkApiId | undefined;
  const contextualApi = apiId ? apiComponent(component.id, apiId) : undefined;
  const frameworkUsage =
    component.frameworks[frameworkId as ReferenceFrameworkId] ?? null;

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <section className="vf-docs-reference__section" id="component-overview">
          <Text size="sm">
            <a href="#/component-reference">← Component reference</a>
          </Text>
          <div className="vf-docs-catalog-row__header">
            <div>
              <Heading level={3} size="md">
                {component.displayName}
              </Heading>
              <Text size="sm" tone="muted">
                {component.category}
                {" · "}
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
        </section>

        <div id="component-specimen">
          <ReferenceComponentSpecimen
            componentId={component.id}
            relatedPatterns={relatedPatterns.map((pattern) => pattern.id)}
          />
        </div>

        <section className="vf-docs-reference__section" id="component-usage">
          <Heading level={3} size="md">
            When to use
          </Heading>
          <MemberList label="Use when" values={[component.guidance.useWhen]} />
          <MemberList
            label="When not to use"
            values={[component.guidance.avoidWhen]}
          />
        </section>

        {hasCapabilityMatrix && (
          <section
            className="vf-docs-reference__section"
            id="component-capabilities"
          >
            <Heading level={3} size="md">
              Variants, sizes & states
            </Heading>
            <Text tone="muted">
              Values shown here resolve from the canonical public component
              contract. Documentation metadata only decides which capabilities
              are useful to expose as specimens.
            </Text>
            {variantValues.length > 0 && (
              <MemberList label="Variants" values={variantValues} />
            )}
            {sizeValues.length > 0 && (
              <MemberList label="Sizes" values={sizeValues} />
            )}
            {stateValues.length > 0 && (
              <MemberList label="Interactive states" values={stateValues} />
            )}
          </section>
        )}

        {hasAnatomy && (
          <section className="vf-docs-reference__section" id="component-anatomy">
            <Heading level={3} size="md">
              Anatomy & composition
            </Heading>
            <MemberList
              label="Semantic parts"
              values={documentation?.anatomy ?? []}
            />
          </section>
        )}

        <section
          className="vf-docs-reference__section"
          id="component-accessibility-styling"
        >
          <Heading level={3} size="md">
            Accessibility & interaction
          </Heading>
          <MemberList
            label="Accessibility guidance"
            values={[
              component.accessibilityNotes,
              ...(component.contract?.accessibility ?? []),
            ].filter(Boolean)}
          />
          <MemberList
            label="Evidence state"
            values={[
              `Component maturity: ${maturity.label}`,
              "Reference does not infer or promote manual assistive-technology verification beyond canonical evidence.",
            ]}
          />
        </section>

        <section
          className="vf-docs-reference__section"
          id="component-framework-usage"
        >
          <Heading level={3} size="md">
            Framework usage
          </Heading>
          <Text tone="muted">
            {framework?.label ?? frameworkId} is the active Reference context.
            Switch framework context in the Reference shell to view the same
            component contract through Native HTML, React, Angular, or Vue.
          </Text>
          {frameworkUsage ? (
            <div className="vf-docs-framework-usage">
              <div className="vf-docs-framework-usage__meta">
                <Badge size="sm" tone="subtle">
                  {frameworkUsage.status}
                </Badge>
                {frameworkUsage.package && <code>{frameworkUsage.package}</code>}
              </div>
              {frameworkUsage.setup && (
                <CopyableCode
                  code={frameworkUsage.setup}
                  language={frameworkUsage.label}
                />
              )}
              {frameworkUsage.example && (
                <CopyableCode
                  code={frameworkUsage.example}
                  language={`${frameworkUsage.label} example`}
                />
              )}
              {frameworkUsage.note && (
                <Text size="sm" tone="muted">
                  {frameworkUsage.note}
                </Text>
              )}
            </div>
          ) : (
            <Text size="sm" tone="muted">
              No generated usage example is available for this framework
              context.
            </Text>
          )}
        </section>

        <section className="vf-docs-reference__section" id="component-theming">
          <Heading level={3} size="md">
            Theming & design tokens
          </Heading>
          <Text tone="muted">
            These are the canonical styling surfaces already associated with
            this component. Shared VyrnForge tokens remain the customization
            foundation.
          </Text>
          <MemberList
            label="CSS variables"
            values={component.styling.variables}
          />
          <MemberList
            label="Public classes"
            values={component.styling.classes}
          />
        </section>

        <section className="vf-docs-reference__section" id="component-related">
          <Heading level={3} size="md">
            Related components & patterns
          </Heading>
          <MemberList
            label="Related components"
            values={component.guidance.relatedComponents}
          />
          <MemberList
            label="Patterns using this component"
            values={relatedPatterns.map((pattern) => pattern.displayName)}
          />
        </section>

        {showLimitations && (
          <section
            className="vf-docs-reference__section"
            id="component-limitations"
          >
            <Heading level={3} size="md">
              Known limitations
            </Heading>
            <MemberList
              label="Current limitations"
              values={component.knownLimitations}
            />
          </section>
        )}

        <section
          className="vf-docs-reference__section"
          id="component-framework-api"
        >
          <Heading level={3} size="md">
            Generated API reference
          </Heading>
          <Text tone="muted">
            Authoritative generated API facts for {framework?.label ?? frameworkId}{" "}
            documentation version {version}. Use this layer after the behavior,
            accessibility, framework, and theming guidance above.
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
        hasAnatomy={hasAnatomy}
        hasCapabilityMatrix={hasCapabilityMatrix}
        showLimitations={showLimitations}
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
              Browse by functional area, then open a component to see live UI,
              usage guidance, supported states, accessibility, framework usage,
              theming surfaces, and only then the generated API reference.
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
                    <ComponentIndexRow
                      component={component}
                      key={component.id}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
