import {
  Badge,
  Button,
  Heading,
  Icon,
  MoreButton,
  Text,
} from "@vyrnforge/ui-components";
import { assets } from "../data/assets";
import { tickets } from "../data/tickets";

const asset = assets[0];

export function DetailPage() {
  return (
    <div className="vf-docs-example-page-stack">
      <section className="vf-docs-example-panel vf-docs-example-detail-header">
        <div>
          <div className="vf-docs-example-inline-actions">
            <Badge variant="success">{asset.status}</Badge>
            <Badge variant="info">{asset.criticality} criticality</Badge>
          </div>
          <Heading size="lg">{asset.name}</Heading>
          <Text tone="muted">
            {asset.id} / {asset.type} / {asset.environment}
          </Text>
        </div>
        <div className="vf-docs-example-inline-actions">
          <Button leftSlot={<Icon name="Check" />} variant="primary">
            Review
          </Button>
          <Button leftSlot={<Icon name="Eye" />} variant="subtle">
            Open audit
          </Button>
          <MoreButton />
        </div>
      </section>

      <section className="vf-docs-example-grid vf-docs-example-grid--two">
        <article className="vf-docs-example-card">
          <Heading size="sm">Metadata</Heading>
          <dl className="vf-docs-example-key-value-grid">
            <div>
              <dt>Owner</dt>
              <dd>{asset.owner}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{asset.region}</dd>
            </div>
            <div>
              <dt>Last seen</dt>
              <dd>{asset.lastSeen}</dd>
            </div>
            <div>
              <dt>Environment</dt>
              <dd>{asset.environment}</dd>
            </div>
          </dl>
        </article>
        <article className="vf-docs-example-card">
          <Heading size="sm">Related tickets</Heading>
          <div className="vf-docs-example-mini-list">
            {tickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id}>
                <strong>{ticket.title}</strong>
                <span>
                  {ticket.id} / {ticket.priority} / {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
