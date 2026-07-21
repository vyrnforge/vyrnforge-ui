import { Badge, Card, Heading, Text } from "@vyrnforge/ui-components";

import componentMetadataRaw from "../../../docs/metadata/components.json?raw";

type ComponentItem = {
  id: string;
  displayName: string;
  package: string;
  category: string;
  maturity: string;
  purpose: string;
  knownLimitations: string[];
};

type ComponentCatalog = {
  components: ComponentItem[];
};

const componentCatalog = JSON.parse(componentMetadataRaw) as ComponentCatalog;
const componentAreas = Object.entries(
  componentCatalog.components
    .filter((component) => component.maturity !== "internal")
    .reduce<Record<string, ComponentItem[]>>((areas, component) => {
      (areas[component.category] ??= []).push(component);
      return areas;
    }, {}),
).sort(([left], [right]) => left.localeCompare(right));

function statusVariant(status: string) {
  if (status === "stable") return "success";
  if (status === "experimental") return "warning";
  if (status === "deprecated") return "danger";
  return "info";
}

export function ComponentReferencePage() {
  return (
    <div className="vf-docs-reference">
      {componentAreas.map(([area, components]) => (
        <Card className="vf-docs-reference__section" key={area} padding="lg">
          <Heading level={3} size="md">
            {area}
          </Heading>
          <div className="vf-docs-reference__grid">
            {components
              .sort((left, right) => left.displayName.localeCompare(right.displayName))
              .map((component) => (
                <Card className="vf-docs-reference-card" key={component.id} padding="md">
                  <div className="vf-docs-reference-card__header">
                    <div>
                      <Heading level={4} size="sm">
                        {component.displayName}
                      </Heading>
                      <code>{component.package}</code>
                    </div>
                    <Badge size="sm" tone="subtle" variant={statusVariant(component.maturity)}>
                      {component.maturity}
                    </Badge>
                  </div>
                  <Text>{component.purpose}</Text>
                  <Text tone="muted" size="sm">
                    {component.knownLimitations.join(" ")}
                  </Text>
                </Card>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
