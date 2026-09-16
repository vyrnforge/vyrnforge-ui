import {
  Badge,
  Card,
  CodeText,
  Heading,
  Panel,
  Text,
} from "@vyrnforge/ui-components";
import { getReferenceRecordRoute } from "../../../../../docs/reference/referenceRuntime";
import { usePlaygroundFramework } from "../../app/PlaygroundFrameworkContext";
import { referenceModel } from "../../app/playgroundContext";
import {
  executableExampleRecords,
  executableExampleSourceOfTruth,
  getExecutableExampleRecord,
  type ExecutableExampleFrameworkId,
} from "../../data/executableExampleContract";
import { CodeBlock } from "../../components/CodeBlock";

export type ExecutableExamplesPageProps = {
  frameworkId?: ExecutableExampleFrameworkId;
};

function exampleHref(
  frameworkId: ExecutableExampleFrameworkId,
  fixtureId: string,
) {
  const query = new URLSearchParams(window.location.search);
  query.set(referenceModel.frameworkContext.queryParameter, frameworkId);
  const route = getReferenceRecordRoute(referenceModel, "examples", fixtureId);
  return `${window.location.pathname}?${query.toString()}#${route}`;
}

function ExampleEvidence({
  frameworkId,
}: {
  frameworkId: ExecutableExampleFrameworkId;
}) {
  const example = getExecutableExampleRecord(frameworkId);
  const framework = referenceModel.frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  const runtime =
    typeof example.fixtureContract.frameworkRuntime === "string"
      ? example.fixtureContract.frameworkRuntime
      : typeof example.fixtureContract.runtime === "string"
        ? example.fixtureContract.runtime
        : "Verified packed consumer runtime";
  const rendererPackages = Array.isArray(
    example.fixtureContract.rendererPackages,
  )
    ? example.fixtureContract.rendererPackages.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  const evidence = [
    ...(Array.isArray(example.fixtureContract.evidence)
      ? example.fixtureContract.evidence
      : []),
    ...(Array.isArray(example.fixtureContract.completedEvidence)
      ? example.fixtureContract.completedEvidence
      : []),
  ].filter((value): value is string => typeof value === "string");

  return (
    <div className="vf-playground-reference-layout">
      <div className="vf-playground-reference-content">
        <Card padding="lg">
          <Text size="sm">
            <a href="#/examples">← Executable examples</a>
          </Text>
          <Heading level={2} size="lg">
            {framework?.label ?? example.frameworkLabel} executable consumer
          </Heading>
          <Text tone="muted">
            This is the source used by the packed {example.frameworkLabel}
            consumer fixture. The fixture is installed from packed VyrnForge
            packages and verified by CI rather than maintained as a separate
            Playground-only implementation.
          </Text>
          <div className="vf-playground-demo-page__badges">
            <Badge tone="subtle" variant="success">
              {example.supportClaim}
            </Badge>
            {example.verification.map((verification) => (
              <Badge key={verification} tone="subtle" variant="success">
                {verification} verified
              </Badge>
            ))}
          </div>
        </Card>

        <Panel title="Verified fixture identity">
          <div className="vf-playground-reference-meta">
            <Text>
              Framework:{" "}
              <CodeText>{framework?.label ?? example.frameworkLabel}</CodeText>
            </Text>
            <Text>
              Runtime: <CodeText>{runtime}</CodeText>
            </Text>
            <Text>
              Directory: <CodeText>{example.directory}</CodeText>
            </Text>
            <Text>
              Entrypoint: <CodeText>{example.entrypoint}</CodeText>
            </Text>
            <Text>
              Contract: <CodeText>{example.contractFile}</CodeText>
            </Text>
            <Text>
              Registry: <CodeText>{executableExampleSourceOfTruth}</CodeText>
            </Text>
          </div>
          {rendererPackages.length > 0 ? (
            <div>
              <Heading level={3} size="sm">
                Renderer packages
              </Heading>
              <ul>
                {rendererPackages.map((packageName) => (
                  <li key={packageName}>
                    <CodeText>{packageName}</CodeText>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <Panel title="Executable source">
          <Text size="sm" tone="muted">
            Source path: <CodeText>{example.sourcePath}</CodeText>
          </Text>
          <CodeBlock code={example.source} />
        </Panel>

        <Panel title="Verification contract">
          <Text tone="muted">
            The fixture contract below is read directly from the consumer
            fixture. It is evidence metadata, not a second Playground contract.
          </Text>
          <CodeBlock code={JSON.stringify(example.fixtureContract, null, 2)} />
        </Panel>

        {evidence.length > 0 ? (
          <Panel title="Runtime evidence">
            <ul>
              {[...new Set(evidence)].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

export function ExecutableExamplesPage({
  frameworkId,
}: ExecutableExamplesPageProps) {
  const { frameworkId: selectedFrameworkId } = usePlaygroundFramework();

  if (frameworkId) {
    return <ExampleEvidence frameworkId={frameworkId} />;
  }

  return (
    <div className="vf-playground-reference-content">
      <Card padding="lg">
        <Heading level={2} size="lg">
          Cross-framework executable examples
        </Heading>
        <Text tone="muted">
          The four first-class surfaces below are backed by the same packed
          consumer verification program. Select a framework to inspect the exact
          source, fixture contract, and runtime evidence used by CI.
        </Text>
        <Text size="sm" tone="muted">
          Canonical example registry:{" "}
          <CodeText>{executableExampleSourceOfTruth}</CodeText>
        </Text>
      </Card>

      <div className="vf-playground-reference-grid">
        {executableExampleRecords.map((example) => {
          const framework = referenceModel.frameworks.find(
            (candidate) => candidate.id === example.frameworkId,
          );
          const selected = example.frameworkId === selectedFrameworkId;
          return (
            <Card key={example.frameworkId} padding="lg">
              <div className="vf-playground-demo-page__badges">
                <Badge tone="subtle" variant={selected ? "success" : "neutral"}>
                  {selected ? "Selected framework" : "First-class surface"}
                </Badge>
              </div>
              <Heading level={3} size="md">
                <a href={exampleHref(example.frameworkId, example.fixtureId)}>
                  {framework?.label ?? example.frameworkLabel}
                </a>
              </Heading>
              <Text tone="muted">{framework?.language}</Text>
              <Text>
                Verified fixture <CodeText>{example.fixtureId}</CodeText> ·{" "}
                <CodeText>{example.entrypoint}</CodeText>
              </Text>
              <div className="vf-playground-demo-page__badges">
                {example.verification.map((verification) => (
                  <Badge key={verification} tone="subtle" variant="success">
                    {verification}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
