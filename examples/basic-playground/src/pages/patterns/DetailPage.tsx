import { Badge, Button, Heading, Icon, MoreButton, Text } from "@dravyn/ui-components";
import { assets } from "../../data/assets";
import { tickets } from "../../data/tickets";

const asset = assets[0];

export function DetailPage() {
  return (
    <div className="page-stack">
      <section className="playground-panel detail-header">
        <div>
          <div className="inline-actions">
            <Badge variant="success">{asset.status}</Badge>
            <Badge variant="info">{asset.criticality} criticality</Badge>
          </div>
          <Heading size="lg">{asset.name}</Heading>
          <Text tone="muted">{asset.id} / {asset.type} / {asset.environment}</Text>
        </div>
        <div className="inline-actions">
          <Button leftSlot={<Icon name="Check" />} variant="primary">Review</Button>
          <Button leftSlot={<Icon name="Eye" />} variant="subtle">Open audit</Button>
          <MoreButton />
        </div>
      </section>

      <section className="playground-grid two">
        <article className="playground-card">
          <Heading size="sm">Metadata</Heading>
          <dl className="key-value-grid">
            <div><dt>Owner</dt><dd>{asset.owner}</dd></div>
            <div><dt>Region</dt><dd>{asset.region}</dd></div>
            <div><dt>Last seen</dt><dd>{asset.lastSeen}</dd></div>
            <div><dt>Environment</dt><dd>{asset.environment}</dd></div>
          </dl>
        </article>
        <article className="playground-card">
          <Heading size="sm">Related tickets</Heading>
          <div className="mini-list">
            {tickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id}>
                <strong>{ticket.title}</strong>
                <span>{ticket.id} / {ticket.priority} / {ticket.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
