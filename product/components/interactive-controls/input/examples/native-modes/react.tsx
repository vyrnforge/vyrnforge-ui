import { Input } from '@vyrnforge/react/input';
import '@vyrnforge/web/styles/input.css';

export function Example() {
  return (
    <>
      <label htmlFor="quantity">Quantity</label>
      <Input id="quantity" type="number" name="quantity" min={0} step={1} />

      <label htmlFor="starts-on">Starts on</label>
      <Input id="starts-on" type="date" name="startsOn" />

      <label htmlFor="accent">Accent color</label>
      <Input id="accent" type="color" name="accent" defaultValue="#245edb" />
    </>
  );
}
