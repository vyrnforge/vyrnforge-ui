import {
  Badge,
  Button,
  Card,
  Heading,
  Inline,
  Panel,
  Section,
  Stack,
  Text
} from "@dravyn/ui-components";

export function LayoutPage() {
  return (
    <section className="playground-panel">
      <div className="card-heading">
        <Heading size="md">Layout primitives</Heading>
        <Badge variant="success">candidate</Badge>
      </div>
      <Section
        title="Section"
        description="Section provides title, description, actions, and content layout."
        actions={<Button size="sm" variant="primary">Action</Button>}
      >
        <Panel title="Panel" description="Panel frames a related task area.">
          <Stack gap="md">
            <Inline justify="between">
              <Text tone="strong">Inline row</Text>
              <Badge variant="info">metadata</Badge>
            </Inline>
            <div className="playground-grid three">
              <Card variant="plain" padding="md"><Text>Plain card</Text></Card>
              <Card variant="bordered" padding="md"><Text>Bordered card</Text></Card>
              <Card variant="elevated" padding="md"><Text>Elevated card</Text></Card>
            </div>
          </Stack>
        </Panel>
      </Section>
    </section>
  );
}
