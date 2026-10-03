import type { ComponentType } from "react";
import { Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "../docsContext";
import { resolveDocumentationExample } from "../referenceRoutes";
import { CodeBlock } from "./components/CodeBlock";

const exampleModules = import.meta.glob("./pages/**/*.tsx", {
  eager: true,
}) as Record<string, Record<string, unknown>>;

const exampleSources = import.meta.glob("./pages/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function exampleModuleKey(sourcePath: string) {
  const prefix = "apps/docs/src/examples/";
  if (!sourcePath.startsWith(prefix)) {
    throw new Error(
      `Documentation example source is outside the Docs example tree: ${sourcePath}`,
    );
  }
  return `./${sourcePath.slice(prefix.length)}`;
}

function exampleComponent(sourcePath: string) {
  const moduleKey = exampleModuleKey(sourcePath);
  const module = exampleModules[moduleKey];
  if (!module) {
    throw new Error(
      `Generated documentation example module is missing: ${sourcePath}`,
    );
  }

  const candidates = Object.entries(module).filter(
    ([name, value]) => name.endsWith("Page") && typeof value === "function",
  );
  if (candidates.length !== 1) {
    throw new Error(
      `Documentation example ${sourcePath} must export exactly one *Page component.`,
    );
  }
  return candidates[0][1] as ComponentType;
}

export type MigratedExamplePageProps = {
  exampleId: string;
  frameworkId: DocsFrameworkId;
  version: string;
};

export function MigratedExamplePage({
  exampleId,
  frameworkId,
  version,
}: MigratedExamplePageProps) {
  const resolution = resolveDocumentationExample(
    exampleId,
    frameworkId,
    version,
  );

  if (!resolution.available) {
    const alternatives = resolution.alternatives
      .map(
        (implementation) =>
          `${implementation.framework} ${implementation.version}`,
      )
      .join(", ");

    return (
      <Text tone="muted">
        This example is unavailable for {frameworkId} {version}.
        {alternatives ? ` Available implementations: ${alternatives}.` : ""}
      </Text>
    );
  }

  const { implementation } = resolution;
  const Example = exampleComponent(implementation.sourcePath);
  const moduleKey = exampleModuleKey(implementation.sourcePath);
  const source = exampleSources[moduleKey];
  if (typeof source !== "string") {
    throw new Error(
      `Generated documentation example source text is missing: ${implementation.sourcePath}`,
    );
  }

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <section
          className="vf-docs-reference__section vf-docs-example-workbench"
          id="interactive-example"
        >
          <Heading level={3} size="md">
            Interactive example
          </Heading>
          <Text tone="muted">
            This example is resolved from the generated Documentation Registry
            for the selected framework and documentation version.
          </Text>
          <div className="vf-docs-example-workbench__body">
            <div className="vf-docs-example-stage">
              <Example />
            </div>
            <div
              className="vf-docs-example-workbench__source"
              id="example-source"
            >
              <Heading level={3} size="md">
                Source
              </Heading>
              <Text size="sm" tone="muted">
                <code>{implementation.sourcePath}</code>
              </Text>
              <CodeBlock code={source} />
            </div>
          </div>
        </section>
      </div>

      <aside
        className="vf-docs-reference-outline"
        aria-label="On this example page"
      >
        <Text size="sm" tone="muted">
          On this page
        </Text>
        <nav>
          <ul>
            <li>
              <a href="#interactive-example">Interactive example</a>
            </li>
            <li>
              <a href="#example-source">Source</a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}
