import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { ControlGroup } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/layout.css';

export function SearchControls() {
  return (
    <ControlGroup>
      <Input type="search" aria-label="Search query" />
      <Button type="button" variant="secondary">Search</Button>
    </ControlGroup>
  );
}
