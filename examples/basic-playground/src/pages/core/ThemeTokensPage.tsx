import { Heading, Text } from "@vyrnforge/ui-components";
import { referenceTokenCategories } from "../../data/referenceMetadata";

export function ThemeTokensPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Shared vf token contract</Heading>
          <Text tone="muted">
            This page is generated from the canonical ui-core token metadata for
            the selected VyrnForge snapshot.
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
          </div>
          <div className="vf-playground-token-grid">
            {category.tokens.map((token) => (
              <div className="vf-playground-token-card" key={token.name}>
                {token.themeScoped && (
                  <span
                    aria-hidden="true"
                    className="vf-playground-token-swatch"
                    style={{ background: `var(${token.name})` }}
                  />
                )}
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
