import type { ComponentType } from "react";
import { Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "./docsContext";
import { resolveDocumentationExample } from "./referenceRoutes";

const exampleModules = import.meta.glob("./examples/pages/**/*.tsx", {
  eager: true,
}) as Record<string, Record<string, unknown>>;

function exampleModuleKey(sourcePath: string) {
  const prefix = "apps/docs/src/examples/";
  if (!sourcePath.startsWith(prefix)) {
    throw new Error(
      `Reference example source is outside the docs example tree: ${sourcePath}`,
    );
  }
  return `./examples/${sourcePath.slice(prefix.length)}`;
}

function exampleComponent(sourcePath: string) {
  const moduleKey = exampleModuleKey(sourcePath);
  const module = exampleModules[moduleKey];
  if (!module) {
    throw new Error(`Reference example module is missing: ${sourcePath}`);
  }
  const candidates = Object.entries(module).filter(
    ([name, value]) => name.endsWith("Page") && typeof value === "function",
  );
  if (candidates.length !== 1) {
    throw new Error(
      `Reference example ${sourcePath} must export exactly one *Page component.`,
    );
  }
  return candidates[0][1] as ComponentType;
}

export function ReferenceLiveExample({
  exampleId,
  frameworkId,
  title,
  version,
}: {
  exampleId: string;
  frameworkId: DocsFrameworkId;
  title: string;
  version: string;
}) {
  const resolution = resolveDocumentationExample(exampleId, frameworkId, version);

  if (!resolution.available) {
    return (
      <div className="vf-docs-live-example__unavailable">
        <Heading level={4} size="sm">
          {title}
        </Heading>
        <Text tone="muted">
          This interactive example is not published for {frameworkId} {version}.
        </Text>
      </div>
    );
  }

  const Example = exampleComponent(resolution.implementation.sourcePath);

  return (
    <section className="vf-docs-live-example" aria-label={title}>
      <div className="vf-docs-live-example__header">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Live VyrnForge example
          </Text>
          <Heading level={3} size="md">
            {title}
          </Heading>
        </div>
        <Text size="sm" tone="muted">
          Rendered from <code>{resolution.implementation.sourcePath}</code>
        </Text>
      </div>
      <div className="vf-docs-live-example__stage">
        <Example />
      </div>
    </section>
  );
}
