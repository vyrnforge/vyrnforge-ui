import { Heading, Text } from "@dravyn/ui-components";

const tokens = [
  ["Background", "--dv-bg", "var(--dv-bg)"],
  ["Surface", "--dv-surface", "var(--dv-surface)"],
  ["Subtle surface", "--dv-surface-subtle", "var(--dv-surface-subtle)"],
  ["Text", "--dv-text", "var(--dv-text)"],
  ["Muted text", "--dv-text-muted", "var(--dv-text-muted)"],
  ["Border", "--dv-border", "var(--dv-border)"],
  ["Primary", "--dv-primary", "var(--dv-primary)"],
  ["Danger", "--dv-danger", "var(--dv-danger)"],
  ["Warning", "--dv-warning", "var(--dv-warning)"],
  ["Success", "--dv-success", "var(--dv-success)"],
  ["Info", "--dv-info", "var(--dv-info)"],
  ["Focus", "--dv-focus-ring", "var(--dv-focus-ring)"]
];

const scaleTokens = [
  ["Small radius", "--dv-radius-sm"],
  ["Medium radius", "--dv-radius-md"],
  ["Large radius", "--dv-radius-lg"],
  ["Control height", "--dv-control-height"],
  ["Row height", "--dv-row-height"],
  ["Space 2", "--dv-space-2"],
  ["Space 3", "--dv-space-3"],
  ["Space 4", "--dv-space-4"]
];

export function ThemeTokensPage() {
  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-section-heading">
        <div>
          <Heading size="md">Shared dv token contract</Heading>
          <Text tone="muted">Components and grid examples inherit these values from ui-core.</Text>
        </div>
      </div>
      <div className="dv-playground-token-grid">
        {tokens.map(([label, name, value]) => (
          <div className="dv-playground-token-card" key={name}>
            <span className="dv-playground-token-swatch" style={{ background: value }} />
            <strong>{label}</strong>
            <code>{name}</code>
          </div>
        ))}
      </div>
      <div className="dv-playground-scale-grid">
        {scaleTokens.map(([label, name]) => (
          <div className="dv-playground-scale-row" key={name}>
            <strong>{label}</strong>
            <code>{name}</code>
            <span style={{ width: `var(${name}, 24px)`, borderRadius: name.includes("radius") ? `var(${name}, 8px)` : 4 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
