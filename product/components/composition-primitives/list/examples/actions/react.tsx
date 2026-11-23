import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <List aria-label="Saved reports" variant="bordered" size="lg">
      <ListItem trailing={
        <Flow direction="inline" gap="sm" wrap="wrap">
          <Button type="button" size="sm" variant="secondary">Open report</Button>
          <Button type="button" size="sm" variant="ghost">More options</Button>
        </Flow>
      }>
        <Flow gap="xs">
          <Text as="strong">Monthly operations</Text>
          <Text as="span" tone="secondary">Updated yesterday</Text>
        </Flow>
      </ListItem>
      <ListItem trailing={<Button type="button" size="sm" disabled>Unavailable</Button>}>
        <Text as="span">Archived report</Text>
      </ListItem>
    </List>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
