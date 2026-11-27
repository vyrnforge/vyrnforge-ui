# React NumberField

## React setup

Import the public NumberField subpath. CSS-aware browser bundlers deliver the canonical shared styles. The ref targets the native input.

```tsx
import { NumberField } from '@vyrnforge/react/number-field';

<NumberField label="Quantity" name="quantity" defaultValue={1} min={0} max={100} />;
```

The high-level default value is null. For an existing custom layout retain NumberFieldRoot, NumberFieldInput, NumberFieldIncrement and NumberFieldDecrement. The root's historical default remains zero. Use explicit defaultValue to avoid ambiguity. Custom steppers require incrementLabel and decrementLabel; the default native presentation needs neither. Use labelPlacement, fieldSize, variant and textAlign exactly as on TextField.

## Controlled values

```tsx
import { useState } from 'react';
import { NumberField } from '@vyrnforge/react/number-field';

export function Example() {
  const [value, setValue] = useState<number | null>(null);
  return <NumberField label="Adjustment" value={value} onValueChange={setValue} step={0.1} />;
}
```

The numeric callback reports parseable values or null, not transient invalid text. Native onChange remains available. Supply the accepted controlled value synchronously; external updates replace native editing text when the numeric value differs. For exact raw text or locale-specific formatted editing, use a text input with authored parsing.

## React tokens

Customize through the existing typed editor and textField groups. The same overrides can be passed to createTheme and rendered using renderThemeCss for application-wide customization; ThemeScope provides local overrides, and tokenStyle provides typed per-element token styles.

```tsx
import { ThemeScope, tokens } from '@vyrnforge/react';
import { NumberField } from '@vyrnforge/react/number-field';

export function Example() {
  return (
    <ThemeScope tokens={{ textField: { valueFont: '600 1rem/1.5 ' + tokens.fontFamily.sans, radius: '8px' } }}>
      <NumberField label="Weight in kilograms" suffix="kg" step={0.1} />
    </ThemeScope>
  );
}
```

No NumberField-only token group is necessary; the same shared roles customize Input and TextField.
