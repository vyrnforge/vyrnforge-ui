import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow as="section" gap="md" aria-label="Button content and states">
      <Text as="h2" variant="heading-sm">Content and state</Text>
      <Flow direction="inline" wrap="wrap" align="center" gap="md">
        <Button type="button" aria-label="Save bookmark">
          <Icon icon={bookmarkIcon} />
        </Button>
        <Button type="button" variant="secondary">
          <Icon icon={bookmarkIcon} /> Save bookmark
        </Button>
        <Button type="button" loading>Loading</Button>
        <Button type="button" disabled>Disabled</Button>
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
