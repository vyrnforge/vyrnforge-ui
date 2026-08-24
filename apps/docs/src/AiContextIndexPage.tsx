import { Badge, Card, Heading, Stack, Text } from "@vyrnforge/ui-components";
import aiContextRaw from "../../../docs/generated/ai-context/index.json?raw";

type AiContextIndex = {
  protocol: Record<string, string>;
  packages: Array<{ name: string; status: string; releaseTrack: string | null; runtime: string | null }>;
  frameworks: Array<{ id: string; supportLevel: string; renderer: string }>;
  categories: Array<{ id: string; context: string }>;
  patterns: Array<{ id: string; name: string; category: string; context: string }>;
  components: Array<{ id: string; name: string; category: string; availability: string; context: string }>;
};

const index = JSON.parse(aiContextRaw) as AiContextIndex;

export function AiContextIndexPage() {
  return (
    <Stack gap="lg">
      <Card padding="lg">
        <Stack gap="md">
          <Badge variant="info">AI bootstrap</Badge>
          <Heading level={3} size="md">Task-scoped retrieval</Heading>
          <Text>
            AI consumers should start with <code>ai-context/index.json</code>, select the smallest relevant pattern, category, or component slice, and only escalate to architecture documents for cross-cutting decisions.
          </Text>
          <pre className="vf-docs-reference-code"><code>{`npm run query:ai-context -- --component button --framework react\nnpm run query:ai-context -- --pattern settings`}</code></pre>
        </Stack>
      </Card>

      <Card padding="lg">
        <Heading level={3} size="md">Retrieval protocol</Heading>
        <div className="vf-docs-contract-details">
          {Object.entries(index.protocol).map(([name, instruction]) => (
            <div className="vf-docs-contract-field" key={name}>
              <strong>{name}</strong>
              <span>{instruction}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <Heading level={3} size="md">Context surface</Heading>
        <div className="vf-docs-reference__grid">
          <Card padding="md"><Heading level={4} size="sm">Categories</Heading><Text>{index.categories.length} discovery slices</Text></Card>
          <Card padding="md"><Heading level={4} size="sm">Patterns</Heading><Text>{index.patterns.length} task-oriented slices</Text></Card>
          <Card padding="md"><Heading level={4} size="sm">Components</Heading><Text>{index.components.length} focused component slices</Text></Card>
          <Card padding="md"><Heading level={4} size="sm">Frameworks</Heading><Text>{index.frameworks.map((entry) => entry.id).join(", ")}</Text></Card>
        </div>
      </Card>

      <Card padding="lg">
        <Heading level={3} size="md">Patterns</Heading>
        <div className="vf-docs-contract-details">
          {index.patterns.map((pattern) => (
            <div className="vf-docs-contract-field" key={pattern.id}>
              <strong>{pattern.name}</strong>
              <span><code>{pattern.context}</code></span>
            </div>
          ))}
        </div>
      </Card>
    </Stack>
  );
}
