import { Checkbox, type CheckboxProps } from '@vyrnforge/react/checkbox';
const props: CheckboxProps = { indeterminate: true, name: 'choice' };
const control: typeof Checkbox = Checkbox;
void [props, control];
