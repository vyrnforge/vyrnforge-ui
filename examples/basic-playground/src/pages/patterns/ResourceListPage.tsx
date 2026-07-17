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
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Assets</Heading>
          <Text tone="muted">A compact list pattern for resources, metadata, and actions.</Text>
        </div>
        <div className="vf-playground-inline-actions">
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
      <div className="vf-playground-resource-list">
        {assets.map((asset) => (
          <article className="vf-playground-resource-row" key={asset.id}>
            <div>
              <strong>{asset.name}</strong>
              <span>{asset.id} / {asset.type} / {asset.environment}</span>
            </div>
            <div className="vf-playground-resource-meta">
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
