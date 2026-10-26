import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot } from '@vyrnforge/react/number-field';
export function Example(){return <NumberFieldRoot defaultValue={2} min={0} max={10}><NumberFieldDecrement>−</NumberFieldDecrement><NumberFieldInput aria-label="Quantity"/><NumberFieldIncrement>+</NumberFieldIncrement></NumberFieldRoot>;}
