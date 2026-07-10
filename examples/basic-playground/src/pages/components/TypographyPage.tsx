import { Caption, CodeText, Heading, Label, Text } from "@dravyn/ui-components";

export function TypographyPage() {
  return (
    <section className="dv-playground-panel dv-playground-text-demo">
      <Heading level={2} size="lg">Heading large</Heading>
      <Heading level={3} size="md">Heading medium</Heading>
      <Heading level={4} size="sm">Heading small</Heading>
      <Text>
        Default body text is tuned for dense product surfaces, repeated scanning, and predictable line height.
      </Text>
      <Text size="sm">Small text supports compact metadata rows.</Text>
      <Text size="lg">Large text supports short empty-state descriptions.</Text>
      <Text tone="muted">Muted text supports metadata, helper copy, and quieter secondary context.</Text>
      <Text tone="strong">Strong text emphasizes state, totals, or current selections without custom CSS.</Text>
      <Text tone="danger">Danger tone supports validation and destructive context.</Text>
      <Text tone="success">Success tone supports confirmed state.</Text>
      <Text tone="warning">Warning tone supports review state.</Text>
      <Label>Label primitive</Label>
      <Caption>Caption text supports hints, timestamps, and quiet helper copy.</Caption>
      <CodeText>--dv-primary: #2563eb;</CodeText>
      <p className="dv-truncate dv-playground-truncate-demo">
        Truncated utility text keeps long labels contained in fixed-width operational layouts.
      </p>
    </section>
  );
}
