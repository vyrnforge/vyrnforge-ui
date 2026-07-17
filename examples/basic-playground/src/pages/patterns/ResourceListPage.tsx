import { Badge, Button, Heading, Icon, MoreButton, Text, ToastProvider, useToast } from "@vyrnforge/ui-components";
import { assets } from "../../data/assets";

export function ResourceListPage() {
  return (
    <ToastProvider>
      <ResourceListPageContent />
    </ToastProvider>
  );
}

function ResourceListPageContent() {
  const toast = useToast();

  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-section-heading">
        <div>
          <Heading size="md">Assets</Heading>
          <Text tone="muted">A compact list pattern for resources, metadata, and actions.</Text>
        </div>
        <div className="dv-playground-inline-actions">
          <Button leftSlot={<Icon name="Plus" />} variant="primary">Register asset</Button>
          <Button
            leftSlot={<Icon name="Export" />}
            onClick={() => {
              const id = toast.info({
                title: "Export started",
                description: "Preparing the asset inventory.",
                duration: null
              });
              window.setTimeout(() => {
                toast.update(id, {
                  title: "Export ready",
                  description: "The asset inventory export is ready.",
                  tone: "success",
                  duration: 5000
                });
              }, 900);
            }}
            variant="subtle"
          >
            Export
          </Button>
        </div>
      </div>
      <div className="dv-playground-resource-list">
        {assets.map((asset) => (
          <article className="dv-playground-resource-row" key={asset.id}>
            <div>
              <strong>{asset.name}</strong>
              <span>{asset.id} / {asset.type} / {asset.environment}</span>
            </div>
            <div className="dv-playground-resource-meta">
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
