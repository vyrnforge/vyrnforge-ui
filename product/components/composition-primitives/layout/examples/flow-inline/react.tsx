import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

export function FlowInlineExample() {
  return (
    <Flow direction="inline" align="baseline" justify="space-between">
      <Text as="span">Storage used</Text>
      <Text as="strong" variant="label-md">18 of 50 GB</Text>
    </Flow>
  );
}
