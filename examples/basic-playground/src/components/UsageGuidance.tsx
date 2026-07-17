import { Panel, Text } from "@vyrnforge/ui-components";

export type UsageGuidanceProps = {
  useWhen?: string;
  avoidWhen?: string;
  accessibility?: string;
};

export function UsageGuidance({
  useWhen,
  avoidWhen,
  accessibility
}: UsageGuidanceProps) {
  const guidance = [
    ["Use when", useWhen],
    ["Avoid when", avoidWhen],
    ["Accessibility", accessibility]
  ].filter(([, value]) => Boolean(value));

  if (guidance.length === 0) {
    return null;
  }

  return (
    <Panel className="dv-playground-usage-guidance" title="Usage guidance">
      <dl>
        {guidance.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd><Text tone="muted">{value}</Text></dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
