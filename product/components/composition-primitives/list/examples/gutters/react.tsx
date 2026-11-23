import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { Divider } from '@vyrnforge/react/divider';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/divider.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <main>
      <Text as="h2" variant="heading-sm">Gutterless rows with inset rules</Text>
      <List aria-label="Edge-to-edge reports" variant="divided" gutter="none"
        dividerInset="gutter">
        <ListItem>Daily summary</ListItem>
        <ListItem>Monthly overview</ListItem>
        <ListItem>Annual report</ListItem>
      </List>
      <Divider />
      <Text as="h2" variant="heading-sm">Wide-gutter bordered list</Text>
      <List aria-label="Wide-gutter reports" variant="bordered" gutter="lg"
        dividerInset="gutter">
        <ListItem>Incoming</ListItem>
        <ListItem>Reviewed</ListItem>
      </List>
    </main>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
