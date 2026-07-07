import { Heading, Text } from "@dravyn/ui-components";

export function TypographyPage() {
  return (
    <section className="playground-panel text-demo">
      <Heading level={2} size="lg">Heading large</Heading>
      <Heading level={3} size="md">Heading medium</Heading>
      <Heading level={4} size="sm">Heading small</Heading>
      <Text>
        Default body text is tuned for dense product surfaces, repeated scanning, and predictable line height.
      </Text>
      <Text tone="muted">Muted text supports metadata, helper copy, and quieter secondary context.</Text>
      <Text tone="strong">Strong text emphasizes state, totals, or current selections without custom CSS.</Text>
      <small className="caption-demo">Caption text can remain app-owned until a caption primitive exists.</small>
      <code className="code-demo">--dv-primary: #2563eb;</code>
      <p className="dv-truncate truncate-demo">
        Truncated utility text keeps long labels contained in fixed-width operational layouts.
      </p>
    </section>
  );
}
