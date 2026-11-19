import { Flow } from '@vyrnforge/react/layout';
import { Input } from '@vyrnforge/react/input';
import { Text } from '@vyrnforge/react/text';

export function FlowBlockExample() {
  return (
    <Flow>
      <label htmlFor="layout-react-email">Contact email</label>
      <Input id="layout-react-email" type="email" aria-describedby="layout-react-email-help" />
      <Text as="p" id="layout-react-email-help">Used for account notifications.</Text>
    </Flow>
  );
}
