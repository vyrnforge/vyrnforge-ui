import { Badge, Heading, StatusBadge, Text } from "@dravyn/ui-components";

const variants = ["neutral", "success", "warning", "danger", "info"] as const;

export function BadgesPage() {
  return (
    <section className="playground-panel">
      <Heading size="md">Badge variants</Heading>
      <Text tone="muted">Badges cover neutral metadata and common product status colors.</Text>
      <div className="badge-row">
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>{variant}</Badge>
        ))}
      </div>
      <div className="badge-row">
        {variants.map((variant) => (
          <Badge key={variant} size="sm" variant={variant}>{variant} small</Badge>
        ))}
      </div>
      <div className="badge-row">
        {variants.map((variant) => (
          <Badge key={variant} tone="solid" variant={variant}>{variant} solid</Badge>
        ))}
      </div>
      <div className="badge-row">
        <StatusBadge status="active" />
        <StatusBadge status="pending" />
        <StatusBadge status="error" label="blocked" />
        <StatusBadge status="custom" label="custom mapped" />
      </div>
    </section>
  );
}
