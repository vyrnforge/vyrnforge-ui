# NumberField

NumberField provides numeric editing around a real number input. It uses the shared editor and TextField presentation; it is not a currency formatter or a form state manager.

## When to use

Use NumberField for quantities, signed and fractional measurements, and bounded numeric values. Use Input with type number when only the primitive is needed. Use a text editor and an explicitly authored parser when formatted text or exact decimal arithmetic is essential.

## Appearance and accessibility

The composed field supports outlined, filled and underlined surfaces, inherited density or explicit sm/md/lg, outside or always-raised floating labels, logical alignment, full width, description and error relationships, and prefix/suffix and adornments. Unstyled composition belongs to the underlying Input. Author meaningful labels, requiredness instructions and units; a placeholder is not a name. Authored errors mark aria-invalid, while native validity remains available independently. Native, stacked, horizontal or hidden steppers are presentation choices. Custom step buttons require localized accessible names and do not submit forms. Native keyboard stepping remains available when step controls are hidden; step any disallows discrete custom stepping. Each custom target is at least 24 CSS pixels; stacked controls may increase the field height. Tooltip is optional consumer composition, not a replacement for a button name.

## Numeric behavior

The numeric value is a finite number or null (empty); zero is not empty. Invalid transient native editing text (badInput) does not emit a numeric value. A parseable edit can be out of range or step-mismatched; do not clamp it. The browser owns native step base, validity, decimal stepping, arrow keys, editing and form submission. Step actions call native stepUp/stepDown. Read-only or disabled controls cannot step. Controlled owners accept or reject proposed values; external updates synchronize the editor. Reset restores the initial uncontrolled value or current controlled value without emitting a value-change request. Native selection APIs and exact editing text are limited on number inputs. Native locale behavior and acceptance of decimal separators, exponents and pasted text vary by browser. No custom press-and-hold behavior is introduced.

## Formatting boundary

Prefix/suffix are decorative context, not submitted content. A label or description must identify meaningful units. Step is a constraint, not a display precision instruction. NumberField does not group thousands, pad fractional digits, scale percentages, convert currency, or promise arbitrary-precision decimal arithmetic. Use Intl.NumberFormat for read-only display; use a separately authored text editing/parsing policy for localized formatted numeric editing when required. Currency minor-unit conversion and rounding belong to application policy.

## Native Web

Load `@vyrnforge/web/styles/number-field.css`. The native number input remains the successful form control. Use existing TextField and Input hooks for the shared presentation. Example with native step controls:

```html
<div data-vf-number-field-root data-vf-number-field-layout="native">
  <div data-vf-text-field data-vf-text-field-variant="outlined">
    <label for="quantity" data-vf-text-field-label>Quantity</label>
    <div data-vf-text-field-control data-vf-editor-surface>
      <input
        id="quantity"
        name="quantity"
        type="number"
        min="0"
        max="100"
        step="1"
        value="1"
        data-vf-input
        data-vf-editor-variant="unstyled"
        data-vf-number-field-input
        data-vf-text-field-value
      />
    </div>
  </div>
</div>
```

Existing compound hooks remain supported. For custom actions author native buttons with localized names, use the established native step methods and guard disabled, read-only and step-any states. The new convenient composed API is React-first; other adapters retain their existing public contracts.
