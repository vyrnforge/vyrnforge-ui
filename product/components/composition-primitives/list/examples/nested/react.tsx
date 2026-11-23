import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { DisclosureRoot, DisclosureTrigger, DisclosurePanel } from '@vyrnforge/react/disclosure';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/disclosure.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <List aria-label="Project areas" variant="divided">
      <ListItem>
        <DisclosureRoot defaultOpen>
          <DisclosureTrigger>Frontend areas</DisclosureTrigger>
          <DisclosurePanel>
            <List aria-label="Frontend files" marker="auto" indent="lg" size="sm">
              <ListItem>Components</ListItem>
              <ListItem>Tokens</ListItem>
            </List>
          </DisclosurePanel>
        </DisclosureRoot>
      </ListItem>
      <ListItem>
        <Text as="strong">Infrastructure</Text>
        <List aria-label="Infrastructure files" marker="auto" indent="md" size="sm">
          <ListItem>Deploy</ListItem>
          <ListItem>Monitor</ListItem>
        </List>
      </ListItem>
    </List>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
