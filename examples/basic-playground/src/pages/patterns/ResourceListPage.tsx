import { Badge, Button, Heading, Text } from "@dravyn/ui-components";
import { assets } from "../../data/assets";

export function ResourceListPage() {
  return (
    <section className="playground-panel">
      <div className="section-heading">
        <div>
          <Heading size="md">Assets</Heading>
          <Text tone="muted">A compact list pattern for resources, metadata, and actions.</Text>
        </div>
        <Button variant="primary">Register asset</Button>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
