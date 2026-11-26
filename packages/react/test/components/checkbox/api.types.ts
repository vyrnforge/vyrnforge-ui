import { Checkbox, type CheckboxProps } from '@vyrnforge/react/checkbox';
const props: CheckboxProps = { indeterminate: true, name: 'choice', size: 'sm' };
const control: typeof Checkbox = Checkbox;
void [props, control];

// @ts-expect-error native numeric text-input size is not a Checkbox visual size
const numeric: CheckboxProps = { size: 12 };
// @ts-expect-error unsupported visual size
const unsupported: CheckboxProps = { size: 'xl' };
void [numeric, unsupported];
