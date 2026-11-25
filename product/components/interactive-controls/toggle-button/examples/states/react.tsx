import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="md">
      <Flow gap="xs" align="center">
        <ToggleButton iconOnly aria-label="Bookmark report">
          <Icon icon={bookmarkIcon} />
        </ToggleButton>
        <Text as="span">Report</Text>
      </Flow>
      <Flow gap="xs" align="center">
        <ToggleButton iconOnly defaultPressed aria-label="Bookmark notes">
          <Icon icon={bookmarkIcon} />
        </ToggleButton>
        <Text as="span">Notes</Text>
      </Flow>
      <Flow gap="xs" align="center">
        <ToggleButton iconOnly disabled aria-label="Bookmark invoice">
          <Icon icon={bookmarkIcon} />
        </ToggleButton>
        <Text as="span">Invoice</Text>
      </Flow>
      <Flow gap="xs" align="center">
        <ToggleButton iconOnly defaultPressed disabled aria-label="Bookmark draft">
          <Icon icon={bookmarkIcon} />
        </ToggleButton>
        <Text as="span">Draft</Text>
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
