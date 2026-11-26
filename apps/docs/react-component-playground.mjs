import { createElement as h, useEffect, useId, useRef, useState } from 'react';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Radio } from '@vyrnforge/react/radio';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { CodeBlock } from '@vyrnforge/react/code';
import { defaultsFor, changeConfiguration, normalizeConfiguration } from './playground-config.mjs';

function ConfigurationField({ field, config, update, disabled }) {
  const id = useId();
  const value = config[field.key];
  const locked = disabled || (field.available && !field.available(config));
  const description = field.description
    ? h(Text, { id: id + '-description', variant: 'body-sm' }, field.description) : null;
  const common = { id, disabled: locked, 'aria-describedby': description ? id + '-description' : undefined };
  if (field.kind === 'boolean') return h(Flow, { gap: 'xs' },
    h(Flow, { as: 'label', direction: 'inline', gap: 'xs', align: 'center' },
      h(Checkbox, { ...common, checked: value, onChange: e => update(field.key, e.currentTarget.checked) }),
      h(Text, { as: 'span' }, field.label)), description);
  if (field.kind === 'choice' && field.options.length <= 4) return h(Flow, {
    as: 'fieldset', gap: 'xs', disabled: locked,
    'aria-describedby': common['aria-describedby'],
    style: { border: 0, margin: 0, padding: 0, minInlineSize: 0 },
  }, h('legend', null, h(Text, { as: 'span', variant: 'body-sm' }, field.label)),
  h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm', align: 'center' },
    ...field.options.map(option => h(Flow, { as: 'label', key: option.value, direction: 'inline', gap: 'xs', align: 'center' },
      h(Radio, { name: id, value: option.value, checked: value === option.value,
        onChange: () => update(field.key, option.value) }),
      h(Text, { as: 'span', variant: 'body-sm' }, option.label)))), description);
  return h(Flow, { gap: 'xs' },
    h('label', { htmlFor: id }, h(Text, { as: 'span' }, field.label)),
    field.kind === 'choice'
      ? h(NativeSelect, { ...common, value, onChange: e => update(field.key, e.currentTarget.value) },
          ...field.options.map(option => h('option', { key: option.value, value: option.value }, option.label)))
      : h(Input, { ...common, type: field.kind === 'number' ? 'number' : 'text', value,
          min: field.min, max: field.max, step: field.step,
          onChange: e => {
            const next = field.kind === 'number' ? e.currentTarget.valueAsNumber : e.currentTarget.value;
            if (field.kind !== 'number' || Number.isFinite(next)) update(field.key, next);
          } }), description);
}

/**
 * React presentation only. Adapters own real component props, behavior and usage source.
 * This is deliberately not a public component or a live code evaluator.
 * @typedef {import('./playground-config.mjs').Configuration} Configuration
 * @typedef {{fields: readonly import('./playground-config.mjs').Field[],
 *   presets?: readonly import('./playground-config.mjs').Preset[],
 *   Preview: import('react').ComponentType<{config: Configuration, update: (key: string, value: string | boolean | number) => void}>,
 *   source: (config: Configuration) => string}} Adapter
 * @param {{adapter: Adapter, title: string}} props
 */
export function ComponentPlayground({ adapter, title }) {
  const id = useId();
  const [config, setConfig] = useState(() => defaultsFor(adapter.fields));
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState('');
  const sourceRegion = useRef(null);
  const copyRequest = useRef(0);
  useEffect(() => { setReady(true); return () => { copyRequest.current++; }; }, []);
  const source = adapter.source(config);
  function update(key, value) {
    copyRequest.current++;
    setFeedback('');
    setConfig(current => changeConfiguration(adapter.fields, current, { [key]: value }));
  }
  function restore(values = {}) {
    copyRequest.current++;
    setFeedback('');
    setConfig(normalizeConfiguration(adapter.fields, { ...defaultsFor(adapter.fields), ...values }));
    setRevision(current => current + 1);
  }
  async function copy() {
    const request = ++copyRequest.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(source);
      if (request === copyRequest.current) setFeedback('React usage copied.');
    } catch {
      if (request !== copyRequest.current) return;
      const region = sourceRegion.current;
      region?.focus();
      const selection = window.getSelection();
      if (region && selection) {
        const range = document.createRange();
        range.selectNodeContents(region);
        selection.removeAllRanges();
        selection.addRange(range);
        setFeedback('Source selected. Use your device copy command.');
      } else setFeedback('Clipboard unavailable. Select and copy the source manually.');
    }
  }
  return h(Flow, { gap: 'lg', 'data-vf-docs-component-playground': title },
    h(Flow, { as: 'section', gap: 'sm', 'aria-label': title + ' preview',
      className: 'vf-docs-component-playground-preview', align: 'center', justify: 'center' },
      h(adapter.Preview, { key: revision, config, update })),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': id + '-config' },
      h(Text, { as: 'h3', id: id + '-config', variant: 'heading-sm' }, 'Configuration'),
      h(AutoGrid, { minItemSize: '12rem', gap: 'md' },
        ...adapter.fields.map(field => h(ConfigurationField, { key: field.key, field, config, update, disabled: !ready }))),
      adapter.presets?.length ? h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm', align: 'center' },
        h(Text, { as: 'span', variant: 'body-sm' }, 'Presets:'),
        ...adapter.presets.map(preset => h(Button, { key: preset.label, type: 'button', variant: 'secondary',
          disabled: !ready, onClick: () => restore(preset.values) }, preset.label))) : null),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': id + '-source' },
      h(Text, { as: 'h3', id: id + '-source', variant: 'heading-sm' }, 'React usage'),
      h('div', { ref: sourceRegion, tabIndex: 0, role: 'region', 'aria-label': 'Generated React usage' },
        h(CodeBlock, null, source)),
      h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm' },
        h(Button, { type: 'button', variant: 'secondary', disabled: !ready, onClick: copy }, 'Copy React usage'),
        h(Button, { type: 'button', variant: 'ghost', disabled: !ready, onClick: () => restore() }, 'Reset playground')),
      h(Text, { role: 'status', variant: 'body-sm' }, feedback)));
}
