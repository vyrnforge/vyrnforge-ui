import { Badge, Button, Heading, Icon, MoreButton, Text } from "@dravyn/ui-components";
import { assets } from "../../data/assets";

export function ResourceListPage() {
  return (
    <section className="playground-panel">
      <div className="section-heading">
        <div>
          <Heading size="md">Assets</Heading>
          <Text tone="muted">A compact list pattern for resources, metadata, and actions.</Text>
        </div>
        <Button leftSlot={<Icon name="Plus" />} variant="primary">Register asset</Button>
      </div>
      <div className="resource-list">
        {assets.map((asset) => (
          <article className="resource-row" key={asset.id}>
            <div>
              <strong>{asset.name}</strong>
              <span>{asset.id} / {asset.type} / {asset.environment}</span>
            </div>
            <div className="resource-meta">
              <Badge variant={asset.status === "Healthy" ? "success" : asset.status === "At Risk" ? "danger" : "warning"}>
                {asset.status}
              </Badge>
              <span>{asset.owner}</span>
              <span>{asset.region}</span>
              <MoreButton aria-label={`More actions for ${asset.name}`} size="xs" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
