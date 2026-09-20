import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { referenceComponents } from "../../data/referenceMetadata";

const componentById = new Map(
  referenceComponents.map((component) => [component.id, component] as const),
);

export function createGeneratedComponentPage(componentId: string) {
  const component = componentById.get(componentId);
  if (!component) {
    throw new Error(
      `Cannot create Playground component reader without canonical metadata: ${componentId}.`,
    );
  }

  return function GeneratedComponentPage() {
    return (
      <ComponentDemoPage
        importCode=""
        sections={[]}
        title={component.displayName}
      />
    );
  };
}
