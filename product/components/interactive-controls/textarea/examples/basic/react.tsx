import { Textarea } from '@vyrnforge/react/textarea';
import '@vyrnforge/web/styles/textarea.css';

export function Example() {
  return (
    <>
      <label htmlFor="notes">Notes</label>
      <Textarea id="notes" name="notes" rows={4} required />
    </>
  );
}
