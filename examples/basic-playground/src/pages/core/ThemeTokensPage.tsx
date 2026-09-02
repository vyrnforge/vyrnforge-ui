import { Badge, Heading, Text } from "@vyrnforge/ui-components";
import {
  referenceElements,
  referenceReleaseLines,
  referenceSnapshot,
  referenceTokenCategories,
} from "../../data/referenceMetadata";

export function ThemeTokensPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Current reference snapshot</Heading>
          <Text tone="muted">
            Components, elements, release lines, and tokens below are derived from
            canonical metadata in this exact VyrnForge playground snapshot.
          </Text>
        </div>
      </div>

      <div className="vf-playground-token-grid">
        <div className="vf-playground-token-card">
          <strong>{referenceSnapshot.components.length}</strong>
          <Text size="sm" tone="muted">
            Canonical components
          </Text>
        </div>
        <div className="vf-playground-token-card">
          <strong>{referenceElements.length}</strong>
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
          <strong>{referenceReleaseLines.length}</strong>
          <Text size="sm" tone="muted">
            Release lines
          </Text>
        </div>
      </div>

      <section className="vf-playground-section">
        <div className="vf-playground-section-heading">
          <div>
            <Heading size="sm">Release lines</Heading>
            <Text tone="muted">
              Package versions come from the release-group contract captured with
              this playground version.
            </Text>
          </div>
        </div>
        <div className="vf-playground-token-grid">
          {referenceReleaseLines.map((releaseLine) => (
            <div className="vf-playground-token-card" key={releaseLine.id}>
              <strong>{releaseLine.id}</strong>
              <code>{releaseLine.version}</code>
              <div className="vf-playground-demo-page__badges">
                <Badge tone="subtle">{releaseLine.channel}</Badge>
                <Badge tone="subtle">{releaseLine.distTag}</Badge>
              </div>
              <Text size="sm" tone="muted">
                {releaseLine.packages.join(", ")}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className="vf-playground-section">
        <div className="vf-playground-section-heading">
          <div>
            <Heading size="sm">Native elements</Heading>
            <Text tone="muted">
              The registered Custom Element catalog is composed from the canonical
              core and advanced element waves.
            </Text>
          </div>
        </div>
        <div className="vf-playground-token-grid">
          {referenceElements.map((tag) => (
            <div className="vf-playground-token-card" key={tag}>
              <code>{`<${tag}>`}</code>
            </div>
          ))}
        </div>
      </section>

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
