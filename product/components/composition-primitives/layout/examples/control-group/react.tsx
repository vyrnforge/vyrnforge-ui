import { Button } from '@vyrnforge/react/button';
import { ControlGroup } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';

export function AlignmentActions() {
  return (
    <ControlGroup role="group" aria-label="Text alignment">
      <Button type="button" variant="secondary">Left</Button>
      <Button type="button" variant="secondary">Center</Button>
      <Button type="button" variant="secondary">Right</Button>
    </ControlGroup>
  );
}
