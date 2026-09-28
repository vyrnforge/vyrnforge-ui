import { Badge, Heading, Text } from "@vyrnforge/ui-components";
import {
  referenceSnapshot,
  referenceTokenCategories,
} from "../../data/referenceMetadata";

export function ThemeTokensPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Theme token contract</Heading>
          <Text tone="muted">
            Token categories and variables are rendered from the canonical
            design-token metadata captured by this exact VyrnForge playground
            snapshot.
          </Text>
        </div>
        <Badge tone="subtle">
          {referenceTokenCategories.reduce(
            (total, category) => total + category.tokens.length,
            0,
          )}{" "}
          tokens
        </Badge>
      </div>

      <div className="vf-playground-token-grid">
        <div className="vf-playground-token-card">
          <strong>{referenceSnapshot.components.length}</strong>
          <Text size="sm" tone="muted">
            Canonical components in this snapshot
          </Text>
        </div>
        <div className="vf-playground-token-card">
          <strong>{referenceSnapshot.elements.length}</strong>
          <Text size="sm" tone="muted">
            Registered native elements
          </Text>
        </div>
        <div className="vf-playground-token-card">
          <strong>{referenceTokenCategories.length}</strong>
          <Text size="sm" tone="muted">
            Token categories
          </Text>
        </div>
        <div className="vf-playground-token-card">
          <strong>{referenceSnapshot.releaseLines.length}</strong>
          <Text size="sm" tone="muted">
            Release lines
          </Text>
        </div>
      </div>

      {referenceTokenCategories.map((category) => (
        <section className="vf-playground-section" key={category.id}>
          <div className="vf-playground-section-heading">
            <div>
              <Heading size="sm">{category.id}</Heading>
              <Text tone="muted">{category.purpose}</Text>
            </div>
            <Badge tone="subtle">{category.tokens.length}</Badge>
          </div>
          <div className="vf-playground-token-grid">
            {category.tokens.map((token) => (
              <div className="vf-playground-token-card" key={token.name}>
                {token.themeScoped ? (
                  <span
                    aria-hidden="true"
                    className="vf-playground-token-swatch"
                    style={{ background: `var(${token.name})` }}
                  />
                ) : null}
                <strong>{token.purpose}</strong>
                <code>{token.name}</code>
                <Text size="sm" tone="muted">
                  {token.themeScoped ? "Theme scoped" : "Shared scale"}
                </Text>
              </div>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
