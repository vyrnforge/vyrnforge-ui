import { Badge, Button, Heading, Icon, Text } from "@vyrnforge/ui-components";

const cards = [
  {
    title: "@vyrnforge/ui-core",
    status: "Foundation",
    text: "Owns shared dv tokens, theme modes, density, and reusable utility classes."
  },
  {
    title: "@vyrnforge/ui-components",
    status: "Candidate",
    text: "Hosts native-first primitives that consume the shared core token contract."
  },
  {
    title: "@vyrnforge/ui-data-grid",
    status: "Stable",
    text: "Keeps udg variables for compatibility while aligning to dv tokens where possible."
  }
];

export function OverviewPage() {
  return (
    <div className="dv-playground-page-stack">
      <section className="dv-playground-panel dv-playground-overview-hero">
        <div>
          <Heading size="lg">Native-first enterprise UI workspace</Heading>
          <Text tone="muted">
            This playground is the review surface for shared tokens, primitives, data grid
            behavior, and common product patterns.
          </Text>
        </div>
        <div className="dv-playground-inline-actions">
          <Button leftSlot={<Icon name="Plus" />} variant="primary">Primary action</Button>
          <Button leftSlot={<Icon name="Info" />} variant="subtle">Secondary</Button>
        </div>
      </section>

      <section className="dv-playground-grid three">
        {cards.map((card) => (
          <article className="dv-playground-card" key={card.title}>
            <div className="dv-playground-card-heading">
              <Heading size="sm">{card.title}</Heading>
              <Badge variant={card.status === "Stable" ? "success" : "info"}>{card.status}</Badge>
            </div>
            <Text tone="muted">{card.text}</Text>
          </article>
        ))}
      </section>
    </div>
  );
}
