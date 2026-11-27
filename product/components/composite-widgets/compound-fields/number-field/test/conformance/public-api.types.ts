type ReactModule = typeof import('@vyrnforge/react/number-field');
type AngularModule = typeof import('@vyrnforge/angular/number-field');
type VueModule = typeof import('@vyrnforge/vue/number-field');
type ElementsModule = typeof import('@vyrnforge/elements/number-field');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;

type NumberFieldRootProps = import('@vyrnforge/react/number-field').NumberFieldRootProps;
const nullableRoot: NumberFieldRootProps = {
  value: null,
  defaultValue: null,
  step: 'any',
  onValueChange(value) {
    const committed: number | null = value;
    void committed;
  },
};
void nullableRoot;

type NumberFieldProps = import('@vyrnforge/react/number-field').NumberFieldProps;
const composed: NumberFieldProps = {
  label: 'Quantity',
  defaultValue: null,
  min: -10,
  step: 0.1,
  variant: 'filled',
  stepControls: 'horizontal',
  incrementLabel: 'Add',
  decrementLabel: 'Remove',
};
const native: NumberFieldProps = { label: 'Quantity', value: 0, stepControls: 'none' };
// @ts-expect-error Custom actions need authored accessible names.
const missingNames: NumberFieldProps = { label: 'Quantity', stepControls: 'stacked' };
// @ts-expect-error Numeric values are numbers or null.
const stringValue: NumberFieldProps = { label: 'Quantity', value: '3' };
void [composed, native, missingNames, stringValue];
