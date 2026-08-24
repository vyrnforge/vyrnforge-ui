import { Badge, Button, Card, Heading, Inline, Stack, Text } from "@vyrnforge/ui-components";
import consumerKnowledgeRaw from "../../../../../docs/generated/consumer-knowledge.json?raw";

type ConsumerKnowledge = {
  packages: Array<{ name: string; purpose: string; releaseTrack: string | null; runtime: string | null }>;
  frameworks: Array<{ id: string; supportLevel: string; renderer: string }>;
  patterns: Array<{ id: string; displayName: string; purpose: string; playgroundRoute: string }>;
};

const knowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
const featuredPatterns = knowledge.patterns.filter((pattern) =>
  ["settings", "form", "resource-list", "detail", "admin-shell", "customer-portal-shell"].includes(pattern.id)
);

function navigate(path: string) {
  window.location.hash = path;
}

export function OverviewPage() {
  return (
    <Stack gap="lg">
      <section className="vf-playground-panel vf-playground-overview-hero">
        <Stack gap="md">
          <Badge variant="info">VyrnForge UI</Badge>
          <Heading size="lg">Build application UI, not isolated demos</Heading>
          <Text tone="muted">
            Explore reusable components, application patterns, shared foundations, and optional advanced modules. Examples use public VyrnForge APIs and keep business state in the consuming application.
          </Text>
          <Inline gap="sm" wrap>
            <Button onClick={() => navigate("/settings")} variant="primary">Explore a settings workflow</Button>
            <Button onClick={() => navigate("/components/actions/button")} variant="subtle">Browse components</Button>
          </Inline>
        </Stack>
      </section>

      <section>
        <Heading size="md">Build by outcome</Heading>
        <Text tone="muted">Start from a reusable application composition, then drill into the components it uses.</Text>
        <div className="vf-playground-grid vf-playground-grid--three">
          {featuredPatterns.map((pattern) => (
            <Card key={pattern.id} padding="md">
              <Stack gap="sm">
                <Heading size="sm">{pattern.displayName}</Heading>
                <Text tone="muted">{pattern.purpose}</Text>
                <a href={`#${pattern.playgroundRoute}`}>Open pattern</a>
              </Stack>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Heading size="md">Framework surfaces</Heading>
        <Text tone="muted">Support labels come from canonical multi-framework metadata rather than playground copy.</Text>
        <div className="vf-playground-grid vf-playground-grid--four">
          {knowledge.frameworks.map((framework) => (
            <Card key={framework.id} padding="md">
              <Stack gap="xs">
                <Heading size="sm">{framework.id}</Heading>
                <Badge tone="subtle">{framework.supportLevel}</Badge>
                <Text size="sm" tone="muted">{framework.renderer}</Text>
              </Stack>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Heading size="md">Package model</Heading>
        <Text tone="muted">The playground is broader than the grid: shared foundations, renderers, and advanced modules have separate responsibilities and release tracks.</Text>
        <div className="vf-playground-grid vf-playground-grid--three">
          {knowledge.packages.map((packageEntry) => (
            <Card key={packageEntry.name} padding="md">
              <Stack gap="xs">
                <Heading size="sm">{packageEntry.name}</Heading>
                {packageEntry.releaseTrack && <Badge tone="subtle">{packageEntry.releaseTrack}</Badge>}
                <Text tone="muted">{packageEntry.purpose}</Text>
              </Stack>
            </Card>
          ))}
        </div>
      </section>
    </Stack>
  );
}
