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
    return (
      <Text tone="muted">
        The packed consumer example is unavailable for {frameworkId} {version}.
      </Text>
    );
  }

  const example = getExecutableExampleRecord(frameworkId);
  if (example.sourcePath !== resolution.implementation.sourcePath) {
    throw new Error(
      `Generated example registry source for ${frameworkId} has drifted from packed consumer evidence.`,
    );
  }

  const runtime =
    typeof example.fixtureContract.runtime === "string"
      ? example.fixtureContract.runtime
      : typeof example.fixtureContract.frameworkRuntime === "string"
        ? example.fixtureContract.frameworkRuntime
        : "Runtime verified by consumer fixture";
  const rendererPackages = stringList(example.fixtureContract.rendererPackages);
  const verification = [
    ...example.verification,
    ...stringList(example.fixtureContract.completedEvidence),
  ].filter((item, index, values) => values.indexOf(item) === index);

  return (
    <div className="vf-docs-example-reference">
      <section className="vf-docs-example-reference__summary">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Framework quick start
          </Text>
          <Heading level={3} size="md">
            {example.frameworkLabel} setup
          </Heading>
          <Text tone="muted">
            Use this as the minimal supported consumer shape for the selected
            framework. Verified against packed VyrnForge packages rather than a
            docs-only or Playground implementation.
          </Text>
        </div>
        <Badge tone="subtle" variant="success">
          {example.supportClaim}
        </Badge>
      </section>

      <dl className="vf-docs-example-reference__facts">
        <div>
          <dt>Framework</dt>
          <dd>{example.frameworkLabel}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{runtime}</dd>
        </div>
        <div>
          <dt>Consumer</dt>
          <dd>
            <CodeText>{example.fixtureId}</CodeText>
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            <CodeText>{resolution.implementation.sourcePath}</CodeText>
          </dd>
        </div>
      </dl>

      <div className="vf-docs-example-reference__workbench">
        <section className="vf-docs-example-reference__source">
          <div className="vf-docs-catalog__section-heading">
            <div>
              <Text className="vf-docs-catalog__kicker" size="sm">
                Example
              </Text>
              <Heading level={3} size="md">
                Minimal consumer entry point
              </Heading>
            </div>
          </div>
          <CodeBlock code={example.source} />
        </section>

        <aside className="vf-docs-example-reference__evidence">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              What it demonstrates
            </Text>
            <Heading level={3} size="sm">
              Supported integration behaviors
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
          {rendererPackages.length > 0 ? (
            <div className="vf-docs-example-reference__packages">
              <Text size="sm" tone="muted">
                VyrnForge packages
              </Text>
              {rendererPackages.map((packageName) => (
                <CodeText key={packageName}>{packageName}</CodeText>
              ))}
            </div>
          ) : null}
          <Text size="sm" tone="muted">
            Additional consumer files: {example.exampleFiles.length}
          </Text>
        </aside>
      </div>
    </div>
  );
}
