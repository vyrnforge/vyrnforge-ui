import { Button } from '@vyrnforge/react/button';
import { useState } from 'react';
import {
  MultiSelectContent,
  MultiSelectFormControl,
  MultiSelectOption,
  MultiSelectRoot,
  MultiSelectSelection,
  MultiSelectTrigger,
} from '@vyrnforge/react/multi-select';

const items = [
  { value: 'react', label: 'React', removeLabel: 'Remove React' },
  { value: 'vue', label: 'Vue', removeLabel: 'Remove Vue' },
  { value: 'angular', label: 'Angular', removeLabel: 'Remove Angular' },
];

export function Example() {
  const [submitted, setSubmitted] = useState<string[]>([]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(new FormData(event.currentTarget).getAll('framework').map(String));
      }}
      onReset={() => setSubmitted([])}
    >
      <MultiSelectRoot defaultValue={['react']} selectionSummary>
        <MultiSelectTrigger>Choose frameworks</MultiSelectTrigger>
        <MultiSelectContent aria-label="Frameworks">
          {items.map((item) => (
            <MultiSelectOption key={item.value} value={item.value}>
              {item.label}
            </MultiSelectOption>
          ))}
        </MultiSelectContent>
        <MultiSelectSelection items={items} label="Selected frameworks" emptyLabel="None selected" locale="en" />
        <MultiSelectFormControl name="framework" required options={items} />
      </MultiSelectRoot>
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">Reset</Button>
      <output aria-live="polite">
        {submitted.length ? `Submitted: ${submitted.join(', ')}` : 'Nothing submitted'}
      </output>
    </form>
  );
}
