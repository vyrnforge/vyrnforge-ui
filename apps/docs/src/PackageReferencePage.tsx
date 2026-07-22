import { Badge, Card, CodeText, Heading, Text } from "@vyrnforge/ui-components";

const packages = [
  {
    name: "@vyrnforge/ui-core",
    role: "Framework-neutral foundation",
    status: "Current",
    owns: [
      "semantic tokens",
      "themes and density",
      "typography and motion",
      "layers and utilities",
    ],
    notes:
      "Lowest-level package. It must not depend on a renderer, behavior package, or grid package.",
  },
  {
    name: "@vyrnforge/ui-behaviors",
    role: "Shared behavior layer",
    status: "Planned",
    owns: [
      "controller state transitions",
      "collections and selection",
      "keyboard decisions",
      "validation and event reasons",
    ],
    notes:
      "Created in S5. It may depend on ui-core only and must remain framework- and DOM-neutral.",
  },
  {
    name: "@vyrnforge/ui-components",
    role: "First-class React renderer",
    status: "Current",
    owns: [
      "React components and hooks",
      "React props and callbacks",
      "React DOM adapters",
      "shared component CSS",
    ],
    notes:
      "Keeps its current package name through beta and consumes shared behaviors after S5.",
  },
  {
    name: "@vyrnforge/ui-elements",
    role: "Native Custom Element renderer",
    status: "Planned",
    owns: [
      "vf-* Custom Elements",
      "property and attribute reflection",
      "canonical DOM events",
      "form association and registration",
    ],
    notes:
      "Created after shared behavior parity. Light DOM is the default and framework runtimes are forbidden.",
  },
  {
    name: "@vyrnforge/ui-data-grid",
    role: "Specialized React data grid",
    status: "Deferred alpha",
    owns: [
      "UniversalDataGrid",
      "grid state and adapters",
      "grid-specific behavior",
      "udg-* styles",
    ],
    notes:
      "Remains independently versioned and outside the non-grid beta critical path.",
  },
];

const dependencyRules = [
  "ui-behaviors -> ui-core",
  "ui-components -> ui-core + ui-behaviors",
  "ui-elements -> ui-core + ui-behaviors",
  "ui-data-grid -> ui-core + ui-components",
  "never ui-core -> another VyrnForge package",
  "never ui-behaviors -> a renderer or framework runtime",
  "never ui-components <-> ui-elements",
  "never shared non-grid packages -> ui-data-grid",
];

export function PackageReferencePage() {
  return (
    <div className="vf-docs-reference">
      <div className="vf-docs-package-grid">
        {packages.map((packageInfo) => (
          <Card
            className="vf-docs-package-card"
            key={packageInfo.name}
            padding="lg"
          >
            <div className="vf-docs-package-card__header">
              <Heading level={3} size="md">
                {packageInfo.name}
              </Heading>
              <Badge
                tone="subtle"
                variant={packageInfo.status === "Current" ? "success" : "info"}
              >
                {packageInfo.status}
              </Badge>
            </div>
            <Text className="vf-text-strong">{packageInfo.role}</Text>
            <ul>
              {packageInfo.owns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Text tone="muted">{packageInfo.notes}</Text>
          </Card>
        ))}
      </div>

      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Dependency direction
        </Heading>
        <div className="vf-docs-dependency-list">
          {dependencyRules.map((rule) => (
            <CodeText className="vf-docs-dependency-item" key={rule}>
              {rule}
            </CodeText>
          ))}
        </div>
      </Card>
    </div>
  );
}
