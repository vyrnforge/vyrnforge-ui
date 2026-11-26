import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { useState } from 'react';
import { TagGroupRoot, TagGroupItem } from '@vyrnforge/react/tag-group';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { closeIcon } from '@vyrnforge/icons/close';
import '@vyrnforge/web/styles/tag-group.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/icon.css';
const initial = ['Design', 'Build', 'Ship'];
function App() {
  const [tags, setTags] = useState(initial);
  return <Flow gap="sm">
    <TagGroupRoot aria-label="Selected tags">
      {tags.map(tag => <TagGroupItem key={tag}>
        <Chip selectable defaultSelected onRemove={() => setTags(current => current.filter(item => item !== tag))}
          removeLabel={'Remove ' + tag} removeIcon={<Icon icon={closeIcon} size="sm" />}>{tag}</Chip>
      </TagGroupItem>)}
    </TagGroupRoot>
    <Flow direction="inline"><Button type="button" variant="secondary" onClick={() => setTags(initial)}>Reset tags</Button></Flow>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
