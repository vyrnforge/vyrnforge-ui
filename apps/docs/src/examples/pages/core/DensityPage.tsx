import {
  Button,
  Card,
  Heading,
  Icon,
  Inline,
  Stack,
  Text,
  TextInput,
} from "@vyrnforge/ui-components";

const densities = ["compact", "standard", "comfortable"] as const;

export function DensityPage() {
  return (
    <div className="vf-docs-example-grid vf-docs-example-grid--three">
      {densities.map((density) => (
        <Card data-density={density} key={density} padding="md" variant="bordered">
          <Stack gap="md">
            <Heading size="sm">{density}</Heading>
            <Text tone="muted">
              Shared control sizing feeds component spacing and grid density.
            </Text>
            <TextInput
              aria-label={`${density} input`}
              defaultValue={`${density} input`}
            />
            <Inline gap="sm" wrap>
              <Button
                leftSlot={<Icon name="Check" />}
                size="sm"
                variant="primary"
              >
                Apply
              </Button>
              <Button leftSlot={<Icon name="Close" />} size="sm" variant="subtle">
                Clear
              </Button>
            </Inline>
          </Stack>
        </Card>
      ))}
    </div>
  );
}
