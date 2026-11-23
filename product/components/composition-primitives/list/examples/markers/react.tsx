import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow gap="lg">
      <Text as="h2" variant="heading-sm">Ordered steps</Text>
      <List as="ol" marker="auto" aria-label="Release steps" size="sm">
        <ListItem>Prepare package</ListItem>
        <ListItem>Run verification</ListItem>
        <ListItem>Review evidence</ListItem>
      </List>
      <Text as="h2" variant="heading-sm">Unordered information</Text>
      <List as="ul" marker="auto" aria-label="Project notes" size="sm">
        <ListItem>Shared design tokens</ListItem>
        <ListItem>Native list semantics</ListItem>
      </List>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
