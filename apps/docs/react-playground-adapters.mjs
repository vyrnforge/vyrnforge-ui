import { createElement as h, useId, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Radio } from '@vyrnforge/react/radio';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { jsxText } from './playground-config.mjs';

const text = (key, label, value) => ({ kind: 'text', key, label, default: value });
const bool = (key, label) => ({ kind: 'boolean', key, label, default: false });
const choice = (key, label, value, options) => ({ kind: 'choice', key, label, default: value,
  options: options.map(option => ({ value: option, label: option })) });
const importLine = (component, path) => "import { " + component + " } from '@vyrnforge/react/" + path + "';";
const styleLine = path => "import '@vyrnforge/web/styles/" + path + ".css';";
const compositionImports = [importLine('Flow', 'layout'), importLine('Text', 'text'), styleLine('layout'), styleLine('text')];
const label = (config, fallback) => config.label.trim() || fallback;
const flag = (name, enabled) => enabled ? ' ' + name : '';
const attribute = (name, value, defaultValue) => value === defaultValue ? '' : ' ' + name + '=' + jsxText(value);

function buttonProps(config) {
  return { type: 'button', variant: config.variant, size: config.size, disabled: config.disabled, loading: config.loading };
}
function ButtonPreview({ config }) {
  const [count, setCount] = useState(0);
  return h(Flow, { align: 'center', gap: 'sm' },
    h(Button, { ...buttonProps(config), onClick: () => setCount(n => n + 1) }, label(config, 'Save changes')),
    h(Text, { role: 'status', variant: 'body-sm' }, 'Activations: ' + count));
}
export const buttonPlayground = {
  fields: [text('label', 'Label', 'Save changes'),
    choice('variant', 'Variant', 'primary', ['primary', 'secondary', 'ghost']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    bool('disabled', 'Disabled'), bool('loading', 'Loading')],
  presets: [{ label: 'Busy and disabled', values: { loading: true, disabled: true } }],
  Preview: ButtonPreview,
  source(config) {
    const props = buttonProps(config);
    return [
      "import { useState } from 'react';", importLine('Button', 'button'), styleLine('button'), ...compositionImports,
      '', 'export function Example() {', '  const [count, setCount] = useState(0);', '  return (',
      '    <Flow align="center" gap="sm">',
      '      <Button type="button"' + attribute('variant', props.variant, 'primary') + attribute('size', props.size, 'md') +
        flag('disabled', props.disabled) + flag('loading', props.loading) + ' onClick={() => setCount(n => n + 1)}>' +
        jsxText(label(config, 'Save changes')) + '</Button>',
      '      <Text role="status" variant="body-sm">Activations: {count}</Text>',
      '    </Flow>', '  );', '}',
    ].join('\n');
  },
};

function CheckboxPreview({ config, update }) {
  return h(Flow, { as: 'label', direction: 'inline', align: 'center', gap: 'sm' },
    h(Checkbox, { checked: config.selection === 'checked', indeterminate: config.selection === 'mixed',
      disabled: config.disabled, required: config.required,
      onChange: e => update('selection', e.currentTarget.checked ? 'checked' : 'unchecked') }),
    h(Text, { as: 'span' }, label(config, 'Include a gift receipt')));
}
export const checkboxPlayground = {
  fields: [text('label', 'Label', 'Include a gift receipt'),
    choice('selection', 'State', 'unchecked', ['unchecked', 'checked', 'mixed']),
    bool('disabled', 'Disabled'), bool('required', 'Required')],
  Preview: CheckboxPreview,
  source(config) {
    return [
      "import { useState } from 'react';", importLine('Checkbox', 'checkbox'), styleLine('checkbox'), ...compositionImports,
      '', 'export function Example() {', '  const [selection, setSelection] = useState<' +
        "'unchecked' | 'checked' | 'mixed'>(" + JSON.stringify(config.selection) + ');',
      '  return (', '    <Flow as="label" direction="inline" align="center" gap="sm">',
      '      <Checkbox checked={selection === "checked"} indeterminate={selection === "mixed"}' +
        flag('disabled', config.disabled) + flag('required', config.required) +
        ' onChange={event => setSelection(event.currentTarget.checked ? "checked" : "unchecked")} />',
      '      <Text as="span">' + jsxText(label(config, 'Include a gift receipt')) + '</Text>',
      '    </Flow>', '  );', '}',
    ].join('\n');
  },
};

function RadioPreview({ config, update }) {
  const name = useId();
  return h(Flow, { as: 'fieldset', gap: 'sm', style: { minInlineSize: 0 } },
    h('legend', null, 'Delivery'),
    ...['standard', 'express'].map(value => h(Flow, { as: 'label', direction: 'inline', align: 'center', gap: 'sm', key: value },
      h(Radio, { name, value, checked: config.selection === value, disabled: config.disabled,
        required: config.required, onChange: () => update('selection', value) }),
      h(Text, { as: 'span' }, value === 'standard' ? 'Standard' : 'Express'))));
}
export const radioPlayground = {
  fields: [choice('selection', 'Selected option', 'standard', ['standard', 'express']),
    bool('disabled', 'Disabled'), bool('required', 'Required')],
  Preview: RadioPreview,
  source(config) {
    return [
      "import { useId, useState } from 'react';", importLine('Radio', 'radio'), styleLine('radio'), ...compositionImports,
      '', 'export function Example() {', '  const name = useId();',
      '  const [selection, setSelection] = useState(' + JSON.stringify(config.selection) + ');',
      '  return (', '    <Flow as="fieldset" gap="sm" style={{ minInlineSize: 0 }}>', '      <legend>Delivery</legend>',
      ...['standard', 'express'].flatMap(value => [
        '      <Flow as="label" direction="inline" align="center" gap="sm">',
        '        <Radio name={name} value="' + value + '" checked={selection === "' + value + '"}' +
          flag('disabled', config.disabled) + flag('required', config.required) +
          ' onChange={() => setSelection("' + value + '")} />',
        '        <Text as="span">' + (value === 'standard' ? 'Standard' : 'Express') + '</Text>', '      </Flow>',
      ]), '    </Flow>', '  );', '}',
    ].join('\n');
  },
};
