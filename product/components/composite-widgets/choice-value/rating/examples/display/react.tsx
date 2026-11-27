import { Rating } from '@vyrnforge/react/rating';
import { Text } from '@vyrnforge/react/text';
import { Flow } from '@vyrnforge/react/layout';
export function Example() {
  return <Flow direction="inline" align="center" gap="sm"><Rating value={4.7} readOnly aria-label="Average: 4.7 out of 5" /><Text>4.7 (128 reviews)</Text></Flow>;
}
