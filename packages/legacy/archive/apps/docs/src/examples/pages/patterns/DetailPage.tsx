import {
  Badge,
  Button,
  Card,
  DescriptionList,
  Heading,
  Icon,
  Inline,
  MoreButton,
  PageHeader,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
import { assets } from "../../data/assets";
import { tickets } from "../../data/tickets";

const asset = assets[0];

export function DetailPage() {
  return (
    <Stack gap="lg">
      <PageHeader
        actions={
          <Inline gap="sm" wrap>
            <Button leftSlot={<Icon name="Check" />} variant="primary">
              Review
            </Button>
            <Button leftSlot={<Icon name="Eye" />} variant="subtle">
              Open audit
            </Button>
            <MoreButton />
          </Inline>
        }
        description={`${asset.id} / ${asset.type} / ${asset.environment}`}
        status={
          <Inline gap="sm" wrap>
            <Badge variant="success">{asset.status}</Badge>
            <Badge variant="info">{asset.criticality} criticality</Badge>
          </Inline>
        }
        title={asset.name}
      />

      <div className="vf-docs-example-grid vf-docs-example-grid--two">
        <Card padding="md" variant="bordered">
          <Stack gap="md">
            <Heading size="sm">Metadata</Heading>
            <DescriptionList>
              <dt>Owner</dt>
              <dd>{asset.owner}</dd>
              <dt>Region</dt>
              <dd>{asset.region}</dd>
              <dt>Last seen</dt>
              <dd>{asset.lastSeen}</dd>
              <dt>Environment</dt>
              <dd>{asset.environment}</dd>
            </DescriptionList>
          </Stack>
        </Card>
        <Card padding="md" variant="bordered">
          <Stack gap="md">
            <Heading size="sm">Related tickets</Heading>
            <Stack gap="sm">
              {tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id}>
                  <strong>{ticket.title}</strong>
                  <Text size="sm" tone="muted">
                    {ticket.id} / {ticket.priority} / {ticket.status}
                  </Text>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>
      </div>
    </Stack>
  );
}
