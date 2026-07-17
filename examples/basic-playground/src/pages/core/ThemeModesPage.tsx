import { Badge, Button, Heading, Text } from "@vyrnforge/ui-components";

const modes = ["light", "dark", "enterprise", "system"] as const;

export function ThemeModesPage() {
  return (
    <div className="vf-playground-grid two">
      {modes.map((mode) => (
        <section className="vf-playground-card vf-playground-theme-sample" data-theme={mode} key={mode}>
          <div className="vf-playground-card-heading">
            <Heading size="sm">{mode}</Heading>
            <Badge variant={mode === "dark" ? "info" : "neutral"}>{mode}</Badge>
          </div>
          <Text tone="muted">The same primitives render inside a scoped theme container.</Text>
          <div className="vf-playground-inline-actions">
            <Button size="sm" variant="primary">Confirm</Button>
            <Button size="sm" variant="subtle">Cancel</Button>
          </div>
        </section>
      ))}
    </div>
  );
}
