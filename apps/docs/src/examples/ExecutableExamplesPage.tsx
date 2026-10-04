import { Badge, CodeText, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "../docsContext";
import { resolveDocumentationExample } from "../referenceRoutes";
import { CodeBlock } from "./components/CodeBlock";
import { getExecutableExampleRecord } from "./data/executableExampleContract";

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

export function ExecutableExamplesPage({
  frameworkId,
  version,
}: {
  frameworkId: DocsFrameworkId;
  version: string;
}) {
  const resolution = resolveDocumentationExample(
    "framework-consumer",
    frameworkId,
    version,
  );

  if (!resolution.available) {
    const surfaceGuidance = {
    "native-html": {
      title: "Native HTML / Custom Elements",
      packageName: "@vyrnforge/ui-elements",
      concepts: [
        "Typed vf-* Custom Elements and generated binding helpers",
        "Canonical DOM events for actions and value changes",
        "ElementInternals-backed form participation",
      ],
    },
    react: {
      title: "React",
      packageName: "@vyrnforge/ui-components",
      concepts: [
        "First-class React components from the public package",
        "Controlled state and idiomatic React callbacks",
        "Refs and composition without application state coupling",
      ],
    },
    angular: {
      title: "Angular",
      packageName: "@vyrnforge/ui-angular",
      concepts: [
        "Generated Angular facades over canonical Custom Elements",
        "Reactive and template-driven Forms integration",
        "Typed outputs, slots, and imperative references",
      ],
    },
    vue: {
      title: "Vue",
      packageName: "@vyrnforge/ui-vue",
      concepts: [
        "Generated Vue component facades over canonical elements",
        "Vue-native props, emits, slots, and v-model mappings",
        "Canonical DOM events remain available when needed",
      ],
    },
  }[frameworkId];

  return (
    <div className="vf-docs-framework-example">
      <section className="vf-docs-framework-example__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            {surfaceGuidance.title}
          </Text>
          <Heading level={3} size="md">
            Consume VyrnForge the way this framework expects.
          </Heading>
          <Text tone="muted">
            This is the real packed-consumer source used to verify the public
            package. It demonstrates the framework idioms VyrnForge supports,
            not a docs-only approximation.
          </Text>
        </div>
        <Badge tone="subtle" variant="success">
          {example.supportClaim}
        </Badge>
      </section>

      <div className="vf-docs-framework-example__surface">
        <section className="vf-docs-framework-example__source">
          <div className="vf-docs-catalog__section-heading">
            <div>
              <Text className="vf-docs-catalog__kicker" size="sm">
                Working consumer
              </Text>
              <Heading level={3} size="md">
                {surfaceGuidance.packageName}
              </Heading>
              <Text size="sm" tone="muted">
                <code>{resolution.implementation.sourcePath}</code>
              </Text>
            </div>
          </div>
          <CodeBlock code={example.source} />
        </section>

        <aside className="vf-docs-framework-example__concepts">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              Framework contract
            </Text>
            <Heading level={3} size="sm">
              What to learn from this example
            </Heading>
          </div>
          <ul>
            {surfaceGuidance.concepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Runtime</dt>
              <dd>{runtime}</dd>
            </div>
            <div>
              <dt>Public package</dt>
              <dd>
                <code>{surfaceGuidance.packageName}</code>
              </dd>
            </div>
            <div>
              <dt>Fixture</dt>
              <dd>
                <code>{example.fixtureId}</code>
              </dd>
            </div>
          </dl>
          {rendererPackages.length > 0 ? (
            <div className="vf-docs-framework-example__packages">
              <Text size="sm" tone="muted">
                Renderer packages
              </Text>
              {rendererPackages.map((packageName) => (
                <CodeText key={packageName}>{packageName}</CodeText>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      <section className="vf-docs-framework-example__verification">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Packed verification
          </Text>
          <Heading level={3} size="sm">
            What CI proves about this consumer
          </Heading>
        </div>
        <ol>
          {verification.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Text size="sm">{item}</Text>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
