import {
  Badge,
  Button,
  Card,
  Heading,
  Inline,
  Stack,
  Text,
} from "@vyrnforge/ui-components";

const modes = ["light", "dark", "enterprise", "system"] as const;

export function ThemeModesPage() {
  return (
    <div className="vf-docs-example-grid vf-docs-example-grid--two">
      {modes.map((mode) => (
        <Card
          className="vf-docs-example-theme-sample"
          data-theme={mode}
          key={mode}
          padding="md"
          variant="bordered"
        >
          <Stack gap="md">
            <Inline align="start" gap="sm" justify="between" wrap>
              <Heading size="sm">{mode}</Heading>
              <Badge variant={mode === "dark" ? "info" : "neutral"}>{mode}</Badge>
            </Inline>
            <Text tone="muted">
              The same primitives render inside a scoped theme container.
            </Text>
            <Inline gap="sm" wrap>
              <Button size="sm" variant="primary">
                Confirm
              </Button>
              <Button size="sm" variant="subtle">
                Cancel
              </Button>
            </Inline>
          </Stack>
        </Card>
      ))}
    </div>
  );
}
