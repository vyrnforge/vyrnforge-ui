import { getReferenceRecordRoute } from "../../../../docs/reference/referenceRuntime";
import { ExecutableExamplesPage } from "../pages/reference/ExecutableExamplesPage";
import {
  referenceModel,
  type PlaygroundFrameworkId,
} from "./playgroundContext";
import type { PlaygroundRoute } from "./routes";

export type ExecutableExampleRoute = PlaygroundRoute & {
  exampleFrameworkId?: PlaygroundFrameworkId;
};

export const executableExamplesCatalogRoute: ExecutableExampleRoute = {
  id: "executable-examples",
  label: "Executable Examples",
  title: "Executable Examples",
  description:
    "Registry-backed packed consumer examples for Native HTML, React, Angular, and Vue.",
  group: "Overview",
  path: "/examples",
  Component: ExecutableExamplesPage,
};

export const executableExampleDetailRoutes: ExecutableExampleRoute[] =
  referenceModel.examples.map((example) => {
    const framework = referenceModel.frameworks.find(
      (candidate) => candidate.id === example.framework,
    );
    const DetailPage = () => (
      <ExecutableExamplesPage frameworkId={example.framework} />
    );

    return {
      id: `executable-example-${example.id}`,
      label: `${framework?.label ?? example.framework} Example`,
      title: `${framework?.label ?? example.framework} Executable Example`,
      description: `Verified packed consumer source and runtime evidence for ${framework?.label ?? example.framework}.`,
      group: "Overview",
      path: getReferenceRecordRoute(referenceModel, "examples", example.id),
      exampleFrameworkId: example.framework,
      Component: DetailPage,
    };
  });

export function getExecutableExampleRouteForFramework(
  frameworkId: PlaygroundFrameworkId,
) {
  return executableExampleDetailRoutes.find(
    (route) => route.exampleFrameworkId === frameworkId,
  );
}
