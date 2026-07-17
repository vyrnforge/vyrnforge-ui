import { Badge, Card, CodeText, Heading, Text } from "@vyrnforge/ui-components";

const packages = [
  {
    name: "@vyrnforge/ui-core",
    role: "Shared foundation",
    owns: ["tokens", "themes", "density", "utilities"],
    notes: "Must stay dependency-light and must not own React components or grid behavior."
  },
  {
    name: "@vyrnforge/ui-components",
    role: "Reusable UI layer",
    owns: [
      "reusable primitives",
      "application components",
      "overlays",
      "forms",
      "feedback"
    ],
    notes: "May depend on ui-core. Must not depend on ui-data-grid."
  },
  {
    name: "@vyrnforge/ui-data-grid",
    role: "Specialized data-management grid",
    owns: [
      "UniversalDataGrid",
      "grid state",
      "grid adapters",
      "grid-specific styles"
    ],
    notes: "May depend on ui-core and ui-components. Apps own fetching and business state."
  }
];

const dependencyRules = [
  "ui-components -> ui-core",
  "ui-data-grid -> ui-core",
  "ui-data-grid -> ui-components",
  "never ui-core -> ui-components or ui-data-grid",
  "never ui-components -> ui-data-grid"
];

export function PackageReferencePage() {
  return (
    <div className="dv-docs-reference">
      <div className="dv-docs-package-grid">
        {packages.map((packageInfo) => (
          <Card className="dv-docs-package-card" key={packageInfo.name} padding="lg">
            <div className="dv-docs-package-card__header">
              <Heading level={3} size="md">
                {packageInfo.name}
              </Heading>
              <Badge tone="subtle" variant="info">
                {packageInfo.role}
              </Badge>
            </div>
            <ul>
              {packageInfo.owns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Text tone="muted">{packageInfo.notes}</Text>
          </Card>
        ))}
      </div>

      <Card className="dv-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Dependency direction
        </Heading>
        <div className="dv-docs-dependency-list">
          {dependencyRules.map((rule) => (
            <CodeText className="dv-docs-dependency-item" key={rule}>
              {rule}
            </CodeText>
          ))}
        </div>
      </Card>
    </div>
  );
}
