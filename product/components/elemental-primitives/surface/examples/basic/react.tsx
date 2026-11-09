import { Surface } from '@vyrnforge/react/surface';
import '@vyrnforge/web/styles/surface.css';

export function Example() {
  return (
    <Surface as="article">
      <h2>Release summary</h2>
      <p>Surface supplies the visual boundary; application CSS owns spacing and layout.</p>
    </Surface>
  );
}
