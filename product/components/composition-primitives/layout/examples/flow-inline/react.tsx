import { Flow } from '@vyrnforge/react/layout';

export function FlowInlineExample() {
  return (
    <Flow direction="inline" align="baseline" justify="space-between">
      <span>Storage used</span>
      <strong>18 of 50 GB</strong>
    </Flow>
  );
}
