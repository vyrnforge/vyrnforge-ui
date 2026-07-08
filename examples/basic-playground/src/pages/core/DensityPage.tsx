import { Button, Heading, Icon, Text, TextInput } from "@dravyn/ui-components";

const densities = ["compact", "standard", "comfortable"] as const;

export function DensityPage() {
  return (
    <div className="playground-grid three">
      {densities.map((density) => (
        <section className="playground-card" data-density={density} key={density}>
          <Heading size="sm">{density}</Heading>
          <Text tone="muted">Shared control sizing feeds component spacing and grid density.</Text>
          <TextInput aria-label={`${density} input`} defaultValue={`${density} input`} />
          <div className="inline-actions">
            <Button leftSlot={<Icon name="Check" />} size="sm" variant="primary">Apply</Button>
            <Button leftSlot={<Icon name="Close" />} size="sm" variant="subtle">Clear</Button>
          </div>
        </section>
      ))}
    </div>
  );
}
