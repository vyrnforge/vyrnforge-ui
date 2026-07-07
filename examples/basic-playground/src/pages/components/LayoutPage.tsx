import { Badge, Heading, Text } from "@dravyn/ui-components";

const items = [
  "Use full-width sections for pages and panels.",
  "Use cards for repeated records, previews, or bounded tools.",
  "Keep layout CSS app-owned until layout primitives become stable."
];

export function LayoutPage() {
  return (
    <section className="playground-panel">
      <div className="card-heading">
        <Heading size="md">Layout guidance</Heading>
        <Badge variant="warning">planned primitives</Badge>
      </div>
      <Text tone="muted">The package does not expose layout primitives yet; the playground shows current CSS patterns.</Text>
      <div className="playground-grid three">
        {items.map((item) => (
          <article className="playground-card" key={item}>
            <Text>{item}</Text>
          </article>
        ))}
      </div>
    </section>
  );
}
