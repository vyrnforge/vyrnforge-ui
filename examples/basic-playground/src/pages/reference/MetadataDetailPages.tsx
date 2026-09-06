import {
  Badge,
  CodeText,
  PageHeader,
  Panel,
  Text,
} from "@vyrnforge/ui-components";
import { usePlaygroundFramework } from "../../app/PlaygroundFrameworkContext";
import { routes } from "../../app/routes";
import { CodeBlock } from "../../components/CodeBlock";
import { PropsTable, type PropsTableRow } from "../../components/PropsTable";
import {
  getReferenceFrameworkComponent,
  referenceComponents,
  referenceElements,
  type ReferenceApiComponent,
  type ReferenceApiMember,
  type ReferenceComponent,
  type ReferenceElement,
} from "../../data/referenceMetadata";

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatDefaultValue(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function apiMemberDescription(member: ReferenceApiMember) {
  return [
    member.binding,
    member.controlled ? "controlled" : null,
    member.mode,
    member.multiple ? "multiple" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function toPropsRows(api: ReferenceApiComponent | undefined): PropsTableRow[] {
  return (api?.properties ?? []).map((property) => ({
    name: property.public,
    type: property.type ?? "unknown",
    defaultValue: formatDefaultValue(property.default),
    description:
      apiMemberDescription(property) || `Canonical: ${property.canonical}`,
    required: property.required,
  }));
}

function ApiMemberList({
  emptyLabel,
  members,
}: {
  emptyLabel: string;
  members: ReferenceApiMember[];
}) {
  if (members.length === 0) {
    return (
      <Text size="sm" tone="muted">
        {emptyLabel}
      </Text>
    );
  }

  return (
    <ul className="vf-playground-related-links">
      {members.map((member) => (
        <li key={`${member.canonical}-${member.public}`}>
          <CodeText>{member.public}</CodeText>
          <Text tone="muted">
            {[member.type, apiMemberDescription(member)]
              .filter(Boolean)
              .join(" · ") || member.canonical}
          </Text>
        </li>
      ))}
    </ul>
  );
}

function ReferenceApiSections({ api }: { api: ReferenceApiComponent | undefined }) {
  const props = toPropsRows(api);

  return (
    <>
      <section className="vf-playground-section" id="properties">
        <Panel title="Properties">
          {props.length > 0 ? (
            <PropsTable rows={props} />
          ) : (
            <Text size="sm" tone="muted">
              No public properties are declared for this framework surface.
            </Text>
          )}
        </Panel>
      </section>
      <section className="vf-playground-section" id="events">
        <Panel title="Events">
          <ApiMemberList
            emptyLabel="No public events are declared for this framework surface."
            members={api?.events ?? []}
          />
        </Panel>
      </section>
      <section className="vf-playground-section" id="slots">
        <Panel title="Slots and content">
          <ApiMemberList
            emptyLabel="No public slots are declared for this framework surface."
            members={api?.slots ?? []}
          />
        </Panel>
      </section>
      <section className="vf-playground-section" id="methods">
        <Panel title="Methods">
          <ApiMemberList
            emptyLabel="No public methods are declared for this framework surface."
            members={api?.methods ?? []}
          />
        </Panel>
      </section>
    </>
  );
}

function findDemoRoute(component: ReferenceComponent | undefined) {
  if (!component) return undefined;
  const normalizedDisplayName = normalizeName(component.displayName);
  return routes.find(
    (route) =>
      route.gallery && normalizeName(route.title) === normalizedDisplayName,
  );
}

function AccessibilityPanel({
  api,
  component,
}: {
  api: ReferenceApiComponent | undefined;
  component: ReferenceComponent | undefined;
}) {
  const notes = Array.from(
    new Set([
      ...(component?.accessibilityNotes ? [component.accessibilityNotes] : []),
      ...(component?.contract?.accessibility ?? []),
      ...(api?.accessibility ?? []),
    ]),
  );

  return (
    <section className="vf-playground-section" id="accessibility">
      <Panel title="Accessibility">
        {notes.length > 0 ? (
          <ul>
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : (
          <Text size="sm" tone="muted">
            No additional accessibility notes are declared for this surface.
          </Text>
        )}
      </Panel>
    </section>
  );
}

function ComponentReferenceDetail({ component }: { component: ReferenceComponent }) {
  const { frameworkId } = usePlaygroundFramework();
  const api = getReferenceFrameworkComponent(frameworkId, component.id);
  const usage = component.frameworks[frameworkId];
  const demoRoute = findDemoRoute(component);

  return (
    <div className="vf-playground-reference-content">
      <section className="vf-playground-section" id="overview">
        <PageHeader
          description={component.purpose}
          status={
            <div className="vf-playground-demo-page__badges">
              <Badge tone="subtle">{component.category}</Badge>
              <Badge tone="subtle">{usage.status}</Badge>
              <Badge tone="subtle">{api?.status ?? component.maturity}</Badge>
            </div>
          }
          title={component.displayName}
        />
      </section>

      <section className="vf-playground-section" id="usage">
        <Panel title={`${usage.label} usage`}>
          {usage.setup ? <CodeBlock code={usage.setup} /> : null}
          {usage.example ? <CodeBlock code={usage.example} /> : null}
          {usage.note ? (
            <Text size="sm" tone="muted">
              {usage.note}
            </Text>
          ) : null}
          {demoRoute ? (
            <a href={`#${demoRoute.path ?? `/${demoRoute.id}`}`}>
              Open the human-authored live demo
            </a>
          ) : null}
        </Panel>
      </section>

      <ReferenceApiSections api={api} />
      <AccessibilityPanel api={api} component={component} />

      {component.knownLimitations.length > 0 ? (
        <section className="vf-playground-section" id="limitations">
          <Panel title="Known limitations">
            <ul>
              {component.knownLimitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </Panel>
        </section>
      ) : null}
    </div>
  );
}

function ElementReferenceDetail({ element }: { element: ReferenceElement }) {
  const { frameworkId } = usePlaygroundFramework();
  const component = element.componentId
    ? referenceComponents.find((candidate) => candidate.id === element.componentId)
    : undefined;
  const api = element.componentId
    ? getReferenceFrameworkComponent(frameworkId, element.componentId)
    : undefined;
  const usage = component?.frameworks[frameworkId];
  const demoRoute = findDemoRoute(component);

  return (
    <div className="vf-playground-reference-content">
      <section className="vf-playground-section" id="overview">
        <PageHeader
          description={
            component?.purpose ??
            `Registered ${element.family} Custom Element from the canonical native catalog.`
          }
          status={
            <div className="vf-playground-demo-page__badges">
              <Badge tone="subtle">{element.wave}</Badge>
              <Badge tone="subtle">{element.family}</Badge>
              <Badge tone="subtle">{api?.status ?? "registered"}</Badge>
            </div>
          }
          title={`<${element.tag}>`}
        />
      </section>

      <section className="vf-playground-section" id="identity">
        <Panel title="Canonical identity">
          <p>
            <CodeText>{element.tag}</CodeText>
          </p>
          <Text size="sm" tone="muted">
            {element.package}
            {element.componentId ? ` · ${element.componentId}` : ""}
          </Text>
        </Panel>
      </section>

      {usage ? (
        <section className="vf-playground-section" id="usage">
          <Panel title={`${usage.label} usage`}>
            {usage.setup ? <CodeBlock code={usage.setup} /> : null}
            {usage.example ? <CodeBlock code={usage.example} /> : null}
            {usage.note ? (
              <Text size="sm" tone="muted">
                {usage.note}
              </Text>
            ) : null}
            {demoRoute ? (
              <a href={`#${demoRoute.path ?? `/${demoRoute.id}`}`}>
                Open the human-authored live demo
              </a>
            ) : null}
          </Panel>
        </section>
      ) : null}

      <ReferenceApiSections api={api} />
      <AccessibilityPanel api={api} component={component} />
    </div>
  );
}

export function createComponentReferenceDetailPage(componentId: string) {
  const component = referenceComponents.find(
    (candidate) => candidate.id === componentId,
  );

  return function ComponentReferenceDetailRoute() {
    return component ? (
      <ComponentReferenceDetail component={component} />
    ) : (
      <Panel title="Reference unavailable">
        <Text tone="muted">No canonical component metadata was found.</Text>
      </Panel>
    );
  };
}

export function createElementReferenceDetailPage(tag: string) {
  const element = referenceElements.find((candidate) => candidate.tag === tag);

  return function ElementReferenceDetailRoute() {
    return element ? (
      <ElementReferenceDetail element={element} />
    ) : (
      <Panel title="Reference unavailable">
        <Text tone="muted">No canonical element metadata was found.</Text>
      </Panel>
    );
  };
}
