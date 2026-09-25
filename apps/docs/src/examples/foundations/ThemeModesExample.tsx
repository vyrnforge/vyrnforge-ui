import { Badge, Button, Heading, Text } from "@vyrnforge/ui-components";

const modes = ["light", "dark", "enterprise", "system"] as const;

export function ThemeModesPage() {
  return (
    <div className="vf-docs-example-grid vf-docs-example-grid--two">
      {modes.map((mode) => (
        <section
          className="vf-docs-example-card vf-docs-example-theme-sample"
          data-theme={mode}
          key={mode}
        >
          <div className="vf-docs-example-card-heading">
            <Heading size="sm">{mode}</Heading>
            <Badge variant={mode === "dark" ? "info" : "neutral"}>{mode}</Badge>
          </div>
          <Text tone="muted">
            The same primitives render inside a scoped theme container.
          </Text>
          <div className="vf-docs-example-inline-actions">
            <Button size="sm" variant="primary">
              Confirm
            </Button>
            <Button size="sm" variant="subtle">
              Cancel
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
