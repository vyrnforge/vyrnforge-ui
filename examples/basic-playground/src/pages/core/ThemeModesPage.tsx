import { Badge, Button, Heading, Text } from "@dravyn/ui-components";

const modes = ["light", "dark", "enterprise", "system"] as const;

export function ThemeModesPage() {
  return (
    <div className="dv-playground-grid two">
      {modes.map((mode) => (
        <section className="dv-playground-card dv-playground-theme-sample" data-theme={mode} key={mode}>
          <div className="dv-playground-card-heading">
            <Heading size="sm">{mode}</Heading>
            <Badge variant={mode === "dark" ? "info" : "neutral"}>{mode}</Badge>
          </div>
          <Text tone="muted">The same primitives render inside a scoped theme container.</Text>
          <div className="dv-playground-inline-actions">
            <Button size="sm" variant="primary">Confirm</Button>
            <Button size="sm" variant="subtle">Cancel</Button>
          </div>
        </section>
      ))}
    </div>
  );
}
