import {
  Badge,
  Button,
  Card,
  Icon,
  Inline,
  MoreButton,
  Section,
  Stack,
  Text,
  ToastProvider,
  useToast,
} from "@vyrnforge/ui-components";
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
    <Section
      actions={
        <Inline gap="sm" wrap>
          <Button leftSlot={<Icon name="Plus" />} variant="primary">
            Register asset
          </Button>
          <Button
            leftSlot={<Icon name="Export" />}
            onClick={() => {
              const id = toast.info({
                title: "Export started",
                description: "Preparing the asset inventory.",
                duration: null,
              });
              window.setTimeout(() => {
                toast.update(id, {
                  title: "Export ready",
                  description: "The asset inventory export is ready.",
                  tone: "success",
                  duration: 5000,
                });
              }, 900);
            }}
            variant="subtle"
          >
            Export
          </Button>
        </Inline>
      }
      description="A compact list pattern for resources, metadata, and actions."
      title="Assets"
    >
      <Stack gap="sm">
        {assets.map((asset) => (
          <Card key={asset.id} padding="md" variant="bordered">
            <Inline align="center" gap="md" justify="between" wrap>
              <div>
                <strong>{asset.name}</strong>
                <Text size="sm" tone="muted">
                  {asset.id} / {asset.type} / {asset.environment}
                </Text>
              </div>
              <Inline align="center" gap="sm" wrap>
                <Badge
                  variant={
                    asset.status === "Healthy"
                      ? "success"
                      : asset.status === "At Risk"
                        ? "danger"
                        : "warning"
                  }
                >
                  {asset.status}
                </Badge>
                <Text size="sm" tone="muted">
                  {asset.owner}
                </Text>
                <Text size="sm" tone="muted">
                  {asset.region}
                </Text>
                <MoreButton
                  aria-label={`More actions for ${asset.name}`}
                  size="xs"
                />
              </Inline>
            </Inline>
          </Card>
        ))}
      </Stack>
    </Section>
  );
}
