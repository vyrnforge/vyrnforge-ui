import { Heading, Text } from "@vyrnforge/ui-components";

const tokens = [
  ["Background", "--vf-bg", "var(--vf-bg)"],
  ["Surface", "--vf-surface", "var(--vf-surface)"],
  ["Subtle surface", "--vf-surface-subtle", "var(--vf-surface-subtle)"],
  ["Text", "--vf-text", "var(--vf-text)"],
  ["Muted text", "--vf-text-muted", "var(--vf-text-muted)"],
  ["Border", "--vf-border", "var(--vf-border)"],
  ["Primary", "--vf-primary", "var(--vf-primary)"],
  ["Danger", "--vf-danger", "var(--vf-danger)"],
  ["Warning", "--vf-warning", "var(--vf-warning)"],
  ["Success", "--vf-success", "var(--vf-success)"],
  ["Info", "--vf-info", "var(--vf-info)"],
  ["Focus", "--vf-focus-ring", "var(--vf-focus-ring)"]
];

const scaleTokens = [
  ["Small radius", "--vf-radius-sm"],
  ["Medium radius", "--vf-radius-md"],
  ["Large radius", "--vf-radius-lg"],
  ["Control height", "--vf-control-height"],
  ["Row height", "--vf-row-height"],
  ["Space 2", "--vf-space-2"],
  ["Space 3", "--vf-space-3"],
  ["Space 4", "--vf-space-4"]
];

export function ThemeTokensPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Shared dv token contract</Heading>
          <Text tone="muted">Components and grid examples inherit these values from ui-core.</Text>
        </div>
      </div>
      <div className="vf-playground-token-grid">
        {tokens.map(([label, name, value]) => (
          <div className="vf-playground-token-card" key={name}>
            <span className="vf-playground-token-swatch" style={{ background: value }} />
            <strong>{label}</strong>
            <code>{name}</code>
          </div>
        ))}
      </div>
      <div className="vf-playground-scale-grid">
        {scaleTokens.map(([label, name]) => (
          <div className="vf-playground-scale-row" key={name}>
            <strong>{label}</strong>
            <code>{name}</code>
            <span style={{ width: `var(${name}, 24px)`, borderRadius: name.includes("radius") ? `var(${name}, 8px)` : 4 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
