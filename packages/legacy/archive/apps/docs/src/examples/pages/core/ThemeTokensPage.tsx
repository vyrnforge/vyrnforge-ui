import {
  Badge,
  Card,
  CodeText,
  Heading,
  Section,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
import {
  referenceSnapshot,
  referenceTokenCategories,
} from "../../data/referenceMetadata";

export function ThemeTokensPage() {
  return (
    <Stack gap="xl">
      <Section
        actions={
          <Badge tone="subtle">
            {referenceTokenCategories.reduce(
              (total, category) => total + category.tokens.length,
              0,
            )}{" "}
            tokens
          </Badge>
        }
        description="Token categories and variables are rendered from canonical design-token metadata captured by this exact VyrnForge Reference snapshot."
        title="Theme token contract"
      >
        <div className="vf-docs-example-token-grid">
          {[
            [
              referenceSnapshot.components.length,
              "Canonical components in this snapshot",
            ],
            [referenceSnapshot.elements.length, "Registered native elements"],
            [referenceTokenCategories.length, "Token categories"],
            [referenceSnapshot.releaseLines.length, "Release lines"],
          ].map(([value, label]) => (
            <Card key={label} padding="md" variant="bordered">
              <Stack gap="xs">
                <strong>{value}</strong>
                <Text size="sm" tone="muted">
                  {label}
                </Text>
              </Stack>
            </Card>
          ))}
        </div>
      </Section>

      {referenceTokenCategories.map((category) => (
        <Section
          actions={<Badge tone="subtle">{category.tokens.length}</Badge>}
          description={category.purpose}
          key={category.id}
          title={category.id}
        >
          <div className="vf-docs-example-token-grid">
            {category.tokens.map((token) => (
              <Card key={token.name} padding="md" variant="bordered">
                <Stack gap="sm">
                  {token.themeScoped ? (
                    <span
                      aria-hidden="true"
                      className="vf-docs-example-token-swatch"
                      style={{ background: `var(${token.name})` }}
                    />
                  ) : null}
                  <strong>{token.purpose}</strong>
                  <CodeText>{token.name}</CodeText>
                  <Text size="sm" tone="muted">
                    {token.themeScoped ? "Theme scoped" : "Shared scale"}
                  </Text>
                </Stack>
              </Card>
            ))}
          </div>
        </Section>
      ))}
    </Stack>
  );
}
