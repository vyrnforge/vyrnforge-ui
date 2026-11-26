import { Button } from '@vyrnforge/react/button';
import { useState } from 'react';
import { SelectContent, SelectFormControl, SelectOption, SelectRoot, SelectTrigger } from '@vyrnforge/react/select';

const options = [
  { value: '', label: 'Choose a plan' },
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
];

export function Example() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const label = options.find((option) => option.value === value)?.label ?? 'Choose a plan';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('plan') ?? ''));
      }}
      onReset={() => {
        setValue('');
        setSubmitted('');
      }}
    >
      <SelectRoot value={value} onValueChange={setValue}>
        <SelectTrigger aria-label={`Plan: ${label}`}>{label}</SelectTrigger>
        <SelectContent aria-label="Plans">
          {options.slice(1).map((option) => (
            <SelectOption key={option.value} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </SelectContent>
        <SelectFormControl name="plan" required options={options} />
      </SelectRoot>
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">Reset</Button>
      <output aria-live="polite">{submitted ? `Submitted: ${submitted}` : 'Nothing submitted'}</output>
    </form>
  );
}
