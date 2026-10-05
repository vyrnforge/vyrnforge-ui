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

function FrameworkUsagePanel({
  framework,
  usage,
}: {
  framework: string;
  usage: ReferenceFrameworkUsage;
}) {
  return (
    <div className="vf-docs-framework-usage">
      <div className="vf-docs-framework-usage__meta">
        <Badge size="sm" tone="subtle">
          {usage.status}
        </Badge>
        {usage.package ? <code>{usage.package}</code> : null}
      </div>
      <Text tone="muted">{usage.note}</Text>
      <div className="vf-docs-api-section">
        <Heading level={4} size="sm">
          Setup
        </Heading>
        <pre>
          <code>{usage.setup}</code>
        </pre>
      </div>
      <div className="vf-docs-api-section">
        <Heading level={4} size="sm">
          {framework} example
        </Heading>
        <pre>
          <code>{usage.example}</code>
        </pre>
      </div>
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

function controlSummary(
  control: ReferenceContractProperty,
  contextualApi: FrameworkApiComponent | undefined,
) {
  const apiProperty = contextualApi?.properties.find(
    (property) => property.public === control.name,
  );
  const type = apiProperty?.type ?? control.type.typeName ?? control.type.kind;
  return `${control.name}: ${type} · default ${formatDefault(control.default)}`;
}

function slotSummary(slot: {
  name: string;
  required?: boolean;
  multiple?: boolean;
  content?: string;
}) {
  return [
    slot.name,
    slot.content,
    slot.required ? "required" : "optional",
    slot.multiple ? "multiple" : null,
  ]
    .filter(Boolean)
    .join(" · ");
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
    ["component-specimen", "Live specimen"],
    ["component-usage", "Usage"],
    ...(showCapabilities
      ? [["component-capabilities", "Variants, sizes & states"]]
      : []),
    ...(showComposition
      ? [["component-composition", "Anatomy & composition"]]
      : []),
    ...(showInteraction
      ? [["component-interaction", "Interaction & keyboard"]]
      : []),
    ["component-accessibility", "Accessibility & evidence"],
    ["component-framework-usage", "Framework usage"],
    ...(showTheming ? [["component-theming", "Theming & tokens"]] : []),
    ...(showRelated
      ? [["component-related-maturity", "Related & maturity"]]
      : []),
    ["component-generated-api", "Generated API reference"],
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

        {showCapabilities ? (
          <section
            className="vf-docs-reference__section"
            id="component-capabilities"
          >
            <Heading level={3} size="md">
              Variants, sizes & states
            </Heading>
            <Text tone="muted">
              Controls come from the canonical public component contract.
              Framework types come from the selected generated API surface.
            </Text>
            {capabilities.variantControl ? (
              <MemberList
                label="Variant control"
                values={[
                  controlSummary(capabilities.variantControl, contextualApi),
                ]}
              />
            ) : null}
            {capabilities.sizeControl ? (
              <MemberList
                label="Size control"
                values={[
                  controlSummary(capabilities.sizeControl, contextualApi),
                ]}
              />
            ) : null}
            {capabilities.densityControl ? (
              <MemberList
                label="Density control"
                values={[
                  controlSummary(capabilities.densityControl, contextualApi),
                ]}
              />
            ) : null}
            {capabilities.states.length > 0 ? (
              <MemberList
                label="States & controls"
                values={capabilities.states.map((control) =>
                  controlSummary(control, contextualApi),
                )}
              />
            ) : null}
          </section>
        ) : null}

        {showComposition ? (
          <section
            className="vf-docs-reference__section"
            id="component-composition"
          >
            <Heading level={3} size="md">
              Anatomy & composition
            </Heading>
            <Text tone="muted">
              Composition regions come directly from the shared slot/template
              contract and keep the same meaning across framework adapters.
            </Text>
            <MemberList
              label="Content regions"
              values={capabilities.compositionSlots.map(slotSummary)}
            />
          </section>
        ) : null}

        {showInteraction ? (
          <section
            className="vf-docs-reference__section"
            id="component-interaction"
          >
            <Heading level={3} size="md">
              Interaction & keyboard
            </Heading>
            {capabilities.interactionEvents.length > 0 ? (
              <MemberList
                label="Canonical events"
                values={capabilities.interactionEvents.map(
                  (event) => event.name,
                )}
              />
            ) : null}
            {capabilities.interactionMethods.length > 0 ? (
              <MemberList
                label="Public methods"
                values={capabilities.interactionMethods.map(
                  (method) => method.name,
                )}
              />
            ) : null}
            {accessibilityEvidence ? (
              <MemberList
                label="Keyboard documentation"
                values={[accessibilityEvidence.keyboardDocumentation]}
              />
            ) : null}
            {accessibilityEvidence?.keyboardDocumentation ===
            "requires-verification" ? (
              <Text className="vf-docs-evidence-note" size="sm" tone="muted">
                Keyboard behavior remains explicitly unverified until canonical
                manual evidence is complete.
              </Text>
            ) : null}
          </section>
        ) : null}

        <section
          className="vf-docs-reference__section"
          id="component-accessibility"
        >
          <Heading level={3} size="md">
            Accessibility & evidence
          </Heading>
          <MemberList
            label="Accessibility guidance"
            values={[
              component.accessibilityNotes,
              ...(component.contract?.accessibility ?? []),
            ].filter(Boolean)}
          />
          {accessibilityEvidence ? (
            <>
              <MemberList
                label="Canonical evidence status"
                values={[accessibilityEvidence.evidenceStatus]}
              />
              <MemberList
                label="Accessibility source"
                values={[accessibilityEvidence.documentationPath]}
              />
            </>
          ) : null}
        </section>

        <section
          className="vf-docs-reference__section"
          id="component-framework-usage"
        >
          <Heading level={3} size="md">
            Framework usage
          </Heading>
          <Text tone="muted">
            {framework?.label ?? frameworkId} usage is generated from the same
            shared VyrnForge metadata as the other first-class framework
            surfaces.
          </Text>
          <FrameworkUsagePanel
            framework={framework?.label ?? frameworkId}
            usage={frameworkUsage}
          />
        </section>

        {showTheming ? (
          <section
            className="vf-docs-reference__section"
            id="component-theming"
          >
            <Heading level={3} size="md">
              Theming & design tokens
            </Heading>
            <Text tone="muted">
              Prefer the public styling surface over application-local
              overrides. These names come from generated component styling
              facts.
            </Text>
            {capabilities.themingClasses.length > 0 ? (
              <MemberList
                label="Public classes"
                values={capabilities.themingClasses}
              />
            ) : null}
            {capabilities.themingVariables.length > 0 ? (
              <MemberList
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
              Related patterns & maturity
            </Heading>
            <MemberList
              label="Related components"
              values={component.guidance.relatedComponents}
            />
            <MemberList
              label="Patterns using this component"
              values={relatedPatterns.map((pattern) => pattern.displayName)}
            />
            <MemberList
              label="Known limitations"
              values={component.knownLimitations}
            />
            <MemberList
              label="Maturity"
              values={[maturity.label, component.availability]}
            />
          </section>
        ) : null}

        <section
          className="vf-docs-reference__section"
          id="component-generated-api"
        >
          <Heading level={3} size="md">
            Generated API reference
          </Heading>
          <Text tone="muted">
            Authoritative generated API facts for{" "}
            {framework?.label ?? frameworkId} documentation version {version}.
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
              framework examples, accessibility, and generated API details.
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
