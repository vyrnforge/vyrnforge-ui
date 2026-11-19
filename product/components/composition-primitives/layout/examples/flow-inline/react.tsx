import { Flow } from '@vyrnforge/react/layout';

export function FlowInlineExample() {
  return (
    <Flow direction="inline" gap="md" align="baseline" justify="space-between"
      style={{ inlineSize: 'min(100%, 26rem)' }}>
      <span>Storage used</span>
      <strong>18 of 50 GB</strong>
    </Flow>
  );
}
