import { Input } from '@vyrnforge/react/input';

export function Example() {
  return (
    <>
      <label htmlFor="email">Email</label>
      <Input id="email" type="email" name="email" autoComplete="email" required />
    </>
  );
}
