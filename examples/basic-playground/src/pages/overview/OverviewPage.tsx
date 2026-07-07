import { Badge, Button, Heading, Text } from "@dravyn/ui-components";

const cards = [
  {
    title: "@dravyn/ui-core",
    status: "Foundation",
    text: "Owns shared dv tokens, theme modes, density, and reusable utility classes."
  },
  {
    title: "@dravyn/ui-components",
    status: "Candidate",
    text: "Hosts native-first primitives that consume the shared core token contract."
  },
  {
    title: "@dravyn/ui-data-grid",
    status: "Stable",
    text: "Keeps udg variables for compatibility while aligning to dv tokens where possible."
  }
];

export function OverviewPage() {
  return (
    <div className="page-stack">
      <section className="playground-panel overview-hero">
        <div>
          <Heading size="lg">Native-first enterprise UI workspace</Heading>
          <Text tone="muted">
            This playground is the review surface for shared tokens, primitives, data grid
            behavior, and common product patterns.
          </Text>
        </div>
        <div className="inline-actions">
          <Button variant="primary">Primary action</Button>
          <Button variant="subtle">Secondary</Button>
        </div>
      </section>

      <section className="playground-grid three">
        {cards.map((card) => (
          <article className="playground-card" key={card.title}>
            <div className="card-heading">
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
